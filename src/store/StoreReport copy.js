import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { fetchStoreOrder,OrderProceedStore } from '../functions/VendorAccess/function';
import OrderDetailsModal from '../components/OrderDetailsModal';

const StoreReport = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [pdfLoading, setPDFLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Helper to format "2025-03-07T09:25:41.525081Z" into "03-07-2025 09:25"
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day}-${year} ${hours}:${minutes}`;
  };

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
    await fetchStoreOrder(
      start,
      end,
      (fetchedOrders) => {
        // Sort newest to oldest
        // const sortedOrders = [...fetchedOrders].sort(
        //   (a, b) => new Date(b.created_at) - new Date(a.created_at)
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

  useEffect(() => {
    const fetchInitialData = async () => {
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
    };
    fetchInitialData();
  }, []);


const ProceedStore = async (orderid) => {

  const response = await OrderProceedStore(orderid);
  if (response) {
    console.log("Ordern response",response.quotations);
    setSelectedOrder(response);
    setModalVisible(true);
  }
  else{
    Alert.alert("failed to dispatch");
  }
}
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
      const tableRows =
        order.order_lines && order.order_lines.length > 0
          ? order.order_lines
              .map(
                (line) => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.product_name}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.barcode}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.warehouse.warehouseName}</td>
              
              </tr>
            `
              )
              .join('')
          : `<tr><td colspan="7" style="border: 1px solid #ccc; padding: 8px; text-align: center;">No Order Lines Found</td></tr>`;

      // Full HTML for PDF
      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Order ${order.orderNumber}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Order Number: ${order.orderNumber}</h1>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Barcode</th>
                <th>Quantity</th>
                <th>Warehouse</th>
                <th>Available Stock</th>
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
        fileName: `Order-${order.orderNumber}`,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', file.filePath);

      // Define destination path in the public Download directory
      const destPath = `${RNFS.DownloadDirectoryPath}/Order-${order.orderNumber}.pdf`;
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
        {/* Date Range and Buttons */}
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
                  <Button
                    mode="contained"
                    onPress={setYesterday}
                    style={styles.filterButton}
                  >
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
                      {startDate
                        ? `Start: ${startDate.toLocaleDateString()}`
                        : 'Start Date'}
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

      <Text style={styles.selectedRangeText}>
        Selected Range: {startDate ? startDate.toLocaleDateString() : 'All'} -{' '}
        {endDate ? endDate.toLocaleDateString() : 'All'}
      </Text>

      <ScrollView style={styles.container}>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <Card
              key={index}
              style={[
                styles.card,
                // Alternate background for even/odd cards:
                // { backgroundColor: index % 2 === 0 ? '#f3f3f3' : '#ffffff' },
                { backgroundColor:  '#ffffff' },
              ]}
            >
              {/* Header with blue background (#d9ecfe) */}
              <View style={styles.orderHeader}>
                <Text style={styles.orderHeaderText}>
                  Order Number: {order.orderNumber} | Status: {order.status} | Date:{' '}
                  {order.created_at} | id: {order.id}
                </Text>
              </View>

              {/* Card content (table, etc.) */}
              <Card.Content style={{ padding: 10 }}>
                {/* Order Lines Table Header */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeaderCell}>Product Name</Text>
                  {/* <Text style={styles.tableHeaderCell}>Barcode</Text> */}
                  <Text style={styles.tableHeaderCell}>Qty</Text>
                  {/* <Text style={styles.tableHeaderCell}>Unit Price</Text>
                  <Text style={styles.tableHeaderCell}>Total Price</Text> */}
                  <Text style={styles.tableHeaderCell}>Warehouse</Text>
                
                </View>

                {/* Order Lines Table Rows */}
                {order.order_lines && order.order_lines.length > 0 ? (
                  order.order_lines.map((line, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{line.product_name}</Text>
                      {/* <Text style={styles.tableCell}>{line.barcode}</Text> */}
                      <Text style={styles.tableCell}>{line.quantity}</Text>
                      {/* <Text style={styles.tableCell}>{line.unit_price}</Text>
                      <Text style={styles.tableCell}>{line.total_price}</Text> */}
                      <Text style={styles.tableCell}>{line.warehouse.warehouseName}</Text>
               
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No Order Lines Found</Text>
                )}
 <View style={{ flexDirection: 'row' }}>
                <Button mode="outlined" onPress={() => generatePDF(order)} style={{ marginTop: 10 }}>
                  {pdfLoading ? 'Generating PDF...' : 'Download as PDF'}
                </Button>
                 <TouchableOpacity
               style={[styles.addButton]}
              onPress={() => ProceedStore(order.id)}
                 >
                    <Text style={styles.addButtonText}>Order Detail</Text>
                    </TouchableOpacity>
                    </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={styles.noDataText}>No Orders Found</Text>
        )}
      </ScrollView>
      <OrderDetailsModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  orderDetails={selectedOrder}
/>
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
    backgroundColor: '#fff',
    flex: 1,
  },
  loadingText: {
    marginTop: 20,
  },
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  row: {
    // Helper style if needed for row layout
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
    marginVertical: 5,
    borderRadius: 10,
    // remove extra top margin if needed
  },
  orderHeader: {
    backgroundColor: '#d9ecfe',
    padding: 10,
  },
  orderHeaderText: {
    fontWeight: '600',
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
});

export default StoreReport;
