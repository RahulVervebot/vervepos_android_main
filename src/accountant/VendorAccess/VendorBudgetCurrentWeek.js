import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, ScrollView, Modal, Button as RNButton, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, DataTable, Card, Button,ProgressBar } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { fetchVendorList, distributeAllocatedAmountVendorCurrentWeek, AllocatedBudgetAllVendorCurrentWeek, getTotalAllocationCurrentWeek, getVendorBudgetCurrentWeek }  from '../../functions/VendorAccess/function';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VendorBudgetCurrentWeek = () => {
  const [vendorNames, setVendorNames] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorBudgetData, setVendorBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allocateAmountModalVisible, setAllocateAmountModalVisible] = useState(false);
  const [totalBudgetModalVisible, setTotalBudgetModalVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
    const [requestloading, setRequestLoading] = useState(false);
  const [allocationData, setAllocationData] = useState({ allocated_amount: 0, remaining_allocated_amount: 0,remainingPOBalance:0 });
  const navigation = useNavigation(); // Access navigation from react-navigation
  const [tableData, setTableData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null); 
  const [sortDirection, setSortDirection] = useState('descending'); // 'ascending' or 'descending'
  const [startDateFormatted, setStartDateFormatted] = useState('');
  const [endDateFormatted, setEndDateFormatted] = useState('');
       const [totalspend, setTotalSpend] = useState(1);
  useEffect(() => {
    const initializeData = async () => {
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      const daysUntilMonday = (dayOfWeek + 6) % 7;
      // Start date: next Monday at 00:00:00
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - daysUntilMonday);
      startDate.setHours(0, 0, 0, 0);
      // End date: next Sunday at 23:59:59
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      // Format dates as YYYY-MM-DD HH:mm:ss
      const startDatecurr = `${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}-${startDate.getFullYear()}`;
      const endDatecurr = `${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}-${endDate.getFullYear()}`;
      setStartDateFormatted(startDatecurr)
      setEndDateFormatted(endDatecurr);
      setLoading(true);
      try {
        // Fetch vendor names and sort them alphabetically
        const names = await fetchVendorList();
        const sortedNames = names.sort((a, b) => a.localeCompare(b));
        setVendorNames(sortedNames);
        // Fetch allocation summary for display
        const allocationDetails = await getTotalAllocationCurrentWeek();
        if (allocationDetails && allocationDetails.status === 'success' && Array.isArray(allocationDetails.data) && allocationDetails.data.length > 0) {
          const { allocated_amount, remaining_allocated_amount,remainingPOBalance } = allocationDetails.data[0];
          setAllocationData({ allocated_amount, remaining_allocated_amount,remainingPOBalance });
          const progressValue = allocated_amount
          ? remaining_allocated_amount / allocated_amount
          : 0;
        setTotalSpend(progressValue);
        }
      } catch (error) {
        console.error("Error fetching vendor names or allocation details:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);
  const handleGetAllVendors = async () => {
    setLoading(true);
    try {
      const allBudgets = [];
      for (const vendor of vendorNames) {
      const budget = await getVendorBudgetCurrentWeek(vendor);
    //    const budget = await getVendorBudgetCurrentWeek();
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
  const handleSort = (columnKey) => {
    let nextSortDirection = 'descending';
    // If same column is clicked again, toggle the direction
    if (sortColumn === columnKey && sortDirection === 'descending') {
      nextSortDirection = 'ascending';
    }

    setSortColumn(columnKey);
    setSortDirection(nextSortDirection);

    const sorted = [...tableData].sort((a, b) => {
      if (columnKey === 'allocated') {
        return nextSortDirection === 'descending'
          ? a.vendor_allocated_amount - b.vendor_allocated_amount
          : b.vendor_allocated_amount - a.vendor_allocated_amount;
      } else {
        // 'remaining'
        return nextSortDirection === 'descending'
          ? a.vendor_remaining_amount - b.vendor_remaining_amount
          : b.vendor_remaining_amount - a.vendor_remaining_amount;
      }
    });

    setTableData(sorted);
  };





  const handleVendorSelect = async (vendorName) => {
   setSelectedVendor(vendorName);
    setSearchText('');
    setFilteredVendors([]);
    setLoading(true);
    try {
      const budget = await getVendorBudgetCurrentWeek(vendorName);
      if (budget?.status === 'success' && budget.data.length > 0) {
        const vendorAllocation = budget.data[0].vendor_allocations[0];
        setVendorBudgetData({
          vendor_name: vendorName,
          vendor_allocated_amount: vendorAllocation?.vendor_allocated_amount ?? 0,
          vendor_remaining_amount: vendorAllocation?.vendor_remaining_amount ?? 0,
        });
        setTableData([
          {
            vendor_name: vendorName,
          vendor_allocated_amount: vendorAllocation?.vendor_allocated_amount ?? 0,
          vendor_remaining_amount: vendorAllocation?.vendor_remaining_amount ?? 0,
          },
        ]);
      } else {
        setVendorBudgetData({
          vendor_name: vendorName,
          vendor_allocated_amount: 0,
          vendor_remaining_amount: 0,
        });
       
      }
    } catch (error) {
      console.error("Error fetching budget for selected vendor:", error);
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


  const handleVendorAllocate = async (vendorName) => {
    setSelectedVendor(vendorName);
    setSearchText('');
    setFilteredVendors([]);
    setLoading(true);
  
    try {
      const budget = await getVendorBudgetCurrentWeek(vendorName);
      if (budget?.status === 'success' && budget.data.length > 0) {
        const vendorAllocation = budget.data[0].vendor_allocations[0];
  
        // Prepare the new/updated item
        const newItem = {
          vendor_name: vendorName,
          vendor_allocated_amount: vendorAllocation?.vendor_allocated_amount ?? 0,
          vendor_remaining_amount: vendorAllocation?.vendor_remaining_amount ?? 0,
        };
  
        // Update tableData without replacing the entire table
        setTableData((prevData) => {
          // Make a shallow copy of previous data
          const updatedData = [...prevData];
  
          // Find if we already have this vendor in the table
          const existingIndex = updatedData.findIndex(
            (item) => item.vendor_name === vendorName
          );
  
          if (existingIndex !== -1) {
            // Vendor found, update existing record
            updatedData[existingIndex] = {
              ...updatedData[existingIndex],
              ...newItem,
            };
          } else {
            // Vendor not found, add a new row
            updatedData.push(newItem);
          }
  
          return updatedData;
        });
  
        // Also update the "vendorBudgetData" state if you need it
        setVendorBudgetData(newItem);
      } else {
        // If no budget data returned, create an entry with 0 values
        const emptyVendorData = {
          vendor_name: vendorName,
          vendor_allocated_amount: 0,
          vendor_remaining_amount: 0,
        };
  
        setTableData((prevData) => {
          const updatedData = [...prevData];
          const existingIndex = updatedData.findIndex(
            (item) => item.vendor_name === vendorName
          );
  
          if (existingIndex !== -1) {
            updatedData[existingIndex] = emptyVendorData;
          } else {
            updatedData.push(emptyVendorData);
          }
          return updatedData;
        });
  
        setVendorBudgetData(emptyVendorData);
      }
    } catch (error) {
      console.error("Error fetching budget for selected vendor:", error);
      // On error, still keep the table but update/append the vendor with 0 values
      const errorVendorData = {
        vendor_name: vendorName,
        vendor_allocated_amount: 0,
        vendor_remaining_amount: 0,
      };
  
      setTableData((prevData) => {
        const updatedData = [...prevData];
        const existingIndex = updatedData.findIndex(
          (item) => item.vendor_name === vendorName
        );
  
        if (existingIndex !== -1) {
          updatedData[existingIndex] = errorVendorData;
        } else {
          updatedData.push(errorVendorData);
        }
        return updatedData;
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVendorSearch = (text) => {
    setSearchText(text);
    if (text.length >= 3) {
      const filtered = vendorNames.filter((name) => name.toLowerCase().includes(text.toLowerCase()));
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors([]);
    }
  };
  const openAllocateModal = (vendorName) => {
    setSelectedVendor(vendorName);
    setPrice('');
    setAllocateAmountModalVisible(true);
  };
  const handleAllocateSubmit = async () => {
    setRequestLoading(true);
    if (selectedVendor && price) {
      const response = await distributeAllocatedAmountVendorCurrentWeek(selectedVendor, parseFloat(price));
      setRequestLoading(false);
    } else {
      setRequestLoading(false);
      console.error('Vendor or price is missing');
    }
    const allocationDetails = await getTotalAllocationCurrentWeek();
    if (allocationDetails && allocationDetails.status === 'success' && Array.isArray(allocationDetails.data) && allocationDetails.data.length > 0) {
      const { allocated_amount, remaining_allocated_amount } = allocationDetails.data[0];
      setAllocationData({ allocated_amount, remaining_allocated_amount });
    }
    handleVendorAllocate(selectedVendor);
    setAllocateAmountModalVisible(false);
    setPrice('');
  };
  const [loadingItems, setLoadingItems] = useState(false);

  const handleTotalBudgetSubmit = async () => {
    setRequestLoading(true);
    if (totalPrice) {
      const response = await AllocatedBudgetAllVendorCurrentWeek(parseFloat(totalPrice));
      console.log('Total Budget Distribution response:', response);
      setRequestLoading(false);
    } else {
      setRequestLoading(false);
      console.error('Total budget amount is missing');
    }
    const allocationDetails = await getTotalAllocationCurrentWeek();
    if (allocationDetails && allocationDetails.status === 'success' && Array.isArray(allocationDetails.data) && allocationDetails.data.length > 0) {
      const { allocated_amount, remaining_allocated_amount } = allocationDetails.data[0];
      setAllocationData({ allocated_amount, remaining_allocated_amount });
    }
setTotalBudgetModalVisible(false);
setTotalPrice('');
  };
  

  return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5]', height: '100%' }}>
     <View style={styles.row}>
      <Card style={styles.topcard}>
        { loading ?
       <Card.Content>
  
       <Text variant="titleMedium" style={styles.titleTextWhite}>Budget</Text>
       <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 24, marginTop: 10, marginBottom: 10}}>${allocationData.allocated_amount.toFixed(2)}</Text>
  
       <ProgressBar 
     progress={0.1}
     color="#1E90FF"   // you can choose any color
     style={styles.progressBar}
   />
   <View >
   <Text variant="titleMedium" style={styles.titleTextWhite}>Remaining Budget(loading)</Text>

   </View>
     </Card.Content>
      :
          <Card.Content>
            <Text variant="titleMedium" style={styles.titleTextWhite}>Budget From : {startDateFormatted} to {endDateFormatted} 
     </Text>
            <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 24, marginTop: 10, marginBottom: 10}}>${allocationData.allocated_amount.toFixed(2)}</Text>
            <ProgressBar 
          progress={totalspend}
          color="#1E90FF"   // you can choose any color
          style={styles.progressBar}
        />
        <View >
        <Text variant="titleMedium" style={styles.titleTextWhite}>Remaining Budget(${allocationData.remaining_allocated_amount})</Text>

        </View>
        <View style={styles.titleTextWhitehead}>

    <TouchableOpacity style={[styles.headerbutton]} onPress={() => setTotalBudgetModalVisible(true)}>
        <Text style={styles.buttonText}>Allocate Total Budget</Text>
      </TouchableOpacity>
        <TouchableOpacity style={[styles.headerbutton]}onPress={handleGetAllVendors}>
            <Text style={styles.buttonText}>Vendor List</Text>
          </TouchableOpacity>
  </View>
          </Card.Content>
}
        </Card>
        </View>

      <View style={styles.row}>
        <Card style={{ marginVertical: 5, backgroundColor:"#d9ecfe" }}>
          <Card.Content>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
              <View style={styles.Rowvendor}>
              <View style={styles.dropdownContainer}>
           <TextInput
        style={styles.searchInputVendor}
        placeholder="Search Vendor"
        value={searchText}
        onChangeText={handleVendorSearch}
      />
      </View>
  <View style={styles.dropdownContainer}>
  <RNPickerSelect
          onValueChange={(value) => handleVendorSelect(value)}
          items={vendorNames.map((name) => ({ label: name, value: name }))}
          placeholder={{ label: "Select Vendor", value: null }}
          style={{
            inputIOS: styles.picker,
            inputAndroid: styles.picker,
          }}
        />
          </View>

        </View>
        {filteredVendors.map((vendor, index) => (
        <TouchableOpacity key={index} onPress={() => handleVendorSelect(vendor)} style={styles.vendorItem}>
          <Text style={styles.vendorText}>{vendor}</Text>
        </TouchableOpacity>
      ))}

              </>
            )}
          </Card.Content>
        </Card>
      </View>
      {/* Vendor Selection Dropdown */}
      {/* <View style={styles.Rowvendor}>

      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={(value) => handleVendorSelect(value)}
          items={vendorNames.map((name) => ({ label: name, value: name }))}
          placeholder={{ label: "Select Vendor", value: null }}
          style={{
            inputIOS: styles.picker,
            inputAndroid: styles.picker,
          }}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Search Vendor"
        value={searchText}
        onChangeText={handleVendorSearch}
      />
</View> */}
      {/* Vendor Search Input */}

      {filteredVendors.map((vendor, index) => (
        <TouchableOpacity key={index} onPress={() => handleVendorSelect(vendor)} style={styles.vendorItem}>
          <Text style={styles.vendorText}>{vendor}</Text>
        </TouchableOpacity>
      ))}
       <ScrollView contentContainerStyle={styles.container}>
   <View style={{ width: '100%' }}>
        <DataTable>
          <DataTable.Header>
          <DataTable.Title >
              Action
            </DataTable.Title>
            {/* Vendor Name at 40% width */}
            <DataTable.Title >Vendor Name</DataTable.Title>
            
            {/* Total Allocated at 20%, clickable for sorting */}
            <DataTable.Title
              numeric
              sortDirection={sortDirection}
              onPress={() => handleSort('allocated')}
            >
              Total Allocated
            </DataTable.Title>
            
            {/* Remaining at 20%, clickable for sorting */}
            <DataTable.Title
              numeric
              sortDirection={sortDirection}
              onPress={() => handleSort('remaining')}
            >
              Remaining
            </DataTable.Title>
          </DataTable.Header>

          {tableData.map((row, index) => (
            <DataTable.Row key={index}>
              {/* Vendor Name (40%) */}
              <DataTable.Cell>
                {row.vendor_name ?
                <RNButton
                  title="Allocate"
                  onPress={() => openAllocateModal(row.vendor_name)

                   
                  } 
                />
                :''}
              </DataTable.Cell>
              <DataTable.Cell >
                {row.vendor_name}
              </DataTable.Cell>

              {/* Allocated (20%) */}
              <DataTable.Cell numeric >
                ${row.vendor_allocated_amount.toFixed(2)}
              </DataTable.Cell>

              {/* Remaining (20%) */}
              <DataTable.Cell numeric >
                ${row.vendor_remaining_amount.toFixed(2)}
              </DataTable.Cell>

              {/* Request Action (20%) */}
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
          <Text style={styles.modalTitle}>Allocate Amount for {selectedVendor}</Text>
          <TextInput
            style={styles.inputAmount}
            placeholder="Enter amount"
            value={price}
            onChangeText={(text) => setPrice(text)}
            keyboardType="numeric"
          />
               <View style={styles.buttonRow}>
                         <TouchableOpacity style={[styles.addbutton]} onPress={handleAllocateSubmit}>
                         {requestloading ? <ActivityIndicator size="large" color="#0000ff" />
            :
                              <Text style={styles.popbuttonText}>Submit</Text>
                         }
                            </TouchableOpacity>
                                      <TouchableOpacity style={[styles.clearbuttonsRow]} onPress={() => setAllocateAmountModalVisible(false)} >
                              <Text style={styles.popbuttonText}>Close</Text>
                            </TouchableOpacity>
                      </View>
  
        </View>
      </Modal>

      {/* Total Weekly Budget Modal */}

      <Modal
        visible={totalBudgetModalVisible}
        animationType="slide"
        onRequestClose={() => setTotalBudgetModalVisible(false)}
      >
          <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Allocate Total Weekly Budget</Text>
          <TextInput
            style={styles.inputAmount}
            placeholder="Enter total budget"
            value={totalPrice}
            onChangeText={(text) => setTotalPrice(text)}
            keyboardType="numeric"
          />
          
      
               <View style={styles.buttonRow}>
                         <TouchableOpacity style={[styles.addbutton]} onPress={handleTotalBudgetSubmit}>
                         {requestloading ? <ActivityIndicator size="large" color="#0000ff" />
            :
                              <Text style={styles.popbuttonText}>Submit</Text>
                         }
                            </TouchableOpacity>
                                      <TouchableOpacity style={[styles.clearbuttonsRow]} onPress={() => setTotalBudgetModalVisible(false)} >
                              <Text style={styles.popbuttonText}>Close</Text>
                            </TouchableOpacity>
                      </View>
          </View>
 
      </Modal>
    </ScrollView>
          </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  row: {
    marginHorizontal: '2%',
    margin:5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleTextWhite:{
    color: '#fff',
  },
  titleTextWhitehead:{
    marginTop: '5%',
    color: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  allocationContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  submitbutton:{
    backgroundColor: '#2C62FF',
    paddingVertical: 15,  // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,

  },
  buttonText: {
    color: '#2C62FF',
    fontSize: 16,
    textAlign: 'center',
  },
  popbuttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  allocationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#555',
    textAlign: 'center',
  },

  headerbutton:{
backgroundColor: "#fff",
paddingVertical: 15,  // Internal vertical padding
paddingHorizontal: 20, // Internal horizontal padding
borderRadius: 5,
alignItems: 'center',
justifyContent: 'center',
  },

  topcard:{
    backgroundColor: '#2C62FF',
    width: '100%',
    padding: 10,
      },
  dropdownContainer: {
    width: '49%',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  clearbuttonsRow: {
    backgroundColor:"#f00",
    paddingVertical: 10,  // Internal vertical padding
    paddingHorizontal: 15, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  picker: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
  },
  searchInputVendor: {
    backgroundColor:"#fff",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 5,
  },
 input:   {
 borderColor: '#010101',
borderWidth: 2,
padding: 10,
  borderRadius: 5,
  fontSize: 16,
  marginVertical: 10,
  width: '45%',
  marginLeft: 5,
},
  vendorItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  inputAmount: {
    borderColor: '#010101',
     borderWidth: 2,
     padding: 10,
     borderRadius: 5,
     fontSize: 16,
     marginVertical: 10,
     width: '100%',
     marginLeft: 5,
   },
  vendorText: {
    fontSize: 16,
  },
  modalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  Rowvendor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

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

export default VendorBudgetCurrentWeek;
