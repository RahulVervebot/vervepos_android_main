import React, { useState, useEffect, useCallback } from 'react';
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
  Image
} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS, { appendFile } from 'react-native-fs';
import Share from 'react-native-share';
import CheckBox from '@react-native-community/checkbox';
import {
  fetchManageOrderReport,
  getVendorBudgetCurrentWeek,
  UpdatePOVendor,
  fetchVendorDetailsForVendor,
  getSingleDepartmentCurrentWeek,
} from '../../../functions/DepartmentAccess/function_dep';
import { useFocusEffect } from '@react-navigation/native';
const DepartmentReport = () => {
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
  const [departmentBudgets, setDepartmentBudgets] = useState({});
  const [username, setUserName] = useState('');
  // Request sto  const { budgetloading, startDateFormatted, endDateFormatted, activeDepartmentBudget, totalspend } = useBudgetData();
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

  const departmentBudget = async (departmentName) => {
    try {
      const details = await getSingleDepartmentCurrentWeek(departmentName);
      const allocation = details?.data?.[0]?.department_allocations?.[0];
       
      if (allocation) {
        setDepartmentBudgets((prev) => ({
          ...prev,
          [departmentName]: {
            total: allocation.departmentAllocatedAmount,
            remaining: allocation.departmentRemainingAmount,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching department budget:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const uniqueDepartments = new Set();
      data.forEach((item) => {
        if (item.departmentName) {
          uniqueDepartments.add(item.departmentName);
        }
      });

      uniqueDepartments.forEach((dept) => {
        if (!departmentBudgets[dept]) {
          departmentBudget(dept);
        }
      });
    }, [data])
  );

  // PDF generation for the entire invoice
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
      const { invoiceNumber, vendorName, status, end_date, start_date} = itemsForInvoice[0];

      const totalPosCost = itemsForInvoice.reduce((acc, rowItem) => {
        if(rowItem.invQty > 0){
          const cost = parseFloat(rowItem.invCaseCost) || 0;
          const quantity = parseFloat(rowItem.invQty) || 0;
          return acc + cost * quantity;
          }else{
          const cost = parseFloat(rowItem.posUnitCost) || 0;
          const quantity = parseFloat(rowItem.unitQty) || 0;
          return acc + cost * quantity;
          }
  
      }, 0);
      const formatDateTime = (dateStr) => {
        const [datePart, timePart] = dateStr.split(" ");
        const [year, month, day] = datePart.split("-");
        return `${month}-${day}-${year}`;
      };
      const endformattedDate = formatDateTime(end_date);
      const startformattedDate = formatDateTime(start_date);
      // Build table rows as HTML
      const tableRows = itemsForInvoice
        .map((rowItem) => {
          return `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.departmentName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.barcode}</td>
   
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posName}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.vendorName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posSize}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.invCaseCost}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.invQty}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posUnitCost}</td>
               <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.unitQty}</td>
            </tr>
          `;
        })
        .join('');

      // Full HTML content for PDF
      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>${invoiceNumber}</title>

          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1, h3, h4 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>PO: ${invoiceNumber}</h1>
          <h4>${startformattedDate} to ${endformattedDate}<h4>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Barcode</th>
               
                <th>Item Name</th>cc
                 <th>Vendor Name</th>
                <th>Size</th>
                <th>CC</th>
                <th>CQty</th>
                  <th>UC</th>
                <th>UQty</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <br />
          <h3>Total Cost: ${totalPosCost.toFixed(2)}</h3>
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

  // New function: Generate PDF for a single department's items
  const generateDepartmentPDF = async (departmentItems, invoiceKey, departmentName) => {
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
      const firstItem = departmentItems[0];
      const { invoiceNumber, vendorName, status, end_date, start_date } = firstItem;
      const totalPosCost = departmentItems.reduce((acc, rowItem) => {
        if(rowItem.invQty > 0){
        const cost = parseFloat(rowItem.invCaseCost) || 0;
        const quantity = parseFloat(rowItem.invQty) || 0;
        return acc + cost * quantity;
        }else{
        const cost = parseFloat(rowItem.posUnitCost) || 0;
        const quantity = parseFloat(rowItem.unitQty) || 0;
        return acc + cost * quantity;
        }
     
      }, 0);
      const formatDateTime = (dateStr) => {
        const [datePart, timePart] = dateStr.split(" ");
        const [year, month, day] = datePart.split("-");
        return `${month}-${day}-${year}`;
      };
      const endformattedDate = formatDateTime(end_date);
      const startformattedDate = formatDateTime(start_date);

      const tableRows = departmentItems
        .map((rowItem) => {
          return `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.vendorName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.barcode}</td>
      
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posSize}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.invCaseCost}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.invQty}</td>
                              <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.posUnitCost}</td>
               <td style="border: 1px solid #ccc; padding: 8px;">${rowItem.unitQty}</td>
            </tr>
          `;
        })
        .join('');

      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${invoiceNumber} - Dept: ${departmentName}</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1, h2, h3, h4 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>PO: ${invoiceNumber}</h1>
          <h2>Department: ${departmentName}</h2>
           <h4>${startformattedDate} to ${endformattedDate}<h4>
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Barcode</th>
             
                <th>Item Name</th>
                <th>Size</th>
                <th>CC</th>
                <th>CQty</th>
                <th>UC</th>
                  <th>UQty</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <br />
          <h3>Department Total: ${totalPosCost.toFixed(2)}</h3>
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `Invoice_${invoiceNumber}_Dept_${departmentName}`,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);
      const destPath = `${RNFS.DownloadDirectoryPath}/Invoice_${invoiceNumber}_Dept_${departmentName}.pdf`;

      const downloadDirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
      if (!downloadDirExists) {
        await RNFS.mkdir(RNFS.DownloadDirectoryPath);
      }

      await RNFS.moveFile(file.filePath, destPath);
      setPDFLoading(false);

      Alert.alert(
        'Department PDF Generated',
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
      console.error('Error generating Department PDF:', error);
      setPDFLoading(false);
    }
  };

  // Function to open the generated PDF
  const openPDF = async (filePath) => {
    try {
      const shareOptions = {
        title: 'Open PDF',
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
    console.log("data department:",data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [])
  );

  const fetchInitialData = useCallback(async () => {
    try {
      await AsyncStorage.getItem('access_token');
      await AsyncStorage.getItem('store_url');
   const username = await AsyncStorage.getItem('username');
setUserName(username);
      const today = new Date();
      const lastMonday = getLastMonday(today);
      const start = resetTimeToStartOfDay(lastMonday);
      const end = setTimeToEndOfDay(today);
      setStartDate(start);
      setEndDate(end);
      await fetchData(start, end);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to fetch initial data.');
    }

  }, []);
  // On initial mount, fetch data for the last 7 days




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

  // ----------- GROUP DATA BY invoiceNumber, THEN BY departmentName -----------
  const invoiceGroups = data.reduce((acc, item) => {
    const invoiceKey = item.invoiceNumber || 'No_Invoice_Number';
    if (!acc[invoiceKey]) {
      acc[invoiceKey] = {};
    }
    const deptKey = item.departmentName || 'Unknown Dept';
    if (!acc[invoiceKey][deptKey]) {
      acc[invoiceKey][deptKey] = [];
    }
    acc[invoiceKey][deptKey].push(item);
    return acc;
  }, {});

  // Parse date utility: "YYYY-MM-DD HH:mm:ss"
  const parseDateString = (dateString) => {
    if (!dateString) return 0;
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute, second).getTime();
  };

  // Helper to grab the "first item" from the first department in an invoice
  const getFirstItemInInvoice = (departments) => {
    const deptKeys = Object.keys(departments);
    if (deptKeys.length === 0) return null;
    const firstDeptArray = departments[deptKeys[0]];
    if (!firstDeptArray || firstDeptArray.length === 0) return null;
    return firstDeptArray[0];
  };

  // Sort invoices by newest date

  const sortedInvoiceKeys = Object.keys(invoiceGroups).sort((a, b) => {
    const firstItemA = getFirstItemInInvoice(invoiceGroups[a]);
    const firstItemB = getFirstItemInInvoice(invoiceGroups[b]);
    const dateA = parseDateString(firstItemA?.invoiceUpdateDate);
    const dateB = parseDateString(firstItemB?.invoiceUpdateDate);
    return dateB - dateA; // descending
  });
  // ---------------------------------------------------------------------------
  console.log("sortedInvoiceKeys:", sortedInvoiceKeys.length);

  // Handle quantity changes

  const handleQtyChange = (text, invoiceKey, barcode) => {
    const newQty = text.replace(/[^0-9]/g, '');
    const editKey = `${invoiceKey}-${barcode}`;

    setEditedQuantities((prev) => ({
      ...prev,
      [editKey]: newQty,
    }));

    setData((prevData) =>
      prevData.map((item) => {
        if (item.invoiceNumber === invoiceKey && item.barcode === barcode) {
          return { ...item, invQty: newQty };
        }
        return item;
      })
    );
  };

  // For item modal filtering

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

  // Handle "Add Items" in modal

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
          updatedData[existingIndex].product_id;
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

  const toggleCheckbox = (barcode) => {
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
        <View style={styles.departmentdeadrow}>
          <View style={styles.dateRangeContainer}>
            <Image
              source={require('../../../images/CalenderIcon.png')}
              style={{ width: 24, height: 24, marginRight: 2 }}
            />
            <TouchableOpacity
              onPress={() => setStartDatePickerOpen(true)}
              style={styles.dateRangeButton}
            >
              <Text>
                {startDate
                  ? `${startDate.toLocaleDateString()} `
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
            <Text>
              _
            </Text>
            <TouchableOpacity
              onPress={() => setEndDatePickerOpen(true)}
              style={styles.dateRangeButton}
            >
              <Text>
                {endDate
                  ? `${endDate.toLocaleDateString()}`
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
            <Text>

            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {sortedInvoiceKeys.length > 0 ? (
          sortedInvoiceKeys.map((invoiceKey, invoiceIdx) => {
            const allItemsForInvoice = Object.values(
              invoiceGroups[invoiceKey]
            ).flat();
            const filteredInvoiceItems = allItemsForInvoice.filter((rowItem) => {
              const searchQuery = searchQueries[invoiceKey]?.toLowerCase() || '';
              const dep = rowItem.departmentName?.toLowerCase() || '';
              const bc = rowItem.barcode?.toLowerCase() || '';
              const nm = rowItem.posName?.toLowerCase() || '';
              return (
                dep.includes(searchQuery) ||
                bc.includes(searchQuery) ||
                nm.includes(searchQuery)
              );
            });
            const totalPosCost = allItemsForInvoice.reduce((acc, rowItem) => {
              if(rowItem.invQty > 0){
              const cost = parseFloat(rowItem.invCaseCost) || 0;
              const quantity = parseFloat(rowItem.invQty) || 0;
              return acc + cost * quantity;
              }else{
                const cost = parseFloat(rowItem.posUnitCost) || 0;
                const quantity = parseFloat(rowItem.unitQty) || 0;
                return acc + cost * quantity;
              }
            }, 0);

            const firstItem = getFirstItemInInvoice(invoiceGroups[invoiceKey]);
            if (!firstItem) {
              return null;
            }
            const {
              vendorName,
              invoiceUpdateDate,
              start_date,
              end_date,
              status,
              warehouseName
            } = firstItem;
            const budgetInfo =
              vendorBudgets[vendorName] || { total: '0', remaining: '0' };

            const deptGroups = filteredInvoiceItems.reduce((acc, item) => {
              const dKey = item.departmentName || 'Unknown Dept';
              if (!acc[dKey]) {
                acc[dKey] = [];
              }
              acc[dKey].push(item);
              return acc;
            }, {});

            const departmentKeys = Object.keys(deptGroups);

            return (
              <View style={styles.departmentrow}>
                {/* Invoice-level header */}
                <View style={styles.vendorheader}>

                  <TextInput
                    style={styles.searchBox}
                    placeholder="  Search Dept, Barcode, or Item Name..."
                    value={searchQueries[invoiceKey] || ''}
                    onChangeText={(txt) =>
                      setSearchQueries({ ...searchQueries, [invoiceKey]: txt })
                    }
                  />
                  {sortedInvoiceKeys.length > 0 ? (


                    <View style={styles.budgetWarehouseButtons}>
                      <TouchableOpacity
                        style={styles.headerwarehousebutton}
                        onPress={() => {
                          const allInvoiceItems = Object.values(
                            invoiceGroups[invoiceKey]
                          ).flat();
                          generatePDF(allInvoiceItems);
                        }}
                      >
                        <Text style={styles.buttonWarehouseText}>Download PO</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.budgetWarehouseButtons}>
                      <TouchableOpacity
                        style={styles.headerwarehousebutton}
                      >
                        <Text style={styles.buttonWarehouseText}>Loading</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {/* Render sub-tables per department */}
                {departmentKeys.map((departmentKey, idx) => {
                  const departmentItems = deptGroups[departmentKey] || [];
                  const departmentTotal = departmentItems.reduce((acc, item) => {
                    // const cost = parseFloat(item.invCaseCost) || 0;
                    // const qty = parseFloat(item.invQty) || 0;
                    // return acc + cost * qty;
                    if(item.invQty > 0){
                      const cost = parseFloat(item.invCaseCost) || 0;
                      const quantity = parseFloat(item.invQty) || 0;
                      return acc + cost * quantity;
                      }else{
                      const cost = parseFloat(item.posUnitCost) || 0;
                      const quantity = parseFloat(item.unitQty) || 0;
                      return acc + cost * quantity;
                      }
                  }, 0);
                  const formatDateTime = (dateStr) => {
                    const [datePart, timePart] = dateStr.split(" ");
                    const [year, month, day] = datePart.split("-");
                    return `${month}/${day}/${year}`;
                  };
                  const endformattedDate = formatDateTime(end_date);
                  const startformattedDate = formatDateTime(start_date);
                  return (
                    <View key={idx} style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: "row", marginTop: "3%" }}>
                        <View style={{ width: "80%", flexDirection: "row" }}>
                          <View style={{ flexDirection: "column", fontWeight: '400', marginRight: "5%" }}>
                            <Text style={{ fontSize: 16, color: "#888" }}>
                              Department
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                              {departmentKey}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "column", fontWeight: '400' }}>
                            <Text style={{ fontSize: 16, color: "#888" }}>
                              PO
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                              {invoiceKey}
                            </Text>
                          </View>
                              {username?.toLowerCase().includes("account") && ( 
                           <View style={{ flexDirection: "column", fontWeight: '400', marginLeft: "5%" }}>
                            <Text style={{ fontSize: 16, color: "#888" }}>
                              Warehouse
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                              {warehouseName}
                            </Text>
                          </View>
                              )}
                        </View>
                       
                          
                          
                        {sortedInvoiceKeys.length > 0 ? (
                          sortedInvoiceKeys.map((invoiceKey, invoiceIdx) => {
                            return (
                              <View style={styles.budgetDepartmentButtons}>
                                <TouchableOpacity
                                  style={styles.headerDepartmentbutton}
                                  onPress={() =>
                                    generateDepartmentPDF(
                                      departmentItems,
                                      invoiceKey,
                                      departmentKey
                                    )
                                  }
                                >
                                  <Text style={styles.buttonDepartmentText}>Department PO</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })
                        ) : (
                          <View style={styles.budgetWarehouseButtons}>
                            <TouchableOpacity
                              style={styles.headerwarehousebutton}
                            >
                              <Text style={styles.buttonWarehouseText}>Loading</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: "row", marginTop: "3%" }}>
                        <View style={{ width: "80%", flexDirection: "row" }}>
                          <View style={{ flexDirection: "column", fontWeight: '400', marginRight: "5%" }}>
                            <Text style={{ fontSize: 16, color: "#888" }}>
                              Total Cost
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                              {totalPosCost.toFixed(2)}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "column", fontWeight: '400', marginRight: "5%"  }}>
                            <Text style={{ fontSize: 16, color: "#888" }}>
                              Total Budget
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                              {departmentBudgets[departmentKey]?.total ?? '...'}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "column", fontWeight: '400', marginRight: "5%" }}>
                            <Text style={{ fontSize: 16, color: "#888" }}>
                              Remaining Budget
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                              {totalPosCost.toFixed(2)}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "column", fontWeight: '400', marginRight: "5%" }}>
                            <Text style={{ fontSize: 16, color: "#888" }}>
                              Date
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                              {startformattedDate} - {endformattedDate}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {/* Department-level Download PDF Button */}
                      {/* Table Header */}
                      <View style={styles.tableHeader}>
                        <Text style={[styles.cell, styles.colval]}>BARCODE</Text>
                        {/* <Text style={[styles.cell, styles.colval]}>ItemNo</Text> */}
                        <Text style={[styles.cell, styles.col]}>ITEM NAME</Text>
                        <Text style={[styles.cell, styles.col3]}>VENDOR NAME</Text>
                        <Text style={[styles.cell, styles.colval]}>CC</Text>
                        <Text style={[styles.cell, styles.colval]}>CQTY</Text>
                        <Text style={[styles.cell, styles.colval]}>UC</Text>
                        <Text style={[styles.cell, styles.colval]}>UQTY</Text>
                        <Text style={[styles.cell, styles.colval]}>TOTAL</Text>
                      </View>
                      {departmentItems.map((rowItem, rowIdx) => {
                        const lineTotal = (
                          rowItem.invQty > 0?
                          (parseFloat(rowItem.invCaseCost) || 0) *
                          (parseFloat(rowItem.invQty) || 0)
                          :
                          (parseFloat(rowItem.posUnitCost) || 0) *
                          (parseFloat(rowItem.unitQty) || 0)
                          
                        ).toFixed(2);
                        return (
                          <View key={rowIdx} style={styles.tableRow}>
                            <Text style={[styles.cell, styles.colval]}>{rowItem.barcode}</Text>
                            {/* <Text style={[styles.cell, styles.colval]}>{rowItem.itemNo}</Text> */}
                            <Text style={[styles.cell, styles.col]}>{rowItem.posName}-{rowItem.posSize}</Text>
                            <Text style={[styles.cell, styles.col3]}>{rowItem.vendorName}</Text>
                            <Text style={[styles.cell, styles.colval]}>{rowItem.invCaseCost}</Text>
                            <Text style={[styles.cell, styles.colval]}>{rowItem.invQty}</Text>
                            <Text style={[styles.cell, styles.colval]}>{rowItem.posUnitCost}</Text>
                            <Text style={[styles.cell, styles.colval]}>{rowItem.unitQty}</Text>
                            <Text style={[styles.cell, styles.colval]}>{lineTotal}</Text>
                          </View>
                        );
                      })}
                      <View style={[styles.tableRow, { backgroundColor: '#f2f2f2' }]}>
                        <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                          Department Total:
                        </Text>
                        <Text style={styles.tableCell} />
                        <Text style={styles.tableCell} />
                        <Text style={styles.tableCell} />
                        <Text style={styles.tableCell} />
                        <Text style={styles.tableCell} />
                        <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                          {departmentTotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
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
                      onValueChange={() => toggleCheckbox(item.barcode)}
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
  container: { padding: 20 },
  headercontainer: {
    marginVertical: 10,
    alignItems: 'flex-end'
  },
  departmentrow: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: "5%",
  },

  departmentdeadrow: {
    marginLeft: 10,
    marginRight: 10,
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
    width: '30%',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#adadad',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dateRangeButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 3,
    borderRadius: 5,
    alignItems: 'center',
    // marginHorizontal: 5,
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

  tableCell: { flex: 1, textAlign: 'center' },
  tableCellqty: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    borderColor: '#f3f3f3',
    borderWidth: 1,
    textAlign: 'center',
    padding: 5,
    height: 35,
  },
  footerRow: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footerText: { fontSize: 16, fontWeight: '700', margin: 5, color: '#2C62FF' },
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
    borderRadius: 25,
    padding: 3,
    marginLeft: 10,
    flex: 1,
  },
  alltablebutton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  searchvendorbutton: {
    backgroundColor: '#f00',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addbutton: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  searchInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
  },
  cell: {
    textAlign: 'center',
    fontSize: 13,
    paddingHorizontal: 4,
  },
  col: {
    width: 200,
  },
  col3: {
    width: 120,
  },
  colval: {
    width: 70,
  },
  budgetWarehouseButtons: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    width: '20%',
    alignItems: 'flex-end'
  },

  budgetDepartmentButtons: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    width: '20%',
    alignItems: 'flex-end'
  },

  headerDepartmentbutton:{
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    borderColor:"#ccc",
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  
  buttonWarehouseText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },

  buttonDepartmentText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },

  headerwarehousebutton: {
    backgroundColor: '#23729d',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
export default DepartmentReport;