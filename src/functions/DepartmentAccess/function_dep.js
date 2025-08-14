// src/functions/function.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState} from 'react';

import { Alert } from 'react-native';
import { configureProps } from 'react-native-reanimated/lib/reanimated2/core';
import OneSignal from 'react-native-onesignal';
// Adjusted fetchManagerDataForRequest function
export const fetchManagerDataForRequest = async (token, url, setData, setLoading) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');

    var myHeaders = new Headers();
   // myHeaders.append('access_token', storedtoken);
    myHeaders.append('Authorization', `Bearer ${storedtoken}`);
    myHeaders.append('Cookie', 'session_id');
    myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify({}),
    };

    console.log('storedtoken', storedtoken);
    console.log('url', storedurl);
    console.log('Request Options:', requestOptions);

    const response = await fetch(`${storedurl}/api/get_grant_requests/department`, requestOptions);

    // Log raw response
    const responseText = await response.text();
   // console.log('Raw Response:', responseText);

    if (!response.ok) {
      console.error(`Error ${response.status}:`, responseText);
      throw new Error('API responded with an error');
    }

    // Try parsing JSON only if the response is valid
    const data = JSON.parse(responseText);
    //console.log('Parsed Response Data:', JSON.stringify(data, null, 2));

    if (data.result.status === 'success') {
      const grantRequests = data.result.grant_requests || [];
     console.log('Grant Requests:', JSON.stringify(grantRequests, null, 2));

      setData(grantRequests); // Set the grant requests data
    } else {
      console.error('API returned failure status:', data);
      throw new Error(data.message || 'API Error');
    }
  } catch (error) {
    console.error('Fetch Error:', error.message);
  } finally {
    setLoading(false);
  }
};

// granty extra budget request

export const postApprovalRequest = async (token, url, approvalData,warehouseId, setLoading) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');
    console.log('storedtoken url', storedurl+storedtoken)
    setLoading(true);

    const requestOptions = {
      method: 'POST',
      redirect: 'follow',
      //credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${storedtoken}`,
        'Content-Type': 'application/json',
        'Cookie': 'session_id',
      },
      body: JSON.stringify(approvalData),
    };

    console.log('Posting Approval Request:', approvalData);

    const response = await fetch(`${storedurl}/api/approve_grant_request/department`, requestOptions);

    if (!response.ok) {
      const errorText = await response.json();
      console.error(`Error ${response.status}:`, errorText);
      alert(`Error: ${errorText.error}`);
      throw new Error('Failed to submit approval request.');
    }

    const data = await response.json();
    console.log('Approval Response:', data.result);
     console.log('response: ',response);
    if (data.result.status === 'success') {
      alert('Approval processed successfully.');
      await sendPushNotification('Fund Approved', 'Your fund request has been approved!',`manager${warehouseId}`);
      console.log("test id:",`manager${warehouseId}`);
    } else {
      throw new Error(data.message || 'Approval failed.');
    }
  } catch (error) {
    console.error('Approval Error:', error.message);
  } finally {
    setLoading(false);
  }
};

export const postApprovalPO = async (approvalData, setLoading) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');
    console.log('storedtoken url', storedurl+storedtoken)
    setLoading(true);
  
    const requestOptions = {
      method: 'POST',
      redirect: 'follow',
      //credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${storedtoken}`,
        'Content-Type': 'application/json',
        'Cookie': 'session_id',
      },
      body: JSON.stringify(approvalData),
    };

    console.log('Posting Approval Request:', approvalData);

    const response = await fetch(`${storedurl}/api/order/update_status`, requestOptions );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error ${response.status}:`, errorText);
      throw new Error('Failed to submit approval request.');
    }

    const data = await response.json();
    console.log('Approval Response:', data.result);
     console.log('response: ',response);
    if (data.result.status === 'success') {
      alert('Approval processed successfully.');
      fetchManageOrderReport();
    } else {
      throw new Error(data.message || 'Approval failed.');
    }
  } catch (error) {
    console.error('Approval Error:', error.message);
    alert(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// Function to fetch async values and check status for ManagerRequest.js

export const fetchAsyncValuesAndCheckStatusForRequest = async (setAccessToken, setStoreUrl, fetchManagerData, setData, setLoading) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const url = await AsyncStorage.getItem('storeUrl');
   // const selectedManagerId = await AsyncStorage.getItem('selectedManagerId');

    if (!token || !url) {
      throw new Error('Failed to retrieve access token or store URL');
    }
    setAccessToken(token);
    setStoreUrl(url);
    await fetchManagerData(token, url, setData, setLoading);
   // setManagerID(selectedManagerId);
    console.log('')
  } catch (error) {
    console.log('Error', error.message);
  }
};

// Function to fetch manager data for ManagerDashboard.js

export const fetchManagerDataForDashboard = async (token, url, setData, setLoading) => {

  try {
 
    var myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };
    const response = await fetch(`${url}/api/get/all/manager`, requestOptions);
    const dataPromise = response.json();
    if (dataPromise instanceof Promise) {
      const data = await dataPromise;
      console.log('Manager Data:', data);
      setData(data);
    } else {
      console.error('Failed to resolve data', dataPromise);
    }
  } catch (error) {
    Alert.alert('Error', 'Unable to fetch manager data. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Function to fetch async values and check status for ManagerDashboard.js

export const fetchAsyncValuesAndCheckStatusForDashboard = async (setAccessToken, setStoreUrl, fetchManagerData, setData, setLoading, navigation) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const url = await AsyncStorage.getItem('storeUrl');

    if (!token || !url) {
      throw new Error('Failed to retrieve access token or store URL');
    }
    
    setAccessToken(token);
    setStoreUrl(url);
    await fetchManagerData(token, url, setData, setLoading);
  } catch (error) {
    Alert.alert('Error', error.message);
    navigation.navigate('Home');
  }
};

// Function to handle manager selection for ManagerDashboard.js

export const handleManagerSelect = async (manager, navigation) => {
  try {
    await AsyncStorage.setItem('selectedManagerName', manager.name);
    await AsyncStorage.setItem('selectedManagerId', manager.id);
    navigation.navigate('SingleManagerDetails'); // Navigate to the details screen
    console.log('manager.id', manager.id);
  } catch (error) {
    console.error('Error saving manager details', error);
    Alert.alert('Error', 'Failed to save manager details');
  }
};

// Function to fetch categories for displaying in the main list for DepartmentConfiguration.js

export const fetchCategories = async (token, url, setCategories, setLoading) => {
  try {
  
    const accesstoken = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    console.log('url:', storeUrl);
    console.log('token:', accesstoken);
    var myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (dayOfWeek + 6) % 7; // Calculate days until the next Monday

    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);

    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      // //credentials: 'omit',
    };

    // Append month and year as query parameters to the URL
    const response = await fetch(`${storeUrl}/api/get/category/vendor/department?start_date=${startDateFormatted}&end_date=${endDateFormatted}`, requestOptions);
    // Wait for the JSON data to be parsed
    if (response.ok) {
      const data = await response.json(); // Await the resolution of the promise
      console.log('alldatacategories:', data);
      // Check if the data contains the expected fields
      if (data) {
        setCategories(data); // Store full API response in state

      } else {
        console.error('No data returned from the API');
      }
    } else {
      console.error('Failed to fetch categories, status:', response.status);
    }
  } catch (error) {
    console.log('Error', 'Unable to fetch categories. Please try again.', error);
  } finally {
    setLoading(false);
  }
};

// Function to fetch available categories for the checkbox list in the modal

export const fetchAvailableCategories = async (setAvailableCategories) => {
  try {
    var myHeaders = new Headers();
    const accesstoken = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    console.log('url:', storeUrl);
    console.log('category token', accesstoken);
    myHeaders.append('Authorization',  `Bearer ${accesstoken}`);
    myHeaders.append('Cookie', 'session_id');
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    const response = await fetch(`${storeUrl}/api/categories`, requestOptions);
    const dataPromise = response.json();

    if (dataPromise instanceof Promise) {
      const data = await dataPromise;
      setAvailableCategories(data); // Store the categories for checkbox selection
    }
  } catch (error) {
    Alert.alert('Error', 'Unable to fetch available categories.');
  }
};

// Function to handle form submission for creating a category in DepartmentConfiguration.js

export const handleCreateCategory = async (
  categoryName,
  selectedCategories,
  accessToken,
  storeUrl,
  setCreateCategoryModalVisible,
  fetchCategories, // Ensure fetchCategories is passed correctly
  setCategories,
  setLoading // Ensure setLoading is passed
) => {
  if (!categoryName || selectedCategories.length === 0) {
    Alert.alert('Error', 'Please enter a category name and select at least one category.');
    return;
  }
  const token = await AsyncStorage.getItem('access_token');

  try {
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');
    const body = JSON.stringify({
      name: categoryName,
      pos_categ_ids: selectedCategories, // Add selected category IDs
      status: 'active',
    });
    console.log('new category create request',myHeaders);
    console.log('selectedCategories',selectedCategories);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: body,
      redirect: 'follow',
      //credentials: 'omit',
    };
   
    const response = await fetch(`${storeUrl}/api/create/category/vendor/department/`, requestOptions);
    if (response.ok) {
      Alert.alert('Success', 'Category created successfully!');  
      // Close the modal
      setCreateCategoryModalVisible(false);
      // Set loading to true while fetching categories
      setLoading(true);
      // Fetch the updated list of categories
      await fetchCategories(accessToken, storeUrl, setCategories, setLoading);
    } else {
      const responseData = await response.json();
      Alert.alert('Error', responseData.message);
    }
  } catch (error) {
    console.log('Error', 'Unable to create category.');
  }
};
export const handleUpdateCategory = async (
  categoryID,
  categoryName,
  selectedCategories,
  accessToken,
  storeUrl,
  setAddAllianceModalVisible,
  fetchCategories, // Ensure fetchCategories is passed correctly
  setCategories,
  setLoading, // Ensure setLoading is passed
) => {
  if (!categoryName || selectedCategories.length === 0) {
    Alert.alert('Error', 'Please enter a category name and select at least one category.');
    return;
  }

  const selectedCategoryIds = selectedCategories
  .map(cat => cat?.id)
  .filter(id => typeof id === 'number');
  const token = await AsyncStorage.getItem('access_token');
  try {
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');
    const body = JSON.stringify({
      id: categoryID,
      name: categoryName,
      pos_categ_ids: selectedCategoryIds, // Add selected category IDs
      status: 'active',
    });
    console.log("selectedCategories",selectedCategories);
    console.log('new category update request',myHeaders);
    console.log('selectedCategories',categoryName,selectedCategoryIds,categoryID);
    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: body,
      redirect: 'follow',
      //credentials: 'omit',
    };
   
    const response = await fetch(`${storeUrl}/api/update/category/vendor/department/`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
      Alert.alert('Success', 'Category Updated successfully!');  
      console.log("response",JSON.stringify(responseData));
      console.log("response new",responseData);
      // Close the modal
      setAddAllianceModalVisible(false);
      // Set loading to true while fetching categories
      setLoading(true);
      // Fetch the updated list of categories
      await fetchCategories(accessToken, storeUrl, setCategories, setLoading);
    } else {
      const responseData = await response.json();
      console.log("responseData",responseData);
     Alert.alert('Error', responseData.message);
    }
  } catch (error) {
    console.log('Error', error);
  }
};

export const createOrder = async (storeUrl, storeId, warehouses, token) => {
  try {
    const response = await fetch(`${storeUrl}/create/order/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        store_id: storeId,
        warehouses: warehouses
      })
    });
console.log('warehouse',JSON.stringify(warehouses));
    const data = await response.json();
    console.log('orderdata',data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order');
    }

    return { status: 'success', data: data };
  } catch (error) {
    console.error("API Error:", error);
    return { status: 'error', message: error.message };
  }
};

// Function to fetch async values and check status for DepartmentConfiguration.js

export const fetchAsyncValuesAndCheckStatus = async (setAccessToken, setStoreUrl, fetchCategories, fetchAvailableCategories, setCategories, setAvailableCategories, setLoading) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const url = await AsyncStorage.getItem('storeUrl');
    if (!token || !url) {
      throw new Error('Failed to retrieve access token or store URL');
    }

    setAccessToken(token);
    setStoreUrl(url);
    await fetchCategories(token, url, setCategories, setLoading);
    await fetchAvailableCategories(setAvailableCategories);
  } catch (error) { 
    console.log('Error', error.message);
  }
};

// Function to fetch vendor alliances for dropdown

export const fetchVendorAlliances = async (setAlliances, setLoading) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    console.log('fetchvendortoken', token);
    const storeUrl = await AsyncStorage.getItem('storeUrl');

    if (!token || !storeUrl) {
      throw new Error('Access token or store URL not found');
    }

    const myHeaders = new Headers();
    // myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Authorization',  `Bearer ${token}`);
    // myHeaders.append('Cookie', 'session_id'); // Modify if necessary

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    //  //credentials: 'omit',
    };

    const response = await fetch(`${storeUrl}/api/vendor_management/alliances/department`, requestOptions);
   console.log('fetch alliance response', response);

    if (!response.ok) {
      throw new Error(`Error fetching vendor alliances: ${response.status}`);
    }

    const data = await response.json();
    console.log('data',data);
    if (data.status === 'success') {
      setAlliances(data.alliance); // Corrected to access the 'alliance' array in the response
    } else {
      Alert.alert('Error', data.message || 'Failed to fetch vendor alliances');
    }
  } catch (error) {
    console.error('Error fetching vendor alliances:', error);
    Alert.alert('Error', error.message || 'An error occurred while fetching vendor alliances');
  } finally {
    setLoading(false);
  }
};

// vendor details for vendor

export const fetchVendorDetailsForVendor = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const filteredVendorNames = await AsyncStorage.getItem('filteredVendorNames');
    console.log('POToken:', token);
    console.log('POStore URL:', storeUrl);

    // Setup headers
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');
   // myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };
console.log('filteredVendorNames',filteredVendorNames);
    const response = await fetch(`${storeUrl}/api/vendor_management/data?vendorName=${filteredVendorNames}`, requestOptions);
    const text = await response.text();
    console.log('PO Response Text (raw):', response);
    // Replace both NaN and Infinity with null
    const sanitizedText = text.replace(/\bNaN\b/g, 'null').replace(/\bInfinity\b/g, 'null');

    try {
      const data = JSON.parse(sanitizedText);
    //  console.log('Parsed Response Data:', JSON.stringify(data[0], null, 2));
      const vendorDetails = data.vendor_details || [];
      console.log('vendor data', data);
      console.log('vendorDetails',vendorDetails[0]);
      // Store vendor details in AsyncStorage
      for (let vendor of vendorDetails) {
        const { id, posDepartment, vendorName, posUnitPrice, posName, barcode } = vendor;
        await AsyncStorage.setItem(`vendor_${id}_details`, JSON.stringify({ 
          id,
          posDepartment,
          vendorName,
          posUnitPrice,
          posName,
          barcode,
       
        }));
      }

      return vendorDetails;
    } catch (jsonError) {
      console.error("JSON Parse Error after sanitization Vendor details:", jsonError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return [];
  }
};


export const fetchCategoryProducts = async (deptId) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    console.log('POToken:', token);
    console.log('POStore URL:', storeUrl);

    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    // Example endpoint that fetches items for a department
    const response = await fetch(
      `${storeUrl}/api/vendor_management/data/department?departmentId=${deptId}`,
      requestOptions
    );
    const text = await response.text();
    console.log('PO Response Text (raw):', response);

    // Replace both NaN and Infinity with null
    const sanitizedText = text.replace(/\bNaN\b/g, 'null').replace(/\bInfinity\b/g, 'null');

    try {
      const data = JSON.parse(sanitizedText);
      if (data && data.status === "success" && Array.isArray(data.data)) {
        return data.data;
      } else {
        return []; 
      }
    } catch (jsonError) {
      console.error("JSON Parse Error after sanitization Fetch cate:", jsonError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return [];
  }
};


//fetch all items

export const fetchAllItems = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    console.log('POToken:', token);
    console.log('POStore URL:', storeUrl);

    // Setup headers
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');
   // myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    const response = await fetch(`${storeUrl}/api/vendor_management/data`, requestOptions);
    const text = await response.text();
    console.log('PO Response Text (raw):', response);
    // Replace both NaN and Infinity with null
    const sanitizedText = text.replace(/\bNaN\b/g, 'null').replace(/\bInfinity\b/g, 'null');

    try {
      const data = JSON.parse(sanitizedText);
    //  console.log('Parsed Response Data:', JSON.stringify(data[0], null, 2));
      const vendorDetails = data.vendor_details || [];
      console.log('vendorDetails',vendorDetails[0]);
      // Store vendor details in AsyncStorage
      for (let vendor of vendorDetails) {
        const { id, posDepartment, vendorName, posUnitPrice, posName, barcode } = vendor;
        await AsyncStorage.setItem(`vendor_${id}_details`, JSON.stringify({ 
          id,
          posDepartment,
          vendorName,
          posUnitPrice,
          posName,
          barcode,
        }));
      }

      return vendorDetails;
    } catch (jsonError) {
      console.error("JSON Parse Error after sanitization Item:", jsonError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return [];
  }
};


export const fetchStoreCatItems = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const filteredVendorNames = await AsyncStorage.getItem('filteredVendorNames');
    console.log('POToken:', token);
    console.log('POStore URL:', storeUrl);

    // Setup headers
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');
   // myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };
console.log('filteredVendorNames',filteredVendorNames);
    const response = await fetch(`${storeUrl}/api/vendor_management/data`, requestOptions);
    const text = await response.text();
    console.log('PO Response Text (raw):', response);
    // Replace both NaN and Infinity with null
    const sanitizedText = text.replace(/\bNaN\b/g, 'null').replace(/\bInfinity\b/g, 'null');

    try {
      const data = JSON.parse(sanitizedText);
    //  console.log('Parsed Response Data:', JSON.stringify(data[0], null, 2));
      const vendorDetails = data.vendor_details || [];
      console.log('vendorDetails',vendorDetails[0]);
      // Store vendor details in AsyncStorage
      for (let vendor of vendorDetails) {
        const { id, posDepartment, vendorName, posUnitPrice, posName, barcode } = vendor;
        await AsyncStorage.setItem(`vendor_${id}_details`, JSON.stringify({ 
          id,
          posDepartment,
          vendorName,
          posUnitPrice,
          posName,
          barcode,
        }));
      }

      return vendorDetails;
    } catch (jsonError) {
      console.error("JSON Parse Error after sanitization Filter Vendor:", jsonError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return [];
  }
};
// vendor list

export const fetchVendorList = async () => {

  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');
    console.log('token',token);
    console.log('storeurl', storeUrl);
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
     //credentials: 'omit',
    };
    const response = await fetch(`${storeUrl}/api/vendor_management/vendors`, requestOptions);

    if (response.ok) {
      const data = await response.json();
      const vendorNames = data.vendors || [];

      // Store each vendor name in AsyncStorage with a unique key
      for (let i = 0; i < vendorNames.length; i++) {
        const vendorName = vendorNames[i];
        await AsyncStorage.setItem(`vendor_${i}_name`, vendorName);
      }

      console.log('Vendor names:', vendorNames);
      return vendorNames;
    } else {
      console.error('Failed to fetch vendor names:', response.status);
      return [];
    }

  } catch (error) {
    console.error('Error fetching vendor names:', error);
    return [];
  }
};

export const fetchDepartmentList = async () => {

  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');
    console.log('token',token);
    console.log('storeurl', storeUrl);
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
     //credentials: 'omit',
    };
    const response = await fetch(`${storeUrl}/api/vendor_management/vendors/department`, requestOptions);

    if (response.ok) {
      const data = await response.json();
      const vendorNames = data.vendors || [];

      // Store each vendor name in AsyncStorage with a unique key
      for (let i = 0; i < vendorNames.length; i++) {
        const vendorName = vendorNames[i];
        await AsyncStorage.setItem(`vendor_${i}_name`, vendorName);
      }

      console.log('Vendor names:', vendorNames);
      return data;
    } else {
      console.error('Failed to fetch vendor names:', response.status);
      return [];
    }

  } catch (error) {
    console.error('Error fetching vendor names:', error);
    return [];
  }
};

export const RequestExtraBudgetNextWeek = async (VendorName, amount ,message ,selectedCategoryallocationId ,selectedCategoryid) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const warehouseId = await AsyncStorage.getItem('warehouseId');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload

    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 6) % 7;  // Calculate days until the next Monday

    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday +1);
    startDate.setHours(0, 0, 0, 0);

    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
    console.log('startDateFormatted', startDateFormatted);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify({
        warehouseId:warehouseId,
        start_date: startDateFormatted, // Format as "YYYY-MM-DD HH:MM:SS"
        end_date: endDateFormatted,
        departmentName: VendorName,
        amount_requested: parseFloat(amount),
        message: message,
        departmentAllocationId: selectedCategoryallocationId,
        departmentId:selectedCategoryid,
      }),
    };

    const response = await fetch(`${storeUrl}/api/submit_grant_request/department`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Request Submitted:', data);
      Alert.alert('Request Sent Successfully');
      await sendPushNotification('New Fund Request', 'you have recived a fund request from manger!',`account_manager`);
      return data;
    } else {
      console.error('Failed to distribute allocated amount:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error distributing allocated amount:', error);
    return null;
  }
};
// request extra vendor budget for current week
export const RequestExtraBudget = async (VendorName, amount ,message ,selectedCategoryallocationId ,selectedCategoryid) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload
    const warehouseId = await AsyncStorage.getItem('warehouseId');
    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (dayOfWeek + 6) % 7; // Calculate days until the next Monday
    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);

    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
    console.log('startDateFormatted', startDateFormatted);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify({
        warehouseId:warehouseId,
        start_date: startDateFormatted,
        end_date: endDateFormatted,
        departmentName: VendorName,
        amount_requested: amount,
        message: message,
        departmentAllocationId: selectedCategoryallocationId,
        departmentId: selectedCategoryid,
      }),
    };
    const response = await fetch(`${storeUrl}/api/submit_grant_request/department`, requestOptions);
    console.log("requestOptionsrequestOptions:",requestOptions);
    if (response.ok) {
      const data = await response.json();
     console.log('Request Submitted Test:', data);
     Alert.alert('Request Sent Successfully');
    //  OneSignal.postNotification(
    //   "Your grant request was successfully created!"
    // );

    const roleFromStorage = await AsyncStorage.getItem('user_role');
    await sendPushNotification('New Fund Request', 'you have recived a fund request from manger!',`account_manager`);

      return data;
    } else {
      console.error('Failed to distribute allocated amount:', response);
      return null;
    }
  } catch (error) {
    console.error('Error distributing allocated amount:', error);
    return null;
  }
};
// allocate department price for manager

export const distributeAllocatedAmountDepartmentNextWeek = async (CategoryName, amount, selectedCategoryid, selectedCategoryallocationId)=> {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const warehouseId = await AsyncStorage.getItem('warehouseId');
    console.log('distributevendorName', CategoryName);
    console.log('distrbute amount', amount);

    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    // Calculate start and end dates for the current week (Monday-Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 6) % 7; 

    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday +1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const startDateFormatted = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(
      startDate.getHours()
    ).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(
      startDate.getSeconds()
    ).padStart(2, '0')}`;

    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(
      2,
      '0'
    )}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(
      2,
      '0'
    )}`;

    console.log('startDateFormatted', startDateFormatted);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
      body: JSON.stringify({
        warehouseId:warehouseId,
        allocation_id: selectedCategoryallocationId,
        department_id: selectedCategoryid,
        start_date: startDateFormatted,
        end_date: endDateFormatted,
        category_name: CategoryName,
        allocated_amount: amount,
      }),
    };

    const response = await fetch(`${storeUrl}/api/allocate_vendor_amount/department`, requestOptions);
    const data = await response.json(); // <--- Only call response.json() once

    if (response.ok) {
      console.log('Distribution success:', data);
      return data;
    } else {
      Alert.alert(data?.message || 'Something went wrong');
      console.error('Failed to distribute allocated amount:', data);
      return null;
    }
  } catch (error) {
    console.error('Error distributing allocated amount:', error);
    return null;
  }
};

export const distributeAllocatedAmountVendorCurrentWeek = async (CategoryName, amount, selectedCategoryid, selectedCategoryallocationId) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const warehouseId = await AsyncStorage.getItem('warehouseId');
    console.log('distributevendorName', CategoryName);
    console.log('distrbute amount', selectedCategoryallocationId);
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    // Calculate start and end dates for the current week (Monday-Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (dayOfWeek + 6) % 7;
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const startDateFormatted = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(
      startDate.getHours()
    ).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(
      startDate.getSeconds()
    ).padStart(2, '0')}`;

    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(
      2,
      '0'
    )}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(
      2,
      '0'
    )}`;

    console.log('startDateFormatted', startDateFormatted);
console.log("warehouseIdallocation:",warehouseId);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
      body: JSON.stringify({
        warehouseId: warehouseId,
        allocation_id: selectedCategoryallocationId,
        department_id: selectedCategoryid,
        start_date: startDateFormatted,
        end_date: endDateFormatted,
        category_name: CategoryName,
        allocated_amount: amount,
      }),
    };

    const response = await fetch(`${storeUrl}/api/allocate_vendor_amount/department`, requestOptions);
    const data = await response.json(); // <--- Only call response.json() once

    if (response.ok) {
      console.log('Distribution success:', data);
      return data;
    } else {
      Alert.alert(data?.message || 'Something went wrong');
      console.error('Failed to distribute allocated amount:', data);
      return null;
    }
  } catch (error) {
    console.error('Error distributing allocated amount:', error);
    return null;
  }
};


export const AllocatedBudgetAllVendor = async (amount) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload
     const warehouseId = await AsyncStorage.getItem('warehouseId');
    // console.log("warehouseId_Des",warehouseId);
    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 6) % 7; 
    // const daysUntilMonday = (1 - dayOfWeek + 7) % 7; 
    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday + 1);
    startDate.setHours(0, 0, 0, 0);

    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify({
        start_date: startDateFormatted, // Format as "YYYY-MM-DD HH:MM:SS"
        end_date: endDateFormatted,
        allocated_amount: amount,
         warehouseId:warehouseId,
      }),
    };
console.log('requestOptions', requestOptions);
    const response = await fetch(`${storeUrl}/api/allocate_amount/department`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Budget Allocate success:', data);
      await sendPushNotification('Budget Alert', 'You have Budget For The Next Week!',`manager${warehouseId}`);
      return data;
    } else {
      console.error('Failed to distribute allocated amount:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error distributing allocated amount:', error);
    return null;
  }
};

export const AllocatedBudgetAllVendorCurrentWeek = async (amount) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    // const warehouseId = await AsyncStorage.getItem('warehouseId');
    const warehouseId = await AsyncStorage.getItem('warehouseId');
    console.log("warehouseId_new",warehouseId);
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload

    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (dayOfWeek + 6) % 7; // Calculate days until the next Monday

    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);
console.log('startDate', startDate);
    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify({
        start_date: startDateFormatted, // Format as "YYYY-MM-DD HH:MM:SS"
        end_date: endDateFormatted,
        allocated_amount: amount,
         warehouseId:warehouseId,
      }),
    };
console.log('requestOptions', requestOptions);
    const response = await fetch(`${storeUrl}/api/allocate_amount/department`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Budget Allocate success:', data);
      alert('Approval processed successfully.');
      await sendPushNotification('Budget Alert', 'You have Budget for this Week!',`manager${warehouseId}`);
      return data;
    } else {
      console.error('Failed to distribute allocated amount:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error distributing allocated amount:', error);
    return null;
  }
};
// get allocated budget for vedor

export const getTotalAllocationDetail = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    console.log('dayOfWeek',dayOfWeek);
  const daysUntilMonday = (1 - dayOfWeek + 6) % 7; // Calculate days since the most recent Monday
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday +1);
    startDate.setHours(0, 0, 0, 0);

    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Format dates as YYYY-MM-DD HH:mm:ss
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
console.log('startDateFormatted',startDateFormatted);
    const requestUrl = `${storeUrl}/api/get/total_allocation_detail/department?start_date=${startDateFormatted}&end_date=${endDateFormatted}&category_name=all`;

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Total Allocation Detail:', data);
      return data;
    } else {
      console.error('Failed to fetch total allocation detail:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching total allocation detail:', error);
    return null;
  }
};

export const getTotalAllocationCurrentWeek = async () => {
  try {
    
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
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
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
console.log('startDateFormatted',startDateFormatted);
    const requestUrl = `${storeUrl}/api/get/total_allocation_detail/department?start_date=${startDateFormatted}&end_date=${endDateFormatted}&category_name=all`;
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Total Allocation Detail:', data);
      return data;
    } else {
      console.error('Failed to fetch total allocation detail:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching total allocation detail:', error);
    return null;
  }
};

//get single department details

export const getSingleDepartmentCurrentWeek = async (DepartmentName) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
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
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
console.log('startDateFormatted',startDateFormatted);
    const requestUrl = `${storeUrl}/api/get/total_allocation_detail/department?start_date=${startDateFormatted}&end_date=${endDateFormatted}&category_name=${DepartmentName}`;
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Total Allocation Detail:', data);
      return data;
    } else {
      console.error('Failed to fetch total allocation detail:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching total allocation detail:', error);
    return null;
  }
};

export const getSingleDepartmentNextWeek = async (DepartmentName) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysSinceMonday = (1 - dayOfWeek + 6) % 7; 
    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysSinceMonday + 1);
    startDate.setHours(0, 0, 0, 0);
    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    // Format dates as YYYY-MM-DD HH:mm:ss
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
console.log('startDateFormatted',startDateFormatted);
    const requestUrl = `${storeUrl}/api/get/total_allocation_detail/department?start_date=${startDateFormatted}&end_date=${endDateFormatted}&category_name=${DepartmentName}`;
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Total Allocation Detail:', data);
      return data;
    } else {
      console.error('Failed to fetch total allocation detail:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching total allocation detail:', error);
    return null;
  }
};
// get vendor allocated budget

export const getVendorBudget = async (vendor_name) => {
  try {

  
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');

    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);

    // Calculate start and end dates for the current week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysSinceMonday = (1 - dayOfWeek + 6) % 7; // Calculate days since the most recent Monday

    // Start date: current Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysSinceMonday + 1);
    startDate.setHours(0, 0, 0, 0);

    // End date: current Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Format dates as "YYYY-MM-DD HH:mm:ss"
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;

    const requestUrl = `${storeUrl}/api/get/total_allocation_detail?vendor_name=${vendor_name}&start_date=${startDateFormatted}&end_date=${endDateFormatted}`;

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch vendor budget detail:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching vendor budget detail:', error);
    return null;
  }
};

export const getVendorBudgetCurrentWeek = async (vendor_name) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');

    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);

    // Calculate start and end dates for the current week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7; // Calculate days since the most recent Monday

    // Start date: current Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - daysSinceMonday);
    startDate.setHours(0, 0, 0, 0);

    // End date: current Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Format dates as "YYYY-MM-DD HH:mm:ss"
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
  //  const requestUrl = `${storeUrl}/api/get/total_allocation_detail?vendor_name=ALL&start_date=${startDateFormatted}&end_date=${endDateFormatted}`;
   const requestUrl = `${storeUrl}/api/get/total_allocation_detail?vendor_name=${vendor_name}&start_date=${startDateFormatted}&end_date=${endDateFormatted}`;

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };

    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch vendor budget detail:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching vendor budget detail:', error);
    return null;
  }
};

// order for next week

export const createNextWeekOrder = async  (items,totalCash,accountTransfer) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const warehouseId = await AsyncStorage.getItem('warehouseId');

    const myHeaders = new Headers();
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 6) % 7; 

  //  const daysUntilMonday = (1 - dayOfWeek + 7) % 7;     // Start date: current Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday + 1);
  //  startDate.setDate(currentDate.getDate() + daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);
    // End date: current Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    // Format dates as "YYYY-MM-DD HH:mm:ss"
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;

  myHeaders.append('Authorization',  `Bearer ${token}`);
  myHeaders.append('Content-Type', 'application/json');
  console.log('items',items);
    const body = {
      account_payment: accountTransfer,
      cash_payment: totalCash,
      orders: items.map((item) => ({
        warehouseId:warehouseId,
        departmentName: item.departmentName,
        departmentId: item.departmentId,
        departmentAllocationId: item.departmentAllocationId,
        vendorName: item.vendorName,
        product_id: item.id,
        itemNo: item.itemNo,
        posName: item.posName,
        posSize: item.posSize,
        posDepartment: item.posDepartment,
        barcode: item.barcode,
        posUnitCost: item.posUnitCost,
        unitQty: item.unitQty,
        invCaseCost: item.invCaseCost,
        invQty: item.qty,  // or 'item.invQty' depending on your data
        start_date: startDateFormatted,
        end_date: endDateFormatted,
      }))
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify(body),
    };

console.log('body:', body);
    const response = await fetch(`${storeUrl}/api/create/vendor_manager_order/department`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
       console.log('invoiceNumber',requestOptions);
     // console.log(`Order created for ${item.posName}`, responseData); // Log the response data
      return responseData;
    } else {
      const responseData = await response.json();
      console.error('Failed to create order:', responseData.error.message);
      return responseData;
    }
  } catch (error) {
    console.error('Error creating vendor details order:', error);
    return null;
  }
};
// create order from manager account

export const createDepartmentDetailsOrder = async (items,totalCash,accountTransfer) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const warehouseId = await AsyncStorage.getItem('warehouseId');
    const myHeaders = new Headers();
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7; // Calculate days since the most recent Monday
    // Start date: current Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - daysSinceMonday);
    startDate.setHours(0, 0, 0, 0);
    // End date: current Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Format dates as "YYYY-MM-DD HH:mm:ss"
 const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
myHeaders.append('Authorization',  `Bearer ${token}`);
myHeaders.append('Content-Type', 'application/json');
console.log('allitems',items);
    const body = {
      account_payment: accountTransfer,
      cash_payment: totalCash,
      orders: items.map((item) => ({
        departmentId: item.departmentId,
        warehouseId:warehouseId,
        itemNo: item.itemNo,
        departmentName: item.departmentName,
        departmentAllocationId: item.departmentAllocationId,
        vendorName: item.vendorName,
        product_id: item.id,
        posName: item.posName,
        posSize: item.posSize,
        posDepartment: item.posDepartment,
        barcode: item.barcode,
        posUnitCost: item.posUnitCost,
        invCaseCost: item.invCaseCost,
        invQty: item.qty,  // or 'item.invQty' depending on your data
        unitQty: item.unitQty,
        start_date: startDateFormatted,
        end_date: endDateFormatted,
      }))
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    //   body: body,
     body: JSON.stringify(body),
    };

console.log('body:', body);
    const response = await fetch(`${storeUrl}/api/create/vendor_manager_order/department`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
       console.log('invoiceNumber',responseData);
     // console.log(`Order created for ${item.posName}`, responseData); // Log the response data
      return responseData;

    } else {
      const responseData = await response.json();
      console.error('Failed to create Order:', responseData.error.message);
      return responseData;
    }

  } catch (error) {
    console.error('Error creating vendor details order:', error);
    return null;
  }
};


export const fetchStockUpdate = async (selectedModalItems, modalSelectedItems) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const storeid =  await AsyncStorage.getItem('store_id');
    if (!token || !storeUrl) {
      console.error("Error: Missing token or storeUrl");
      return;
    }

    // Construct query parameters dynamically to match the required format
    let queryParams = selectedModalItems
      .map((barcode) => `barcodes[]=${barcode}&quantities[]=${modalSelectedItems[barcode] || 1}`)
      .join("&");

    // Append store_id
    queryParams += `&store_id=${storeid}`;

    // Final API URL
    const apiUrl = `${storeUrl}/product/stock/?${queryParams}`;

    console.log("API Request URL:", apiUrl);

    let myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    let requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    // Fetch data
    const response = await fetch(apiUrl, requestOptions);
    const data = await response.json();

    console.log("API Response:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error fetching stock update:", error);
  }
};

export const handleVendorSearch = async (query) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');
    if (!storedtoken || !storedurl) return;
    const params = new URLSearchParams();
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(`${storedurl}/category-management/vendor-wise-search/?vendorName=${encodedQuery}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${storedtoken}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (result && result.data) {
  //    setApiSearchResults(result.data);
      return result.data;
    } else {
      console.log("data not found");
      return null;
    }
  } catch (error) {
    console.error("API search error:", error);
  }
};

//create request for department budget

export const createGrantRequest = async (amountRequested, message, categoryIds) => {
  try {
    // Retrieve necessary values from AsyncStorage
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const userId = await AsyncStorage.getItem('uid');
    
    // Setup headers and body for the request
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    const body = {
      amount_requested: amountRequested,
      manager_id: `${storeUrl}_${userId}`, // Constructed as per your requirements
      message: message,
      category_ids: categoryIds,
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify(body),
    };

    console.log('Grant Request Body:', body);

    // Perform the API request
    const response = await fetch(`${storeUrl}/api/create/grant_request`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
      console.log('Grant request created successfully:', responseData);
      await sendPushNotification('New Fund Request', 'you have recived a fund request from manger!',`account_manager${warehouseId}`);
      return responseData;
    } else {
      console.error('Failed to create grant request:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating grant request:', error);
    return null;
  }
};

// Fetch Order Report for Manager


export const fetchManageOrderReport = async (startDate, endDate, setData, setLoading) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${storedtoken}`);
    myHeaders.append('Cookie', 'session_id');
    //myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
    //  redirect: 'follow',
      credentials: 'omit',
    };
    console.log('storedtoken', storedtoken);
    console.log('url', storedurl);
    console.log('Request Options:', requestOptions);

    // Function to format date
    const formatDate = (date) => {
      const pad = (n) => (n < 10 ? '0' + n : n);
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedStartDate = formatDate(startDate);
    console.log('formattedStartDates',formattedStartDate);
    const formattedEndDate = formatDate(endDate);
    console.log('formattedEndDates',formattedEndDate);

    const response = await fetch(
      `${storedurl}/api/get/vendor_management_order/department/?start_date=${formattedStartDate}&end_date=${formattedEndDate}&vendor_name=all&department_name=all`,
      requestOptions
    );

    // Log raw response
    const responseText = await response.text();
    console.log('Raw all Response:', responseText);

    if (!response.ok) {
      console.error(`Error ${response.status}:`, responseText);
      throw new Error('API responded with an error');
    }

    // Try parsing JSON only if the response is valid
    const data = JSON.parse(responseText);


    
     //console.log('Parsed Response Data:', JSON.stringify(data, null, 2));
     console.log("data fetched for update:", data);
    if (data.status === 'success' && Array.isArray(data.data)) {
      const flatData = data.data.flatMap((invoice) => {
        const { invoiceNumber, invoiceSaveDate, invoiceUpdateDate, totalAmount,start_date,end_date,status,warehouseName } = invoice;
        return invoice.orderLines.map((line) => ({
          ...line,
          invoiceNumber,
          invoiceSaveDate,
          invoiceUpdateDate,
          totalCost: totalAmount, // Optional: can override with line.totalCost
          start_date,
          end_date,
          status,
          warehouseName,
          
        }));
      });

      setData(flatData);
      return flatData; // ✅ ADD THIS
    } else {
    console.log("error:",data.status);
    return null; // ✅ ADD THIS

    }
  } catch (error) {
    console.error('Fetch Error:', error.message);
    return null; // ✅ ADD THIS

  } finally {
    setLoading(false);
  }
};

export const fetchStoreReport = async (startDate, endDate, setData, setLoading) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${storedtoken}`);
    myHeaders.append('Cookie', 'session_id');
    //myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };
    console.log('storedtoken', storedtoken);
    console.log('url', storedurl);
    console.log('Request Options:', requestOptions);

    // Function to format date
    const formatDate = (date) => {
      const pad = (n) => (n < 10 ? '0' + n : n);
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedStartDate = formatDate(startDate);
    console.log('formattedStartDate',formattedStartDate);
    const formattedEndDate = formatDate(endDate);
    console.log('formattedEndDate',formattedEndDate);

    const response = await fetch(
      `${storedurl}/order/list?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
      requestOptions
    );

    // Log raw response
    const responseText = await response.text();
    console.log('Raw Response:', responseText);

    if (!response.ok) {
      console.error(`Error ${response.status}:`, responseText);
      throw new Error('API responded with an error');
    }

    // Try parsing JSON only if the response is valid
    const data = JSON.parse(responseText);
    console.log('storereport', data);
   // console.log('Parsed Response Data:', JSON.stringify(data, null, 2));
    setData(data.data); 
    // if (data.status === 'success') {
    //   const invoices = data.data.invoices || [];
    //   console.log('Invoices:', JSON.stringify(invoices, null, 2));
    //   setData(invoices); // Set the invoices data
    // } else {
    //   console.error('API returned failure status:', data);
    //   throw new Error(data.message || 'API Error');
    // }
  } catch (error) {
    console.error('Fetch Error:', error.message);
  } finally {
    setLoading(false);
  }
};

export const fetchStoreManagerReport = async (startDate, endDate, setData, setLoading) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${storedtoken}`);
    myHeaders.append('Cookie', 'session_id');
    //myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
    };
    console.log('storedtoken', storedtoken);
    console.log('url', storedurl);
    console.log('Request Options:', requestOptions);

    // Function to format date
    const formatDate = (date) => {
      const pad = (n) => (n < 10 ? '0' + n : n);
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedStartDate = formatDate(startDate);
    console.log('formattedStartDate',formattedStartDate);
    const formattedEndDate = formatDate(endDate);
    console.log('formattedEndDate',formattedEndDate);

    const response = await fetch(
      `${storedurl}/api/quotation?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
      requestOptions
    );

    // Log raw response
    const responseText = await response.text();
    console.log('Raw Response:', JSON.stringify(responseText));

    if (!response.ok) {
      console.error(`Error ${response.status}:`, responseText);
      throw new Error('API responded with an error');
    }

    // Try parsing JSON only if the response is valid
    const data = JSON.parse(responseText);
    console.log('storereport', data);
   // console.log('Parsed Response Data:', JSON.stringify(data, null, 2));
    setData(data); 
    // if (data.status === 'success') {
    //   const invoices = data.data.invoices || [];
    //   console.log('Invoices:', JSON.stringify(invoices, null, 2));
    //   setData(invoices); // Set the invoices data
    // } else {
    //   console.error('API returned failure status:', data);
    //   throw new Error(data.message || 'API Error');
    // }
  } catch (error) {
    console.error('Fetch Error:', error.message);
  } finally {
    setLoading(false);
  }
};


export const ConfirmPOVendor = async (items) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    console.log('🔄 Received items:', items);

    const itemin = Array.isArray(items) && items.length > 0 ? items[0].invoiceNumber : null;
    if (!itemin) {
      console.error("❌ No valid invoiceNumber found in items!");
      return null;
    }
    console.log('✅ itemin:', itemin);

    const body = {
      invoiceNumber:itemin,
      status:'inprocess',
      orders: items.map((item) => ({
        product_id: item.product_id,
        itemNo: item.itemNo,
        departmentId: item.departmentId || "",
        departmentAllocationId: item.departmentAllocationId || "",
        departmentName: item.departmentName || "",
        vendorName: item.vendorName || "",
        posName: item.posName || "",
        posSize: item.posSize || "",
        posDepartment: item.posDepartment || "",
        barcode: item.barcode || "",
        posUnitCost: item.posUnitCost || 0,
        invCaseCost: item.invCaseCost || 0,
        invQty: Number(item.invQty ?? item.qty ?? 0),
        unitQty: Number(item.unitQty ?? item.unitQty ?? 0),
        start_date: item.start_date || "",
        end_date: item.end_date || "",
      }))
    };

    if (!body.orders.length) {
      console.error("❌ No orders found, skipping request!");
      return null;
    }

    console.log('📦 Request body:', JSON.stringify(body)); // Pretty print for debugging

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      body: JSON.stringify(body),
    };

    const url = `${storeUrl}/api/vendor_management_order_line/update/department/`;
    console.log('🌍 Fetching:', url);

    const response = await fetch(url, requestOptions);

    if (response.ok) {
      const responseData = await response.json();
    //  console.log('✅ Success:', responseData.result.message);
      return responseData;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to update order:', errorData.error.message);
      return errorData;
    }
  } catch (error) {
    console.error('🚨 Error updating vendor details order:', error);
    return null;
  }
};
// update po for vendor
export const UpdatePOVendor = async (items,totalCash,accountTransfer) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    console.log('🔄 Received items:', items);

    const itemin = Array.isArray(items) && items.length > 0 ? items[0].invoiceNumber : null;
    if (!itemin) {
      console.error("❌ No valid invoiceNumber found in items!");
      return null;
    }
    console.log('✅ itemin:', itemin);

    const body = {
      invoiceNumber:itemin,
      status:'pending',
      account_payment: accountTransfer,
      cash_payment: totalCash,
      orders: items.map((item) => ({
        product_id: item.product_id,
        itemNo: item.itemNo,
        departmentId: item.departmentId || "",
        departmentAllocationId: item.departmentAllocationId || "",
        departmentName: item.departmentName || "",
        vendorName: item.vendorName || "",
        posName: item.posName || "",
        posSize: item.posSize || "",
        posDepartment: item.posDepartment || "",
        barcode: item.barcode || "",
        posUnitCost: item.posUnitCost || 0,
        invCaseCost: item.invCaseCost || 0,
        invQty: Number(item.invQty ?? item.qty ?? 0),
        unitQty: Number(item.unitQty ?? item.unitQty ?? 0),
        start_date: item.start_date || "",
        end_date: item.end_date || "",
      }))
    };

    if (!body.orders.length) {
      console.error("❌ No orders found, skipping request!");
      return null;
    }

    console.log('📦 Request body:', JSON.stringify(body)); // Pretty print for debugging

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
     //maxRedirects: 20,
    // credentials: 'omit',
      body: JSON.stringify(body),
    };

    const url = `${storeUrl}/api/vendor_management_order_line/update/department/`;
    console.log('🌍 Fetching:', url);

    const response = await fetch(url, requestOptions);

    if (response.ok) {
      const responseData = await response.json();
    //  console.log('✅ Success:', responseData.result.message);
      return responseData;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to update order:', errorData.error.message);
      return errorData;
    }
  } catch (error) {
    console.error('🚨 Error updating vendor details order:', error);
    return null;
  }
};

export const SubmitQuotationReview = async (quotationNumber, dispatchData) => {
  try {
    // Retrieve token and base URL from AsyncStorage
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    
    if (!token || !storeUrl) {
      console.error('Missing access token or store URL');
      return null;
    }
    // Prepare request headers
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Cookie', 'session_id');
    myHeaders.append('Content-Type', 'application/json');
    // Prepare the request body
    const requestBody = {
      quotationNumber,
      dispatchData: Array.isArray(dispatchData) ? dispatchData : [dispatchData],
    };

    // Prepare request options
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
     redirect: 'follow',
      credentials: 'omit',
      body: requestBody,
    };
    console.log('Submitting quotation review with:', requestBody);
    console.log('Request URL:', url);
    // Construct the full URL
    const url = `${storeUrl}/api/quotation-line-review/`;


    // Make the POST request
    const response = await fetch(url, requestOptions);

    // Otherwise, parse directly to JSON
    const data = await response.json();
    
    console.log('Response received:', response);
    return data;

  } catch (error) {
    console.error('Error submitting quotation review:', error);
    return null;
  }
};

export const fetchSingleProductByBarcode = async (barcode) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const response = await fetch(`${storeUrl}/product/api/product-costs/vendor-wise/?barcode=${barcode}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    return null; // Or return { error: true, message: error.message }
  }
};

export const VendorProfile = async (vendorname) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const encodedQuery = encodeURIComponent(vendorname);
    const response = await fetch(`${storeUrl}/api/vendor_management/vendors/profile?vendorName=${encodedQuery}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    return null; // Or return { error: true, message: error.message }
  }
};


// add cash budget for warehosue

export const addCashBudget = async (amountRequested,paymentRecordId,allocationId,warehouseId) => {
  try {
    // Retrieve necessary values from AsyncStorage
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const userId = await AsyncStorage.getItem('uid');
    // Setup headers and body for the request
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');
    const body = {
      amount: amountRequested,
      paymentRecordId: paymentRecordId, // Constructed as per your requirements
      allocationId: allocationId,
      warehouseId: warehouseId,
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      //credentials: 'omit',
      body: JSON.stringify(body),
    };

    console.log('Grant Request Body:', body);

    // Perform the API request
    const response = await fetch(`${storeUrl}/api/transfer/account_to_cash/`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
      console.log('Cash Added Successfully', responseData);
      return responseData;
    } else {
      console.error('Failed to add cash budget:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const sendPushNotification = async (title, message, roleFromStorage) => {
  try {
    const signalappid = await AsyncStorage.getItem('signalappid');
    const signalchannelid = await AsyncStorage.getItem('signalchannelid');
    const signalrestkey = await AsyncStorage.getItem('signalrestkey');
    console.log("all cred",signalappid,signalchannelid,signalrestkey);
    const state = await OneSignal.getDeviceState();
 // ✅ Links this device to your user
    const playerid = state?.userId;
    console.log("Subscribed:", state.isSubscribed);
    console.log("User ID (player_id):", state);
    const response = await fetch('https://onesignal.com/api/v1/notifications/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${signalrestkey}`, // ⚠️ careful, exposing secret
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: signalappid,
    //    include_player_ids: [roleFromStorage],   // ✅ always works
        include_external_user_ids: [roleFromStorage],
        headings: { en: title },
        contents: { en: message },
        priority: 10,
        android_channel_id: signalchannelid
      }),
    });

    const data = await response.json();
    console.log('Push notification data:', data);
  } catch (error) {
    console.error('Error sending push notification:', error);
    Alert.alert('Error', error.message);
  }
};

// top vendor data
export const TopVendorData = async () => {
  try {
    const warehouseId = await AsyncStorage.getItem('warehouseId');
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const response = await fetch(`${storeUrl}/category-management/order/vendor-graph?warehouseId=${warehouseId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    return null; // Or return { error: true, message: error.message }
  }
};
