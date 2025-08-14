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
} from '../../../functions/VendorAccess/function';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import LoginForm from '../../../screen/Login';
import RNPickerSelect from 'react-native-picker-select';
import donwlaodicon from "../../../../fonts/download-icon.png";
import { color } from 'react-native-reanimated';

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

  // **Changed to an array** to store all items fetched
  const [fetchallitems, setFetchAllItems] = useState([]);  

  // Existing Items Modal (for selected vendor)
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
  const [selectedModalItems, setSelectedModalItems] = useState([]);
  const [itemModalSearchQuery, setItemModalSearchQuery] = useState('');
  // **New** modal states for "all items"
  const [isAllItemsModalVisible, setIsAllItemsModalVisible] = useState(false);
  const [selectedAllModalItems, setSelectedAllModalItems] = useState([]);
  const [itemAllModalSearchQuery, setItemAllModalSearchQuery] = useState('');
  const [totalbalance, setTotalBalance] = useState('');
  const [allocationData, setAllocationData] = useState({
    allocated_amount: 0,
    remaining_allocated_amount: 0,
  });
  const navigation = useNavigation();

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

  // useEffect(() => {
  //   const loadPOData = async () => {
  //     try {
  //       const storedData = await AsyncStorage.getItem('poTableData');
  //       if (storedData) {
  //         setPoTableData(JSON.parse(storedData));
  //       }
  //     } catch (error) {
  //       console.log('Error loading poTableData from AsyncStorage:', error);
  //     }
  //   };
  //   loadPOData();
  // }, []);

  // // ─────────────────────────────────────────────────────────────
  // // 2) Whenever poTableData changes, store it in AsyncStorage
  // // ─────────────────────────────────────────────────────────────
  // useEffect(() => {
  //   const storePOData = async () => {
  //     try {
  //       await AsyncStorage.setItem('poTableData', JSON.stringify(poTableData));
  //     } catch (error) {
  //       console.log('Error storing poTableData in AsyncStorage:', error);
  //     }
  //   };
  //   // Only store if poTableData is defined
  //   if (poTableData) {
  //     storePOData();
  //   }
  // }, [poTableData]);


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
        setTotalBalance(allocationData.allocated_amount - allocationData.remaining_allocated_amount);
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
      // If you need to load categories from an API, do it here:
      // ...
      setLoadingCategories(false);
    };
    loadCategories();
  }, [accessToken, storeUrl]);

  // Fetch all items once on component mount
  // useEffect(() => {
  //   const loadAllData = async () => {
  //     try {
  //       const allitemsdata = await fetchAllItems();
  //       // Make sure it’s an array
  //       setFetchAllItems(Array.isArray(allitemsdata) ? allitemsdata : []);
  //     } catch (err) {
  //       console.error('Error fetching all items:', err);
  //       setFetchAllItems([]);
  //     }
  //   };

  //   loadAllData();
    
  // }, [accessToken, storeUrl]);

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

  // Handle adding multiple selected items from vendor modal
// Modified handleAddSelectedItems for the vendor items modal
const handleAddSelectedItems = () => {
  // Filter the selected items from the vendor's filtered list
  const selectedItemsData = filteredItems.filter((item) =>
    selectedModalItems.includes(item.barcode)
  );

  setPoTableData((prevData) => {
    // Make a copy of the existing table data
    const updatedData = [...prevData];

    // For each selected item, check if it already exists in the table
    selectedItemsData.forEach((selectedItem) => {
      const existingIndex = updatedData.findIndex(
        (row) => row.barcode === selectedItem.barcode
      );

      if (existingIndex >= 0) {
        // If found, increase qty by 1
        updatedData[existingIndex].qty += 1;
        updatedData[existingIndex].totalPrice =
          updatedData[existingIndex].invCaseCost *
          updatedData[existingIndex].qty;
      } else {
        // If not found, add a new item with qty = 1
        updatedData.push({
          ...selectedItem,
          qty: 1,
          totalPrice: selectedItem.invCaseCost,
        });
      }
    });

    return updatedData;
  });

  // Clear selections and close modal
  setSelectedModalItems([]);
  setIsItemsModalVisible(false);
};


  // **New** handle adding multiple selected items from "all items" modal
// Modified handleAddSelectedAllItems for the "all items" modal
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
        // Increase qty by 1 if already in the table
        updatedData[existingIndex].qty += 1;
        updatedData[existingIndex].totalPrice =
          updatedData[existingIndex].invCaseCost *
          updatedData[existingIndex].qty;
      } else {
        // Add new item
        updatedData.push({
          ...selectedItem,
          qty: 1,
          totalPrice: selectedItem.invCaseCost,
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
      newQty = 1; // fallback to 1 if invalid or less than 1
    }
    setPoTableData((prevData) =>
      prevData.map((item, i) =>
        i === index
          ? {
              ...item,
              qty: newQty,
              totalPrice: item.invCaseCost * newQty,
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
                item.invCaseCost *
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

  // Select vendor from suggestions
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
        setVendorBudgetTotal(
          vendorAllocation.vendor_allocated_amount || '0'
        );
       
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
  };

  // Generate PDF
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

    // First, create vendor details order
    const dataresponse = await createVendorDetailsOrder(poTableData);

    let invoiceNumber = 'UnknownInvoice'; // Default value in case invoiceNumber is not found
    if (dataresponse && dataresponse.result && dataresponse.result.invoiceNumber) {
      invoiceNumber = dataresponse.result.invoiceNumber;
      setPDFLoading(false);
    } else {
      Alert.alert('Error', dataresponse.result.message);
      setPDFLoading(false);
      return;
    }

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
        <td>${item.totalPrice.toFixed(2)}</td>
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
      console.log('PDF generated at:', file.filePath);

      // Define destination path in the public Download directory
      const destPath = `${RNFS.DownloadDirectoryPath}/Invoice_${invoiceNumber}.pdf`;
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
      Alert.alert('Error', 'Could not open PDF.');
    }
  };

  const toggleCheckbox = (barcode, unitCost) => {
    setSelectedModalItems((prevSelected) => {
      let updatedSelectedItems;
      let updatedRemainingAmount = vendorBudgetRemaining;
  
      if (prevSelected.includes(barcode)) {
        // If item is already selected, remove it and add back its cost
        updatedSelectedItems = prevSelected.filter((item) => item !== barcode);
        updatedRemainingAmount += unitCost;
      } else {
        // If item is not selected, add it and subtract its cost
        updatedSelectedItems = [...prevSelected, barcode];
        updatedRemainingAmount -= unitCost;
      }
  
      setVendorBudgetRemaining(updatedRemainingAmount);
      return updatedSelectedItems;
    });
  };

  // Handle checkbox toggle inside all-items modal
  const toggleAllItemsCheckbox = (barcode) => {
    setSelectedAllModalItems((prevSelected) => {
      if (prevSelected.includes(barcode)) {
        return prevSelected.filter((item) => item !== barcode);
      } else {
        return [...prevSelected, barcode];
      }
    });
  };

  // Filter for vendor modal
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

  return (
    <View style={styles.container}>
      {/* Vendor Search Box */}
      <View style={styles.row}>
        <Card style={{ marginVertical: 10, backgroundColor:"#d9ecfe" }}>
          <Card.Content>
            {loadingVendors ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
              <View style={styles.Rowvendor}>
                <TextInput
                  style={styles.searchInputVendor}
                  placeholder="Search Vendor"
                  value={vendorSearchQuery}
                  onChangeText={(text) => {
                    setVendorSearchQuery(text);
                    setIsVendorDropdown(true);
                  }}
  
                />
  <View style={styles.dropdownContainer}>
          <RNPickerSelect
            onValueChange={(value) => handleVendorSelect(value)}
            items={vendorNames.map((name) => ({ label: name, value: name }))}
            placeholder={{ label: 'Select Vendor', value: null }}
            style={{
              inputIOS: styles.picker,
              inputAndroid: styles.picker,
            }}
          />
          </View>
            {loadingItems ? (
          <ActivityIndicator size="large" color="#0000ff" />
                      ) : (
       <TouchableOpacity style={[styles.button]} onPress={loadVendorDetails}>
      <Text style={styles.buttonText}>Search Items</Text>
    </TouchableOpacity>
      )
    }
     {/* <Button title="Search Items" onPress={loadVendorDetails} color="#1b70f5" width="10%"/> */}
        </View>
             {vendorSearchQuery.length > 0 && (
  filteredVendorNames && isvendordropdown && filteredVendorNames.length > 0 ? (
    <ScrollView style={styles.dropdown}>
      {filteredVendorNames.map((name, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            handleVendorSelect(name);
          }}
        >

        <Text style={styles.dropdownItem}>{name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : (
    <Text style={styles.noResult}></Text>
  )
)}

              </>
            )}
          </Card.Content>
        </Card>
      </View>
      <View style={styles.Rowvendor}>

     </View>
      {/* Totals */}
      <View style={styles.totalInvoiceContainer}>
      <View style={styles.invoiceHeaderBlock}>
       <Text style={styles.inoiceheader}>Allocated Amount: ${allocationData.allocated_amount.toFixed(2)}</Text>
       </View>
       <View style={styles.invoiceHeaderBlockMid}>
       <Text>Total Items: {totalItems}</Text> 
       </View>
       <View style={styles.invoiceHeaderBlock}>
      <Text style={styles.inoiceheader}> Total Qty: {totalQty}</Text> 
      </View>
      <View style={styles.invoiceHeaderBlockTotal}>
      <Text style={styles.inoiceheader}>Total PO: $ {totalInvoiceValue.toFixed(2)}
       </Text>
       </View>
      </View>
      {/* Scrollable Table */}
      <ScrollView style={styles.horizontalScroll} horizontal={true} nestedScrollEnabled={true}>
        <View style={{ minWidth: 1000 }}>
          <ScrollView style={styles.poTableContainer} contentContainerStyle={styles.scrollContent}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Item Name
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Size</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Unit Cost
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Case Cost
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Total Price
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Barcode
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Department
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Vendor Name
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col]}>
                  Remove
                </Text>
              </View>
              {poTableData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col]}>
                    {item.posName}
                  </Text>
                  <Text style={[styles.tableCell, styles.col]}>
                    {item.posSize}
                  </Text>
                  <Text style={[styles.tableCell, styles.col]}>
                    ${item.posUnitCost.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col]}>
                    ${item.invCaseCost.toFixed(2)}
                  </Text>
  
                  {/* QTY container */}
                  <View style={[styles.tableCell, styles.col, styles.qtyContainer]}>
                    <TouchableOpacity
                      onPress={() => updateQty(index, -1)}
                      style={[styles.qtyButton,styles.qtyButtonPlus]}
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
                    ${item.totalPrice.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col]}>
                    {item.barcode}
                  </Text>
                  <Text style={[styles.tableCell, styles.col]}>
                    {item.posDepartment}
                  </Text>
                  <Text style={[styles.tableCell, styles.col]}>
                    {item.vendorName}
                  </Text>
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
          </ScrollView>
        </View>
      </ScrollView>
      <View style={styles.buttonsRow}>
      {pdfloading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity style={[styles.generatepo]} onPress={generatePDF} >
      <Text style={styles.buttonText}> Generate PO <Image
    source={donwlaodicon}
    style={{ width: 30, height: 30}}
  /></Text>
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
                      <Text style={[styles.tableHeaderCell, styles.col]}>
                        Category Name
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.col]}>
                        Allocated Amount
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.col]}>
                        Balance
                      </Text>
                    </View>
                    {sortedActiveCategories.map((category) =>
                      category.pos_categ_ids.map((cat) => (
                        <View key={cat.id} style={styles.tableRow}>
                          <Text style={styles.tableCell}>
                            {cat.categoryName}
                          </Text>
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
                </ScrollView>
                <Button title="Close" onPress={() => setIsModalVisible(false)} />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Items Modal with Search and Checkboxes (for selected vendor) */}
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
              { vendorBudgetRemaining != null 
    ? vendorBudgetRemaining
    : '' }
            </Text>

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
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}
            >
                <TouchableOpacity style={[styles.addbutton]} onPress={handleAddSelectedItems}>
      <Text style={styles.buttonText}>Add Items</Text>
    </TouchableOpacity>
              {/* <Button title="Add Selected Items" onPress={handleAddSelectedItems} /> */}
              {/* <Button title="Close" onPress={() => setIsItemsModalVisible(false)} /> */}
              <TouchableOpacity style={[styles.clearbuttonsRow]} onPress={() => setIsItemsModalVisible(false)} >
      <Text style={styles.buttonText}>Close</Text>
    </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW: All Items Modal with Search and Checkboxes */}
      <Modal
        visible={isAllItemsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAllItemsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select from All Items</Text>

            {/* Search Box inside all-items modal */}
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
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}
            >
              <Button title="Add Selected Items" onPress={handleAddSelectedAllItems} />
              <Button title="Close" onPress={() => setIsAllItemsModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Button */}
      {/* <Button mode="contained" onPress={custom_Logout} title="Logout" /> */}
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
    // paddingBottom: 20,
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
    backgroundColor:"#fff",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 5,
    width: '35%',
    marginLeft: 2,
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
    width: 150, // Set the width for each column as needed
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
    // any other block-level style
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
    paddingVertical: 10,  // Internal vertical padding
    paddingHorizontal: 15, // Internal horizontal padding
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
  instructionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#555',
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15,  // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
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
    paddingVertical: 15,  // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  
  generatepo:{
    paddingBottom:"1%",
    backgroundColor: '#2ccb70',
    paddingHorizontal: 10, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VendorPOData;