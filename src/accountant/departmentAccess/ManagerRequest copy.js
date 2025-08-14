import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, ScrollView, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { fetchManagerDataForRequest, postApprovalRequest, getTotalAllocationCurrentWeek, AllocatedBudgetAllVendorCurrentWeek } from '../../functions/DepartmentAccess/function_dep';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { assignWith } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';

const ManagerRequest = () => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [storeUrl, setStoreUrl] = useState(null);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [allData, setAllData] = useState([]); // Store all fetched data
  const [totalBudgetModalVisible, setTotalBudgetModalVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState('');
  const [allocationData, setAllocationData] = useState({ allocated_amount: 0, remaining_allocated_amount: 0, remainingPOBalance: 0 });
  const [startDateFormatted, setStartDateFormatted] = useState('');
  const [endDateFormatted, setEndDateFormatted] = useState('');
  const [totalspend, setTotalSpend] = useState(1);
  const [requestloading, setRequestLoading] = useState(false);

  const initializeData = useCallback(async () => {
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
      // Fetch allocation summary for display
      const allocationDetails = await getTotalAllocationCurrentWeek();
      if (allocationDetails && allocationDetails.status === 'success' && Array.isArray(allocationDetails.data) && allocationDetails.data.length > 0) {
        const { allocated_amount, remaining_allocated_amount, remainingPOBalance } = allocationDetails.data[0];
        const usedallocated = allocated_amount - remaining_allocated_amount;
        setAllocationData({ allocated_amount, remaining_allocated_amount, remainingPOBalance, usedallocated });
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
  }, []);

  const fetchInitialData = useCallback(async () => {
    const token = await AsyncStorage.getItem('access_token');
    const url = await AsyncStorage.getItem('store_url');
    setAccessToken(token);
    setStoreUrl(url);

    await fetchData(); // Fetch all data initially

  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      initializeData();
      
    }, [])

  );

  const fetchData = async (customStartDate, customEndDate) => {
    setLoading(true);
    await fetchManagerDataForRequest(
      accessToken,
      storeUrl,
      setAllData,
      setLoading,
    );
    console.log('fetched data console', allData);
    filterDataByDateRange(startDate, endDate);
  };

  const handleApproval = async (requestId, approvalType, amount) => {
    const approvalData =
      approvalType === 'approved'
        ? {
          request_id: requestId,
          approval_type: 'approved',
          approved_amount: amount,
          message: 'Approved full requested amount.',
        }
        : {
          request_id: requestId,
          approval_type: 'partially_approved',
          approved_amount: parseFloat(partialAmount),
          message: 'Partially approved requested amount.',
        };

    await postApprovalRequest(accessToken, storeUrl, approvalData, setLoading);
    setModalVisible(false); // Close the modal after submitting
    await fetchData(); // Refresh the data
    filterDataByDateRange(startDate, endDate);
  };
  // Helper functions to reset time
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

  // Function to get the date of the last Monday
  const getLastMonday = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
    newDate.setDate(diff);
    return newDate;
  };

  // Date parsing function 
  const parseDate = (dateString) => {
    // Replace space with 'T' to make it ISO 8601 compliant
    const isoString = dateString.replace(' ', 'T');
    const parsedDate = new Date(isoString);
    if (isNaN(parsedDate)) {
      // Handle invalid date
      console.error('Invalid date:', dateString);
    }
    return parsedDate;
  };

  // Updated filterDataByDateRange function
  const filterDataByDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setData(allData); // No date range selected, show all data
      return;
    }

    const filteredData = allData.filter((item) => {
      const itemDate = parseDate(item.create_date);
      if (isNaN(itemDate)) {
        // Skip invalid dates
        return false;
      }
      return itemDate >= startDate && itemDate <= endDate;
    });

    setData(filteredData);
    console.log('all fetched data for week', allData);
  };


  // Date filter handlers
  const setToday = () => {
    const today = new Date();
    const start = resetTimeToStartOfDay(today);
    const end = setTimeToEndOfDay(today);
    setStartDate(start);
    setEndDate(end);
    filterDataByDateRange(start, end); // Filter data for today
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = resetTimeToStartOfDay(yesterday);
    const end = setTimeToEndOfDay(yesterday);
    setStartDate(start);
    setEndDate(end);
    filterDataByDateRange(start, end); // Filter data for yesterday
  };

  const setWeekly = () => {
    const today = new Date();
    const lastMonday = getLastMonday(today);
    const start = resetTimeToStartOfDay(lastMonday);
    const end = setTimeToEndOfDay(today);
    setStartDate(start);
    setEndDate(end);
    filterDataByDateRange(start, end); // Filter data from last Monday to today
  };

  // Custom Date Range Selection
  const onStartDateConfirm = (date) => {
    setStartDatePickerOpen(false);
    const start = resetTimeToStartOfDay(date);
    setStartDate(start);

    if (endDate) {
      filterDataByDateRange(start, endDate);
    }
  };

  const onEndDateConfirm = (date) => {
    setEndDatePickerOpen(false);
    const end = setTimeToEndOfDay(date);
    setEndDate(end);

    if (startDate) {
      filterDataByDateRange(startDate, end);
    }
  };
  if (loading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Fetching Request Data...</Text>
      </View>
    );
  }

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
    <View style={styles.maincontainer}>
      <View style={styles.container}>
        <View style={styles.row}>
          <Card style={{ marginVertical: 5, backgroundColor: "#2C62FF" }}>
            {loading ?
              <Card.Content>

                <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10 }}>Budget: ${allocationData.allocated_amount.toFixed(2)}</Text>

                <ProgressBar
                  progress={0.1}
                  color="#1E90FF"   // you can choose any color
                  style={styles.progressBar}
                />
                <View >
                  <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10 }}>Budget in Hand(loading)</Text>

                </View>
              </Card.Content>
              :
              <Card.Content>
                <Text variant="titleMedium" style={styles.titleTextWhite}>From : {startDateFormatted} to {endDateFormatted}
                </Text>
                <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10 }}>Budget: ${allocationData.allocated_amount} | Used Budget: ${allocationData.usedallocated}</Text>
                <ProgressBar
                  progress={totalspend}
                  color="#1E90FF"   // you can choose any color
                  style={styles.progressBar}
                />
                <View >
                  <Text variant="titleMedium" style={{ color: 'white', fontWeight: "700", fontSize: 20, marginTop: 10, marginBottom: 10 }}>Budget in Hand(${allocationData.remaining_allocated_amount})</Text>

                </View>
                <View style={styles.titleTextWhitehead}>

                  <TouchableOpacity style={[styles.headerbutton]} onPress={() => setTotalBudgetModalVisible(true)}>
                    <Text style={styles.buttonText}>Allocate Total Budget</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            }
          </Card>
        </View>
      </View>
      <View style={styles.container}>
        {/* Vendor Search Box */}
        <View style={styles.row}>
          <Card style={{ marginVertical: 5, backgroundColor: "#d9ecfe" }}>
            <Card.Content>
              <Text style={{ color: "#2C62FF", fontWeight: "800", padding: 5 }}>Select Custom Range:</Text>
              <View style={styles.headercontainer}>
                <View style={styles.buttonContainer}>
                  <Button mode="contained" onPress={setToday} style={styles.filterButton} >
                    Today
                  </Button>
                  <Button mode="contained" onPress={setYesterday} style={styles.filterButton} >
                    Yesterday
                  </Button>
                  <Button mode="contained" onPress={setWeekly} style={styles.filterButton} >
                    Weekly
                  </Button>
                </View>
                <View style={styles.dateRangeContainer}>
                  <TouchableOpacity onPress={() => setStartDatePickerOpen(true)} style={styles.dateRangeButton}>
                    <Text>
                      {startDate ? `Start: ${startDate.toLocaleDateString()}` : 'Start Date'}
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

                  <TouchableOpacity onPress={() => setEndDatePickerOpen(true)} style={styles.dateRangeButton}>
                    <Text>
                      {endDate ? `End: ${endDate.toLocaleDateString()}` : 'End Date'}
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
      {/* Date Filter Buttons */}
      <ScrollView style={styles.container}>
        {/* Request Data */}
        {data.length > 0 ? (
          data.map((manager, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Text style={styles.cardText}>Requested Amount: {manager.amount_requested}</Text>
                <Text style={styles.cardText}>Created Date: {manager.create_date}</Text>
                <Text style={styles.cardText}>Department Name: {manager.departmentName}</Text>
                <Text style={styles.cardText}>Status: {manager.request_status}</Text>
                <Text style={styles.cardText}>Message: {manager.message}</Text>
                {manager.request_status == 'partially_approved' && (
                  <Text style={styles.cardText}>Aprroved Amount: {manager.approved_amount}</Text>
                )}
                <View style={styles.approvebuttonContainer}>
                  {manager.request_status == 'pending' && (
                    <View style={styles.buttonContainer}>
                      <Button
                        mode="contained"
                        onPress={() => handleApproval(manager.request_id, 'approved', manager.amount_requested)}
                        style={styles.approveButton}
                      >
                        Approve
                      </Button>

                      <Button
                        mode="contained"
                        onPress={() => {
                          setSelectedRequestId(manager.request_id);
                          setModalVisible(true); // Open the modal for partial approval
                        }}
                        style={styles.partialButton}
                      >
                        Partial Approve
                      </Button>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={styles.noRequestText}>No Requests Found</Text>
        )}

        {/* Modal for Partial Approval */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Text style={styles.modalTitle}>Enter Partial Approval Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Approved Amount"
                  keyboardType="numeric"
                  value={partialAmount}
                  onChangeText={setPartialAmount}
                />
                <View style={styles.modalButtonContainer}>
                  <Button
                    mode="contained"
                    onPress={() => handleApproval(selectedRequestId, 'partially_approved')}
                    style={styles.modalApproveButton}
                  >
                    Submit
                  </Button>
                  <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalCancelButton}>
                    Cancel
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        </Modal>
        <Modal visible={totalBudgetModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Text style={styles.modalTitle}>Allocate Total Weekly Budget</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter total budget"
                  value={totalPrice}
                  onChangeText={(text) => setTotalPrice(text)}
                  keyboardType="numeric"
                />
                <View style={styles.modalButtonContainer}>
                  {requestloading ?

                    <ActivityIndicator size="large" color="#0000ff" /> :


                    <Button
                      mode="contained"
                      onPress={handleTotalBudgetSubmit}
                      style={styles.modalApproveButton}
                    >
                      Submit
                    </Button>
                  }
                  <Button mode="outlined" onPress={() => setTotalBudgetModalVisible(false)} style={styles.modalCancelButton}>
                    Cancel
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        </Modal>

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
  },
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 15,
    width: "50%",
  },
  approvebuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 15,
  },
  dateRangeLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },

  selectedRangeText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    marginRight: 5,
  },
  partialButton: {
    backgroundColor: '#FFA500',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalCard: {
    width: '90%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalApproveButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  modalCancelButton: {
    color: '#FF0000',
  },
  noRequestText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  maincontainer: {
    backgroundColor: "#fff",
    flex: 1,
  },
  headercontainer: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#2C62FF',
    color: "#fff",
    borderRadius: 5,
    marginRight: 5,
    textAlign: 'center',
  },
  dateRangeContainer: {
    width: "50%",
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

  topcard: {
    backgroundColor: '#2C62FF',
    width: '100%',
    padding: 10,
    marginVertical: 5,
  },

  titleTextWhite: {
    color: '#fff',
  },
  titleTextWhitehead: {
    marginTop: '5%',
    color: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerbutton: {
    backgroundColor: "#fff",
    paddingVertical: 15,  // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearbuttonsRow: {
    backgroundColor: "#f00",
    paddingVertical: 10,  // Internal vertical padding
    paddingHorizontal: 15, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addbutton: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15,  // Internal vertical padding
    paddingHorizontal: 20, // Internal horizontal padding
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },

});

export default ManagerRequest;
