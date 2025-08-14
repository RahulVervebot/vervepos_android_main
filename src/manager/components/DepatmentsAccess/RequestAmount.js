import React, { useState, useEffect,useCallback, useMemo } from 'react';
import {
  View,
  ActivityIndicator,
  ScrollView,
  Modal,
  Button as RNButton,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Text, Card, Checkbox, Button, ProgressBar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import {
  fetchCategories,
  fetchDepartmentList,
  fetchAvailableCategories,
  fetchAsyncValuesAndCheckStatus,
  getTotalAllocationCurrentWeek,
  RequestExtraBudget
} from '../../../functions/DepartmentAccess/function_dep';
import { useFocusEffect } from '@react-navigation/native';
const DepartmentRequestAmount = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const [allocateAmountModalVisible, setAllocateAmountModalVisible] = useState(false);
  const [departmentmodalvisible, setDepartmentModalVisible] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('');
  const [activeDepartmentBudget, setActiveDepartmentBudget] = useState({ data: [] });
  const [selectedCategoryallocationId, setSelectedCategoryAllocationId] = useState(null);
  const [selectedCategoryid, setSelectedCategoryId] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const [storeUrl, setStoreUrl] = useState(null);
  const [totalSale, setTotalSale] = useState(null);
  const [allocatedAmount, setAllocatedAmount] = useState(null);
  const [remainingAllocatedAmount, setRemainingAllocatedAmount] = useState(null);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [requestloading, setRequestLoading] = useState(false);
  const [totalBudgetModalVisible, setTotalBudgetModalVisible] = useState(false);
  const [startDateFormatted, setStartDateFormatted] = useState('');
  const [endDateFormatted, setEndDateFormatted] = useState('');
  const [totalspend, setTotalSpend] = useState(1); // For the progress bar (example)
  const [appType, setAppType] = useState(null);
  // On mount, fetch categories and alliances, then get active department budget

    const fetchData = useCallback(async () => {
        setLoading(true);
        // Calculate current "week" date range (Monday-Sunday)
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay();
        const daysUntilMonday = (dayOfWeek + 6) % 7;
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - daysUntilMonday);
        startDate.setHours(0, 0, 0, 0);
  
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
  
        const startDatecurr = `${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(
          startDate.getDate()
        ).padStart(2, '0')}-${startDate.getFullYear()}`;
        const endDatecurr = `${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(
          endDate.getDate()
        ).padStart(2, '0')}-${endDate.getFullYear()}`;
        setStartDateFormatted(startDatecurr);
        setEndDateFormatted(endDatecurr);
        const apptype = await AsyncStorage.getItem('apptype');
        setAppType(apptype);
        // 1) Fetch categories, store token and storeUrl
        await fetchAsyncValuesAndCheckStatus(
          setAccessToken,
          setStoreUrl,
          fetchCategories,
          fetchAvailableCategories,
          setCategories,
          setAvailableCategories,
          setLoading
        );
    const alldepartment = await fetchDepartmentList();
    console.log('alldepartment',alldepartment);
    setActiveDepartment(alldepartment.data);
        // 2) Fetch vendor alliances
  
        // 3) Fetch your active department’s weekly budget from the API
        const ActiveDept = await getTotalAllocationCurrentWeek();

        console.log('ActiveDepartment response =>', ActiveDept);
        setActiveDepartmentBudget(ActiveDept);
  
        setLoading(false);
      

    }, []);

     useFocusEffect(
            useCallback(() => {
              fetchData();
            }, [])
          );
  


  

  // The main categories we have from the store
  const activeCategories =  activeDepartment || [];
  //const activeCategories = categories.categories || [];
  const sortedactiveCategories = activeCategories.sort((a, b) => a.name.localeCompare(b.name));

  // Checkbox toggling
  const toggleCategorySelection = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((categoryId) => categoryId !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };


  const handleAllocateSubmit = async () => {
    setRequestLoading(true);
    setPriceError('');
    setMessageError('');

    let isValid = true;

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      setPriceError('Enter a valid amount greater than 0');
      isValid = false;
    }

    if (!message.trim()) {
      setMessageError('Message cannot be empty');
      isValid = false;
    }

    if (!isValid) {
      setRequestLoading(false);
      return;
    }
    console.log(selectedCategory,price,selectedCategoryallocationId,selectedCategoryid);
    if (selectedCategory && price && selectedCategoryallocationId && selectedCategoryid) {
      try {
        const response = await RequestExtraBudget(
          selectedCategory,
          parseFloat(price),
          message,
          selectedCategoryallocationId,
          selectedCategoryid,
        );
        Alert.alert('Request Sent Successfully');
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20 }}>Fetching Department...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Top "Budget" Card */}
        <View style={styles.row}>
          <Card style={styles.topcard}>
            {loading ? (
              <Card.Content>
               <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10}}>
                 Budget: $0.00
                </Text>
                <ProgressBar progress={0.1} style={styles.progressBar}  color="#1E90FF" />
                <View>
                 <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10}}> Budget in Hand (Loading)</Text>
                </View>
              </Card.Content>
            ) : (
              <Card.Content>
                <Text variant="titleMedium" style={styles.titleTextWhite}>
                  From : {startDateFormatted} to {endDateFormatted}
                </Text>
               <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10}}>
                 Budget: $
                  {activeDepartmentBudget?.data?.[0]?.allocated_amount
                    ? activeDepartmentBudget.data[0].allocated_amount.toFixed(2)
                    : 0} | Used Budget:  ${activeDepartmentBudget?.data?.[0]?.remainingPOBalance ? (activeDepartmentBudget.data[0].allocated_amount - activeDepartmentBudget.data[0].remainingPOBalance).toFixed(2): 0}
                </Text>
                <ProgressBar progress={totalspend} style={styles.progressBar}     color="#1E90FF"   />
                <View>
                {appType === 'warehouse' ?
                <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10}}>
                    Total in Hand ($
                    {activeDepartmentBudget?.data?.[0]?.remainingPOBalance
                      ? activeDepartmentBudget.data[0].remainingPOBalance.toFixed(2)
                      : 0}
                    )
                     | Cash in Hand:
                    {activeDepartmentBudget?.data?.[0]?.cashBalance
                      ? activeDepartmentBudget.data[0].cashBalance.toFixed(2)
                      : 0}
                    
                  </Text>
                  :
                  <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10}}>
                  Total in Hand ($
                  {activeDepartmentBudget?.data?.[0]?.remainingPOBalance
                    ? activeDepartmentBudget.data[0].remainingPOBalance.toFixed(2)
                    : 0}
                  )
                
                  
                </Text>
}
                </View>
              </Card.Content>
            )}
          </Card>
        </View>
        <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Table Container */}
          <View style={styles.tableContainer}>
            <View style={[styles.tableRow, styles.headerRow]}>
              <Text style={[styles.tableCell, styles.headerCell]}>Department</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Allocated</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Used</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Remaining</Text>
              <Text style={[styles.tableCell, styles.headerCellCentered]}>Add Budget</Text>
            </View>
            {sortedactiveCategories.map((category) => {
              const allocation = activeDepartmentBudget?.data?.[0]?.department_allocations?.find(
                (alloc) => alloc.departmentId === category.id
              );
              const allocatedAmount = allocation ? allocation.departmentAllocatedAmount : 0;
              const usedamount = allocation ? allocation.departmentAllocatedAmount - allocation.departmentRemainingAmount : 0;
              const remainingAmount = allocation ? allocation.departmentRemainingAmount : 0;
              const departmentAllocationId = allocation ? allocation.departmentAllocationId : 0;
              return (
                <View style={styles.tableRow} key={category.id}>
                  <Text style={styles.tableCell}>{category.name}</Text>
                  <Text style={styles.tableCell}>{allocatedAmount}</Text>
                  <Text style={styles.tableCell}>{usedamount.toFixed(2)}</Text>
                  <Text style={styles.tableCell}>{remainingAmount.toFixed(2)}</Text>
                  <View style={styles.tableCellCentered}>
                    <TouchableOpacity
                      style={styles.addbutton}
                      onPress={() => {
                        setSelectedCategory(category.name);
                        setSelectedCategoryId(category.id);
                        setSelectedCategoryAllocationId(departmentAllocationId);
                        setPrice('');
                        setMessage('');
                        setAllocateAmountModalVisible(true);
                      }}
                    >
                      <Text style={styles.popbuttonText}>Request More </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      </View>

    

      {/* Allocate Amount Modal */}
      <Modal
        visible={allocateAmountModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAllocateAmountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text variant="titleLarge" style={styles.modalTitle}>Request Budget</Text>
            <TextInput
              style={styles.inputAmount}
              placeholder="Enter amount"
              value={price}
              onChangeText={(text) => setPrice(text)}
              keyboardType="numeric"
            />
                        {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

             <TextInput
                        style={styles.inputAmount}
                        placeholder="Notes for Extra Budget"
                        value={message}
                        onChangeText={(text) => setMessage(text)}
                      />
                                  {messageError ? <Text style={styles.errorText}>{messageError}</Text> : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAllocateSubmit}>
                <Text style={styles.popbuttonText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAllocateAmountModalVisible(false)}
              >
                <Text style={styles.popbuttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Category Modal */}
  
    </>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});

// Updated Styles
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    padding: 16,
  },

  row: {
    marginHorizontal: '2%',
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  titleTextWhite: {
    color: '#fff',
  },

  budgetHeaderButtons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  topcard: {
    backgroundColor: '#2C62FF',
    width: '100%',
    padding: 10,
  },

  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },

  headerbutton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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

  tableContainer: {
    marginTop: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  headerRow: {
    backgroundColor: '#f2f2f2',
  },

  tableCell: {
    flex: 2,
    fontSize: 14,
  },

  headerCell: {
    fontWeight: 'bold',
    flex: 2,
  },

  headerCellCentered: {
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  tableCellCentered: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addbutton: {
    backgroundColor: '#2C62FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  // Modals
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
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },

  inputAmount: {
    borderColor: '#010101',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 10,
    width: '100%',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
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

  departmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  departmentName: {
    flex: 1,
    fontSize: 16,
  },

  // Create Category Modal
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  errorText:{
    color: "#f00",
    textAlign:"center",
  }
});

export default DepartmentRequestAmount;
