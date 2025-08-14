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
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import camImg from '../../src/images/compact-camera.png'
// NEW CAMERA CODE
import { RNCamera } from 'react-native-camera';
import {
  fetchCategoryProducts,
  fetchStockUpdate,
  fetchVendorList,
  getVendorBudgetCurrentWeek,
  fetchAllItems,
  getTotalAllocationCurrentWeek,
  fetchAvailableCategories,
  createOrder
} from '../functions/VendorAccess/function';

import LoginForm from '../screen/Login';
import donwlaodicon from "../../fonts/download-icon.png";
import { Dimensions } from 'react-native';

const StoreManagerOrder = () => {
  const [vendorNames, setVendorNames] = useState([]);
  const [filteredVendorNames, setFilteredVendorNames] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [cateproducts, setCagteProducts] = useState([]); 
  const [filteredItems, setFilteredItems] = useState([]); 
  const [poTableData, setPoTableData] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [isvendordropdown, setIsVendorDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfloading, setPDFLoading] = useState(false);
  const [vendorBudgetTotal, setVendorBudgetTotal] = useState(null);
  const [vendorBudgetRemaining, setVendorBudgetRemaining] = useState(null);
  const [totalWarehouseRequestedQty, setTotalWarehouseRequestedQty] = useState(0);

  // State to track quantities inside the vendor-items modal
  const [modalSelectedItems, setModalSelectedItems] = useState({});
  // Holds all items fetched across the entire store
  const [fetchallitems, setFetchAllItems] = useState([]);

  // Existing Items Modal (for selected vendor)
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [selectedModalItems, setSelectedModalItems] = useState([]);
  const [itemModalSearchQuery, setItemModalSearchQuery] = useState('');

  // Modal states for “all items”
  const [isAllItemsModalVisible, setIsAllItemsModalVisible] = useState(false);
  const [selectedAllModalItems, setSelectedAllModalItems] = useState([]);
  const [itemAllModalSearchQuery, setItemAllModalSearchQuery] = useState('');

  const [totalbalance, setTotalBalance] = useState('');
  const [warehouseStockData, setWarehouseStockData] = useState([]);

  const [allocationData, setAllocationData] = useState({
    allocated_amount: 0,
    remaining_allocated_amount: 0,
  });

  const navigation = useNavigation();

  // NEW: modal to select Department
  const [isDepartmentModalVisible, setIsDepartmentModalVisible] = useState(false);
  const [isDepartmentItemVisible, setIsDepartmentItemVisible] = useState(false);

  // NEW CAMERA CODE
  // State to manage whether the camera modal is visible
  const [cameraVisible, setCameraVisible] = useState(false);

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

  const updateQtyInModal = (barcode, increment) => {
    setModalSelectedItems((prevItems) => {
      const currentQty = prevItems[barcode] || 1;
      const newQty = currentQty + increment > 0 ? currentQty + increment : 1;
      return { ...prevItems, [barcode]: newQty };
    });
  };

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
            message: 'This app needs access to your storage to save PDF files',
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

  const custom_Logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      AsyncStorage.removeItem('ManageAccount');
      AsyncStorage.removeItem('is_pos_manager');
      navigation.navigate('Login');
      console.log('Logging out');
    } catch (error) {
      console.error('Error logging out:', error);
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
      // If you need to load categories from an API, do it here
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
    categories[0]?.categories?.sort((a, b) => a.name.localeCompare(b.name)) || [];

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

  // This function runs after a department ID is chosen
  const handleCategorySelect = async (cagteid) => {
    console.log('selected category is', cagteid);
    await AsyncStorage.setItem('categoryid', String(cagteid));
  };

  // The function that actually loads items from the chosen department
  const loadVendorDetails = async () => {
    setLoadingCategories(true);
    const fetchedCatProduct = await fetchCategoryProducts();
    setCagteProducts(fetchedCatProduct);
    setIsDepartmentModalVisible(false);
    setLoadingCategories(false);
    setFilteredItems(fetchedCatProduct);
    console.log('fetchedCatProduct', fetchedCatProduct);

    if (fetchedCatProduct.length > 0) {
      setIsItemsModalVisible(true);
    } else {
      Alert.alert('No Items', 'No items found for this department.');
    }
  };
  const handleCloseItemsModal = () => {
    // Close the modal
    setIsItemsModalVisible(false);
    // Reset both the checkboxes and the per-item qty object
    setSelectedModalItems([]);
    setModalSelectedItems({});
  };
  

  // Just replace your existing handleAddtocardSelectedItems function with this:

const handleAddtocardSelectedItems = () => {
  // Filter the selected items from the vendor's filtered list
  let selectedItemsData = filteredItems.filter((item) =>
    selectedModalItems.includes(item.barcode)
  );

  // Deduplicate by barcode (if multiple items share same barcode, keep only one)
  const uniqueByBarcode = {};
  selectedItemsData.forEach(item => {
    if (!uniqueByBarcode[item.barcode]) {
      uniqueByBarcode[item.barcode] = item;
    }
  });
  selectedItemsData = Object.values(uniqueByBarcode);

  setPoTableData((prevData) => {
    const updatedData = [...prevData];
    selectedItemsData.forEach((selectedItem) => {
      // Get the modal's chosen quantity for this barcode
      const itemQty = modalSelectedItems[selectedItem.barcode] || 1;

      const existingIndex = updatedData.findIndex(
        (row) => row.barcode === selectedItem.barcode
      );

      if (existingIndex >= 0) {
        // If already in PO table, increment the existing qty
        updatedData[existingIndex].qty += itemQty;
        updatedData[existingIndex].totalPrice =
          updatedData[existingIndex].posUnitCost * updatedData[existingIndex].qty;
      } else {
        // Otherwise, push as a new row
        updatedData.push({
          ...selectedItem,
          qty: itemQty,
          totalPrice: selectedItem.posUnitCost * itemQty,
        });
      }
    });
    return updatedData;
  });

  // Clear the selected checkboxes + qty state
  setSelectedModalItems([]);
  setModalSelectedItems({});
  setIsItemsModalVisible(false);
};

  const handleAddSelectedItems = async () => {
    if (poTableData.length === 0) {
      Alert.alert("Error", "No items in PO table.");
      return;
    }

    const selectedQuantities = poTableData.reduce((acc, item) => {
      acc[item.barcode] = item.qty;
      return acc;
    }, {});
    console.log("Prepared Quantity Data for API:", selectedQuantities);

    // Fetch stock update
    const stockData = await fetchStockUpdate(Object.keys(selectedQuantities), selectedQuantities);
    if (!stockData || stockData.status !== "success") {
      console.error("Stock update failed:", stockData);
      Alert.alert("Error", "Stock update failed. Please try again.");
      return;
    }

    console.log("Fetched Stock Data:", stockData.data);
    setWarehouseStockData(stockData.data);

    let totalRequested = 0;
    Object.keys(stockData.data).forEach((warehouseId) => {
      const warehouse = stockData.data[warehouseId];
      const products = warehouse.products || {};
      Object.values(products).forEach((product) => {
        totalRequested += product.requested_quantity || 0;
      });
    });

    setTotalWarehouseRequestedQty(totalRequested);
    setIsPreviewModalVisible(true);
  };

  const handleAddSelectedAllItems = () => {
    // Filter the selected items from the entire fetchallitems array
    const selectedItemsData = fetchallitems.filter((item) =>
      selectedAllModalItems.includes(item.barcode)
    );

    setPoTableData((prevData) => {
      const updatedData = [...prevData];
      selectedItemsData.forEach((selectedItem) => {
        const existingIndex = updatedData.findIndex(
          (row) => row.barcode === selectedItem.barcode
        );
        if (existingIndex >= 0) {
          updatedData[existingIndex].qty += 1;
          updatedData[existingIndex].totalPrice =
            updatedData[existingIndex].posUnitCost *
            updatedData[existingIndex].qty;
        } else {
          updatedData.push({
            ...selectedItem,
            qty: 1,
            totalPrice: selectedItem.posUnitCost,
          });
        }
      });
      return updatedData;
    });

    // Clear selections and close modal
    setSelectedAllModalItems([]);
    setIsAllItemsModalVisible(false);
  };

  // Update quantity and total price manually
  const handleManualQtyChange = (index, text) => {
    let newQty = parseInt(text, 10);
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    setPoTableData((prevData) =>
      prevData.map((item, i) =>
        i === index
          ? {
              ...item,
              qty: newQty,
              totalPrice: item.posUnitCost * newQty,
            }
          : item
      )
    );
  };

  // Update quantity using +/- buttons
  const updateQty = (index, increment) => {
    setPoTableData((prevData) =>
      prevData.map((item, i) =>
        i === index
          ? {
              ...item,
              qty: item.qty + increment > 0 ? item.qty + increment : 1,
              totalPrice:
                item.posUnitCost *
                (item.qty + increment > 0 ? item.qty + increment : 1),
            }
          : item
      )
    );
  };

  // Remove item from PO table
  const handleRemoveItem = (index) => {
    setPoTableData((prevData) => prevData.filter((_, i) => i !== index));
  };

  // const handleRemovePreview = (barcodeToRemove) => {
  //   setWarehouseStockData((prevData) => {
  //     const updatedData = { ...prevData };
  //     Object.keys(updatedData).forEach((warehouseId) => {
  //       if (updatedData[warehouseId]?.products) {
  //         delete updatedData[warehouseId].products[barcodeToRemove];
  //         if (Object.keys(updatedData[warehouseId].products).length === 0) {
  //           delete updatedData[warehouseId];
  //         }
  //       }
  //     });
  //     return updatedData;
  //   });
  // };

  const handleRemovePreview = (barcodeToRemove) => {
    setWarehouseStockData((prevData) => {
      const newData = {};
  
      Object.entries(prevData).forEach(([warehouseId, warehouse]) => {
        const newProducts = { ...warehouse.products };
        delete newProducts[barcodeToRemove];
  
        if (Object.keys(newProducts).length > 0) {
          newData[warehouseId] = {
            ...warehouse,
            products: newProducts,
          };
        }
      });
  
      return newData;
    });
  };
  

  
// remove warehouse data from preview


const handleRemoveWarehouse = (warehouseId) => {
  setWarehouseStockData((prevData) => {
    const updatedData = { ...prevData };
    delete updatedData[warehouseId];
    return updatedData;
  });
};

  // Calculate totals
  const totalInvoiceValue = poTableData.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const totalItems = poTableData.length;
  const totalQty = poTableData.reduce((sum, item) => sum + item.qty, 0);

  const calculateBalance = (category, departmentName) => {
    const matchedCategory = category.pos_categ_ids.find(
      (posCategory) => posCategory.categoryName === departmentName
    );
    if (matchedCategory) {
      const totalForDepartment = poTableData
        .filter((item) => item.posDepartment === departmentName)
        .reduce((sum, item) => sum + item.totalPrice, 0);
      return category.remainingAmount - totalForDepartment;
    }
    return null;
  };

  const clearTableData = () => {
    setPoTableData([]);
    setWarehouseStockData([]);
  };

  // CREATE ORDER API (when user is satisfied with the warehouse preview)
  const handleCreateOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const storeUrl = await AsyncStorage.getItem('storeUrl');
      const storeid = await AsyncStorage.getItem('store_id');

      if (!token || !storeUrl || !storeid) {
        Alert.alert("Error", "Missing authentication details.");
        return;
      }

      // Build the warehouses object
      const warehousesData = {};

      Object.keys(warehouseStockData).forEach((warehouseId) => {
        const warehouse = warehouseStockData[warehouseId];
        const products = warehouse.products || [];
        
        const formattedProducts = products.map((product) => ({
          product_name: product.productName,
          barcode: product.barcode,
          quantity: product.requested_quantity,
          warehouse_id: parseInt(warehouseId),
        }));
        
        if (formattedProducts.length > 0) {
          warehousesData[warehouseId] = { products: formattedProducts };
        }
      });
console.log('warehousedata', warehousesData);
      
      // old warehosuestock data
      // Object.keys(warehouseStockData).forEach((warehouseId) => {
      //   const warehouse = warehouseStockData[warehouseId];
      //   const products = warehouse.products || {};
      //   const formattedProducts = Object.keys(products).map((barcode) => ({
      //     product_name: products[barcode].productName,
      //     barcode: products[barcode].barcode,
      //     quantity: products[barcode].requested_quantity,
      //     warehouse_id: parseInt(warehouseId),
      //   }));
      //   if (formattedProducts.length > 0) {
      //     warehousesData[warehouseId] = { products: formattedProducts };
      //   }
      // });

      if (Object.keys(warehousesData).length === 0) {
        Alert.alert("Error", "No products to order.");
        return;
      }

      // Call API
      const response = await createOrder(storeUrl, storeid, warehousesData, token);
      if (response.status === 'success') {
        Alert.alert("Order has been Create Successfully");
        clearTableData();
        setIsPreviewModalVisible(false);
      } else {
        setIsPreviewModalVisible(false);
        Alert.alert("Error", response.message || "Order creation failed.");
      }
    } catch (error) {
      setIsPreviewModalVisible(false);
      console.error("Error creating order:", error);
      Alert.alert("Error", "Something went wrong while creating the order.");
    }
  };

  // Optional: real-time search from an API
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState([]);

  const handleApiSearch = async (query) => {
    try {
      const storedtoken = await AsyncStorage.getItem('access_token');
      const storedurl = await AsyncStorage.getItem('storeUrl');
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
      }
    } catch (error) {
      console.error("API search error:", error);
    }
  };

  const addSearchItemToTable = (selectedItem) => {
    setPoTableData((prevData) => {
      const updatedData = [...prevData];
      const existingIndex = updatedData.findIndex(
        (row) => row.barcode === selectedItem.barcode
      );
      if (existingIndex >= 0) {
        updatedData[existingIndex].qty += 1;
        updatedData[existingIndex].totalPrice =
          updatedData[existingIndex].posUnitCost *
          updatedData[existingIndex].qty;
      } else {
        updatedData.push({
          ...selectedItem,
          qty: 1,
          totalPrice: selectedItem.posUnitCost,
        });
      }
      return updatedData;
    });
  };

  // Toggles for the vendor-items modal checkboxes
  const toggleCheckbox = (barcode, warehouseId) => {
    setSelectedModalItems((prevSelected) => {
      if (prevSelected.includes(barcode)) {
        // If already selected, remove it
        return prevSelected.filter((item) => item !== barcode);
      } else {
        return [...prevSelected, barcode];
      }
    });
  };

  // Toggles for the “all-items” modal checkboxes
  const toggleAllItemsCheckbox = (barcode) => {
    setSelectedAllModalItems((prevSelected) => {
      if (prevSelected.includes(barcode)) {
        return prevSelected.filter((item) => item !== barcode);
      } else {
        return [...prevSelected, barcode];
      }
    });
  };

  // Filter for vendor-items modal
  const modalFilteredItems = filteredItems
    .reduce((acc, item) => {
      const existingItem = acc.find((i) => i.barcode === item.barcode);
      if (!existingItem) acc.push(item);
      return acc;
    }, [])
    .filter((item) => {
      const productName = item.productName ? item.productName.toLowerCase() : "";
      const barcode = item.barcode ? item.barcode.toLowerCase() : "";
      const warehouseName = item.warehouse__warehouseName ? item.warehouse__warehouseName.toLowerCase() : "";
      const query = itemModalSearchQuery.toLowerCase();
      return (
        productName.includes(query) ||
        barcode.includes(query) ||
        warehouseName.includes(query)
      );
    });

  // Filter for all-items modal
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

  // NEW CAMERA CODE
  // This function gets called when a barcode is read
  const onBarCodeRead = async (event) => {
    const scannedCode = event.data;
    if (scannedCode) {
      // Close the camera
      setCameraVisible(false);
      // Use your existing handleApiSearch or direct fetch to get item info
      try {
        console.log("Scanned Barcode:", scannedCode);
        // We can directly do a search with the scannedCode:
        const storedtoken = await AsyncStorage.getItem('access_token');
        const storedurl = await AsyncStorage.getItem('storeUrl');
        const response = await fetch(`${storedurl}/product/search/?q=${scannedCode}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedtoken}`,
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();

        if (result && result.data && result.data.length > 0) {
          // Usually barcodes match one product, but handle multiple if returned
          const foundItem = result.data[0]; 
          // Add to table
          addSearchItemToTable(foundItem);
        } else {
          Alert.alert("Not Found", "No product found for that barcode");
        }
      } catch (error) {
        console.error("Scanning error:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* ---- Vendor / Department Search Row ---- */}
      <View style={styles.row}>
        <Card style={{ marginVertical: 10, backgroundColor: "#d9ecfe" }}>
          <Card.Content>
            {loadingVendors ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
                <View style={styles.Rowvendor}>
                  {/* TextInput for Searching by API */}
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={[styles.searchInputVendor, { flex: 1 }]}
                      placeholder="Search Products..."
                      value={apiSearchQuery}
                      onChangeText={(text) => {
                        setApiSearchQuery(text);
                        if (text.length > 2) {
                          handleApiSearch(text);
                        } else {
                          setApiSearchResults([]);
                        }
                      }}
                    />
                    {/* NEW CAMERA CODE - Button to open the camera */}
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={() => setCameraVisible(true)}
                    >
                        <Image
                          style={{ ...styles.cameraImage }}
                        source={camImg}
                                      />
                    </TouchableOpacity>
                  </View>
                </View>

              </>
            )}
          </Card.Content>
        </Card>
      </View>
      {apiSearchResults.length > 0 && apiSearchQuery.length > 0 &&  (
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

      <View style={styles.Rowvendor}>
        {sortedActiveCategories.map((category) =>
          category.pos_categ_ids.map((cat) => (
            <View key={cat.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{cat.categoryName}</Text>
              <Text style={styles.tableCell}>
                ${category.allocatedAmount.toFixed(2)}
              </Text>
              <Text style={styles.tableCell}>
                $
                {calculateBalance(category, cat.categoryName)?.toFixed(2) ||
                  0}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Totals */}
      <View style={styles.totalInvoiceContainer}>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => setIsDepartmentModalVisible(true)}
        >
          <Text style={styles.buttonText}>Search with Department</Text>
        </TouchableOpacity>
        <View style={styles.invoiceHeaderBlockTotal}>
          <Text>Total Items: {totalItems}</Text>
        </View>
        <View style={styles.invoiceHeaderBlock}>
          <Text style={styles.inoiceheader}>Total Qty: {totalQty}</Text>
        </View>
      </View>

      {/* PO Table */}
      <ScrollView
       
      > 
      {/* <ScrollView
        style={styles.horizontalScroll}
        horizontal={true}
        nestedScrollEnabled={true}
      > */}
        <View style={styles.tableMinWidthContainer}>
          {/* <ScrollView
             style={styles.poTableContainer}
             contentContainerStyle={styles.scrollContent}
          > */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Item Name
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Barcode
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Qty</Text>
                {/* <Text style={[styles.tableHeaderCell, styles.col]}>
                  Warehouse
                </Text> */}
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Remove
                </Text>
              </View>

              {poTableData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col]}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.tableCell, styles.col]}>
                    {item.barcode}
                  </Text>

                  {/* QTY container */}
                  <View
                    style={[
                      styles.tableCell,
                      styles.col,
                      styles.qtyContainer,
                    ]}
                  >
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

                  {/* Remove button */}
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(index)}
                    style={[styles.tableCell, styles.col, styles.removeButton]}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          {/* </ScrollView> */}
        </View>
      {/* </ScrollView> */}
      </ScrollView> 

      {/* Warehouse Preview Modal */}
      <ScrollView
        style={styles.horizontalScroll}
        horizontal={true}
        nestedScrollEnabled={true}
      >
        <View style={{ minWidth: 1000 }}>
          <Modal
            visible={isPreviewModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsPreviewModalVisible(false)}
          >
           
            <View style={styles.previewContainer}>
              <View style={styles.previewContent}>
              <ScrollView>
                {Object.keys(warehouseStockData).map((warehouseId, index) => {
                  const warehouse = warehouseStockData[warehouseId];
                  const products = warehouse.products || {};
                  return (
                    <View key={index} style={{ marginBottom: 20 }}>
                      {/* Warehouse Name as Table Header */}
                      <View>
                        <Text
                          style={[styles.tableHeaderCell, 
                            
                            warehouse.name === 'Products Not Available'
        ? styles.warehouseHeaderRedBackground
        : styles.warehouseHeader
                           ]}
                        >
                          {  warehouse.name === 'Products Not Available' ? 'Products are not available (Please remove before generating PO)' :warehouse.name}</Text>
                      </View>
             
                      {/* Table for Each Warehouse */}
                      <View style={styles.table}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderCell, styles.col]}>
                            Barcode
                          </Text>
                          <Text style={[styles.tableHeaderCell, styles.col]}>
                            Name
                          </Text>
                          <Text style={[styles.tableHeaderCell, styles.col]}>
                            Size
                          </Text>
                          <Text style={[styles.tableHeaderCell, styles.col]}>
                            Current Stock
                          </Text>
                          <Text style={[styles.tableHeaderCell, styles.col]}>
                            Requested Qty
                          </Text>
                          <Text style={[styles.tableHeaderCell, styles.col]}>
                            Can Fulfill
                          </Text>
                          {/* <Text style={[styles.tableHeaderCell, styles.col]}>
                            Remove
                          </Text> */}
                        </View>
                        {Object.keys(products).map((barcode, productIndex) => {
                          const product = products[barcode];
                          return (
                            <View key={productIndex} style={styles.tableRow}>
                              <Text style={[styles.tableCell, styles.col]}>
                                {product.barcode}
                              </Text>
                              <Text style={[styles.tableCell, styles.col]}>
                                {product.productName}
                              </Text>
                              <Text style={[styles.tableCell, styles.col]}>
                                {product.size}
                              </Text>
                              <Text style={[styles.tableCell, styles.col]}>
                                {product.current_stock}
                              </Text>
                              <Text style={[styles.tableCell, styles.col]}>
                                {product.requested_quantity}
                              </Text>
                              <Text style={[styles.tableCell, styles.col]}>
                                {product.can_fulfill ? "✅ Yes" : "❌ No"}
                              </Text>
                              {/* <TouchableOpacity
                                onPress={() => handleRemovePreview(barcode)}
                                style={[
                                  styles.tableCell,
                                  styles.col,
                                  styles.removeButton,
                                ]}
                              >
                                <Text style={styles.removeButtonText}>X</Text>
                              </TouchableOpacity> */}
                            </View>
                          );
                        })}
                      </View>
                      <TouchableOpacity
        style={{ 
          backgroundColor: 'red', 
          padding: 10, 
          marginVertical: 5, 
          borderRadius: 6,
          alignSelf: 'flex-start'  /* or 'center' or 'flex-end' as you prefer */
        }}
        onPress={() => handleRemoveWarehouse(warehouseId)}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>
          Clear This Warehouse
        </Text>
      </TouchableOpacity>
                    </View>
                  );
                })}
                  </ScrollView>
                {pdfloading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <View style={styles.generatepobutton}>
                    <TouchableOpacity
                      style={[styles.generatepo]}
                      onPress={handleCreateOrder}
                    >
                      <Text style={styles.buttonText}>
                        Generate PO{" "}
                        {/* <Image
                          source={donwlaodicon}
                          style={{ width: 30, height: 30 }}
                        /> */}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.clearbuttonsRow]}
                      onPress={() => setIsPreviewModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          
          </Modal>
        </View>
      </ScrollView>

      {/* Action buttons: Clear Table & Preview Order */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.clearbuttonsRow]} onPress={clearTableData}>
          <Text style={styles.buttonText}>Clear Table</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.generatepo]} onPress={handleAddSelectedItems}>
          <Text style={styles.buttonText}>Preview Order</Text>
        </TouchableOpacity>
      </View>

      {/* Items Modal (for the department’s items) */}
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

            {modalFilteredItems.length > 0 ? (
              <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 5 }}>
                  {/* Table Header */}
                  <View style={[styles.tableHeader, { backgroundColor: '#f2f2f2' }]}>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableHeaderCellcat, { flex: 2 }]}>Product Name</Text>
                    {selectedModalItems.length > 0 && (
    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Qty</Text>
  )}
                    {/* <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Qty</Text> */}
                  </View>
                  {/* Table Rows */}
                  {modalFilteredItems.map((item, index) => {
                    const itemQty = modalSelectedItems[item.barcode] || 1;
                    return (
                      <View key={index} style={styles.tableRow}>
                        {/* Checkbox */}
                        <View style={[styles.tableCell, { flex: 1, justifyContent: 'center' }]}>
                          <CheckBox
                            value={selectedModalItems.includes(item.barcode)}
                            onValueChange={() => toggleCheckbox(item.barcode, item.warehouse_id)}
                          />
                        </View>
                        {/* Product Name */}
                        <TouchableOpacity
                          style={[styles.tableCell, { flex: 2 }]}
                          onPress={() => toggleCheckbox(item.barcode, item.warehouse_id)}
                        >
                          <Text>{item.productName}</Text>
                        </TouchableOpacity>

                        {/* Quantity Controls */}

                        {selectedModalItems.includes(item.barcode) && (
  <View style={[styles.tableCell, styles.qtyContainer, { flex: 2 }]}>
    <TouchableOpacity
      onPress={() => updateQtyInModal(item.barcode, -1)}
      style={[styles.qtyButton, styles.qtyButtonPlus]}
    >
      <Text style={styles.qtyButtonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.qtyText}>{itemQty}</Text>
    <TouchableOpacity
      onPress={() => updateQtyInModal(item.barcode, 1)}
      style={[styles.qtyButton, styles.qtyButtonMinus]}
    >
      <Text style={styles.qtyButtonText}>+</Text>
    </TouchableOpacity>
  </View>
)}
                        {/* <View style={[styles.tableCell, styles.qtyContainer, { flex: 2 }]}>
                          <TouchableOpacity
                            onPress={() => updateQtyInModal(item.barcode, -1)}
                            style={[styles.qtyButton, styles.qtyButtonPlus]}
                          >
                            <Text style={styles.qtyButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{itemQty}</Text>
                          <TouchableOpacity
                            onPress={() => updateQtyInModal(item.barcode, 1)}
                            style={[styles.qtyButton, styles.qtyButtonMinus]}
                          >
                            <Text style={styles.qtyButtonText}>+</Text>
                          </TouchableOpacity>
                        </View> */}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <Text style={{ marginTop: 16 }}>Item not found</Text>
            )}
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="Add Selected Items" onPress={handleAddtocardSelectedItems} />
              <Button title="Close" onPress={() => setIsItemsModalVisible(false)} />
            </View> */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
  {/* Add Selected Items Button */}
  <TouchableOpacity
    onPress={handleAddtocardSelectedItems}
    style={{
      backgroundColor: '#2C62FF',
      borderRadius: 6,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10, // margin between buttons
    }}
  >
    <Text style={{ color: '#fff', fontSize: 16 }}>Add Selected Items</Text>
  </TouchableOpacity>

  {/* Close Button */}
  <TouchableOpacity
  onPress={handleCloseItemsModal}
    style={{
      backgroundColor: '#f00',
      borderRadius: 6,
      paddingHorizontal: 15,
      paddingVertical: 10,
    }}
  >
    <Text style={{ color: '#fff', fontSize: 16 }}>Close</Text>
  </TouchableOpacity>
</View>
          </View>
        </View>
      </Modal>

      {/* “All Items” Modal */}
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
                      {item.posName} - ${item.posUnitCost}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ marginTop: 16 }}>Item not found</Text>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="Add Selected Items" onPress={handleAddSelectedAllItems} />
              <Button title="Close" onPress={() => setIsAllItemsModalVisible(false)} />
            </View>
            
          </View>
        </View>
      </Modal>

      {/* Department Modal with a LIST (no dropdown) */}
      <Modal
        visible={isDepartmentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDepartmentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Department</Text>
            <ScrollView style={{ width: '100%', maxHeight: 400 }}>
              {categories
                ?.sort((a, b) => a.name.localeCompare(b.name))
                ?.map((dept) => (
                  <View style={styles.departmentRow} key={dept.id}>
                    <Text style={styles.departmentName}>{dept.name}</Text>
                    <TouchableOpacity
                      style={styles.searchItemsButton}
                      onPress={() => {
                        handleCategorySelect(dept.id);
                        loadVendorDetails();
                        setIsDepartmentItemVisible(true);
                      }}
                    >
                      <Text style={styles.searchItemsButtonText}>Search Items</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>
            <Text>
              {loadingCategories ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                ''
              )}
            </Text>
            <TouchableOpacity
              style={[styles.clearbuttonsRow, { marginTop: 10 }]}
              onPress={() => setIsDepartmentModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NEW CAMERA CODE: Fullscreen or Modal for scanning */}
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
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  row: {
    marginBottom: 15,
  },
  scrollContent: {
    padding: 10,
  },
  searchInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  searchInputVendor: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 5,
    marginLeft: 2,
  },
  cameraButton: {
    backgroundColor: "#2C62FF",
    marginLeft: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeCameraButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
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
  tableHeaderCellcat:{
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'left',
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
    backgroundColor: "#2C62FF",
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  qtyButtonPlus: {
    backgroundColor: "#f00",
  },
  qtyButtonMinus: {
    backgroundColor: "#2C62FF",
  },
  qtyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  qtyInput: {
    width: 40,
    borderWidth: 1,
    borderColor: '#f3f3f3',

  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  Rowvendor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  generatepobutton: {
    flexDirection: 'row',
    marginBottom: 10,
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
    padding: "2%",
    marginTop: 20,
    borderRadius: 10,
  },
  totalpricecol: {
    color: "#2C62FF",
  },
  inoiceheader: {
    fontWeight: "700",
    color: "#2C62FF",
    backgroundColor: "#d9ecfe",
  },
  invoiceHeaderBlock: {
    width: "30%",
    color: "#2C62FF",
    backgroundColor: "#d9ecfe",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 1,
    borderRadius: 4,
  },
  invoiceHeaderBlockTotal: {
    width: "23%",
    color: "#2C62FF",
    backgroundColor: "#d9ecfe",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 5,
    marginLeft: 5,
    borderRadius: 4,
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  searchquery:{
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "f3f3f3", 
    borderWidth: 2
  },
  clearbuttonsRow: {
    backgroundColor: "#f00",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalScroll: {
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
  },
  previewContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
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
  departmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
  },
  departmentName: {
    flex: 1,
    fontSize: 16,
  },
  searchItemsButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  searchItemsButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatepo: {
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
  warehouseHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: 5,
  },
  warehouseHeaderRedBackground:{
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: "#f00",
    color: "#fff",
    borderRadius: 5,
  },
  cameraImage: {
    height: 24,
    width: 22,
    margin: 10,
    tintColor: 'fff',
    zIndex: 1,
  },
  tableMinWidthContainer: {
    minWidth: screenWidth
  },
});

export default StoreManagerOrder;
