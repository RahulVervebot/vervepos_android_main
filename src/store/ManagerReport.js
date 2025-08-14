import React, { useState, useEffect,useMemo, useCallback  } from 'react';
import {
  View,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {
  SubmitDispatch,
  fetchStoreManagerReport,
  SubmitQuotationReview
} from '../functions/VendorAccess/function';
import { useFocusEffect } from '@react-navigation/native';
const ManagaerReport = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [pdfLoading, setPDFLoading] = useState(false);

  // Local state to store edited lines: { [orderId]: { [productId]: { quantity, dispatch_qty, ... } } }
  // or use a single dimension if you prefer, or store by index.
  const [editedLines, setEditedLines] = useState({});

  // Request storage permissions (Android only)
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted) return true;

        const response = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to save PDF files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return response === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return true;
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Permission Error', 'Failed to request permission.');
      return false;
    }
  };

  // Fetch the data (with optional date range) and store in orders
  const fetchData = async (customStartDate, customEndDate) => {
    setLoading(true);
    const start = customStartDate || startDate;
    const end = customEndDate || endDate;
    await fetchStoreManagerReport(
      start,
      end,
      (fetchedOrders) => {

        
        // Sort newest to oldest
        const sortedOrders = [...fetchedOrders].sort((a, b) =>
          new Date(b.created_at.replace(' ', 'T')) - new Date(a.created_at.replace(' ', 'T'))
        );
        
        console.log("Fetched dates:", fetchedOrders.map(order => order.created_at));
        setOrders(sortedOrders);
        setLoading(false);
      },
      setLoading
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
      setWeekly();
    }, [fetchInitialData])
  );

    const fetchInitialData = useCallback(async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const url = await AsyncStorage.getItem('store_url');
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 7);

        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
        await fetchData(defaultStartDate, defaultEndDate);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to fetch initial data.');
      }
    }, []);


  // Helper functions to reset time
  const resetTimeToStartOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const setTimeToEndOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  };

  // Date filter handlers
  const setToday = () => {
    setOrders([]);
    const today = new Date();
    const start = resetTimeToStartOfDay(today);
    const end = setTimeToEndOfDay(today);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  const setYesterday = () => {
    setOrders([]);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = resetTimeToStartOfDay(yesterday);
    const end = setTimeToEndOfDay(yesterday);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  const setWeekly = () => {
    setOrders([]);
    const today = new Date();
    const lastMonday = new Date(today);
    const day = lastMonday.getDay();
    const diff = lastMonday.getDate() - day + (day === 0 ? -6 : 1);
    lastMonday.setDate(diff);
    const start = resetTimeToStartOfDay(lastMonday);
    const end = setTimeToEndOfDay(today);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  const onStartDateConfirm = (date) => {
    setStartDatePickerOpen(false);
    const start = resetTimeToStartOfDay(date);
    setStartDate(start);
    if (endDate) {
      fetchData(start, endDate);
    }
  };

  const onEndDateConfirm = (date) => {
    setEndDatePickerOpen(false);
    const end = setTimeToEndOfDay(date);
    setEndDate(end);
    if (startDate) {
      fetchData(startDate, end);
    }
  };

  // Handler to change line data (like quantity)
  const handleLineChange = (orderIndex, lineIndex, field, value) => {
    // For the sake of identification, let's use `order.quotationNumber` and `line.product`
    // or line.id if there is one. We'll assume `line.product` is unique here
    const order = orders[orderIndex];
    const line = order.quotation_lines[lineIndex];
    const orderId = order.quotationNumber;
    const productId = line.product;

    setEditedLines((prev) => {
      const currentOrderEdits = prev[orderId] ? { ...prev[orderId] } : {};
      const currentLine = currentOrderEdits[productId] ? { ...currentOrderEdits[productId] } : {};

      // update the field with the new value
      currentLine[field] = value;

      // place updated line edits back into currentOrderEdits
      currentOrderEdits[productId] = currentLine;

      // place updated order edits back into editedLines
      return { ...prev, [orderId]: currentOrderEdits };
    });
  };


const DispatchQuotation = async (orderid) => {

  const response = await SubmitDispatch(orderid);
  if (response) {
    Alert.alert("Order Dispatched");
    await fetchInitialData();
  }
  else{
    Alert.alert("failed to dispatch");
  }
}
  // Function to confirm the quotation
  const confirmQuotation = async (orderIndex) => {
    try {
      const order = orders[orderIndex];
      const orderId = order.quotationNumber;

      // If no lines have been edited for this order, use the original or set defaults
      const linesEdits = editedLines[orderId] || {};

      // We want to pass dispatchData to SubmitQuotationReview, containing product_id and dispatch_qty
      // Suppose we treat `dispatch_qty` as the edited quantity if any, else default to line.dispatch_qty
      // or line.quantity, depending on your app logic.
      const dispatchData = order.quotation_lines.map((line) => {
        const productId = line.product;
        // get any user edits for this line
        const userEdits = linesEdits[productId] || {};
        // Use userEdits.quantity or userEdits.dispatch_qty, falling back to existing line value
        const finalDispatchQty = userEdits.dispatch_qty ?? line.dispatch_qty ?? 0;

        return {
          product_id: productId,
          dispatch_qty: Number(finalDispatchQty)
        };
      });

      // Pass data to SubmitQuotationReview
      console.log("Preparing to SubmitQuotationReview => ", {
        quotationNumber: orderId,
        dispatchData: dispatchData
      });

      const response = await SubmitQuotationReview(orderId, dispatchData);
      if (response.status == "approved") {
        await fetchInitialData();
        Alert.alert(response.message);
      } else {
        Alert.alert(response.error);
      }
    } catch (error) {
      console.error('Error confirming quotation:', error);
      Alert.alert('Error', 'Could not confirm quotation.');
    }
  };

  // Function to generate PDF for a specific order
  const generatePDF = async (order) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot save PDF without storage permission.');
        return;
      }
      setPDFLoading(true);

      // Build table rows for order_lines as HTML
      const tableRows = order.quotation_lines && order.quotation_lines.length > 0
        ? order.quotation_lines
            .map((line) => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.product_name}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.dispatch_qty}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.missing_qty}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.damaged_qty}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.received_qty}</td>
              </tr>
            `)
            .join('')
        : `<tr><td colspan="7" style="border: 1px solid #ccc; padding: 8px; text-align: center;">No Order Lines Found</td></tr>`;

      // Full HTML for PDF
      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Order ${order.quotationNumber}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Order Number: ${order.quotationNumber}</h1>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Qty</th>
                <th>Dispatch Qty</th>
                <th>Missing Qty</th>
                <th>Damaged Qty</th>
                <th>Recieved Qty</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <br />
        </body>
        </html>
      `;

      // Generate PDF in app's internal storage
      const options = {
        html: htmlContent,
        fileName: `Order-${order.quotationNumber}`,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', file.filePath);

      // Define destination path in the public Download directory
      const destPath = `${RNFS.DownloadDirectoryPath}/Order-${order.quotationNumber}.pdf`;
      console.log('Destination Path:', destPath);

      const downloadDirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
      if (!downloadDirExists) {
        await RNFS.mkdir(RNFS.DownloadDirectoryPath);
      }
      await RNFS.moveFile(file.filePath, destPath);
      console.log('PDF moved to:', destPath);

      setPDFLoading(false);
      Alert.alert(
        'PDF Generated',
        `File saved to: ${destPath}`,
        [
          { text: 'OK' },
          {
            text: 'Open PDF',
            onPress: () => openPDF(destPath),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPDFLoading(false);
      Alert.alert('Error', `Could not generate PDF: ${error.message}`);
    }
  };

  const openPDF = async (filePath) => {
    try {
      const shareOptions = {
        title: 'Open Order PDF',
        url: `file://${filePath}`,
        type: 'application/pdf',
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Could not open PDF.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Fetching Order Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.maincontainer}>
      <View style={styles.container}>
        {/* Vendor Search Box */}
        <View style={styles.row}>
          <Card style={{ marginVertical: 5, backgroundColor: '#d9ecfe' }}>
            <Card.Content>
              <Text style={{ color: '#2C62FF', fontWeight: '800', padding: 5 }}>
                Select Custom Range:
              </Text>
              <View style={styles.headercontainer}>
                <View style={styles.buttonContainer}>
                  <Button mode="contained" onPress={setToday} style={styles.filterButton}>
                    Today
                  </Button>
                  <Button mode="contained" onPress={setYesterday} style={styles.filterButton}>
                    Yesterday
                  </Button>
                  <Button mode="contained" onPress={setWeekly} style={styles.filterButton}>
                    Weekly
                  </Button>
                </View>
                <View style={styles.dateRangeContainer}>
                  <TouchableOpacity
                    onPress={() => setStartDatePickerOpen(true)}
                    style={styles.dateRangeButton}
                  >
                    <Text>
                      {startDate ? `Start: ${startDate.toLocaleDateString()}` : 'Start Date'}
                    </Text>
                  </TouchableOpacity>

                  <DatePicker
                    modal
                    open={isStartDatePickerOpen}
                    date={startDate || new Date()}
                    mode="date"
                    onConfirm={onStartDateConfirm}
                    onCancel={() => setStartDatePickerOpen(false)}
                  />

                  <TouchableOpacity
                    onPress={() => setEndDatePickerOpen(true)}
                    style={styles.dateRangeButton}
                  >
                    <Text>
                      {endDate ? `End: ${endDate.toLocaleDateString()}` : 'End Date'}
                    </Text>
                  </TouchableOpacity>

                  <DatePicker
                    modal
                    open={isEndDatePickerOpen}
                    date={endDate || new Date()}
                    mode="date"
                    onConfirm={onEndDateConfirm}
                    onCancel={() => setEndDatePickerOpen(false)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {orders ? (
          orders.map((order, orderIndex) => (
            <Card key={orderIndex} style={styles.card}>
              <Card.Content>
                    <View style={styles.orderHeader}>
                               <Text style={styles.orderHeaderText}>
                  <Text style={styles.orderHeaderMain}>Order Number:</Text>  {order.quotationNumber}  <Text style={styles.orderHeaderMain}>Status:</Text><Text style={[
                      styles.orderStatusText,
                      order.status.toLowerCase() === 'completed' ? styles.statusCompleted :
                                        order.status.toLowerCase() === 'delivered' ? styles.statusCompleted :
                                        order.status.toLowerCase() === 'pending' ? styles.statusProcessed :
                                        order.status.toLowerCase() === 'processed' ? styles.statusProcessed :
                                        order.status.toLowerCase() === 'approved' ? styles.statusProcessed :
                                        order.status.toLowerCase() === 'intransit' ? styles.statusProcessed :
                      null
                    ]}> {` ${order.status.toUpperCase()} `} </Text>| <Text style={styles.orderHeaderMain}>Date:</Text>{' '}
                  {order.created_at}
                </Text>
                </View>
                {/* Order Lines Table Header */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeaderCell}>id</Text>
                  <Text style={styles.tableHeaderCell}>Product Name</Text>
                  <Text style={styles.tableHeaderCell}>Qty</Text>
                  <Text style={styles.tableHeaderCell}>Dispatch Qty</Text>
                  <Text style={styles.tableHeaderCell}>Received Qty</Text>
                  <Text style={styles.tableHeaderCell}>Missing Qty</Text>
                  <Text style={styles.tableHeaderCell}>Damaged Qty</Text>
                  <Text style={styles.tableHeaderCell}>InStock</Text>
                </View>
                {/* Order Lines Table Rows */}
                {order.quotation_lines && order.quotation_lines.length > 0 ? (
                  order.quotation_lines.map((line, lineIndex) => {
                    // retrieve any edits for quantity or dispatch
                    const lineEdits =
                      editedLines[order.quotationNumber]?.[line.product] || {};
                    const editedQuantity =
                      lineEdits.quantity !== undefined
                        ? lineEdits.quantity
                        : line.quantity;
                    const editedDispatch =
                      lineEdits.dispatch_qty !== undefined
                        ? lineEdits.dispatch_qty
                        : line.dispatch_qty;

                    return (
                      <View key={lineIndex} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{line.product}</Text>
                        <Text style={styles.tableCell}>{line.product_name}</Text>
                        <Text style={styles.tableCell}>{line.quantity}</Text>
                        {
                          order.status == 'intransit' || order.status == 'delivered' ?
                          <Text style={styles.tableCell}>{line.dispatch_qty}</Text>
                          :
                          <TextInput
                          style={[styles.tableCell, styles.inputCell]}
                          keyboardType="numeric"
                          value={String(editedDispatch)}
                          onChangeText={(value) =>
                            handleLineChange(orderIndex, lineIndex, 'dispatch_qty', value)
                          }
                        />
                        }
                        <Text style={styles.tableCell}>{line.received_qty}</Text>
                        <Text style={styles.tableCell}>{line.missing_qty}</Text>
                        <Text style={styles.tableCell}>{line.damaged_qty}</Text>
                        <Text style={styles.tableCell}>{line.invQty}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noDataText}>No Order Lines Found</Text>
                )}
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    mode="outlined"
                    onPress={() => generatePDF(order)}
                    style={{ margin: 10 }}
                  >
                    {'Download as PDF'}
                  </Button>

                  <TouchableOpacity
                    style={[order.status == 'approved'? styles.addAprrovedButton : order.status == 'intransit' ? styles.addtransistButton  : styles.addButton]}
                    onPress={() => confirmQuotation(orderIndex)}
                  >
                    <Text style={styles.addButtonText}>Confirm Quotation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[order.status == 'approved'? styles.showtransit : styles.addtransistButton]}
                    onPress={() => DispatchQuotation(order.id)}
                  >
                    <Text style={styles.addButtonText}>Dispatch</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={styles.noDataText}>No Orders Found</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maincontainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
  },
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 15,
    width: '50%',
  },
  headercontainer: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#2C62FF',
    color: '#fff',
    borderRadius: 5,
    marginRight: 5,
    textAlign: 'center',
  },
  dateRangeContainer: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C62FF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dateRangeLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    color: '#2C62FF',
  },
  dateRangeButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedRangeText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  cardText: {
    fontSize: 18,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
    alignItems: 'center',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  inputCell: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 5,
    marginHorizontal: 5,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#888',
  },
  addButton: {
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    margin: 10,
  },
  addAprrovedButton: {
    backgroundColor: '#F9BA51',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    margin: 10,
  },
  showtransit:{
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    margin: 10,
  },
  addtransistButton:{
    display: "none"
  },

  addButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  orderHeaderMain: {
    fontWeight: '800',
  },
  orderHeader: {
    backgroundColor: '#d9ecfe',
    padding: 10,
  },
  orderHeaderText: {
    fontWeight: '600',
  },
  orderStatusText: {
    fontWeight: 'bold',
  },
  statusCompleted: {
    color: 'green',
  },
  statusProcessed: {
    color: '#E8A421',
  },
  
});

export default ManagaerReport;
