import React, { useState, useEffect,useMemo } from 'react';
import { View, ActivityIndicator, ScrollView, Modal, Button as RNButton, StyleSheet, TextInput } from 'react-native';
import { Text, Card, Checkbox, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select'; // Import RNPickerSelect
import {
  fetchCategories,
  fetchAvailableCategories,
  handleCreateCategory,
  fetchAsyncValuesAndCheckStatus,
  fetchVendorAlliances,
  distributeAllocatedAmount
} from '../../functions/VendorAccess/function'; // Import functions

const VendorDepartmentConfiguration = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]); // Store full response including non-active categories
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const [allocateAmountModalVisible, setAllocateAmountModalVisible] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryName, setCategoryName] = useState(''); // This will hold the selected category name
  const [alliances, setAlliances] = useState([]); // This will hold the alliances
  const [accessToken, setAccessToken] = useState(null);
  const [storeUrl, setStoreUrl] = useState(null);
  const [totalSale, setTotalSale] = useState(null);
  const [allocatedAmount, setAllocatedAmount] = useState(null);
  const [remainingAllocatedAmount, setRemainingAllocatedAmount] = useState(null);
  const [price, setPrice] = useState(''); // Holds price in allocate modal

  // Fetch data for the component
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch categories data and wait for it to complete
      const fetchedCategories = await fetchAsyncValuesAndCheckStatus(
        setAccessToken,
        setStoreUrl,
        fetchCategories,
        fetchAvailableCategories,
        setCategories,
        setAvailableCategories,
        setLoading
      );
      console.log('fetchedCategories:', categories);
      // Fetch vendor alliances
      await fetchVendorAlliances(setAlliances, setLoading);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Second useEffect: Only fetch categories data for setting totalSale, allocatedAmount, and remainingAllocatedAmount
  useEffect(() => {
    const fetchSaleData = async () => {
      if (accessToken && storeUrl) {
        // Fetch categories and set the required fields
        await fetchCategories(
          accessToken,
          storeUrl,
          (data) => {
            if (data) {
              setTotalSale(data.total_sale);
              setAllocatedAmount(data.allocated_amount);
              const remainingAllocate = (data.remaining_allocated_amount * 100) / data.allocated_amount;
              setRemainingAllocatedAmount(remainingAllocate);
            }
          },
          setLoading
        );
      }
    };
    fetchSaleData();
  }, [accessToken, storeUrl]); // Runs when accessToken and storeUrl are set
  // Sort alliances alphabetically
  //const sortedAlliances = alliances.sort((a, b) => a.localeCompare(b));
  const sortedAlliances = useMemo(() => {
    return alliances
      .filter((item) => typeof item === 'string' && item.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [alliances]);
  //const sortedAlliances = alliances
  //const sortedAlliances = alliances
  // Sort available categories alphabetically by their name
  const sortedAvailableCategories = availableCategories.sort((a, b) => a.name.localeCompare(b.name));

  // Filter the active categories from the full data set
  // const activeCategories = categories.categories?.filter(category => category.status === 'active') || [];
  const activeCategories = categories.data || [];
  const sortedactiveCategories = activeCategories.sort((a, b) => a.name.localeCompare(b.name));
  const toggleCategorySelection = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((categoryId) => categoryId !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };
  const handleSubmit = async () => {
    await handleCreateCategory(categoryName, selectedCategories, accessToken, storeUrl, setCreateCategoryModalVisible, fetchCategories);
    // Refetch categories after successful submission
    await fetchCategories(accessToken, storeUrl, setCategories, setLoading);
    setCreateCategoryModalVisible(false); // Close the modal after creating the category
    setSelectedCategories([]); // Uncheck checkboxes
    setCategoryName(''); 
  };

  const handleCardPress = async (category) => {
    const budgetType = await AsyncStorage.getItem('budget_type');
    if(budgetType === 'department'){
    setSelectedCategory(category);
    setAllocateAmountModalVisible(true);
    }
  };

  const handleAllocateSubmit = async () => {
    if (selectedCategory && price) {
      // Call distributeAllocatedAmount with selectedCategory name and price
      const response = await distributeAllocatedAmount(selectedCategory.name, parseFloat(price));
      console.log('Distribution response:', response);
    } else {
      console.error('Category or price is missing');
    }
    setAllocateAmountModalVisible(false);
    setPrice('');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20 }}>Fetching Department...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Display additional data */}
        {/* <Card>
          <Card.Content>
            <Text variant="titleMedium">Total Sale: {totalSale}</Text>
            <Text variant="titleMedium">Allocated Amount: {allocatedAmount}</Text>
            <Text variant="titleMedium">Remaining Allocated(%): {remainingAllocatedAmount}</Text>
          </Card.Content>
        </Card> */}
        <Text variant="titleMedium" style={{ marginTop: 20 }}>Active Department</Text>

        {sortedactiveCategories.length > 0 ? (
          sortedactiveCategories.map((category, index) => (

            <Card key={index} style={{ marginVertical: 10 }} onPress={() => handleCardPress(category)}>
              <Card.Content>
                <Text variant="titleMedium">{category.name}</Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text>No Active Department Available</Text>
        )}

        {/* Create Category Button */}
        <RNButton title="Create Department" onPress={() => setCreateCategoryModalVisible(true)} />

        {/* Allocate Amount Modal */}
        <Modal
          visible={allocateAmountModalVisible}
          animationType="slide"
          onRequestClose={() => setAllocateAmountModalVisible(false)}
        >
          <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
            <Text variant="titleLarge" style={{ marginBottom: 20 }}>Allocate Amount in Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              value={price}
              onChangeText={(text) => setPrice(text)}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <View style={{ width: '48%' }}>
                <RNButton title="Submit" onPress={handleAllocateSubmit} />
              </View>
              <View style={{ width: '48%' }}>
                <RNButton title="Close" onPress={() => setAllocateAmountModalVisible(false)} />
              </View>
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
              {/* Dropdown for Category Name */}
              <Text variant="titleMedium">Select Department Name:</Text>
              <RNPickerSelect
                onValueChange={(value) => setCategoryName(value)} // Set selected category
                items={sortedAlliances.map((alliance) => ({
                  label: alliance,
                  value: alliance,
                }))}
                style={pickerSelectStyles} // Custom styling for the picker
                placeholder={{
                  label: 'Select a Department',
                  value: null,
                }}
              />
              <Text variant="titleMedium">Select Category Name:</Text>
              {/* Checkbox List */}
              <ScrollView>
                {sortedAvailableCategories.length > 0 ? (
                  sortedAvailableCategories.map((category) => (
                    <View key={category.id} style={styles.checkboxContainer}>
                      <Checkbox
                        status={selectedCategories.includes(category.id) ? 'checked' : 'unchecked'}
                        onPress={() => toggleCategorySelection(category.id)}
                      />
                      <Text style={styles.checkboxLabel}>{category.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text>No Department Available</Text>
                )}
              </ScrollView>
            </ScrollView>
                          {/* Submit Button */}
                  <View style={styles.Rowvendor}>
                <RNButton
                  title="Submit"
                  onPress={handleSubmit} // Trigger handleSubmit which refetches categories after submission
                />
                <RNButton title="Close" 
                  onPress={() => {
                    setCreateCategoryModalVisible(false);
                    setSelectedCategories([]); // Uncheck checkboxes
                    setCategoryName(''); // Clear category name selection
                  }} 
                
                />
              </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
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
    paddingRight: 30, // to ensure the text is never behind the icon
  },

  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row', // Ensures checkbox and label are aligned horizontally
    alignItems: 'center',
    marginVertical: 8, // Adds spacing between items for better visibility
  },
  checkboxLabel: {
    fontSize: 16, // Ensures the label text is clearly visible
    marginLeft: 8, // Adds space between the checkbox and the label
    color: '#333', // Darker text for better visibility
  },
  Rowvendor: {
    flexDirection: 'row',
    margin: 10,
    marginHorizontal: 5,
    justifyContent: 'space-between',
  },
});

export default VendorDepartmentConfiguration;