import React, { useState, useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  ScrollView,
  Modal,
  Button as RNButton,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  PermissionsAndroid, 
  Platform,
  Image
} from 'react-native';
import RNFS from 'react-native-fs'; // Import react-native-fs
import { Text, DataTable, Card } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import Share from 'react-native-share'; // Optional: For sharing the PDF
// 1) Import the react-native-html-to-pdf library
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import donwlaodicon from "../../../../fonts/download-icon.png";
import {
  fetchVendorList,
  RequestExtraBudget,
  getTotalAllocationCurrentWeek,
  getVendorBudgetCurrentWeek,
} from '../../../functions/VendorAccess/function';

const RequestVendorBudget = () => {
  const [vendorNames, setVendorNames] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [tableData, setTableData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [requestloading, setRequestLoading] = useState(false);
  const [totalbalance, setTotalBalance] = useState('');
  const [allocationData, setAllocationData] = useState({
    allocated_amount: 0,
    remaining_allocated_amount: 0,
  });


  const [allocateAmountModalVisible, setAllocateAmountModalVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  // Sorting state
  const [sortColumn, setSortColumn] = useState(null);  // 'allocated' | 'remaining'
  const [sortDirection, setSortDirection] = useState('ascending'); // 'ascending' or 'descending'
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
        console.error('Error fetching vendor names or allocation details:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleVendorSelect = async (vendorName) => {
    setSelectedVendor(vendorName);
    setSearchText('');
    setFilteredVendors([]);
    setLoading(true);

    try {
      const budget = await getVendorBudgetCurrentWeek(vendorName);
      let vendorAllocated = 0;
      let vendorRemaining = 0;

      if (budget?.status === 'success' && budget.data.length > 0) {
        const vendorAllocation = budget.data[0]?.vendor_allocations?.[0];
        vendorAllocated = vendorAllocation?.vendor_allocated_amount ?? 0;
        vendorRemaining = vendorAllocation?.vendor_remaining_amount ?? 0;
      }
      setTableData([
        {
          vendor_name: vendorName,
          vendor_allocated_amount: vendorAllocated,
          vendor_remaining_amount: vendorRemaining,
        },
      ]);
    } catch (error) {
      console.error('Error fetching budget for selected vendor:', error);
      // Show vendor row with zeroes
      setTableData([
        {
          vendor_name: vendorName,
          vendor_allocated_amount: 0,
          vendor_remaining_amount: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSearch = (text) => {
    setSearchText(text);
    if (text.length > 0) {
      const lowerText = text.toLowerCase();
      const filtered = vendorNames.filter((name) =>
        name.toLowerCase().startsWith(lowerText)
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors([]);
    }
  };

  const openAllocateModal = (vendorName) => {
    setSelectedVendor(vendorName);
    setPrice('');
    setMessage('');
    setAllocateAmountModalVisible(true);
  };

  const handleAllocateSubmit = async () => {
    setRequestLoading(true);
    if (selectedVendor && price) {
      try {
        const response = await RequestExtraBudget(
          selectedVendor,
          parseFloat(price),
          message
        );
        console.log('Distribution response:', response);
        setRequestLoading(false);
      } catch (error) {
        setRequestLoading(false);
        console.error('Error requesting extra budget:', error);
      }
    } else {
      setRequestLoading(false);
      console.error('Vendor or price is missing');
    }
    setAllocateAmountModalVisible(false);
  };

  const handleGetAllVendors = async () => {
    setLoading(true);
    try {
      const allBudgets = [];
      for (const vendor of vendorNames) {
        const budget = await getVendorBudgetCurrentWeek(vendor);
        if (
          budget?.status === 'success' &&
          budget.data?.length > 0 &&
          budget.data[0].vendor_allocations?.length > 0
        ) {
          const vAlloc = budget.data[0].vendor_allocations[0];
          allBudgets.push({
            vendor_name: vendor,
            vendor_allocated_amount: vAlloc.vendor_allocated_amount || 0,
            vendor_remaining_amount: vAlloc.vendor_remaining_amount || 0,
          });
        } else {
          allBudgets.push({
            vendor_name: vendor,
            vendor_allocated_amount: 0,
            vendor_remaining_amount: 0,
          });
        }
      }
      setTableData(allBudgets);
    } catch (error) {
      console.error('Error fetching all vendor budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2) Generate and download PDF for rows with allocated_amount != 0
  const handleDistributionDownload = async () => {
    try {
      // Filter tableData to only include rows with total allocated > 0
      const filteredData = tableData.filter(
        (item) => item.vendor_allocated_amount > 0
      );

      if (filteredData.length === 0) {
        Alert.alert('No Data', 'No rows have a non-zero allocated budget.');
        return;
      }
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Cannot save PDF without storage permission.'
        );
        return;
      }
      // Build an HTML table
      let htmlContent = `
        <h1 style="text-align:center;">Distribution List</h1>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #000; padding: 8px;">Vendor Name</th>
              <th style="border: 1px solid #000; padding: 8px;">Total Allocated</th>
              <th style="border: 1px solid #000; padding: 8px;">Remaining</th>
            </tr>
          </thead>
          <tbody>
      `;

      filteredData.forEach((row) => {
        htmlContent += `
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">${row.vendor_name}</td>
            <td style="border: 1px solid #000; padding: 8px;">${row.vendor_allocated_amount}</td>
            <td style="border: 1px solid #000; padding: 8px;">${row.vendor_remaining_amount}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
        <h6 style="text-align:left;">Total Allocated: $${allocationData.allocated_amount.toFixed(2)} </h6>
          <h6 style="text-align:left;">Balance: $${allocationData.remaining_allocated_amount.toFixed(2)} </h6>
      `;

      // Options for generating PDF
      let options = {
        html: htmlContent,
        fileName: 'distribution_list',
        directory: 'Documents', // or use 'Downloads' or any other folder
      };

      // Generate the PDF
      const file = await RNHTMLtoPDF.convert(options);
      const destPath = `${RNFS.DownloadDirectoryPath}/distribution_list.pdf`;
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
      // If you want to open the PDF automatically or share it,
      // you can use a library like `react-native-share` or `react-native-view-pdf`.
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'An error occurred while generating the PDF.');
    }
  };
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
  // A helper to determine the next sort direction & do the sorting
  const handleSort = (columnKey) => {
    let nextSortDirection = 'ascending';
    // If same column is clicked again, toggle the direction
    if (sortColumn === columnKey && sortDirection === 'ascending') {
      nextSortDirection = 'descending';
    }

    setSortColumn(columnKey);
    setSortDirection(nextSortDirection);

    const sorted = [...tableData].sort((a, b) => {
      if (columnKey === 'allocated') {
        return nextSortDirection === 'ascending'
          ? a.vendor_allocated_amount - b.vendor_allocated_amount
          : b.vendor_allocated_amount - a.vendor_allocated_amount;
      } else {
        // 'remaining'
        return nextSortDirection === 'ascending'
          ? a.vendor_remaining_amount - b.vendor_remaining_amount
          : b.vendor_remaining_amount - a.vendor_remaining_amount;
      }
    });

    setTableData(sorted);
  };

  return (
<View style={styles.maincontainer}>
      {/* Display total store-wide Allocated and Remaining */}
      <View style={styles.allocationContainer}>
        <View style={styles.totalInvoiceContainer}>
              <View style={styles.invoiceHeaderBlock}>
               <Text style={styles.inoiceheader}>Allocated Amount: ${allocationData.allocated_amount.toFixed(2)}</Text>
               </View>
               <View style={styles.invoiceHeaderBlockMid}>
               <Text style={styles.inoiceheadermid}>Balance: {allocationData.remaining_allocated_amount.toFixed(2)}</Text> 
               </View>
              </View>
      </View>
        <View style={styles.row}>
        <Card style={{backgroundColor:"#d9ecfe" }}>
        <Card.Content>
      <View style={styles.Rowvendor}>
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

        {/* Vendor Search Input */}
        <TextInput
          style={styles.searchinput}
          placeholder="Search Vendor"
          value={searchText}
          onChangeText={handleVendorSearch}
        />
      </View>
      </Card.Content>
      </Card>
</View>
      {/* Show Vendor suggestions as list */}
      {filteredVendors.map((vendor, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleVendorSelect(vendor)}
          style={styles.vendorItem}
        >
          <Text style={styles.vendorText}>{vendor}</Text>
        </TouchableOpacity>
      ))}
       <View style={styles.Rowvendor}>
            <TouchableOpacity style={[styles.button]}   onPress={handleGetAllVendors}  >
            <Text style={styles.buttonText}> Get All Vendor</Text>
          </TouchableOpacity>
         
          <TouchableOpacity style={[styles.generatepo]} onPress={handleDistributionDownload} >
            <Text style={styles.buttonText}>Distribution List<Image
          source={donwlaodicon}
          style={{ width: 30, height: 30}}
        /></Text>
            </TouchableOpacity>  
              
           </View>
      <ScrollView contentContainerStyle={styles.container}>
      {/* Single Table for selected or all vendors */}
      <View style={{ width: '100%' }}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={styles.tabletitle}>Action</DataTable.Title>
            <DataTable.Title>Vendor Name</DataTable.Title>

            <DataTable.Title
              numeric
              sortDirection={sortColumn === 'allocated' ? sortDirection : null}
              onPress={() => handleSort('allocated')}
            >
              Total Allocated
            </DataTable.Title>

            <DataTable.Title
              numeric
              sortDirection={sortColumn === 'remaining' ? sortDirection : null}
              onPress={() => handleSort('remaining')}
            >
              Remaining
            </DataTable.Title>
          </DataTable.Header>

          {tableData.map((row, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>
              {row.vendor_name ?
                <RNButton
                  title="Request"
                  onPress={() => openAllocateModal(row.vendor_name)}
                />
                : ''}
              </DataTable.Cell>
              <DataTable.Cell>{row.vendor_name}</DataTable.Cell>
              <DataTable.Cell numeric>
              {row.vendor_name ?
                row.vendor_allocated_amount.toFixed(2)
                :''}
              </DataTable.Cell>
              <DataTable.Cell numeric>
              {row.vendor_name ?
                row.vendor_remaining_amount.toFixed(2)
              :''
              }

              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>

      {/* Allocate Amount Modal */}
      <Modal
        visible={allocateAmountModalVisible}
        animationType="slide"
        onRequestClose={() => setAllocateAmountModalVisible(false)}
      >
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Allocate Amount for {selectedVendor}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={price}
            onChangeText={(text) => setPrice(text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Notes for Extra Budget"
            value={message}
            onChangeText={(text) => setMessage(text)}
          />
          <View style={styles.buttonRow}>
             <TouchableOpacity style={[styles.addbutton]} onPress={handleAllocateSubmit}>
             {requestloading ? <ActivityIndicator size="large" color="#0000ff" />
:
                  <Text style={styles.buttonText}>Submit</Text>
             }
                </TouchableOpacity>
                          <TouchableOpacity style={[styles.clearbuttonsRow]} onPress={() => setAllocateAmountModalVisible(false)} >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:"#fff",
    padding: 10,
  },
  maincontainer:{
    backgroundColor:"#fff",
  },
  allocationContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  allocationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownContainer: {
    width: '50%',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
  },
  searchinput: {
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 10,
    backgroundColor:"#fff",
    width: '45%',
    marginLeft: 5,
  },
  vendorItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  vendorText: {
    fontSize: 16,
  },
  Rowvendor: {
    flexDirection: 'row',
    marginTop: 5,
    marginHorizontal: 10,
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalContainer: {
    margin: 10,
    padding: 10,
    flex: 1,
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 10,
  },
  totalInvoiceContainer: {
    flexDirection: 'row',
    borderColor: '#f4f4f3',
    borderWidth: 1,
    padding:"2%",
    marginTop: 20,
    borderRadius:10
  },
  inoiceheader:{
    fontWeight:"700",
   color: "#2C62FF",
   fontSize: 20,
  backgroundColor:"#d9ecfe",
  },
  inoiceheadermid:{
    fontWeight:"700",
   fontSize: 20,
  },
  invoiceHeaderBlock: {
    width:"50%",
    color: "#2C62FF",
    backgroundColor:"#d9ecfe",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 1,
    borderRadius: 4,
    display:'flex'
    // any other block-level style
  },
  invoiceHeaderBlockMid:{
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 4
  },
  row: {
    margin: 15,
  },
  generatepo:{
    paddingBottom: 10,
    backgroundColor: '#2ccb70',
    paddingHorizontal: 10, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15,  // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
  },
  tabletitle: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  clearbuttonsRow: {
    backgroundColor:"#f00",
    paddingVertical: 10,  // Internal vertical padding
    paddingHorizontal: 15, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
  
});

export default RequestVendorBudget;
