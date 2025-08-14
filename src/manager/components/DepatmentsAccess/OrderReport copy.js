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
} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs'; // Import react-native-fs
import Share from 'react-native-share'; // Optional: For sharing the PDF
import { fetchManageOrderReport } from '../../../functions/DepartmentAccess/function_dep';
import { useFocusEffect } from '@react-navigation/native';

const OrderReport = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);
  const [storeAddress, setStoreAddress] = useState(null);
  const [StoreName, setStoreName] = useState(null);
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  // To track PDF generation loading
  const [pdfLoading, setPDFLoading] = useState(false);
  // Request storage permissions (Android only)
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // Check if permission is already granted
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted) {
          return true;
        }
        // Request WRITE_EXTERNAL_STORAGE permission
        const response = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'This app needs access to your storage to save PDF files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return response === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS does not require WRITE_EXTERNAL_STORAGE permission
        return true;
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Permission Error', 'Failed to request permission.');
      return false;
    }
  };
  // Fetch the data (with optional date range) and store in "data"
  const fetchData = async (customStartDate, customEndDate) => {
    setLoading(true);
    const start = customStartDate || startDate;
    const end = customEndDate || endDate;
    await fetchManageOrderReport(start, end, setData, setLoading);
  };
      useFocusEffect(
        useCallback(() => {
          const fetchInitialData = async () => {
            try {
              // Retrieve any needed tokens/urls (if used by fetchManageOrderReport)
              const token = await AsyncStorage.getItem('access_token');
              const url = await AsyncStorage.getItem('store_url');
              const store_full_name = await AsyncStorage.getItem('store_full_name');
              const store_adress = await AsyncStorage.getItem('store_address');
              setStoreName(store_full_name);
              setStoreAddress(store_adress);
              // Not used directly here, but you can pass them to your function if needed
              // Set default date range (last 7 days)
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
        }, [])
      );
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
  // Function to get the date of the last Monday
  const getLastMonday = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
    newDate.setDate(diff);
    return newDate;
  };
  // Date filter handlers
  const setToday = () => {
    setData(['']);
    const today = new Date();
    const start = resetTimeToStartOfDay(today);
    const end = setTimeToEndOfDay(today);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };
  const setYesterday = () => {
    setData(['']);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = resetTimeToStartOfDay(yesterday);
    const end = setTimeToEndOfDay(yesterday);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  const setWeekly = () => {
    setData(['']);
    const today = new Date();
    const lastMonday = getLastMonday(today);
    const start = resetTimeToStartOfDay(lastMonday);
    const end = setTimeToEndOfDay(today);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  // Custom Date Range Selection
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

  // Function to generate PDF and save to external Download directory
  const generatePDF = async (itemsForInvoice) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Cannot save PDF without storage permission.'
        );
        return;
      }

      setPDFLoading(true);

      // Assuming all items share the same totalCost & invoiceSaveDate
      const { invoiceNumber, totalCost, invoiceUpdateDate, vendorName} =
        itemsForInvoice[0];
        const formatDateTime = (dateStr) => {
          const [datePart, timePart] = dateStr.split(" ");
          const [year, month, day] = datePart.split("-");
          return `${month}-${day}-${year}`;
        };
        
        const formattedDate = formatDateTime(invoiceUpdateDate);
      // Build table rows as HTML
      const tableRows = itemsForInvoice
        .map((rowItem) => {
          return `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.barcode}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posSize}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.invQty}</td>
            </tr>
          `;
        })
        .join('');

      // Full HTML
      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>${invoiceNumber} - ${vendorName}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1, h3, h4 { text-align: left; }
          </style>
        </head>
        <body>
          <div class="invoice-header" style="margin: 2%">
          <h2> From: ${StoreName}</h2>
          <p>${storeAddress}</p>
          <h2>To:${vendorName}</h2>
          <h4>Date: ${formattedDate}</h4>
          <h4>PO: ${invoiceNumber}</h4>
</div>
          <table>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Item Name</th>
                <th>Size</th>
                <th>Qty</th>
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
        fileName: `${invoiceNumber}`,
        directory: 'Download', // Saved under /storage/emulated/0/Android/data/com.odoo/files/Download/
        // Optional: base64: true, // If you need base64 encoded string
      };
      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', file.filePath);
      // Define destination path in the public Download directory
      const destPath = `${RNFS.DownloadDirectoryPath}/${invoiceNumber}-${vendorName}.pdf`;
      console.log('Destination Path:', destPath);
      // Check if the external Download directory exists
      const downloadDirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
      if (!downloadDirExists) {
        // Create the Download directory if it doesn't exist
        await RNFS.mkdir(RNFS.DownloadDirectoryPath);
      }
      // Move the PDF from internal storage to external Download directory
      await RNFS.moveFile(file.filePath, destPath);
      console.log('PDF moved to:', destPath);
      setPDFLoading(false);
      setPdfUri(`file://${destPath}`);
     setIsPdfVisible(true); // Show the viewer
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
  // Optional: Function to open the PDF using react-native-share
  const openPDF = async (filePath) => {
    try {
      const shareOptions = {
        title: 'Open Invoice PDF',
        url: `file://${filePath}`,
        type: 'application/pdf',
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error opening PDF:', error);
    }
  };
  // If data is loading, show a spinner
  if (loading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Fetching Invoice Data...</Text>
      </View>
    );
  }
  // 1) Group data by invoiceNumber
  const groupedData = data.reduce((acc, item) => {
    const key = `${item.vendorName} - ${item.invoiceNumber}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
  console.log('groupedData',groupedData);
  const parseDateString = (dateString) => {
    // For instance, "2025-03-15 12:17:42"
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute, second).getTime();
  };
  return (
       <View style={styles.maincontainer}>
   
        <View style={styles.container}>
                {/* Vendor Search Box */}
                <View style={styles.row}>
                  <Card style={{ marginVertical: 5, backgroundColor:"#d9ecfe" }}>
               <Card.Content>
               <Text style={{color:"#2C62FF", fontWeight:"800", padding:5}}>Select Custom Range:</Text>
              <View style={styles.headercontainer}>
              <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={setWeekly} style={styles.filterButton} >
                Refresh
              </Button>
              <Button mode="contained" onPress={setToday} style={styles.filterButton} >
                Today
              </Button>
              <Button mode="contained" onPress={setWeekly} style={styles.filterButton} >
                Weekly
              </Button>
            </View>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity onPress={() => setStartDatePickerOpen(true)} style={styles.dateRangeButton}>
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
      
              <TouchableOpacity onPress={() => setEndDatePickerOpen(true)} style={styles.dateRangeButton}>
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
      {/* Date Filter Buttons */}


      <ScrollView style={styles.container}>
        
  {/* Render each invoiceNumber group in its own Card / Table */}
  {Object.keys(groupedData).length > 0 ? (
    Object.keys(groupedData)
    .sort((a, b) => {
      const itemA = groupedData[a][0];
      const itemB = groupedData[b][0];
      const dateA = parseDateString(itemA?.invoiceUpdateDate || '');
      const dateB = parseDateString(itemB?.invoiceUpdateDate || '');

      // const dateA = Date.parse(itemA?.invoiceUpdateDate || '') || 0;
      // const dateB = Date.parse(itemB?.invoiceUpdateDate || '') || 0;
      return dateB - dateA;
    })
      .map((invoiceNum, index) => {
        const items = groupedData[invoiceNum];
        const { totalCost, invoiceUpdateDate, posDepartment } = items[0];
        const formatDateTime = (dateStr) => {
          if (!dateStr || !dateStr.includes(' ')) return 'N/A';
          const [datePart, timePart] = dateStr.split(" ");
          const [year, month, day] = datePart.split("-");
          return `${month}-${day}-${year}`;
        };

        const formattedDate = formatDateTime(invoiceUpdateDate);
        return (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Text style={[styles.cardText, { fontWeight: 'bold' }]}>
                {invoiceNum !== 'undefined - undefined' && invoiceNum.trim() !== ''
                  ? `PO: ${invoiceNum} | `
                  : 'NO DATA FOUND'}
                {formattedDate}
              </Text>

              <View style={styles.tableRow}>
                <Text style={styles.tableHeaderCell}>Barcode</Text>
                <Text style={styles.tableHeaderCell}>Item Name</Text>
                <Text style={styles.tableHeaderCell}>Size</Text>
                <Text style={styles.tableHeaderCell}>Qty</Text>
              </View>

              {items.map((rowItem, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{rowItem.barcode}</Text>
                  <Text style={styles.tableCell}>{rowItem.posName}</Text>
                  <Text style={styles.tableCell}>{rowItem.posSize}</Text>
                  <Text style={styles.tableCell}>{rowItem.invQty}</Text>
                </View>
              ))}

              <Button
                mode="outlined"
                onPress={() => generatePDF(items)}
                style={{ marginTop: 10 }}
              >
                Download as PDF
              </Button>
             
            </Card.Content>
          </Card>
        );
      })
  ) : (
    <Text style={styles.noRequestText}>No Invoices Found</Text>
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
  maincontainer:{
    backgroundColor: "#fff",
    flex: 1,
      },
  loadingText: {
    marginTop: 20,
  },
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  headercontainer:{
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 15,
    width: "50%",
  },
  filterButton: {
    backgroundColor: '#2C62FF',
    color:"#fff",
    borderRadius: 5,
    marginRight: 5,
    textAlign: 'center',
  },
  dateRangeContainer: {
    width:"50%",
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
  },
  dateRangeButton: {
    flex: 1,
    backgroundColor: '#DDDDDD',
    padding: 10,
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
    fontSize: 20,
    marginVertical: 10,
  },

  // Table styles
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
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },

  // Footer info styles
  footerRow: {
    marginTop: 10,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noRequestText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default OrderReport;