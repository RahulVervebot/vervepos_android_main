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
import { fetchStoreReport } from '../functions/VendorAccess/function';

const WarehouseReport = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [pdfLoading, setPDFLoading] = useState(false);

  // Helper to format ISO date string into "MM-DD-YYYY HH:MM"
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
    await fetchStoreReport(
      start,
      end,
      (fetchedOrders) => {
        // Sort newest to oldest
        const sortedOrders = [...fetchedOrders].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
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

  // Function to generate PDF for an entire order (all warehouses)
  const generatePDF = async (order) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot save PDF without storage permission.');
        return;
      }
      setPDFLoading(true);

      // Group order lines by warehouse for PDF
      const groupedLines = order.order_lines.reduce((acc, line) => {
        const key = line.warehouse_name || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(line);
        return acc;
      }, {});

      // Build HTML rows per warehouse
      let htmlBody = '';
      for (const [warehouse, lines] of Object.entries(groupedLines)) {
        // Totals calculation for warehouse
        let totalQuantity = 0;
        let totalPrice = 0;
        const rows = lines
          .map((line) => {
            totalQuantity += Number(line.quantity);
            totalPrice += Number(line.total_price);
            return `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.product_name}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.barcode}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.unit_price}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.total_price}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.available_stock}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${line.quotation_status}</td>
              </tr>
            `;
          })
          .join('');

        htmlBody += `
          <h2 style="text-align: center;">Warehouse: ${warehouse}</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th style="border: 1px solid #ccc; padding: 8px;">Product Name</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Barcode</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Qty</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Unit Price</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Total Price</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Available Stock</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="7" style="border: 1px solid #ccc; padding: 8px; text-align: center;">No Order Lines Found</td></tr>`}
              <tr>
                <td colspan="2" style="font-weight:bold; text-align:right; padding:8px;">Total:</td>
                <td style="font-weight:bold; text-align:center; padding:8px;">${totalQuantity}</td>
                <td></td>
                <td style="font-weight:bold; text-align:center; padding:8px;">${totalPrice.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
          <br />
        `;
      }

      // Full HTML for PDF
      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Order ${order.order_number}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1, h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Order Number: ${order.order_number}</h1>
          ${htmlBody}
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `Order-${order.order_number}`,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', file.filePath);
      const destPath = `${RNFS.DownloadDirectoryPath}/Order-${order.order_number}.pdf`;
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

  // Function to generate PDF for a single warehouse group
  const generateWarehousePDF = async (order, warehouse, lines) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot save PDF without storage permission.');
        return;
      }
      setPDFLoading(true);

      let totalQuantity = 0;
      let totalPrice = 0;
      const rows = lines
        .map((line) => {
          totalQuantity += Number(line.quantity);
          totalPrice += Number(line.total_price);
          return `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${line.product_name}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${line.barcode}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${line.quantity}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${line.unit_price}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${line.total_price}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${line.available_stock}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${line.quotation_status}</td>
            </tr>
          `;
        })
        .join('');

      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Order ${order.order_number} - ${warehouse}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1, h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Order Number: ${order.order_number}</h1>
          <h2>Warehouse: ${warehouse}</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Barcode</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Available Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="7" style="border: 1px solid #ccc; padding: 8px; text-align: center;">No Order Lines Found</td></tr>`}
              <tr>
                <td colspan="2" style="font-weight:bold; text-align:right; padding:8px;">Total:</td>
                <td style="font-weight:bold; text-align:center; padding:8px;">${totalQuantity}</td>
                <td></td>
                <td style="font-weight:bold; text-align:center; padding:8px;">${totalPrice.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `Order-${order.order_number}-${warehouse}`,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', file.filePath);
      const destPath = `${RNFS.DownloadDirectoryPath}/Order-${order.order_number}-${warehouse}.pdf`;
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
      console.error('Error generating warehouse PDF:', error);
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
        {/* Date Range and Filter Buttons */}
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
          orders.map((order, index) => {
            // Group order lines by warehouse for UI rendering
            const groupedLines = order.order_lines
              ? order.order_lines.reduce((acc, line) => {
                  const key = line.warehouse_name || 'Unknown';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(line);
                  return acc;
                }, {})
              : {};
            return (
              <Card key={index} style={[styles.card, { backgroundColor: '#ffffff' }]}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderHeaderText}>
                    Order Number: {order.order_number} | Status: {order.status} | Date:{' '}
                    {formatDate(order.created_at)}
                  </Text>
                </View>
                <Card.Content style={{ padding: 10 }}>
                  {order.order_lines && order.order_lines.length > 0 ? (
                    Object.entries(groupedLines).map(([warehouse, lines]) => {
                      // Calculate totals for UI display
                      const totalQuantity = lines.reduce(
                        (sum, line) => sum + Number(line.quantity),
                        0
                      );
                      const totalPrice = lines.reduce(
                        (sum, line) => sum + Number(line.total_price),
                        0
                      );
                      return (
                        <View key={warehouse} style={{ marginBottom: 15 }}>
                          <Text style={styles.warehouseHeader}>
                            Warehouse: {warehouse}
                          </Text>
                          <View style={styles.tableRow}>
                            <Text style={styles.tableHeaderCell}>Product Name</Text>
                            <Text style={styles.tableHeaderCell}>Barcode</Text>
                            <Text style={styles.tableHeaderCell}>Qty</Text>
                            <Text style={styles.tableHeaderCell}>Unit Price</Text>
                            <Text style={styles.tableHeaderCell}>Total Price</Text>
                            <Text style={styles.tableHeaderCell}>Stock</Text>
                            <Text style={styles.tableHeaderCell}>Status</Text>
                          </View>
                          {lines.map((line, idx) => (
                            <View key={idx} style={styles.tableRow}>
                              <Text style={styles.tableCell}>{line.product_name}</Text>
                              <Text style={styles.tableCell}>{line.barcode}</Text>
                              <Text style={styles.tableCell}>{line.quantity}</Text>
                              <Text style={styles.tableCell}>{line.unit_price}</Text>
                              <Text style={styles.tableCell}>{line.total_price}</Text>
                              <Text style={styles.tableCell}>{line.available_stock}</Text>
                              <Text style={styles.tableCell}>{line.quotation_status}</Text>
                            </View>
                          ))}
                          {/* Display totals */}
                          <View style={styles.tableRow}>
                            
                            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                             QTY: {totalQuantity}
                            </Text>
                            <Text style={styles.tableCell}></Text>
                            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                             Total: {totalPrice.toFixed(2)}
                            </Text>
                            <Text style={styles.tableCell} />
                            <Text style={styles.tableCell} />
                          </View>
                          {/* Download button for this warehouse */}
                          <Button
                            mode="outlined"
                            onPress={() => generateWarehousePDF(order, warehouse, lines)}
                            style={{ marginTop: 10 }}
                          >
                            {pdfLoading ? 'Generating PDF...' : 'Download Warehouse PDF'}
                          </Button>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noDataText}>No Order Lines Found</Text>
                  )}
                  {/* Overall download for the entire order (all warehouses) */}
           
                </Card.Content>
              </Card>
            );
          })
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
  row: {},
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
  },
  orderHeader: {
    backgroundColor: '#d9ecfe',
    padding: 10,
  },
  orderHeaderText: {
    fontWeight: '600',
  },
  warehouseHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center',
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
});

export default WarehouseReport;
