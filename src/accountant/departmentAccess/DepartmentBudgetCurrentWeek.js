import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  ScrollView,
  Modal,
  Button as RNButton,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Image
} from 'react-native';
import { Text, Card, Checkbox, Button, ProgressBar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import {
  fetchDepartmentList,
  fetchCategories,
  fetchAvailableCategories,
  handleCreateCategory,
  handleUpdateCategory,
  fetchAsyncValuesAndCheckStatus,
  fetchVendorAlliances,
  AllocatedBudgetAllVendorCurrentWeek,
  getTotalAllocationCurrentWeek,
  distributeAllocatedAmountVendorCurrentWeek,
  addCashBudget
} from '../../functions/DepartmentAccess/function_dep';
import { useFocusEffect } from '@react-navigation/native';
const DepartmentBudgetCurrentWeek = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const [allocateAmountModalVisible, setAllocateAmountModalVisible] = useState(false);
  const [departmentmodalvisible, setDepartmentModalVisible] = useState(false);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [selectedDepartmentForDeactivation, setSelectedDepartmentForDeactivation] = useState(null);
  const [selectedDepartmentStatus, setSelectedDepartmentStatus] = useState(null);
  const [deactivationSelections, setDeactivationSelections] = useState([]);
  const [activeDepartmentBudget, setActiveDepartmentBudget] = useState({ data: [] });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryallocationId, setSelectedCategoryAllocationId] = useState(null);
  const [PaymentRecordId, setPaymentRecordId] = useState(null);
  const [AccountBalance, setAccountBalance] = useState(null);
  const [CashBalance, setCashBalance] = useState(null);
  const [selectedCategoryid, setSelectedCategoryId] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('');
  const [alliances, setAlliances] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [storeUrl, setStoreUrl] = useState(null);
  const [totalSale, setTotalSale] = useState(null);
  const [allocatedAmount, setAllocatedAmount] = useState(null);
  const [addAllianceModalVisible, setAddAllianceModalVisible] = useState(false);
  const [remainingAllocatedAmount, setRemainingAllocatedAmount] = useState(null);
  const [price, setPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [totalCash, setTotalCash] = useState('');
  const [requestloading, setRequestLoading] = useState(false);
  const [totalBudgetModalVisible, setTotalBudgetModalVisible] = useState(false);
  const [startDateFormatted, setStartDateFormatted] = useState('');
  const [endDateFormatted, setEndDateFormatted] = useState('');
  const [totalspend, setTotalSpend] = useState(1); // For the progress bar (example)
  const [warehouseList, setWarehouseList] = useState([]);
  const [warehouseModalVisible, setWarehouseModalVisible] = useState(false);
  const [cashModalVisible, setCasheModalVisible] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedWarehouseName, setSelectedWarehouseName] = useState(null);
  const [appType, setAppType] = useState(null);

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
    const storedList = await AsyncStorage.getItem('warehouseIdList');
    const apptype = await AsyncStorage.getItem('apptype');
    setAppType(apptype);
    const parsedList = storedList ? JSON.parse(storedList) : [];
    if (parsedList.length > 0) {
      setWarehouseList(parsedList);
      setSelectedWarehouseId(parsedList[0].warehouseId); // ✅ Default to first
      setSelectedWarehouseName(parsedList[0].warehouseName);
      await AsyncStorage.setItem('warehouseId', parsedList[0].warehouseId.toString());
    }
    const startDatecurr = `${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(
      startDate.getDate()
    ).padStart(2, '0')}-${startDate.getFullYear()}`;
    const endDatecurr = `${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(
      endDate.getDate()
    ).padStart(2, '0')}-${endDate.getFullYear()}`;
    setStartDateFormatted(startDatecurr);
    setEndDateFormatted(endDatecurr);

    // 1) Fetch categories, store token, and storeUrl
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
    console.log('alldepartment', alldepartment);
    setActiveDepartment(alldepartment.data);
    // 2) Fetch vendor alliances
    await fetchVendorAlliances(setAlliances, setLoading);
    // 3) Fetch your active department’s weekly budget from the API
    const ActiveDept = await getTotalAllocationCurrentWeek();
    setActiveDepartmentBudget(ActiveDept);
    const selectedBudget = ActiveDept?.data?.find(
      (item) => item.warehouse_id === selectedWarehouseId
    );
    setSelectedCategoryAllocationId(selectedBudget?.allocationId || null);
    setPaymentRecordId(selectedBudget?.paymentRecordId || null);
    setAccountBalance(selectedBudget?.accountBalance || null);
    setCashBalance(selectedBudget?.cashBalance || 0);
    console.log('activeDepartmentBudget', activeDepartmentBudget);
    // setSelectedCategoryAllocationId(selectedWarehouseBudget?.allocationId);
    setLoading(false);
  }, []);

  // Use `useFocusEffect` to re-run fetching whenever the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Second effect to grab totalSale, allocatedAmount from categories
  useEffect(() => {
    const fetchSaleData = async () => {
      if (accessToken && storeUrl) {
        await fetchCategories(accessToken, storeUrl, (data) => {
          if (data) {
            setTotalSale(data.total_sale);
            setAllocatedAmount(data.allocated_amount);
            const remainingAllocate = (data.remaining_allocated_amount * 100) / data.allocated_amount;
            setRemainingAllocatedAmount(remainingAllocate);
          }
        }, setLoading);
        const ActiveDept = await getTotalAllocationCurrentWeek();
        setActiveDepartmentBudget(ActiveDept);
        const selectedBudget = ActiveDept?.data?.find(
          (item) => item.warehouse_id === selectedWarehouseId
        );
        setSelectedCategoryAllocationId(selectedBudget?.allocationId || null);
        setPaymentRecordId(selectedBudget?.paymentRecordId || null);
        setAccountBalance(selectedBudget?.accountBalance || null);
        setCashBalance(selectedBudget?.cashBalance || 0);
      }
    };
    fetchSaleData();
  }, [accessToken, storeUrl]);

  // Sort alliances alphabetically
  const sortedAlliances = useMemo(() => {
    return alliances
      .filter((item) => typeof item === 'string' && item.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [alliances]);

  const selectedWarehouseBudget = useMemo(() => {
    return activeDepartmentBudget?.data?.find(
      (item) => item.warehouse_id === selectedWarehouseId
    );
  }, [activeDepartmentBudget, selectedWarehouseId]);
  // Sort available categories alphabetically
  const sortedAvailableCategories = availableCategories.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // The main categories we have from the store
  // const activeCategories = categories.categories || [];
  const activeCategories = activeDepartment || [];
  // changed active department with active categoris to fetch depatment
  const sortedactiveCategories = activeCategories.sort((a, b) => a.name.localeCompare(b.name));
  console.log("sortedactiveCategories:", sortedactiveCategories);
  // Checkbox toggling
  const toggleCategorySelection = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((categoryId) => categoryId !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  // Create department + attach categories
  const handleSubmit = async () => {
    await handleCreateCategory(
      categoryName,
      selectedCategories,
      accessToken,
      storeUrl,
      setCreateCategoryModalVisible,
      fetchCategories
    );
fetchData();
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
    setActiveDepartment(alldepartment.data);
    setCreateCategoryModalVisible(false);
    setSelectedCategories([]);
    setCategoryName('');
  };

  // Actually allocate amount to a specific department
  const handleAllocateSubmit = async () => {
    if (selectedCategory && price && selectedCategoryid) {
      const currentWarehouseBudget = activeDepartmentBudget?.data?.find(
        (item) => item.warehouse_id === selectedWarehouseId
      );
      const currentAllocationId = currentWarehouseBudget?.allocationId;
      const response = await distributeAllocatedAmountVendorCurrentWeek(
        selectedCategory,
        parseFloat(price),
        selectedCategoryid,
        currentAllocationId
      );
      // const response = await distributeAllocatedAmountVendorCurrentWeek(selectedCategory, parseFloat(price), selectedCategoryid, selectedCategoryallocationId);
      console.log('Distribution response:', response);
      // Optionally, refresh activeDepartmentBudget again so the user sees updated budget immediately
      const ActiveDept = await getTotalAllocationCurrentWeek();
      setActiveDepartmentBudget(ActiveDept);
      const selectedBudget = ActiveDept?.data?.find(
        (item) => item.warehouse_id === selectedWarehouseId
      );
      setSelectedCategoryAllocationId(selectedBudget?.allocationId || null);
    } else {
      console.log("all fields:", selectedCategory, price, selectedCategoryid, selectedCategoryallocationId)
      console.error('Category or price is missing');
    }
    setAllocateAmountModalVisible(false);
    setPrice('');
  };
  // Allocate total budget for all vendors
  const handleTotalBudgetSubmit = async () => {
    setRequestLoading(true);
    if (totalPrice && selectedWarehouseId) {
      const response = await AllocatedBudgetAllVendorCurrentWeek(parseFloat(totalPrice));
      console.log('Total Budget Distribution response:', response);
      // Refresh the data
      const ActiveDept = await getTotalAllocationCurrentWeek();
      setActiveDepartmentBudget(ActiveDept);
      const selectedBudget = ActiveDept?.data?.find(
        (item) => item.warehouse_id === selectedWarehouseId
      );
      setSelectedCategoryAllocationId(selectedBudget?.allocationId || null);
      setPaymentRecordId(selectedBudget?.paymentRecordId || null);
      setAccountBalance(selectedBudget?.accountBalance || null);
      setCashBalance(selectedBudget?.cashBalance || 0);
      setRequestLoading(false);
    } else {
      setRequestLoading(false);
      console.error('Total budget amount is missing');
    }
    setTotalBudgetModalVisible(false);
    setTotalPrice('');
  };
  const handlecCashBudget = async () => {
    setRequestLoading(true);
      const isValidTotalCash =
    totalCash !== null &&
    totalCash !== undefined &&
    totalCash !== '' &&
    !isNaN(totalCash);
    if (isValidTotalCash && selectedWarehouseId && PaymentRecordId && selectedCategoryallocationId) {
      const response = await addCashBudget(parseFloat(totalCash), PaymentRecordId, selectedCategoryallocationId, selectedWarehouseId);
      console.log('Total Cash Budget', response);

      // Refresh the data
      const ActiveDept = await getTotalAllocationCurrentWeek();
      setActiveDepartmentBudget(ActiveDept);
      const selectedBudget = ActiveDept?.data?.find(
        (item) => item.warehouse_id === selectedWarehouseId
      );
      setSelectedCategoryAllocationId(selectedBudget?.allocationId || null);
      setAccountBalance(selectedBudget?.accountBalance || null);
      setCashBalance(selectedBudget?.cashBalance || 0);

      setRequestLoading(false);
    } else {
      setRequestLoading(false);
      console.error('Total cash amount is missing');
    }

    setCasheModalVisible(false);
    setTotalCash('');
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
               <View
                   style={{
                     padding: '3%',
       }}>
  <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <View style={styles.budgetcontainer}>
                  <TouchableOpacity
                    style={{ textAlign: 'left' }}
                    onPress={() => navigation.navigate('DepartmentBudgetCurrentWeek')}>
                    <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 16 }}>
                      TOTAL BUDGET
                    </Text>
                    {loading ?
                      <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#2B6FA0' }}>
                        Loading
                      </Text>
                      :
                      <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#2B6FA0' }}>
                   ${(selectedWarehouseBudget?.allocated_amount ?? 0).toFixed(2)}
                 </Text>
                    }
                  </TouchableOpacity>
                </View>
                <View style={styles.budgetusedcontainer}>
                  <TouchableOpacity
                    style={{ textAlign: 'left' }}
                    onPress={() => navigation.navigate('DepartmentBudgetCurrentWeek')}>
                    <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 16 }}>
                      USED BUDGET
                    </Text>
                    {loading ?
                      <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#C80122' }}>
                        Loading
                      </Text>
                      :
                      <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#C80122' }}>
                        ${selectedWarehouseBudget?.remainingPOBalance ? (selectedWarehouseBudget.allocated_amount - selectedWarehouseBudget.remaining_allocated_amount).toFixed(2) : 0}
                      </Text>
                    }
                  </TouchableOpacity>
                </View>
                <View style={styles.budgethandcontainer}>
                  <TouchableOpacity
                    style={{ textAlign: 'left' }}
                    onPress={() => navigation.navigate('DepartmentBudgetCurrentWeek')}>
                    <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 16 }}>
                      BUDGET IN HAND
                    </Text>
                    {loading ?
                      <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#166434' }}>
                        Loading
                      </Text>
                      :
                      <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 24, color: '#166434' }}>
                        ${(selectedWarehouseBudget?.remaining_allocated_amount?? 0).toFixed(2)}
                      </Text>
                    }
  
                  </TouchableOpacity>
                </View>
    </View>
    <View style={styles.budgetHeaderButtons}>
                  <TouchableOpacity
                    style={styles.headerbutton}
                    onPress={() => setTotalBudgetModalVisible(true)}
                  >
                    <Text style={styles.buttonText}>Allocate Total Budget</Text>
                  </TouchableOpacity>
                  {appType === 'warehouse' ?
                    <>
                      <TouchableOpacity
                        style={styles.headerbutton}
                        onPress={() => setCasheModalVisible(true)}
                      >
                        <Text style={styles.buttonText}>Cash in Hand</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.headerbutton}
                        onPress={() => setWarehouseModalVisible(true)}
                      >
                        <Text style={styles.buttonText}>Select Warehouse</Text>
                      </TouchableOpacity>
                    </>
                    : <Text></Text>
                  }
                  <TouchableOpacity
                    style={styles.headerbutton}
                    onPress={() => setCreateCategoryModalVisible(true)}
                  >
                    <Text style={styles.buttonText}>+ Create Departments</Text>
                  </TouchableOpacity>
            
      </View>
      <View style={{flexDirection:"row", paddingBottom: 10,marginTop:"5%",justifyContent:'space-between', borderBottomColor: "#2B7292", borderBottomWidth: 2  }}>
          <Text style={{ color: "#2B7292", fontWeight: "bold", fontSize: 25,marginTop:"2%"}}>DEPARTMENT</Text>
          <View style={styles.warehousecatainer}>
                <View
                  style={styles.warehousemap}>
                  <Image
                    style={styles.graph}
                    source={require('../../images/CalenderIcon.png')}
                  />
                  <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 14, marginLeft: "1%" }}>
                    {startDateFormatted} to {endDateFormatted}
                  </Text>
                </View>
              </View>
                <View style={styles.warehousecatainer}>
                <View
                  style={styles.warehousemap}>
                  <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 14, marginLeft: "1%" }}>
                   Warehouse: {selectedWarehouseName}
                  </Text>
                </View>
              </View>
          </View>
</View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Table Container */}
            <View style={styles.tableContainer}>
              <View style={[styles.tableRow, styles.headerRow]}>
                <Text style={[styles.tableCell, styles.headerCell]}>NAME</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>ALLOCATED</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>REMAINING</Text>
                <Text style={[styles.tableCell, styles.headerCellCentered]}>BUDGET</Text>
                <Text style={[styles.tableCell, styles.headerCellCentered]}>CATEGORIES</Text>
                <Text style={[styles.tableCell, styles.headerCellCentered]}>STATUS</Text>
              </View>
              {sortedactiveCategories.map((category) => {
                const allocation = selectedWarehouseBudget?.department_allocations?.find(
                  (alloc) => alloc.departmentId === category.id
                );
                const allocatedAmount = allocation ? allocation.departmentAllocatedAmount : 0;
                const remainingAmount = allocation ? allocation.departmentRemainingAmount.toFixed(2) : 0;
                const depstatus = allocation ? allocation.departmentStatus : '';
                return (
                  <View style={styles.tableRow} key={category.id}>
                    <Text style={styles.tableCell}>{category.name}</Text>
                    <Text style={styles.tableCell}>{allocatedAmount}</Text>
                    <Text style={styles.tableCell}>{remainingAmount}</Text>
                    <View style={styles.tableCellCentered}>
                      {depstatus === 'active' ?
                        <TouchableOpacity
                          style={styles.addbutton}
                          onPress={() => {
                            setSelectedCategory(category.name);
                            setSelectedCategoryId(category.id);
                            setPrice('');
                            setAllocateAmountModalVisible(true);
                          }}
                        >
                          <Text style={styles.popbuttonText}>Add Budget</Text>

                        </TouchableOpacity>
                        : <Text style={styles.popbuttonText}></Text>}
                    </View>
                    <View style={styles.tableCellCentered}>
                      {depstatus === 'active' ?
                        <TouchableOpacity
                          style={styles.addbutton}
                          onPress={() => {
                            setCategoryName(category.name);
                            setSelectedDepartmentStatus(depstatus);
                            setSelectedCategoryId(category.id);
                            setSelectedCategories(category.pos_categ_ids || []); // Pre-fill selected categories
                            setAddAllianceModalVisible(true);
                          }}
                        >
                          <Text style={styles.popbuttonText}>Add Category</Text>
                        </TouchableOpacity>
                        : <Text style={styles.popbuttonText}></Text>}
                    </View>
                    <View style={styles.tableCellCentered}>
                      {depstatus === 'active' ?
                        <Switch
                          value={true}
                          onValueChange={() => {
                            setSelectedDepartmentForDeactivation(category);
                            setDeactivateModalVisible(true);
                          }}
                        />
                        :
                        <Switch
                          value={false}
                          onValueChange={() => {
                            setSelectedDepartmentStatus(depstatus);
                            setCategoryName(category.name);
                            setSelectedCategoryId(category.id);
                            setSelectedCategories(category.pos_categ_ids || []); // Pre-fill selected categories
                            setAddAllianceModalVisible(true);
                          }}
                        />}
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
            <Text variant="titleLarge" style={styles.modalTitle}>Distribute Budget</Text>
            <TextInput
              style={styles.inputAmount}
              placeholder="Enter amount"
              value={price}
              onChangeText={(text) => setPrice(text)}
              keyboardType="numeric"
            />
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

      {/* update department */}
      <Modal
        visible={addAllianceModalVisible}
        animationType="slide"
        onRequestClose={() => setAddAllianceModalVisible(false)}
      >
        <View style={{ padding: 20, flex: 1 }}>
          <ScrollView>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>Department: {categoryName}</Text>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>Select Categories:</Text>

            {sortedAvailableCategories.map((category) => (
              <View key={category.id} style={styles.checkboxContainer}>
                <Checkbox
                  status={selectedCategories.some((item) => item.id === category.id) ? 'checked' : 'unchecked'}
                  onPress={() => {
                    const alreadySelected = selectedCategories.some((item) => item.id === category.id);
                    if (alreadySelected) {
                      setSelectedCategories(selectedCategories.filter((item) => item.id !== category.id));
                    } else {
                      setSelectedCategories([...selectedCategories, { id: category.id, name: category.name }]);
                    }
                  }}
                />

                <TouchableOpacity
                  onPress={() => {
                    const alreadySelected = selectedCategories.some((item) => item.id === category.id);
                    if (alreadySelected) {
                      setSelectedCategories(selectedCategories.filter((item) => item.id !== category.id));
                    } else {
                      setSelectedCategories([...selectedCategories, { id: category.id, name: category.name }]);
                    }
                  }}
                >
                  <Text style={styles.checkboxLabel}>{category.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={async () => {
                await handleUpdateCategory(
                  selectedCategoryid,
                  categoryName,
                  selectedCategories, // ✅ extract just the ids
                  accessToken,
                  storeUrl,
                  setAddAllianceModalVisible,
                  fetchCategories,
                  setCategories,
                  setLoading,
                );

                const alldepartment = await fetchDepartmentList();
                setActiveDepartment(alldepartment.data);

                setSelectedCategories([]);
                setCategoryName('');
                setSelectedCategoryId(null);
                setAddAllianceModalVisible(false);
              }}
            >
              <Text style={styles.popbuttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setAddAllianceModalVisible(false);
                setSelectedCategories([]);
              }}
            >
              <Text style={styles.popbuttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        visible={createCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setCreateCategoryModalVisible(false)}
      >
        <View style={{ padding: 20, flex: 1 }}>
          <ScrollView>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>Select Department Name:</Text>
            <RNPickerSelect
              onValueChange={(value) => setCategoryName(value)}
              items={sortedAlliances.map((alliance) => ({
                label: alliance,
                value: alliance,
              }))}
              style={pickerSelectStyles}
              placeholder={{
                label: 'Select a Department',
                value: null,
              }}
            />

            <Text variant="titleMedium" style={{ marginTop: 20 }}>Select Category Name:</Text>

            <ScrollView >
              {sortedAvailableCategories.length > 0 ? (
                sortedAvailableCategories.map((category) => (
                  <View key={category.id} style={styles.checkboxContainer}>
                    <Checkbox
                      status={selectedCategories.includes(category.id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleCategorySelection(category.id)}
                    />
                    <TouchableOpacity onPress={() => toggleCategorySelection(category.id)}>
                      <Text style={styles.checkboxLabel}>{category.name}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text>No Department Available</Text>
              )}
            </ScrollView>
          </ScrollView>
          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleSubmit} >
              <Text style={styles.popbuttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCreateCategoryModalVisible(false);
                setSelectedCategories([]);
                setCategoryName('');
              }}
            >
              <Text style={styles.popbuttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Allocate Total Budget Modal */}
      <Modal
        visible={totalBudgetModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTotalBudgetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Allocate Total Weekly Budget</Text>
            <TextInput
              style={styles.inputAmount}
              placeholder="Enter total budget"
              value={totalPrice}
              onChangeText={(text) => setTotalPrice(text)}
              keyboardType="numeric"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleTotalBudgetSubmit}>
                {requestloading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <Text style={styles.popbuttonText}>Submit</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setTotalBudgetModalVisible(false)}
              >
                <Text style={styles.popbuttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* deactivate Department */}
      <Modal
        visible={deactivateModalVisible}
        animationType="slide"
        onRequestClose={() => setDeactivateModalVisible(false)}
      >
        <View style={{ padding: 20, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Select a Department to Transfer Allocation
          </Text>
          <ScrollView>
            {sortedactiveCategories
              .filter((item) => item.id !== selectedDepartmentForDeactivation?.id)
              .map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => {
                    const alreadySelected = deactivationSelections.find((item) => item.id === category.id);
                    if (alreadySelected) {
                      setDeactivationSelections((prev) =>
                        prev.filter((item) => item.id !== category.id)
                      );
                    } else {
                      setDeactivationSelections([{ id: category.id, name: category.name }]);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 8,
                  }}
                >
                  <Checkbox
                    status={
                      deactivationSelections.find((item) => item.id === category.id)
                        ? 'checked'
                        : 'unchecked'
                    }
                  />
                  <Text style={{ fontSize: 16 }}>{category.name}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={async () => {
                if (
                  selectedDepartmentForDeactivation &&
                  deactivationSelections.length > 0
                ) {
                  const body = {
                    departmentId: selectedDepartmentForDeactivation.id,
                    departmentName: selectedDepartmentForDeactivation.name,
                    allocationMovedDepartmentId: deactivationSelections[0].id,
                    allocationMovedDepartmentName: deactivationSelections[0].name,
                  };

                  try {
                    const response = await fetch(`${storeUrl}/api/deactivate/category/vendor/department/`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                      },
                      body: JSON.stringify(body),
                    });
                    const result = await response.json();
                    console.log('Deactivation result:', result);

                    // Refresh list
                    fetchData();
                    setDeactivateModalVisible(false);
                    setDeactivationSelections([]);
                    setSelectedDepartmentForDeactivation(null);
                  } catch (err) {
                    console.error('Deactivation error:', err);
                  }
                }
              }}
            >
              <Text style={styles.popbuttonText}>Deactivate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setDeactivateModalVisible(false);
                setDeactivationSelections([]);
              }}
            >
              <Text style={styles.popbuttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* set warehosue id and name */}
      <Modal
        visible={warehouseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setWarehouseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select a Warehouse</Text>
            <ScrollView style={{ width: '100%' }}>
              {warehouseList.map((item) => (
                <TouchableOpacity
                  key={item.warehouseId}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                  }}
                  onPress={async () => {
                    setSelectedWarehouseId(item.warehouseId);
                    setSelectedWarehouseName(item.warehouseName);
                    await AsyncStorage.setItem('warehouseId', item.warehouseId.toString());
                    setWarehouseModalVisible(false);
                    // fetchData();
                  }}
                >
                  <Text style={{ fontSize: 16, textAlign: 'center' }}>
                    {item.warehouseName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.cancelButton, { marginTop: 15 }]}
              onPress={() => setWarehouseModalVisible(false)}
            >
              <Text style={styles.popbuttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* allocate cash budget */}
      <Modal
        visible={cashModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCasheModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalCashTitle}>Account Balance {selectedWarehouseBudget?.accountBalance}</Text>
            <Text style={styles.modalCashTitle}>Total Cash In Hand: {selectedWarehouseBudget?.cashBalance}</Text>
            <TextInput
              style={styles.inputAmount}
              placeholder="Add More Cash"
              value={totalCash}
              onChangeText={(text) => setTotalCash(text)}
              keyboardType="numeric"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={handlecCashBudget}>
                {requestloading ? (
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
  modalCashTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
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
  warehousecatainer: {
    width: '35%',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  warehousecatainerlocation: {
    width: '70%',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
warehousemap: {
  flexDirection: 'row',
  padding: 20,
  backgroundColor: '#fff',
  borderRadius: 10,
  paddingHorizontal: 15,
  paddingVertical: 15,
  borderColor: '#000',
  shadowColor: '#000',
  elevation: 5,
},
graph: {
  width: 20,
  height: 20,
  marginRight: 5,
  paddingRight: 10,
  aspectRatio: 1,
  borderColor: '#000',
},
budgetcontainer: {
  backgroundColor: '#fff',
  borderRadius: 10,
  margin: 10,
  marginTop: 10,
  padding: 25,
  width: '32%',
  borderColor: '#000',
  shadowColor: '#000',
  // Bottom Border
  borderBottomWidth: 10,
  borderBottomColor: '#2B6FA0',
  // Rounded Bottom Corners
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  elevation: 5,
},
warehousecatainer: {
  width: '35%',
  paddingHorizontal: 10,
  paddingVertical: 10,
},
warehousecatainerlocation: {
  width: '70%',
  paddingHorizontal: 10,
  paddingVertical: 10,

},
budgetusedcontainer: {
  backgroundColor: '#fff',
  borderRadius: 10,
  margin: 10,
  marginTop: 10,
  padding: 25,
  width: '32%',
  borderColor: '#000',
  shadowColor: '#000',
  borderBottomWidth: 10,
  borderBottomColor: '#C80122',
  // Rounded Bottom Corners
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  elevation: 5,
},
budgethandcontainer: {
  backgroundColor: '#fff',
  borderRadius: 10,
  margin: 10,
  marginTop: 10,
  padding: 25,
  width: '32%',
  borderColor: '#000',
  shadowColor: '#000',
  borderBottomWidth: 10,
  borderBottomColor: '#166434',
  // Rounded Bottom Corners
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  elevation: 5,
},

});

export default DepartmentBudgetCurrentWeek;
