import React, { useState, useEffect,useCallback } from 'react';
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
  fetchStoreManagerReport,
  ReceivedQuotation
} from '../functions/VendorAccess/function';
import { useFocusEffect } from '@react-navigation/native';
const QuotationReport = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [pdfLoading, setPDFLoading] = useState(false);

  // Local state to store edited lines: { [orderId]: { [productId]: { received_qty, missing_qty, damaged_qty, ... } } }
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
        // Sort orders with the latest one on top (newest to oldest)
        // const sortedOrders = [...fetchedOrders].sort(
        //   (b, a) => new Date(a.created_at) - new Date(b.created_at)
        // );
        const sortedOrders = [...fetchedOrders].sort((a, b) =>
          new Date(b.created_at.replace(' ', 'T')) - new Date(a.created_at.replace(' ', 'T'))
        );
        setOrders(sortedOrders);
        setLoading(false);
      },
      setLoading
    );
  };
  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
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

  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('access_token');
  //       const url = await AsyncStorage.getItem('store_url');
  //       const defaultEndDate = new Date();
  //       const defaultStartDate = new Date();
  //       defaultStartDate.setDate(defaultStartDate.getDate() - 7);

  //       setStartDate(defaultStartDate);
  //       setEndDate(defaultEndDate);
  //       await fetchData(defaultStartDate, defaultEndDate);
  //     } catch (error) {
  //       console.error('Error fetching initial data:', error);
  //       setLoading(false);
  //       Alert.alert('Error', 'Failed to fetch initial data.');
  //     }
  //   };
  //   fetchInitialData();
  // }, []);

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

  // Handler to change line data for received, missing, and damaged quantities
  const handleLineChange = (orderIndex, lineIndex, field, value) => {
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

  // Function to confirm the quotation

  // Function to generate PDF for a specific order
  const generatePDF = async (order) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot save PDF without storage permission.');
        return;
      }
      setPDFLoading(true);

      // Build table rows for order_lines as HTML using updated fields (received, missing, damaged)
      const tableRows = order.quotation_lines && order.quotation_lines.length > 0
        ? order.quotation_lines
            .map((line) => {
              // Get any user edits for these fields
              const userEdits = editedLines[order.quotationNumber]?.[line.product] || {};
              const finalReceived = userEdits.received_qty ?? line.received_qty ?? 0;
              const finalMissing = userEdits.missing_qty ?? line.missing_qty ?? 0;
              const finalDamaged = userEdits.damaged_qty ?? line.damaged_qty ?? 0;
              return `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.product}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.product_name}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${finalReceived}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${finalMissing}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${finalDamaged}</td>
              </tr>
            `;
            })
            .join('')
        : `<tr><td colspan="6" style="border: 1px solid #ccc; padding: 8px; text-align: center;">No Order Lines Found</td></tr>`;

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
                <th>ID</th>
                <th>Product Name</th>
                <th>Qty</th>
                <th>Received Qty</th>
                <th>Missing Qty</th>
                <th>Damaged Qty</th>
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
                <Text style={[styles.orderHeaderText]}>
                 <Text style={styles.orderHeaderMain}>Order Number: </Text> {order.quotationNumber} | <Text style={styles.orderHeaderMain}>Date:</Text> {' '} 
                  {order.created_at} | <Text style={styles.orderHeaderMain}>Status:</Text> <Text style={[
                                        styles.orderStatusText,
                                        order.status.toLowerCase() === 'completed' ? styles.statusCompleted :
                                        order.status.toLowerCase() === 'delivered' ? styles.statusCompleted :
                                        order.status.toLowerCase() === 'pending' ? styles.statusProcessed :
                                        order.status.toLowerCase() === 'processed' ? styles.statusProcessed :
                                        order.status.toLowerCase() === 'approved' ? styles.statusProcessed :
                                        order.status.toLowerCase() === 'intransit' ? styles.statusProcessed :
                                        null
                                      ]}> {` ${order.status.toUpperCase()} `} </Text>
                </Text>
                </View>
                {/* Order Lines Table Header */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeaderCell}>Product Name</Text>
                  <Text style={styles.tableHeaderCell}>Qty</Text>
                  <Text style={styles.tableHeaderCell}>Dispatch Qty</Text>
                  <Text style={styles.tableHeaderCell}>Received Qty</Text>
                  <Text style={styles.tableHeaderCell}>Missing Qty</Text>
                  <Text style={styles.tableHeaderCell}>Damaged Qty</Text>
                </View>
                {/* Order Lines Table Rows */}
                {order.quotation_lines && order.quotation_lines.length > 0 ? (
                  order.quotation_lines.map((line, lineIndex) => {
       

                    return (
                      <View key={lineIndex} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{line.product_name}</Text>
                        <Text style={styles.tableCell}>{line.quantity}</Text>
                        <Text style={styles.tableCell}>{line.dispatch_qty}</Text>
                        <Text style={styles.tableCell}>{line.received_qty}</Text>
                        <Text style={styles.tableCell}>{line.missing_qty}</Text>
                        <Text style={styles.tableCell}>{line.damaged_qty}</Text>

                       
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
    fontSize: 16,
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
  addButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  orderHeader: {
    backgroundColor: '#d9ecfe',
    padding: 10,
  },
  orderHeaderText: {
    fontWeight: '600',
  },
  orderHeaderMain: {
    fontWeight: '800',
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

export default QuotationReport;
