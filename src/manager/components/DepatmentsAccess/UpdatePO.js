import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Image,
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
  ConfirmPOVendor,
  getSingleDepartmentCurrentWeek,
  getSingleDepartmentNextWeek,
  fetchCategoryProducts,
  getTotalAllocationCurrentWeek,
} from '../../../functions/DepartmentAccess/function_dep';
import BarcodeSearchModal from '../BarcodeSearchModal'
import DepartmentItemSelector from "../../../components/DepartmentItemSelector";
import DepartmentItemSelectorNextWeek from '../../../components/DepartmentItemSelectorNextWeek';
import TotalBudgetCard, { useBudgetData } from '../../../components/TotalBudgetCard';
import { useFocusEffect } from '@react-navigation/native';
import ManualItemAdder from '../ManualItemAdder';
const UpdatePO = () => {
  const [loading, setLoading] = useState(true);
  const [updateloading, setUpdateLoading] = useState(false);
  const [confirmloading, setConfirmLoading] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
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
  const { budgetloading, startDateFormatted, endDateFormatted, activeDepartmentBudget, totalspend } = useBudgetData();
  const [departmentBudgets, setDepartmentBudgets] = useState({});
  const [nextdepartmentBudgets, setNextDepartmentBudgets] = useState({});
  const [deptSelectorVisible, setDeptSelectorVisible] = useState(false);
  const [deptSelectorNextVisible, setDeptSelectorNextVisible] = useState(false);
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState([]);
  const [departmentAllocations, setDepartmentAllocations] = useState([]);
  const [selectedInvoiceKey, setSelectedInvoiceKey] = useState(null);
  const [currentFormattedDate, setCurrentFormattedDate] = useState('');
  const [StartDateUpdate, setStartDateUpdate] = useState('');
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState('');
  const [cashModalVisible, setCasheModalVisible] = useState(false);
  const [totalCash, setTotalCash] = useState('');
  const [PosCost, setPosCost] = useState('');
  const [InvoiceKey, setInvocieKey] = useState('');
  const [appType, setAppType] = useState(null);



  const [allocationData, setAllocationData] = useState({
    allocated_amount: 0,
    remaining_allocated_amount: 0,
  });
  const latestQueryRef = useRef('');
  const departmentBudget = async (departmentName) => {
    try {
      const details = await getSingleDepartmentCurrentWeek(departmentName);
      const nextdetails = await getSingleDepartmentNextWeek(departmentName);
      const allocation = details?.data?.[0]?.department_allocations?.[0];
      const nextallocation = nextdetails?.data?.[0]?.department_allocations?.[0];
      if (nextallocation) {
        setNextDepartmentBudgets((prev) => ({
          ...prev,
          [departmentName]: {
            total: nextallocation.departmentAllocatedAmount,
            remaining: nextallocation.departmentRemainingAmount,
          },
        }));
      }
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

  const formatDateToYYYYMMDD = (dateStr) => {
    const [mm, dd, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  };

  useEffect(() => {
    const initializeData = async () => {
      const now = new Date();
      const apptype = await AsyncStorage.getItem('apptype');
      setAppType(apptype);
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
      const dd = String(now.getDate()).padStart(2, '0');

      const formatted = `${yyyy}-${mm}-${dd} 11:59:59`;
      setCurrentFormattedDate(formatted);
      setLoading(true);
      try {
        const allocationDetails = await getTotalAllocationCurrentWeek();
        if (
          allocationDetails &&
          allocationDetails.status === 'success' &&
          Array.isArray(allocationDetails.data) &&
          allocationDetails.data.length > 0
        ) {
          // The first array element
          const firstRecord = allocationDetails.data[0];

          // Full weekly info if you want it

          // Specifically the array of department allocations
          if (firstRecord.department_allocations) {
            setDepartmentAllocations(firstRecord.department_allocations);
          }

          // If you still want to track allocated_amount & remaining_allocated_amount
          const { allocated_amount, remaining_allocated_amount, cashBalance } = firstRecord;
          setAllocationData({ allocated_amount, remaining_allocated_amount, cashBalance });
        }
      } catch (error) {
        console.error('Error fetching allocation details', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchItemsForDepartment = async (deptId) => {
    try {
      const items = await fetchCategoryProducts(deptId); // calls your function_dep code
      return items;
    } catch (err) {
      console.error("Error in fetchItemsForDepartment:", err);
      return [];
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

        departmentBudget(dept);

      });
    }, [data])
  );

  // search product for add more 

  const handleApiSearch = async (query) => {
    try {
      latestQueryRef.current = query; // Save the current query

      const storedtoken = await AsyncStorage.getItem('access_token');
      const storedurl = await AsyncStorage.getItem('storeUrl');
      if (!storedtoken || !storedurl) return;

      const response = await fetch(`${storedurl}/category-management/search/?q=${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${storedtoken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log("result", query);

      // ❗ Ignore results if it's not for the latest query
      if (latestQueryRef.current !== query) return;

      if (result && result.data) {
        setApiSearchResults(result.data.slice(0, 15));
      } else {
        setApiSearchResults([]);
      }
    } catch (error) {
      console.error("API search error:", error);
    }
  };

  // New function: Generate PDF for a single department's items

  // Fetch report data
  const fetchData = async (customStartDate, customEndDate) => {
    setLoading(true);
    const start = customStartDate || startDate;
    const end = customEndDate || endDate;
    await fetchManageOrderReport(start, end, setData, setLoading);

    console.log("setdata", data);
  };

  const fetchInitialData = useCallback(async () => {
    try {
      await AsyncStorage.getItem('access_token');

      await AsyncStorage.getItem('store_url');
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
  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [])
  );

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


  const invoiceGroups = useMemo(() => {
    const groups = {};
    data.forEach((item) => {
      const invoiceKey = item.invoiceNumber || 'No_Invoice_Number';
      const deptKey = item.departmentName || 'Unknown Dept';
      if (!groups[invoiceKey]) groups[invoiceKey] = {};
      if (!groups[invoiceKey][deptKey]) groups[invoiceKey][deptKey] = [];
      groups[invoiceKey][deptKey].push(item);
    });
    return groups;
  }, [data]);

  const invoiceMeta = useMemo(() => {
    const meta = {};
    data.forEach((item) => {
      const invoiceKey = item.invoiceNumber || 'No_Invoice_Number';
      if (!meta[invoiceKey]) {
        meta[invoiceKey] = {
          start_date: item.start_date || null,
          end_date: item.end_date || null,
          status: item.status || null,
          invoiceUpdateDate: item.invoiceUpdateDate || null,
        };
      }
    });
    return meta;
  }, [data]);

  // ----------- GROUP DATA BY invoiceNumber, THEN BY departmentName -----------

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

  // Update entire invoice

  const updateVendorOrder = async (invoiceKey) => {
    setUpdateLoading(true);
    const allItemsForInvoice = Object.values(invoiceGroups[invoiceKey]).flat();
    const updatedItems = allItemsForInvoice.map((item) => {
      const editKey = `${invoiceKey}-${item.barcode}`;
      const editCaseQtyKey = `${invoiceKey}-${item.barcode}-case`;
      const editUnitQtyKey = `${invoiceKey}-${item.barcode}-unit`;
      return {
        ...item,
        invQty: editedQuantities[editCaseQtyKey] ?? item.invQty,
        unitQty: editedQuantities[editUnitQtyKey] ?? item.unitQty,
      };
    });

    if (!updatedItems || updatedItems.length === 0) {
      setUpdateLoading(false);
      Alert.alert('Update Failed', 'No items found for this invoice.');
      return;
    }

    try {
      const accountTransfer = parseFloat(PosCost || 0) - parseFloat(totalCash || 0);
      const totalcash = parseFloat(totalCash || 0);
      const response = await UpdatePOVendor(updatedItems, totalcash, accountTransfer);

      if (response.result?.message) {
        console.log('response', response.result?.message || 'Update successful.');
        Alert.alert('Success', response.result?.message || 'Update successful.');
        setUpdateLoading(false);
        setCasheModalVisible(false)
      } else {
        console.log('response', response);
        const errorMsg = response?.error?.message || 'Something went wrong. Please try again.';
        Alert.alert('Error', errorMsg);
        setUpdateLoading(false);
        setCasheModalVisible(false)
      }
    } catch (error) {
      setUpdateLoading(false);
      setCasheModalVisible(false)
      console.error('Error updating PO:', error);
      Alert.alert('Error', 'An error occurred while updating the purchase order.');
    }
  };

  const confirmVendorPo = async (invoiceKey) => {
    setConfirmLoading(true);
    const allItemsForInvoice = Object.values(invoiceGroups[invoiceKey]).flat();
    const updatedItems = allItemsForInvoice.map((item) => {
      const editKey = `${invoiceKey}-${item.barcode}`;
      return {
        ...item,
        invQty: editedQuantities[editKey] ?? item.invQty,
      };
    });

    if (!updatedItems || updatedItems.length === 0) {
      setConfirmLoading(false);
      Alert.alert('Update Failed', 'No items found for this invoice.');
      return;
    }

    try {
      const response = await ConfirmPOVendor(updatedItems);

      if (response.result?.message) {
        console.log('response', response.result?.message || 'Update successful.');
        Alert.alert('Success', response.result?.message || 'Update successful.');
        setConfirmLoading(false);
      } else {
        console.log('response', response);
        const errorMsg = response?.error?.message || 'Something went wrong. Please try again.';
        Alert.alert('Error', errorMsg);
        setConfirmLoading(false);
      }
    } catch (error) {
      setConfirmLoading(false);
      console.error('Error updating PO:', error);
      Alert.alert('Error', 'An error occurred while updating the purchase order.');
    }
  };

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
          return { ...item, invQty: newQty, unitQty: 0 };
        }
        return item;
      })
    );
  };

  // unit qty cahnge
  const handleUQtyChange = (text, invoiceKey, barcode) => {
    const newQty = text.replace(/[^0-9]/g, '');
    const editKey = `${invoiceKey}-${barcode}`;
    setEditedQuantities((prev) => ({
      ...prev,
      [editKey]: newQty,
    }));

    setData((prevData) =>
      prevData.map((item) => {
        if (item.invoiceNumber === invoiceKey && item.barcode === barcode) {
          return { ...item, unitQty: newQty, invQty: 0 };
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

  // this function we are using to add selected items from department's item list to po
  const handleItemsSelected = (selectedItems) => {
    if (!selectedInvoiceKey) return;
    const startformatted = formatDateToYYYYMMDD(startDateFormatted);
    const endformatted = formatDateToYYYYMMDD(endDateFormatted);
    setData((prevData) => {
      const updatedData = [...prevData];
      console.log("my selected items", selectedItems);
      selectedItems.forEach((selected) => {
        const existingIndex = updatedData.findIndex(
          (row) =>
            row.invoiceNumber === selectedInvoiceKey &&
            row.barcode === selected.barcode
        );

        if (existingIndex >= 0) {
          // If item exists in that invoice, just update qty and total
          const existingItem = updatedData[existingIndex];
          const newQty = parseFloat(existingItem.invQty || 0) + selected.qty;
          updatedData[existingIndex] = {
            ...existingItem,
            invQty: newQty,
            totalPrice: newQty * (existingItem.invCaseCost || 0),
          };
        } else {
          // If new item, push with invoiceNumber (so it gets grouped)
          updatedData.push({
            ...selected,
            invoiceNumber: selectedInvoiceKey,
            invQty: selected.qty,
            totalPrice: selected.qty * (selected.invCaseCost || 0),
            product_id: selected.id,
            start_date: `${startformatted} 00:00:00`,
            end_date: `${endformatted} 23:59:59`,
          });
        }
      });

      return updatedData;
    });

    setDeptSelectorVisible(false);
  };

  //add more product from search popup

  const addSearchItemToTable = async (item) => {
    if (!selectedInvoiceKey) return;

    const startformatted = formatDateToYYYYMMDD(startDateFormatted);
    const endformatted = formatDateToYYYYMMDD(endDateFormatted);
    const depatmentname = item.departmentName;
    let departmentDetails = {};

    try {
      let response;

      if (currentFormattedDate < StartDateUpdate) {
        response = await getSingleDepartmentNextWeek(depatmentname);
      } else {
        response = await getSingleDepartmentCurrentWeek(depatmentname);
      }

      //  const response = await getSingleDepartmentCurrentWeek(depatmentname);

      if (
        response &&
        response.status === "success" &&
        response.data.length > 0 &&
        response.data[0].department_allocations.length > 0
      ) {
        departmentDetails = response.data[0].department_allocations[0];
      }
    } catch (error) {
      console.warn("Error fetching department details:", error);
    }

    setData((prevData) => {
      const updatedData = [...prevData];

      const existingIndex = updatedData.findIndex(
        (row) =>
          row.invoiceNumber === selectedInvoiceKey &&
          row.barcode === item.barcode
      );

      const validProductId = item.id || item.product_id || item._id; // <-- ensure fallback
      console.log("validProductId", validProductId);
      if (existingIndex >= 0) {
        const existingItem = updatedData[existingIndex];
        const newQty = parseFloat(existingItem.invQty || 0) + 1;
        updatedData[existingIndex] = {
          ...existingItem,
          invQty: newQty,
          totalPrice: newQty * (existingItem.invCaseCost || 0),
        };
      } else {
        updatedData.push({
          ...item,
          invoiceNumber: selectedInvoiceKey,
          invQty: 1,
          totalPrice: 1 * (item.invCaseCost || 0),
          product_id: validProductId,
          departmentId: departmentDetails.departmentId || 0,
          departmentAllocationId: departmentDetails.departmentAllocationId || 0,
          start_date: `${startformatted} 00:00:00`,
          end_date: `${endformatted} 23:59:59`,
        });
      }

      return updatedData;
    });
  };

  // Handle "Add Items" in modal but we are not  it using right now

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

  const handleManualAdd = (item) => {
    if (!selectedInvoiceKey || !startDateFormatted || !endDateFormatted) {
      Alert.alert('Error', 'Missing invoice or date information.');
      return;
    }
  
    const startformatted = formatDateToYYYYMMDD(startDateFormatted);
    const endformatted = formatDateToYYYYMMDD(endDateFormatted);
  
    const newItem = {
      ...item,
      invoiceNumber: selectedInvoiceKey,
      invQty: item.invQty || 1,
      totalPrice: (item.invQty || 1) * (item.invCaseCost || 0),
      product_id: item.product_id || item.id || item._id || Math.floor(Math.random() * 100000), // fallback ID
      start_date: `${startformatted} 00:00:00`,
      end_date: `${endformatted} 23:59:59`,
    };
  
    setData((prevData) => [...prevData, newItem]);
  };
  

  return (
    <View style={styles.maincontainer}>
      <TotalBudgetCard
        budgetloading={budgetloading}
        startDateFormatted={startDateFormatted}
        endDateFormatted={endDateFormatted}
        activeDepartmentBudget={activeDepartmentBudget}
        totalspend={totalspend}
      />
      <View style={styles.container}>
        <Text style={{ color: '#000', fontWeight: '800', padding: 5 }}>
          FILTER:
        </Text>
        <View style={styles.headercontainer}>
          <View style={styles.dateRangeContainer}>
              <Image
                          source={require('../../../images/CalenderIcon.png')}
                          style={{ width: 24, height: 24}}
                        />
            <TouchableOpacity
              onPress={() => setStartDatePickerOpen(true)}
              style={styles.dateRangeButton}
            >
              <Text>
                {startDate
                  ? `${startDate.toLocaleDateString()}`
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
              
          
            >
              <Text>
                -
              </Text>
            </TouchableOpacity>
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
              const cost = parseFloat(rowItem.invCaseCost) || 0;
              const quantity = parseFloat(rowItem.invQty) || 0;
              return acc + cost * quantity;
            }, 0);


            const {
              start_date,
              end_date,
              status
            } = invoiceMeta[invoiceKey] || {};

            const vendorName = allItemsForInvoice[0]?.vendorName || 'Unknown Vendor';

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
            // console.log("deptGroups",deptGroups);
            const formatDateTime = (dateStr) => {
              const [datePart, timePart] = dateStr.split(" ");
              const [year, month, day] = datePart.split("-");
              return `${month}-${day}-${year}`;
            };

            const StartDate = formatDateTime(start_date);
            const EndDate = formatDateTime(end_date);

            return (
              <Card key={invoiceIdx} style={styles.card}>
                <Card.Content>
                  {/* Invoice-level header */}
                  <View style={styles.vendorheader}>
                    <TextInput
                      style={styles.searchBox}
                      placeholder="Search Dept, Barcode, or Item Name"
                      value={searchQueries[invoiceKey] || ''}
                      onChangeText={(txt) =>
                        setSearchQueries({ ...searchQueries, [invoiceKey]: txt })
                      }
                    />
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: "center", marginRight: "1%" }}>
                      PO: <Text style={styles.footerText}>{invoiceKey}</Text> | Total Cost: <Text style={styles.footerText}>{totalPosCost.toFixed(2)}</Text> | From: <Text style={styles.footerText}>{StartDate}</Text> to: <Text style={styles.footerText}>{EndDate}</Text> | Status: <Text style={styles.footerText}>{status}</Text>
                    </Text>
                  </View>
                  {/* Render sub-tables per department */}
                  {departmentKeys.map((departmentKey, idx) => {
                    const departmentItems = deptGroups[departmentKey] || [];
                    const departmentTotal = departmentItems.reduce((acc, item) => {
                      const cost = parseFloat(item.invCaseCost) || 0;
                      const qty = parseFloat(item.invQty) || 0;
                      return acc + cost * qty;
                    }, 0);
                    return (

                      <View key={idx} style={{ marginTop: 10 }}>

                        <View style={styles.footerRow}>
                          <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: "center" }} >
                            Department: <Text style={styles.footerText}>{departmentKey} </Text>
                          </Text>
                          {currentFormattedDate < start_date
                            ? <>
                              <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: "center" }} >
                                | Total Budget: <Text style={styles.footerText}>{nextdepartmentBudgets[departmentKey]?.total ?? '...'} </Text>

                              </Text>
                              <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: "center" }} >
                                | Remaining: <Text style={styles.footerText}>{nextdepartmentBudgets[departmentKey]?.remaining.toFixed(2) ?? '...'} </Text> | Upcoming Week
                              </Text>
                            </>
                            :
                            <>
                              <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: "center" }} >
                                | Total Budget: <Text style={styles.footerText}>{departmentBudgets[departmentKey]?.total ?? '...'} </Text>

                              </Text>
                              <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: "center" }} >
                                | Remaining: <Text style={styles.footerText}>{departmentBudgets[departmentKey]?.remaining.toFixed(2) ?? '...'}
                                </Text>
                              </Text>
                            </>
                          }
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableHeaderCell}>Barcode</Text>
                          {/* <Text style={styles.tableHeaderCell}>itemNo</Text> */}
                          <Text style={styles.tableHeaderCell}>Item Name</Text>
                          <Text style={styles.tableHeaderCell}>Vendor</Text>
                          <Text style={styles.tableHeaderCell}> UC</Text>
                          <Text style={styles.tableHeaderCell}>CC</Text>
                          <Text style={styles.tableHeaderCell}>CQty</Text>
                          <Text style={styles.tableHeaderCell}>UQty</Text>
                          <Text style={styles.tableHeaderCell}>Total</Text>
                          {status == 'pending' && (
                            <Text style={{ textAlign: "right", fontWeight: "700" }}>Remove</Text>
                          )}
                        </View>

                        {departmentItems.map((rowItem, rowIdx) => {
                          const editKey = `${invoiceKey}-${rowItem.barcode}`;
                          const editCaseQtyKey = `${invoiceKey}-${rowItem.barcode}-case`;
                          const editUnitQtyKey = `${invoiceKey}-${rowItem.barcode}-unit`;
                          const currentQty =
                            editedQuantities[editCaseQtyKey] ??
                            rowItem.invQty?.toString() ??
                            '';
                          const currentUQty =
                            editedQuantities[editUnitQtyKey] ??
                            rowItem.unitQty?.toString() ??
                            '';

                          const lineTotal = currentUQty > 0 ?
                            ((parseFloat(rowItem.posUnitCost) || 0) *
                              (parseFloat(currentUQty) || 0)).toFixed(2)
                            :
                            (
                              (parseFloat(rowItem.invCaseCost) || 0) *
                              (parseFloat(currentQty) || 0)
                            ).toFixed(2);



                          return (
                            <View key={rowIdx} style={styles.tableRow}>
                              <Text style={styles.tableCell}>
                                {rowItem.barcode}
                              </Text>
                              {/* <Text style={styles.tableCell}>
                                {rowItem.itemNo}
                              </Text> */}
                              <Text style={styles.tableCell}>
                                {rowItem.posName} - ({rowItem.posSize})
                              </Text>
                              <Text style={styles.tableCell}>
                                {rowItem.vendorName}
                              </Text>
                              <Text style={styles.tableCell}>
                                {rowItem.posUnitCost}
                              </Text>
                              <Text style={styles.tableCell}>
                                {rowItem.invCaseCost}
                              </Text>
                              {status == 'pending' ?
                                <TextInput
                                  style={styles.tableCellqty}
                                  keyboardType="numeric"
                                  value={currentQty}
                                  onChangeText={(txt) =>
                                    handleQtyChange(txt, invoiceKey, rowItem.barcode)
                                  }
                                />
                                : <Text style={styles.tableCell}>
                                  {rowItem.invQty}
                                </Text>
                              }
                              {status == 'pending' ?
                                <TextInput
                                  style={styles.tableCellqty}
                                  keyboardType="numeric"
                                  value={currentUQty}
                                  onChangeText={(utxt) =>
                                    handleUQtyChange(utxt, invoiceKey, rowItem.barcode)
                                  }
                                />
                                : <Text style={styles.tableCell}>
                                  {rowItem.unitQty}
                                </Text>
                              }
                              <Text style={styles.tableCell}>{lineTotal}</Text>
                              {status == 'pending' && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setData((prevData) =>
                                      prevData.filter(
                                        (item) =>
                                          !(
                                            item.invoiceNumber === invoiceKey &&
                                            item.barcode === rowItem.barcode
                                          )
                                      )
                                    );
                                  }}
                                >
                                  <Text style={{ color: 'red', fontWeight: 'bold', paddingHorizontal: 6 }}>
                                    ❌
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })}

                        <View style={[styles.tableRow, { backgroundColor: '#f2f2f2' }]}>
                          <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                            Total:
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

                  {/* Footer Buttons for the entire invoice */}
                  {status == 'pending' && (
                    <View style={styles.alltablebutton}>


                      {currentFormattedDate < start_date ?

                        <TouchableOpacity
                          style={{ padding: 10, backgroundColor: "blue", margin: 10 }}
                          onPress={() => {
                            setSelectedInvoiceKey(invoiceKey);
                            setDeptSelectorNextVisible(true);
                          }}
                        >
                          <Text style={{ color: "#fff" }}>Add From Department</Text>
                        </TouchableOpacity>

                        :
                        <TouchableOpacity
                          style={{ padding: 10, backgroundColor: "blue", margin: 10 }}
                          onPress={() => {
                            setSelectedInvoiceKey(invoiceKey);
                            setDeptSelectorVisible(true);
                          }}
                        >
                          <Text style={{ color: "#fff" }}>Add From Department</Text>
                        </TouchableOpacity>
                      }

                      <TouchableOpacity
                        style={{ padding: 10, backgroundColor: "blue", margin: 10 }}
                        onPress={() => {
                          setSelectedInvoiceKey(invoiceKey);
                          setIsItemsModalVisible(true);
                          setStartDateUpdate(start_date);
                        }}
                      >
                        <Text style={{ color: "#fff" }}>Add More</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ backgroundColor: 'green', padding: 10, margin: 10 }}
                        onPress={() => {
                          setSelectedInvoiceKey(invoiceKey);
                          setManualModalVisible(true);
                        }}
                      >
                        <Text style={{ color: '#fff' }}>Add Manual Item</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={updateloading}
                        style={{
                          padding: 10,
                          backgroundColor: updateloading ? "#aaa" : "#2ccb70",
                          margin: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          if (appType === 'warehouse') {
                            setCasheModalVisible(true);
                            setPosCost(totalPosCost);
                            setSelectedInvoiceKey(invoiceKey);

                          } else {
                            updateVendorOrder(invoiceKey); // Replace with your actual PDF function
                          }
                        }}>
                        {/* onPress={() => updateVendorOrder(invoiceKey)} */}

                        {updateloading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={{ color: "#fff" }} >Update PO</Text>
                        )}
                      </TouchableOpacity>


                    </View>


                  )}

                  <ManualItemAdder
                    visible={manualModalVisible}
                    onClose={() => setManualModalVisible(false)}
                    onAdd={handleManualAdd}
                  />

                  <DepartmentItemSelector
                    visible={deptSelectorVisible}
                    onClose={() => setDeptSelectorVisible(false)}
                    categories={departmentAllocations}
                    fetchItemsForDepartment={fetchItemsForDepartment} // <-- correct prop name
                    onItemsSelected={handleItemsSelected}
                  />
                  <DepartmentItemSelectorNextWeek
                    visible={deptSelectorNextVisible}
                    onClose={() => setDeptSelectorNextVisible(false)}
                    categories={departmentAllocations}
                    fetchItemsForDepartment={fetchItemsForDepartment} // <-- correct prop name
                    onItemsSelected={handleItemsSelected}
                  />

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
            <Text style={styles.modalTitle}>Add More Products</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search by Item Name, Barcode..."
              value={apiSearchQuery}
              onChangeText={(text) => {
                setApiSearchQuery(text);
                if (text.length > 0) {
                  handleApiSearch(text);
                } else {
                  setApiSearchResults([]);
                }
              }}
            />

            {apiSearchResults.length > 0 && apiSearchQuery.length > 0 ? (
              <ScrollView style={{ maxHeight: 500, width: '100%', marginTop: 10 }}>
                {apiSearchResults.map((item, index) => {
                  const isSelected = data.some(
                    (row) =>
                      row.invoiceNumber === selectedInvoiceKey &&
                      row.barcode === item.barcode
                  );
                  return (
                    <TouchableOpacity
                      key={index}
                      // onPress={() => addSearchItemToTable(item)
                      // }
                      onPress={() => {
                        setSelectedBarcode(item.barcode);
                        setBarcodeModalVisible(true);
                        setIsItemsModalVisible(false);
                      }}
                      style={{
                        padding: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#eee',
                        backgroundColor: isSelected ? '#d4f8d4' : '#fff',
                      }}
                    >
                      <Text style={{ color: isSelected ? 'green' : 'black' }}>
                        {item.posName} - {item.barcode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={{ marginTop: 10, color: '#999' }}></Text>
            )}


            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>

              <TouchableOpacity
                style={styles.clearbuttonsRow}
                onPress={() => {
                  setIsItemsModalVisible(false);
                  setApiSearchQuery('');
                  setApiSearchResults([]);
                }}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <BarcodeSearchModal
        visible={barcodeModalVisible}
        barcode={selectedBarcode}
        onClose={() => setBarcodeModalVisible(false)}
        onItemSelected={(item) => {
          addSearchItemToTable(item);
          setBarcodeModalVisible(false);
        }}
      />
      {/* transactions type */}
      <Modal
        visible={cashModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCasheModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalCashTitle}>Account Transfer {parseFloat(PosCost).toFixed(2) - totalCash}</Text>
            <Text style={styles.modalCashTitle}>Cash Payment: {totalCash}</Text>
            <TextInput
              style={styles.inputAmount}
              placeholder="Enter Cash Payment"
              value={totalCash}
              onChangeText={(text) => setTotalCash(text)}
              keyboardType="numeric"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => updateVendorOrder(selectedInvoiceKey)}>
                {updateloading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <Text style={styles.popbuttonText}>Submit</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCasheModalVisible(false)}
              >
                <Text style={styles.popbuttonText}>Close</Text>
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
  container: { padding: 20, },
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
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dateRangeButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',

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
    borderColor: "#f3f3f3",
    borderWidth: 1,
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
  tableCellqty: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    textAlign: 'center',
    padding: 1,
    height: 25,
    borderRadius: 5,
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
    marginBottom: 10,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
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
  searchquery: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#f3f3f3",
    borderWidth: 2
  },
  generatepo: {
    paddingBottom: "1%",
    backgroundColor: '#2ccb70',
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatepo: {
    paddingBottom: "1%",
    backgroundColor: '#2ccb70',
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'left',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  popbuttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'left',
  },
  confirmButton: {
    backgroundColor: '#2C62FF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f00',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  modalCashTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'flex-start',
  },
});

export default UpdatePO;