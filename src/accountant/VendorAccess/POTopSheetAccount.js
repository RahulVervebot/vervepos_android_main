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
  TextInput,
  Modal,
} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import CheckBox from '@react-native-community/checkbox';
import {
  fetchManageOrderReport,
  getVendorBudgetCurrentWeek,
  UpdatePOVendor,
  fetchVendorDetailsForVendor,
} from '../../functions/DepartmentAccess/function_dep';

const POTopSheetAccount = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [vendorBudgets, setVendorBudgets] = useState({}); // State to store budget info per vendor
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [pdfLoading, setPDFLoading] = useState(false);
  const [searchQueries, setSearchQueries] = useState({});
  const [editedQuantities, setEditedQuantities] = useState({});
  const [filteredItems, setFilteredItems] = useState([]); // Items for the selected vendor
  const [loadingItems, setLoadingItems] = useState(false);
  const [vendorData, setVendorData] = useState([]); // Full vendor data
  const [selectedModalItems, setSelectedModalItems] = useState([]);
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
  const [itemModalSearchQuery, setItemModalSearchQuery] = useState('');

  // Request storage permission (Android only)
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted) {
          return true;
        }
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

  // PDF generation function
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

      // Destructure details from the first item
      const { invoiceNumber, vendorName, status } = itemsForInvoice[0];
      const totalPosCost = itemsForInvoice.reduce((acc, rowItem) => {
        const cost = parseFloat(rowItem.invCaseCost) || 0;
        const quantity = parseFloat(rowItem.invQty) || 0;
        return acc + cost * quantity;
      }, 0);

      // Build table rows as HTML
      const tableRows = itemsForInvoice
        .map((rowItem) => {
          return `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posDepartment}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.barcode}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posSize}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.invCaseCost}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.invQty}</td>
            </tr>
          `;
        })
        .join('');

      // Full HTML content for PDF
      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>${invoiceNumber} - ${vendorName}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1, h3, h4 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>PO: ${invoiceNumber} - ${vendorName}</h1>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Barcode</th>
                <th>Item Name</th>
                <th>Size</th>
                <th>Case Cost</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <br />
          <h3>Total Cost: ${totalPosCost.toFixed(2)}</h3>
          <h4>Status: ${status}</h4>
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `PO_${invoiceNumber}`,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);
      const destPath = `${RNFS.DownloadDirectoryPath}/${invoiceNumber}_${vendorName}.pdf`;

      const downloadDirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
      if (!downloadDirExists) {
        await RNFS.mkdir(RNFS.DownloadDirectoryPath);
      }

      await RNFS.moveFile(file.filePath, destPath);
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
    }
  };

  // Function to open the generated PDF
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
      Alert.alert('Error', 'Could not open PDF.');
    }
  };

  // Fetch report data
  const fetchData = async (customStartDate, customEndDate) => {
    setLoading(true);
    const start = customStartDate || startDate;
    const end = customEndDate || endDate;
    await fetchManageOrderReport(start, end, setData, setLoading);
  };

  // On initial mount, fetch data for the last 7 days
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Optionally retrieve tokens/urls from storage
        await AsyncStorage.getItem('access_token');
        await AsyncStorage.getItem('store_url');
        const today = new Date();
        const lastMonday = getLastMonday(today);
        const start = resetTimeToStartOfDay(lastMonday);
        const end = setTimeToEndOfDay(today);

        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 7);

        setStartDate(start);
        setEndDate(end);
        await fetchData(start, end);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to fetch initial data.');
      }
    };
    fetchInitialData();
  }, []);

  // When invoice data is loaded, fetch vendor budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      const vendors = [
        ...new Set(data.map((item) => item.vendorName).filter(Boolean)),
      ];
      const budgets = {};
      await Promise.all(
        vendors.map(async (vendorName) => {
          const budget = await getVendorBudgetCurrentWeek(vendorName);
          if (budget?.status === 'success' && budget.data?.length > 0) {
            const vendorAllocations = budget.data[0]?.vendor_allocations ?? [];
            if (vendorAllocations.length > 0) {
              budgets[vendorName] = {
                total: vendorAllocations[0].vendor_allocated_amount || '0',
                remaining: vendorAllocations[0].vendor_remaining_amount
                  ? parseFloat(vendorAllocations[0].vendor_remaining_amount).toFixed(2)
                  : '0.00',
              };
            } else {
              budgets[vendorName] = { total: '0', remaining: '0' };
            }
          } else {
            budgets[vendorName] = { total: '0', remaining: '0' };
          }
        })
      );
      setVendorBudgets(budgets);
    };

    if (data.length > 0) {
      fetchBudgets();
    }
  }, [data]);

  // Helpers to reset or set time for a date
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

  // Get last Monday from a given date
  const getLastMonday = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
    newDate.setDate(diff);
    return newDate;
  };

  // Date filter handlers
  const setToday = () => {
    setData([]);
    const today = new Date();
    const start = resetTimeToStartOfDay(today);
    const end = setTimeToEndOfDay(today);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  const setYesterday = () => {
    setData([]);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = resetTimeToStartOfDay(yesterday);
    const end = setTimeToEndOfDay(yesterday);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  };

  const setWeekly = () => {
    setData([]);
    const today = new Date();
    const lastMonday = getLastMonday(today);
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

  // Group data by invoiceNumber
  const groupedData = data.reduce((acc, item) => {
    const key = `${item.vendorName} - ${item.invoiceNumber}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  // Sort invoice keys so newest (most recent date) is at the top
  // const sortedInvoiceKeys = Object.keys(groupedData).sort((a, b) => {
  //   const itemsA = groupedData[a];
  //   const itemsB = groupedData[b];
  //   const dateA = new Date(itemsA[0].invoiceUpdateDate).getTime();
  //   const dateB = new Date(itemsB[0].invoiceUpdateDate).getTime();
  //   // Subtraction reversed so bigger date (B) ends up first => newest first
  //   return dateB - dateA;
  // });

  // A helper function to reliably parse "YYYY-MM-DD HH:mm:ss" into a timestamp
const parseDateString = (dateString) => {
  // For instance, "2025-03-15 12:17:42"
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  const [hour, minute, second] = timePart.split(':');
  return new Date(year, month - 1, day, hour, minute, second).getTime();
};

// Then in your sorting logic, do:
const sortedInvoiceKeys = Object.keys(groupedData).sort((a, b) => {
  const dateA = parseDateString(groupedData[a][0].invoiceUpdateDate);
  const dateB = parseDateString(groupedData[b][0].invoiceUpdateDate);

  // Return in descending order so the newest (biggest timestamp) is first
  return dateB - dateA;
});

  const updateVendorOrder = async (invoiceKey) => {
    // Retrieve the updated items with the latest `invQty` values
    const updatedItems = data
      .filter(
        (item) => `${item.vendorName} - ${item.invoiceNumber}` === invoiceKey
      )
      .map((item, idx) => ({
        ...item,
        invQty: editedQuantities[`${invoiceKey}-${idx}`] ?? item.invQty, // Use updated quantity
      }));

    if (!updatedItems || updatedItems.length === 0) {
      Alert.alert('Update Failed', 'No items found for this invoice.');
      return;
    }

    try {
      const response = await UpdatePOVendor(updatedItems);

      if (response) {
        Alert.alert(response.message);
      } else {
        Alert.alert('Update Failed', 'Failed to update the purchase order.');
      }
    } catch (error) {
      console.error('Error updating PO:', error);
      Alert.alert('Error', 'An error occurred while updating the purchase order.');
    }
  };

  const handleQtyChange = (text, invoiceKey, idx) => {
    const newQty = text.replace(/[^0-9]/g, ''); // Ensure only numeric input

    setEditedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [`${invoiceKey}-${idx}`]: newQty,
    }));

    // Update the data state properly
    setData((prevData) =>
      prevData.map((item, itemIdx) => {
        if (
          `${item.vendorName} - ${item.invoiceNumber}` === invoiceKey &&
          itemIdx === idx
        ) {
          return { ...item, invQty: newQty }; // Update the `invQty`
        }
        return item;
      })
    );
  };

  const loadVendorDetails = async (vendorName) => {
    await AsyncStorage.setItem('filteredVendorNames', vendorName);
    setLoadingItems(true);
    const fetchedVendors = await fetchVendorDetailsForVendor(vendorName); // Pass vendorName explicitly
    setVendorData(fetchedVendors);
    setLoadingItems(false);

    const itemsForSelectedVendor = fetchedVendors.filter(
      (vendor) => vendor.vendorName === vendorName
    );

    setFilteredItems(itemsForSelectedVendor);

    if (fetchedVendors.length > 0) {
      setIsItemsModalVisible(true);
    } else {
      Alert.alert('No Items', 'No items found for this vendor.');
    }
  };

  const modalFilteredItems = filteredItems.filter((item) => {
    const posName = item.posName ? item.posName.toString().toLowerCase() : '';
    const barcode = item.barcode ? item.barcode.toString().toLowerCase() : '';
    const posDepartment = item.posDepartment
      ? item.posDepartment.toString().toLowerCase()
      : '';
    const query = itemModalSearchQuery.toLowerCase();

    return (
      posName.includes(query) ||
      barcode.includes(query) ||
      posDepartment.includes(query)
    );
  });

  const handleAddSelectedItems = () => {
    const selectedItemsData = filteredItems.filter((item) =>
      selectedModalItems.includes(item.barcode)
    );

    setData((prevData) => {
      const updatedData = [...prevData];

      selectedItemsData.forEach((selectedItem) => {
        const existingIndex = updatedData.findIndex(
          (row) => row.barcode === selectedItem.barcode
        );

        if (existingIndex >= 0) {
          updatedData[existingIndex].invQty =
            parseFloat(updatedData[existingIndex].invQty || 0) + 1;
          updatedData[existingIndex].totalPrice =
            updatedData[existingIndex].invCaseCost *
            updatedData[existingIndex].invQty;
        } else {
          updatedData.push({
            ...selectedItem,
            invQty: 1,
            totalPrice: selectedItem.invCaseCost,
          });
        }
      });

      return updatedData;
    });

    setSelectedModalItems([]);
    setIsItemsModalVisible(false);
  };

  const toggleCheckbox = (barcode, caseCost) => {
    setSelectedModalItems((prevItems) => {
      if (prevItems.includes(barcode)) {
        return prevItems.filter((item) => item !== barcode);
      } else {
        return [...prevItems, barcode];
      }
    });
  };

  return (
    <View style={styles.maincontainer}>
      <View style={styles.container}>
        {/* Vendor Search Box / Date Filter Section */}
        <View style={styles.row}>
          <Card style={{ marginVertical: 5, backgroundColor: '#d9ecfe' }}>
            <Card.Content>
              <Text style={{ color: '#2C62FF', fontWeight: '800', padding: 5 }}>
                Select Custom Range:
              </Text>
              <View style={styles.headercontainer}>
                {/*
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      onPress={setToday}
                      style={styles.filterButton}
                    >
                      Today
                    </Button>
                    <Button
                      mode="contained"
                      onPress={setYesterday}
                      style={styles.filterButton}
                    >
                      Yesterday
                    </Button>
                    <Button
                      mode="contained"
                      onPress={setWeekly}
                      style={styles.filterButton}
                    >
                      Weekly
                    </Button>
                  </View>
                */}
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
                      {endDate
                        ? `End: ${endDate.toLocaleDateString()}`
                        : 'End Date'}
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
        {sortedInvoiceKeys.length > 0 ? (
          sortedInvoiceKeys.map((invoiceKey, index) => {
            const items = groupedData[invoiceKey];
            const filtered = items.filter((rowItem) => {
              const searchQuery = searchQueries[invoiceKey]?.toLowerCase() || '';
              return (
                rowItem.posDepartment.toLowerCase().includes(searchQuery) ||
                rowItem.barcode.toLowerCase().includes(searchQuery) ||
                rowItem.posName.toLowerCase().includes(searchQuery)
              );
            });

            const totalPosCost = items.reduce((acc, rowItem) => {
              const cost = parseFloat(rowItem.invCaseCost) || 0;
              const quantity = parseFloat(rowItem.invQty) || 0;
              return acc + cost * quantity;
            }, 0);

            // Extract vendorName from the key "vendorName - invoiceNumber"
            const vendorName = invoiceKey.split(' - ')[0];
            const budgetInfo =
              vendorBudgets[vendorName] || { total: '0', remaining: '0' };

            const { invoiceUpdateDate, start_date, end_date, status } = items[0];
            const formattedDate = invoiceUpdateDate;
            const startweek = start_date;
            const endweek = end_date;

            return (
              <Card key={index} style={styles.card}>
                <Card.Content>
                  <View style={styles.vendorheader}>
                    <Text style={[styles.cardText, { fontWeight: 'bold' }]}>
                      {invoiceKey !== 'undefined - undefined' &&
                      invoiceKey.trim() !== ''
                        ? `PO: ${invoiceKey}`
                        : 'NO DATA FOUND'}
                    </Text>
                    <TextInput
                      style={styles.searchBox}
                      placeholder="Search Department, Barcode, or Item Name"
                      value={searchQueries[invoiceKey] || ''}
                      onChangeText={(text) =>
                        setSearchQueries({ ...searchQueries, [invoiceKey]: text })
                      }
                    />
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>
                      Total Cost: {totalPosCost.toFixed(2)}
                    </Text>
                    <Text style={styles.footerText}>Date: {formattedDate}</Text>
                  </View>

                  {/* Table Header */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Department</Text>
                    <Text style={styles.tableHeaderCell}>Barcode</Text>
                    <Text style={styles.tableHeaderCell}>Item Name</Text>
                    <Text style={styles.tableHeaderCell}>Size</Text>
                    <Text style={styles.tableHeaderCell}>Case Cost</Text>
                    <Text style={styles.tableHeaderCell}>Qty</Text>
                    <Text style={styles.tableHeaderCell}>Total</Text>
                  </View>

                  {filtered.map((rowItem, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {rowItem.posDepartment}
                      </Text>
                      <Text style={styles.tableCell}>{rowItem.barcode}</Text>
                      <Text style={styles.tableCell}>{rowItem.posName}</Text>
                      <Text style={styles.tableCell}>{rowItem.posSize}</Text>
                      <Text style={styles.tableCell}>{rowItem.invCaseCost}</Text>
                      <Text style={styles.tableCell}>{rowItem.invQty}</Text>

                      <Text style={styles.tableCell}>
                        {(
                          (parseFloat(rowItem.invCaseCost) || 0) *
                          (parseFloat(
                            editedQuantities[`${invoiceKey}-${idx}`] ??
                              rowItem.invQty
                          ) || 0)
                        ).toFixed(2)}
                      </Text>
                    </View>
                  ))}

                  {/* Footer info */}
                  <View style={styles.alltablebutton}>
                    <Button
                      mode="outlined"
                      onPress={() => generatePDF(items)}
                      style={{ marginTop: 10, marginRight: 10 }}
                    >
                      Download as PDF
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Text style={styles.noRequestText}>No Data Found</Text>
        )}
      </ScrollView>
      <Modal
        visible={isItemsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsItemsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Items</Text>

            {/* Search Box inside modal */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search Items..."
              value={itemModalSearchQuery}
              onChangeText={setItemModalSearchQuery}
            />

            {modalFilteredItems && modalFilteredItems.length > 0 ? (
              <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                {modalFilteredItems.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <CheckBox
                      value={selectedModalItems.includes(item.barcode)}
                      onValueChange={() =>
                        toggleCheckbox(item.barcode, item.invCaseCost)
                      }
                    />
                    <Text style={{ marginLeft: 8 }}>
                      {item.posName} - ${item.invCaseCost}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ marginTop: 16 }}>Item not found</Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}
            >
              <TouchableOpacity style={[styles.addbutton]} onPress={handleAddSelectedItems}>
                <Text style={styles.buttonText}>Add Items</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.clearbuttonsRow]}
                onPress={() => setIsItemsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  maincontainer: { backgroundColor: '#fff', flex: 1 },
  loadingText: { marginTop: 20 },
  container: { padding: 20, backgroundColor: '#f9f9f9' },
  headercontainer: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 15,
    width: '50%',
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
  cardText: { fontSize: 20, marginVertical: 10 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
    alignItems: 'center',
  },
  tableHeaderCell: { flex: 1, fontWeight: 'bold', textAlign: 'center' },
  tableCell: { flex: 1, textAlign: 'center' },
  footerRow: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
  tableCellqty: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    borderColor: '#f3f3f3',
    borderWidth: 1,
  },
  footerText: { fontSize: 16, fontWeight: '700', margin: 10, color: '#2C62FF' },
  noRequestText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  vendorheader: {
    flexDirection: 'row',
  },
  searchBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginLeft: 20,
  },
  alltablebutton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  searchvendorbutton: {
    backgroundColor: '#f00',
    paddingVertical: 15, // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  clearbuttonsRow: {
    backgroundColor: '#f00',
    paddingVertical: 10, // Internal vertical padding
    paddingHorizontal: 15, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addbutton: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15, // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
});

export default POTopSheetAccount;
