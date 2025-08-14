import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Button,
  Modal,
  Alert,
  PermissionsAndroid,
  Platform,
  Image
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs'; // Import react-native-fs
import Share from 'react-native-share'; // Optional: For sharing the PDF
import {
  fetchVendorDetailsForVendor,
  createVendorDetailsOrder,
  fetchVendorList,
  getVendorBudgetCurrentWeek,
  fetchAllItems,
  getTotalAllocationCurrentWeek,
  fetchAvailableCategories,
  fetchCategoryProducts,
} from '../../../functions/VendorAccess/function';
import camImg from '../../../images/compact-camera.png'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import LoginForm from '../../../screen/Login';
import RNPickerSelect from 'react-native-picker-select';
import donwlaodicon from "../../../../fonts/download-icon.png";
import DepartmentItemSelector from "../../../components/DepartmentItemSelector";
import VendorItemSelector from "../../../components/VendorItemSelector";


// NEW CAMERA CODE – make sure you have this installed and linked:
import { RNCamera } from 'react-native-camera';
// Example camera icon import:
// import camImg from '../../src/images/compact-camera.png' 


const VendorPOData = () => {
  const [vendorNames, setVendorNames] = useState([]);
  const [filteredVendorNames, setFilteredVendorNames] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorData, setVendorData] = useState([]); // Full vendor data
  const [filteredItems, setFilteredItems] = useState([]); // Items for the selected vendor
  const [poTableData, setPoTableData] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  const [accessToken, setAccessToken] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isvendordropdown, setIsVendorDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfloading, setPDFLoading] = useState(false);
  const [vendorBudgetTotal, setVendorBudgetTotal] = useState(null);
  const [vendorBudgetRemaining, setVendorBudgetRemaining] = useState(null);

  // All items fetched from an API
  const [fetchallitems, setFetchAllItems] = useState([]);  

  // Existing Items Modal (for selected vendor)
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
  const [selectedModalItems, setSelectedModalItems] = useState([]);
  const [itemModalSearchQuery, setItemModalSearchQuery] = useState('');

  // "All Items" Modal
  const [isAllItemsModalVisible, setIsAllItemsModalVisible] = useState(false);
  const [selectedAllModalItems, setSelectedAllModalItems] = useState([]);
  const [itemAllModalSearchQuery, setItemAllModalSearchQuery] = useState('');

  const [totalbalance, setTotalBalance] = useState('');
  const [allocationData, setAllocationData] = useState({
    allocated_amount: 0,
    remaining_allocated_amount: 0,
  });
  const navigation = useNavigation();

  // NEW BARCODE + API SEARCH STATE
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState([]);

  // NEW CAMERA STATE
  const [cameraVisible, setCameraVisible] = useState(false);

  // ─────────────────────────────────────────────────────────────
  //  Request permission to save PDF files
  // ─────────────────────────────────────────────────────────────
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

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const names = await fetchVendorList();
        const sortedNames = names.sort((a, b) => a.localeCompare(b));
        setVendorNames(sortedNames);

        const allocationDetails = await getTotalAllocationCurrentWeek();
        if (
          allocationDetails &&
          allocationDetails.status === 'success' &&
          Array.isArray(allocationDetails.data) &&
          allocationDetails.data.length > 0
        ) {
          const { allocated_amount, remaining_allocated_amount } = allocationDetails.data[0];
          setAllocationData({ allocated_amount, remaining_allocated_amount });
        }
        setTotalBalance(
          allocationData.allocated_amount - allocationData.remaining_allocated_amount
        );
      } catch (error) {
        console.error('Error fetching vendor names', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      // If you need to load categories from an API, do it here...
      setLoadingCategories(false);
    };
    loadCategories();
  }, [accessToken, storeUrl]);

  // Fetch all items once on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const allitemsdata = await fetchAllItems();
        setFetchAllItems(Array.isArray(allitemsdata) ? allitemsdata : []);
      } catch (err) {
        console.error('Error fetching all items:', err);
        setFetchAllItems([]);
      }
    };
    loadAllData();
  }, [accessToken, storeUrl]);

  const sortedActiveCategories =
    categories?.categories
      ?.filter((category) => category.status === 'active')
      ?.sort((a, b) => a.name.localeCompare(b.name)) || [];

  // Filter the vendor names based on vendor search query
  useEffect(() => {
    if (vendorSearchQuery.length >= 1) {
      const filteredVendors = vendorNames.filter((name) =>
        name.toLowerCase().includes(vendorSearchQuery.toLowerCase())
      );
      setFilteredVendorNames(filteredVendors);
    } else {
      setFilteredVendorNames([]);
    }
  }, [vendorSearchQuery, vendorNames]);

  // ─────────────────────────────────────────────────────────────
  //  Searching Items by Vendor
  // ─────────────────────────────────────────────────────────────
  const loadVendorDetails = async () => {
    setLoadingItems(true);
    const fetchedVendors = await fetchVendorDetailsForVendor();
    setVendorData(fetchedVendors);
    setLoadingItems(false);

    // Filter items based on the selected vendor
    const itemsForSelectedVendor = fetchedVendors.filter(
      (vendor) => vendor.vendorName === selectedVendor
    );
    setFilteredItems(itemsForSelectedVendor);

    // Show the modal automatically after fetching items
    if (itemsForSelectedVendor.length > 0) {
      setIsItemsModalVisible(true);
    } else {
      Alert.alert('No Items', 'No items found for this vendor.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Add multiple selected items from vendor modal
  //    (vendor items use 'invCaseCost')
  // ─────────────────────────────────────────────────────────────
  const handleAddSelectedItems = () => {
    // Filter the selected items from the vendor's filtered list
    const selectedItemsData = filteredItems.filter((item) =>
      selectedModalItems.includes(item.barcode)
    );

    setPoTableData((prevData) => {
      const updatedData = [...prevData];
      selectedItemsData.forEach((selectedItem) => {
        // Force numeric
        const numericInvCaseCost = parseFloat(selectedItem.invCaseCost) || 0;

        // Check if item already in table
        const existingIndex = updatedData.findIndex(
          (row) => row.barcode === selectedItem.barcode
        );

        if (existingIndex >= 0) {
          updatedData[existingIndex].qty += 1;

          // Ensure these are always numbers
          updatedData[existingIndex].invCaseCost = numericInvCaseCost;
          updatedData[existingIndex].totalPrice =
            numericInvCaseCost * updatedData[existingIndex].qty;
        } else {
          updatedData.push({
            ...selectedItem,
            // Guarantee posUnitCost is numeric too (in case you display it)
            posUnitCost: parseFloat(selectedItem.posUnitCost) || 0,
            invCaseCost: numericInvCaseCost,
            qty: 1,
            totalPrice: numericInvCaseCost,
          });
        }
      });
      return updatedData;
    });

    setSelectedModalItems([]);
    setIsItemsModalVisible(false);
  };

  // ─────────────────────────────────────────────────────────────
  //  Add multiple selected items from "all items" modal
  //    (all items use 'posUnitCost')
  // ─────────────────────────────────────────────────────────────
  const handleAddSelectedAllItems = () => {
    // Filter the selected items from fetchallitems
    const selectedItemsData = fetchallitems.filter((item) =>
      selectedAllModalItems.includes(item.barcode)
    );

    setPoTableData((prevData) => {
      const updatedData = [...prevData];
      selectedItemsData.forEach((selectedItem) => {
        // Force numeric
        const numericPosUnitCost = parseFloat(selectedItem.posUnitCost) || 0;

        const existingIndex = updatedData.findIndex(
          (row) => row.barcode === selectedItem.barcode
        );

        if (existingIndex >= 0) {
          updatedData[existingIndex].qty += 1;

          // Make sure these remain numbers
          updatedData[existingIndex].posUnitCost = numericPosUnitCost;
          updatedData[existingIndex].totalPrice =
            numericPosUnitCost * updatedData[existingIndex].qty;
        } else {
          updatedData.push({
            ...selectedItem,
            posUnitCost: numericPosUnitCost,
            // Also parse invCaseCost in case we display it
            invCaseCost: parseFloat(selectedItem.invCaseCost) || 0,
            qty: 1,
            totalPrice: numericPosUnitCost,
          });
        }
      });
      return updatedData;
    });

    setSelectedAllModalItems([]);
    setIsAllItemsModalVisible(false);
  };

  // ─────────────────────────────────────────────────────────────
  //  Add item from search results to table (API search or barcode)
  //    (like vendor items, we assume 'invCaseCost')
  // ─────────────────────────────────────────────────────────────
  const addSearchItemToTable = (selectedItem) => {
    setPoTableData((prevData) => {
      const updatedData = [...prevData];

      // Parse numeric fields
      const numericPosUnitCost = parseFloat(selectedItem.posUnitCost) || 0;
      const numericInvCaseCost = parseFloat(selectedItem.invCaseCost) || 0;

      const existingIndex = updatedData.findIndex(
        (row) => row.barcode === selectedItem.barcode
      );

      if (existingIndex >= 0) {
        updatedData[existingIndex].qty += 1;
        // Maintain numeric fields
        updatedData[existingIndex].posUnitCost = numericPosUnitCost;
        updatedData[existingIndex].invCaseCost = numericInvCaseCost;
        // If you prefer totalPrice to be invCaseCost * qty
        updatedData[existingIndex].totalPrice =
          numericInvCaseCost * updatedData[existingIndex].qty;
      } else {
        updatedData.push({
          ...selectedItem,
          posUnitCost: numericPosUnitCost,
          invCaseCost: numericInvCaseCost,
          qty: 1,
          // Use numericInvCaseCost or numericPosUnitCost as your default:
          totalPrice: numericInvCaseCost,
        });
      }
      return updatedData;
    });
  };

  // ─────────────────────────────────────────────────────────────
  //  Update quantity in PO Table
  // ─────────────────────────────────────────────────────────────
  const handleManualQtyChange = (index, text) => {
    let newQty = parseInt(text, 10);
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    setPoTableData((prevData) => {
      const updatedData = [...prevData];

      // current row
      const item = updatedData[index];
      const numericInvCaseCost = parseFloat(item.invCaseCost) || 0;
      const numericPosUnitCost = parseFloat(item.posUnitCost) || 0;

      // If your total is based on invCaseCost:
      item.qty = newQty;
      item.totalPrice = numericInvCaseCost * newQty;

      // or if you prefer posUnitCost, then do:
      // item.totalPrice = numericPosUnitCost * newQty;

      updatedData[index] = item;
      return updatedData;
    });
  };

  const updateQty = (index, increment) => {
    setPoTableData((prevData) => {
      const updatedData = [...prevData];
      const item = updatedData[index];
      let newQty = item.qty + increment > 0 ? item.qty + increment : 1;

      const numericInvCaseCost = parseFloat(item.invCaseCost) || 0;
      // or parseFloat(item.posUnitCost)
      item.qty = newQty;
      item.totalPrice = numericInvCaseCost * newQty;

      updatedData[index] = item;
      return updatedData;
    });
  };

  const handleRemoveItem = (index) => {
    setPoTableData((prevData) => prevData.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────────────────────────────────
  //  Vendor selection
  // ─────────────────────────────────────────────────────────────
  const handleVendorSelect = async (vendorName) => {
    await AsyncStorage.setItem('filteredVendorNames', vendorName);
    const budget = await getVendorBudgetCurrentWeek(vendorName);
    if (budget?.status === 'success' && budget.data?.length > 0) {
      const vendorAllocations = budget.data[0]?.vendor_allocations ?? [];
      if (vendorAllocations.length > 0) {
        const vendorAllocation = vendorAllocations[0];
        setVendorBudgetRemaining(
          vendorAllocation.vendor_remaining_amount
            ? parseFloat(vendorAllocation.vendor_remaining_amount).toFixed(2)
            : '0.00'
        );
        setVendorBudgetTotal(vendorAllocation.vendor_allocated_amount || '0');
      } else {
        setVendorBudgetRemaining('0');
        setVendorBudgetTotal('0');
      }
    }
    setVendorSearchQuery(vendorName);
    setSelectedVendor(vendorName);
    setFilteredVendorNames([]);
    setIsVendorDropdown(false);
  };

  // ─────────────────────────────────────────────────────────────
  //  Totals
  // ─────────────────────────────────────────────────────────────
  // Make sure to parse totalPrice just in case
  const totalInvoiceValue = poTableData.reduce((sum, item) => {
    return sum + (parseFloat(item.totalPrice) || 0);
  }, 0);

  const totalItems = poTableData.length;
  const totalQty = poTableData.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0);

  const calculateBalance = (category, departmentName) => {
    const matchedCategory = category.pos_categ_ids.find(
      (posCategory) => posCategory.categoryName === departmentName
    );
    if (matchedCategory) {
      const totalForDepartment = poTableData
        .filter((item) => item.posDepartment === departmentName)
        .reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);

      return category.remainingAmount - totalForDepartment;
    }
    return null;
  };

  const clearTableData = () => {
    setPoTableData([]);
  };

  // ─────────────────────────────────────────────────────────────
  //  Generate PDF
  // ─────────────────────────────────────────────────────────────
  const generatePDF = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Cannot save PDF without storage permission.'
      );
      return;
    }
    setPDFLoading(true);

    const dataresponse = await createVendorDetailsOrder(poTableData);
    let invoiceNumber = 'UnknownInvoice';
    if (
      dataresponse &&
      dataresponse.result &&
      dataresponse.result.invoiceNumber
    ) {
      invoiceNumber = dataresponse.result.invoiceNumber;
      setPDFLoading(false);
    } else {
      Alert.alert('Error', dataresponse.result.message);
      setPDFLoading(false);
      return;
    }

    // Build the table rows
    const poTableRows = poTableData
      .map(
        (item) => `
      <tr>
        <td>${item.posName}</td>
        <td>${item.posSize}</td>
        <td>${item.barcode}</td>
        <td>${item.posDepartment}</td>
        <td>${item.vendorName}</td>
        <td>${item.posUnitCost}</td>
        <td>${item.invCaseCost}</td>
        <td>${item.qty}</td>
        <td>${(parseFloat(item.totalPrice) || 0).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

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
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Barcode</th>
            <th>Department</th>
            <th>Vendor Name</th>
            <th>Unit Cost</th>
            <th>Case Cost</th>
            <th>Qty</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          ${poTableRows}
        </tbody>
      </table>
      <br />
      <h3>Total Cost: ${totalInvoiceValue.toFixed(2)}</h3>
    </body>
    </html>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: 'invoice',
        directory: 'Downloads',
      };
      const file = await RNHTMLtoPDF.convert(options);

      const destPath = `${RNFS.DownloadDirectoryPath}/Invoice_${invoiceNumber}.pdf`;
      const downloadDirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
      if (!downloadDirExists) {
        await RNFS.mkdir(RNFS.DownloadDirectoryPath);
      }
      await RNFS.moveFile(file.filePath, destPath);
      setPoTableData([]);
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
      setPDFLoading(false);
      console.error('Error generating PDF:', error);
      Alert.alert('Error', `Could not generate PDF: ${error.message}`);
    }
  };

  // Optional: open PDF with react-native-share
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

  // ─────────────────────────────────────────────────────────────
  //  Toggle checkboxes in the vendor-items modal
  // ─────────────────────────────────────────────────────────────
  const toggleCheckbox = (barcode, unitCost) => {
    setSelectedModalItems((prevSelected) => {
      let updatedSelectedItems;
      let updatedRemainingAmount = vendorBudgetRemaining;

      if (prevSelected.includes(barcode)) {
        // If item is already selected, remove it and add back its cost
        updatedSelectedItems = prevSelected.filter((item) => item !== barcode);
        updatedRemainingAmount = parseFloat(updatedRemainingAmount) + (parseFloat(unitCost) || 0);
      } else {
        // If item is not selected, add it and subtract cost
        updatedSelectedItems = [...prevSelected, barcode];
        updatedRemainingAmount = parseFloat(updatedRemainingAmount) - (parseFloat(unitCost) || 0);
      }
      setVendorBudgetRemaining(updatedRemainingAmount);
      return updatedSelectedItems;
    });
  };

  // ─────────────────────────────────────────────────────────────
  //  Toggle checkboxes in the "all-items" modal
  // ─────────────────────────────────────────────────────────────
  const toggleAllItemsCheckbox = (barcode) => {
    setSelectedAllModalItems((prevSelected) => {
      if (prevSelected.includes(barcode)) {
        return prevSelected.filter((item) => item !== barcode);
      } else {
        return [...prevSelected, barcode];
      }
    });
  };

  // ─────────────────────────────────────────────────────────────
  //  Modal filters
  // ─────────────────────────────────────────────────────────────
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

  const modalAllItems = fetchallitems.filter((item) => {
    const posName = item.posName ? item.posName.toString().toLowerCase() : '';
    const barcode = item.barcode ? item.barcode.toString().toLowerCase() : '';
    const posDepartment = item.posDepartment
      ? item.posDepartment.toString().toLowerCase()
      : '';
    const query = itemAllModalSearchQuery.toLowerCase();
    return (
      posName.includes(query) ||
      barcode.includes(query) ||
      posDepartment.includes(query)
    );
  });

  // ─────────────────────────────────────────────────────────────
  //  API live search function
  // ─────────────────────────────────────────────────────────────
  const handleApiSearch = async (query) => {
    try {
      const storedtoken = await AsyncStorage.getItem('access_token');
      const storedurl = await AsyncStorage.getItem('storeUrl');
      if (!storedtoken || !storedurl) return;

      const response = await fetch(`${storedurl}/product/search/?q=${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${storedtoken}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result && result.data) {
        setApiSearchResults(result.data);
      } else {
        setApiSearchResults([]);
      }
    } catch (error) {
      console.error("API search error:", error);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Barcode scanning
  // ─────────────────────────────────────────────────────────────
  const onBarCodeRead = async (event) => {
    const scannedCode = event.data;
    if (scannedCode) {
      setCameraVisible(false);
      try {
        console.log("Scanned Barcode:", scannedCode);
        const storedtoken = await AsyncStorage.getItem('access_token');
        const storedurl = await AsyncStorage.getItem('storeUrl');
        if (!storedtoken || !storedurl) return;

        const response = await fetch(`${storedurl}/product/search/?q=${scannedCode}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedtoken}`,
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();

        if (result && result.data && result.data.length > 0) {
          const foundItem = result.data[0];
          addSearchItemToTable(foundItem);
        } else {
          Alert.alert("Not Found", "No product found for that barcode");
        }
      } catch (error) {
        console.error("Scanning error:", error);
      }
    }
  };


// department function

const [deptSelectorVisible, setDeptSelectorVisible] = useState(false);
const [vendorSelectorVisible, setVendorSelectorVisible] = useState(false);

const fetchItemsForVendor = async (vendorName) => {
  // e.g. similar to your existing loadVendorDetails logic
  // You might do something like:
  // await AsyncStorage.setItem("filteredVendorNames", vendorName);
  // const fetchedVendors = await fetchVendorDetailsForVendor(); 
  // Then filter items for that vendor
  // return arrayOfItems;
  try {
    // If you already have a function that returns items for a given vendor:
    const allVendorItems = await fetchVendorDetailsForVendor();
    // Filter by vendorName
    const itemsForVendor = allVendorItems.filter(
      (v) => v.vendorName === vendorName
    );
    return itemsForVendor;
  } catch (error) {
    console.warn("Error in fetchItemsForVendor:", error);
    return [];
  }
};

// 4) Once user picks items, incorporate them into your `poTableData`
const handleVendorItemsSelected = (selectedItems) => {
  setPoTableData((prevData) => {
    const updated = [...prevData];
    selectedItems.forEach((item) => {
      const existingIndex = updated.findIndex(
        (row) => row.barcode === item.barcode
      );
      if (existingIndex >= 0) {
        updated[existingIndex].qty += item.qty;
        updated[existingIndex].totalPrice =
          updated[existingIndex].invCaseCost * updated[existingIndex].qty;
      } else {
        // new row
        updated.push({
          ...item,
          totalPrice: (item.invCaseCost || 0) * item.qty,
        });
      }
    });
    return updated;
  });
};



useEffect(() => {
  const getCategories = async () => {
    await fetchAvailableCategories((data) => {
      console.log('Fetched Categories:', data);
      setCategories(data);
    });
    const storeid = await AsyncStorage.getItem('store_id');
    console.log('catstoreid', storeid);
  };
  getCategories();
}, []);

// The function we pass down to fetch items for a chosen department
const fetchItemsForDepartment = async (deptId) => {
  try {
    // store the chosen deptId if you need
    await AsyncStorage.setItem("categoryid", String(deptId));
    const items = await fetchCategoryProducts();
    return items; // return array of items
  } catch (err) {
    console.error("Error in fetchItemsForDepartment:", err);
    return [];
  }
};

// Once the user picks items, we incorporate them into our table
const handleItemsSelected = (selectedItems) => {
  // selectedItems is array of { ...itemData, qty }
  setPoTableData((prevData) => {
    const updated = [...prevData];
    selectedItems.forEach((selected) => {
      // if item already in table, increment qty
      const existingIndex = updated.findIndex(
        (row) => row.barcode === selected.barcode
      );
      if (existingIndex >= 0) {
        updated[existingIndex].qty += selected.qty;
        updated[existingIndex].totalPrice =
          updated[existingIndex].posUnitCost * updated[existingIndex].qty;
      } else {
        // otherwise add new
        updated.push({
          ...selected,
          totalPrice: (selected.posUnitCost || 0) * selected.qty,
        });
      }
    });
    return updated;
  });
};


  return (
    <View style={styles.container}>

      {/* ─────────────────────────────────────────────────────────
          NEW: "Search Products" + camera at top
      ───────────────────────────────────────────────────────── */}
      <View style={styles.row}>
        <Card style={{ marginVertical: 10, backgroundColor: "#d9ecfe" }}>
          <Card.Content>
            {/* This row holds the text input + camera button */}
            <View style={styles.Rowvendor}>
              {/* Product search input */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.searchInputVendor, { flex: 1 }]}
                  placeholder="Search Products..."
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
                {/* Camera button */}
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setCameraVisible(true)}
                >
                  {camImg ? (
                    <Image style={styles.cameraImage} source={camImg} />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 12 }}>Cam</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* If the user typed something and results are present, show them */}
            {apiSearchResults.length > 0 && (
              <View style={styles.searchquery}>
                <ScrollView style={{ maxHeight: 150, marginTop: 10 }}>
                  {apiSearchResults.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => addSearchItemToTable(item)}
                    >
                      <Text style={{ padding: 10 }}>
                        {item.productName} - {item.barcode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
      <View style={styles.Rowvendor}>
              {/* Product search input */}
       <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
        style={{ padding: 10, backgroundColor: "blue", margin: 10 }}
        onPress={() => setDeptSelectorVisible(true)}
      >
        <Text style={{ color: "#fff" }}>Search by Department</Text>
      </TouchableOpacity>

      {/* DepartmentItemSelector usage */}
      <DepartmentItemSelector
        visible={deptSelectorVisible}
        onClose={() => setDeptSelectorVisible(false)}
        categories={categories}
      //  fetchItemsForVendor={fetchItemsForVendor}
       fetchItemsForDepartment={fetchItemsForDepartment}
        onItemsSelected={handleItemsSelected}
      />

     {/* Example “Search by Vendor” button */}
     <TouchableOpacity
        style={{ backgroundColor: 'blue', padding: 10, margin: 10 }}
        onPress={() => setVendorSelectorVisible(true)}
      >
        <Text style={{ color: '#fff' }}>Search by Vendor</Text>
      </TouchableOpacity>

      {/* Use the VendorItemSelector modal */}
      <VendorItemSelector
        visible={vendorSelectorVisible}
        onClose={() => setVendorSelectorVisible(false)}
        vendorList={vendorNames}
        fetchItemsForVendor={fetchItemsForVendor}
        onItemsSelected={handleVendorItemsSelected}
      />
      </View>
      </View>




      {/* serach with department */}

      


      {/* Totals row */}
      <View style={styles.totalInvoiceContainer}>
        <View style={styles.invoiceHeaderBlock}>
          <Text style={styles.inoiceheader}>
            Allocated Amount: ${allocationData.allocated_amount.toFixed(2)}
          </Text>
        </View>
        <View style={styles.invoiceHeaderBlockMid}>
          <Text>Total Items: {totalItems}</Text>
        </View>
        <View style={styles.invoiceHeaderBlock}>
          <Text style={styles.inoiceheader}>Total Qty: {totalQty}</Text>
        </View>
        <View style={styles.invoiceHeaderBlockTotal}>
          <Text style={styles.inoiceheader}>
            Total PO: $ {totalInvoiceValue.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Main PO Table */}
      <ScrollView style={styles.horizontalScroll} horizontal={true} nestedScrollEnabled={true}>
        <View style={{ minWidth: 1000 }}>
          <ScrollView style={styles.poTableContainer} contentContainerStyle={styles.scrollContent}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col]}>Item Name</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Size</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Unit Cost</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Case Cost</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Total Price</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Barcode</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Department</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Vendor Name</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Remove</Text>
              </View>
              {poTableData.map((item, index) => {
                // Safely parse for display
                const displayPosUnitCost = parseFloat(item.posUnitCost) || 0;
                const displayInvCaseCost = parseFloat(item.invCaseCost) || 0;
                const displayTotalPrice = parseFloat(item.totalPrice) || 0;
                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.col]}>{item.posName}</Text>
                    <Text style={[styles.tableCell, styles.col]}>{item.posSize}</Text>
                    <Text style={[styles.tableCell, styles.col]}>
                      ${displayPosUnitCost.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, styles.col]}>
                      ${displayInvCaseCost.toFixed(2)}
                    </Text>

                    <View style={[styles.tableCell, styles.col, styles.qtyContainer]}>
                      <TouchableOpacity
                        onPress={() => updateQty(index, -1)}
                        style={[styles.qtyButton, styles.qtyButtonPlus]}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.qtyText, styles.qtyInput]}
                        keyboardType="numeric"
                        value={String(item.qty)}
                        onChangeText={(text) => handleManualQtyChange(index, text)}
                      />
                      <TouchableOpacity
                        onPress={() => updateQty(index, 1)}
                        style={styles.qtyButton}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.tableCell, styles.col, styles.totalpricecol]}>
                      ${displayTotalPrice.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, styles.col]}>{item.barcode}</Text>
                    <Text style={[styles.tableCell, styles.col]}>{item.posDepartment}</Text>
                    <Text style={[styles.tableCell, styles.col]}>{item.vendorName}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(index)}
                      style={[styles.tableCell, styles.col, styles.removeButton]}
                    >
                      <Text style={styles.removeButtonText}>X</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.buttonsRow}>
        {pdfloading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity style={[styles.generatepo]} onPress={generatePDF}>
            <Text style={styles.buttonText}>
              Generate PO{' '}
              <Image source={donwlaodicon} style={{ width: 30, height: 30 }} />
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.clearbuttonsRow]} onPress={clearTableData}>
          <Text style={styles.buttonText}>Clear Table</Text>
        </TouchableOpacity>
      </View>

      {/* Allocated Amount Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {loadingCategories ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
                <Text style={styles.modalTitle}>Allocated Amount Details</Text>
                <ScrollView>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderCell, styles.col]}>Category Name</Text>
                      <Text style={[styles.tableHeaderCell, styles.col]}>Allocated Amount</Text>
                      <Text style={[styles.tableHeaderCell, styles.col]}>Balance</Text>
                    </View>
                    {sortedActiveCategories.map((category) =>
                      category.pos_categ_ids.map((cat) => (
                        <View key={cat.id} style={styles.tableRow}>
                          <Text style={styles.tableCell}>{cat.categoryName}</Text>
                          <Text style={styles.tableCell}>
                            ${category.allocatedAmount.toFixed(2)}
                          </Text>
                          <Text style={styles.tableCell}>
                            $
                            {calculateBalance(category, cat.categoryName)?.toFixed(2) || 0}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                </ScrollView>
                <Button title="Close" onPress={() => setIsModalVisible(false)} />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Items Modal (for selected vendor) */}
      <Modal
        visible={isItemsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsItemsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.addcarthead}>
              Vendor Budget: {vendorBudgetTotal || ''} | Remaining Amount:{' '}
              {vendorBudgetRemaining != null ? vendorBudgetRemaining : ''}
            </Text>
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
                      onValueChange={() => toggleCheckbox(item.barcode, item.invCaseCost)}
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
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

      {/* All Items Modal */}
      <Modal
        visible={isAllItemsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAllItemsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select from All Items</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search All Items..."
              value={itemAllModalSearchQuery}
              onChangeText={setItemAllModalSearchQuery}
            />

            {modalAllItems && modalAllItems.length > 0 ? (
              <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                {modalAllItems.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <CheckBox
                      value={selectedAllModalItems.includes(item.barcode)}
                      onValueChange={() => toggleAllItemsCheckbox(item.barcode)}
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="Add Selected Item" onPress={handleAddSelectedAllItems} />
              <Button title="Close" onPress={() => setIsAllItemsModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW CAMERA MODAL */}
      <Modal
        visible={cameraVisible}
        transparent={false}
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <RNCamera
            style={{ flex: 1 }}
            onBarCodeRead={onBarCodeRead}
            captureAudio={false}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
          />
          <View style={{ position: 'absolute', top: 40, left: 20 }}>
            <TouchableOpacity onPress={() => setCameraVisible(false)} style={styles.closeCameraButton}>
              <Text style={{ color: '#fff', fontSize: 18 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor:"#fff"
  },
  row: {
    marginBottom: 15,
  },
  scrollContent: {
    padding: 10,
  },
  searchInputVendor: {
    backgroundColor:"#fff",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 5,
    width: '35%',
    marginLeft: 2,
  },
  /* Search results container style */
  searchquery: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#f3f3f3",
    borderWidth: 2
  },
  /* Camera button style */
  cameraButton: {
    backgroundColor: "#2C62FF",
    marginLeft: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraImage: {
    height: 24,
    width: 22,
    margin: 5,
    tintColor: '#fff'
  },
  closeCameraButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },

  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    padding: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  col: {
    width: 150,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  qtyButton: {
    backgroundColor:"#2C62FF",
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  qtyButtonPlus:{
    backgroundColor:"#f00",
  },
  qtyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  qtyInput: {
    width: 40,
  },
  qtyButtonText: {
    color:"#fff",
    fontSize: 16,
  },
  Rowvendor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalInvoiceContainer: {
    flexDirection: 'row',
    borderColor: '#f4f4f3',
    borderWidth: 1,
    padding:"2%",
    marginTop: 20,
    borderRadius:10
  },
  totalpricecol:{
    color:"#2C62FF",
  },
  inoiceheader:{
    fontWeight:"700",
    color: "#2C62FF",
    backgroundColor:"#d9ecfe",
  },
  invoiceHeaderBlock: {
    width:"30%",
    color: "#2C62FF",
    backgroundColor:"#d9ecfe",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 1,
    borderRadius: 4,
    display:'flex'
  },
  invoiceHeaderBlockTotal:{
    width:"23%",
    color: "#2C62FF",
    backgroundColor:"#d9ecfe",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 1,
    borderRadius: 4,
    display:'flex'
  },
  invoiceHeaderBlockMid:{
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 4
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  clearbuttonsRow: {
    backgroundColor:"#f00",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
  dropdownContainer: {
    width: '35%',
    marginVertical: 2,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addcarthead:{
    fontWeight:"700",
    padding:5,
  },
  addbutton:{
    backgroundColor: '#2C62FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  generatepo:{
    paddingBottom:"1%",
    backgroundColor: '#2ccb70',
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  headersearh:{
    marginVertical: 10,
    flexDirection: "row",
    flex: 1,

    }
});

export default VendorPOData;
