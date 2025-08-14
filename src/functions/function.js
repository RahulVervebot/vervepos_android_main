// src/functions/function.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Function to fetch manager data for ManagerRequest.js

export const fetchManagerDataForRequest = async (token, url, setData, setLoading) => {
  try {
    const user_id = await AsyncStorage.getItem('uid');
    var myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Cookie', 'session_id');

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
    };
    const response = await fetch(`${url}/api/get/grant_request?account_manager_id=${user_id}`, requestOptions);
    const dataPromise = response.json();
    if (dataPromise instanceof Promise) {
      const data = await dataPromise;
      console.log('Manager Request Data:', data);
      if (data.status === 'success') {
        setData(data.data);
      } else {
        console.error('Failed to fetch data', data);
      }
    } else {
      console.error('Failed to resolve data', dataPromise);
    }
  } catch (error) {
   console.log('Error', 'Unable to fetch manager data. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Function to fetch async values and check status for ManagerRequest.js

export const fetchAsyncValuesAndCheckStatusForRequest = async (setAccessToken, setStoreUrl, setManagerID, fetchManagerData, setData, setLoading) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const url = await AsyncStorage.getItem('storeUrl');
    const selectedManagerId = await AsyncStorage.getItem('selectedManagerId');

    if (!token || !url) {
      throw new Error('Failed to retrieve access token or store URL');
    }
    setAccessToken(token);
    setStoreUrl(url);
    await fetchManagerData(token, url, setData, setLoading);
    setManagerID(selectedManagerId);
    console.log('')
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// Function to fetch manager data for ManagerDashboard.js

export const fetchManagerDataForDashboard = async (token, url, setData, setLoading) => {
  try {
    var myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Cookie', 'session_id');

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
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

export const fetchCategories = async (token, url, setCategories, setLoading, month = null, year = null) => {
  try {
    // If month and year are not provided, set them to the previous month and year
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth(); // Get current month (0-11)
    let currentYear = currentDate.getFullYear(); // Get current year

    if (currentMonth === 0) { // If it's January (month 0), go to December of previous year
      currentMonth = 11;
      currentYear -= 1;
    } else {
      currentMonth -= 1; // Decrement by 1 to get the previous month
    }

    // List of month names (January is index 0, December is index 11)
    const monthNames = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];

    // Set default month and year to previous month in character format
    month = month || monthNames[currentMonth];
    year = year || currentYear;

    console.log(`Fetching categories for month: ${month} and year: ${year}`);
    const accesstoken = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    console.log('url:', storeUrl);
    console.log('token:', accesstoken);
    var myHeaders = new Headers();
    myHeaders.append('access_token', accesstoken);
    myHeaders.append('Cookie', 'session_id');

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
    };

    // Append month and year as query parameters to the URL
    const response = await fetch(`${storeUrl}/api/get/category?month=${month}&year=${year}`, requestOptions);
    // Wait for the JSON data to be parsed
    if (response.ok) {
      const data = await response.json(); // Await the resolution of the promise
      console.log('data:', data);
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

export const fetchAvailableCategories = async (token, url, setAvailableCategories) => {
  try {
    var myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Cookie', 'session_id');
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
    };

    const response = await fetch(`${url}/api/categories`, requestOptions);
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
  try {
    var myHeaders = new Headers();
    myHeaders.append('access_token', accessToken);
    myHeaders.append('Content-Type', 'application/json');
    const body = JSON.stringify({
      name: categoryName,
      pos_categ_ids: selectedCategories, // Add selected category IDs
      status: 'active',
    });
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: body,
      redirect: 'follow',
      credentials: 'omit',
    };
    const response = await fetch(`${storeUrl}/api/create/category`, requestOptions);
    if (response.ok) {
      Alert.alert('Success', 'Category created successfully!');  
      // Close the modal
      setCreateCategoryModalVisible(false);
      // Set loading to true while fetching categories
      setLoading(true);
      // Fetch the updated list of categories
      await fetchCategories(accessToken, storeUrl, setCategories, setLoading);
    } else {
      Alert.alert('Error', 'Failed to create the category.');
    }
  } catch (error) {
    console.log('Error', 'Unable to create category.');
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
    await fetchAvailableCategories(token, url, setAvailableCategories);

  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// Function to fetch vendor alliances for dropdown

export const fetchVendorAlliances = async (setAlliances, setLoading) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');

    if (!token || !storeUrl) {
      throw new Error('Access token or store URL not found');
    }

    const myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Cookie', 'session_id'); // Modify if necessary

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
    };

    const response = await fetch(`${storeUrl}/api/vendor/alliances`, requestOptions);

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

//fetch vendor data for department

export const fetchVendorDetails = async (token, url) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Cookie', 'session_id');
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
    };
    const response = await fetch(`${storeUrl}/api/vendor_details/data`, requestOptions);

    if (response.ok) {
      const data = await response.json();
      const vendorDetails = data.vendor_details || [];
      // Extract and store the required fields in AsyncStorage
      for (let vendor of vendorDetails) {
        const { id, posDepartment, vendorName, posUnitPrice, posName, barcode } = vendor;
        // Save each field to AsyncStorage using a unique key for each vendor
        await AsyncStorage.setItem(`vendor_${id}_details`, JSON.stringify({
          id,
          posDepartment,
          vendorName,
          posUnitPrice,
          posName,
          barcode,
        }));
      }
console.log('data', data);
      return vendorDetails;
    } else {
      console.error('Failed to fetch vendor details:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return [];
  }
};

// vendor details for vendor

export const fetchVendorDetailsForVendor = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    console.log('Token:', token);
    console.log('Store URL:', storeUrl);

    // Setup headers
    const myHeaders = new Headers();
    myHeaders.append('access_token', token);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };

    const response = await fetch(`${storeUrl}/api/vendor_management/data`, requestOptions);
    const text = await response.text();
    console.log('Response Text (raw):', text);

    // Replace both NaN and Infinity with null
    const sanitizedText = text.replace(/\bNaN\b/g, 'null').replace(/\bInfinity\b/g, 'null');

    try {
      const data = JSON.parse(sanitizedText);
      console.log('Parsed Data:', data);

      const vendorDetails = data.vendor_details || [];

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
      console.error("JSON Parse Error after sanitization:", jsonError);
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
    myHeaders.append('access_token', token);
    myHeaders.append('Cookie', 'session_id');

    console.log('token',token);
    console.log('storeurl', storeUrl);
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
     credentials: 'omit',
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

// allocate department price for manager

export const distributeAllocatedAmount = async (categoryName, amount) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
      body: JSON.stringify({
        month: new Date().getMonth() || 12, // Last month; defaults to 12 if month is 0 (January)
        year: new Date().getFullYear(),
        distribution_data: [
          {
            category_name: categoryName,
            amount: amount,
          },
        ],
      }),
    };

    const response = await fetch(`${storeUrl}/api/distribute_allocated_amount`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Distribution success:', data);
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
export const distributeAllocatedAmountVendor = async (VendorName, amount) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    
    const myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload

    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7; // Calculate days until the next Monday

    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday);
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
      credentials: 'omit',
      body: JSON.stringify({
        start_date: startDateFormatted, // Format as "YYYY-MM-DD HH:MM:SS"
        end_date: endDateFormatted,
        vendor_name: VendorName,
        allocated_amount: amount,
      
      }),
    };

    const response = await fetch(`${storeUrl}/api/allocate_vendor_amount`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Distribution success:', data);
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

export const AllocatedBudgetAllVendor = async (amount) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    
    const myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload

    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7; // Calculate days until the next Monday

    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday);
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
      credentials: 'omit',
      body: JSON.stringify({
        start_date: startDateFormatted, // Format as "YYYY-MM-DD HH:MM:SS"
        end_date: endDateFormatted,
        allocated_amount: amount,
      }),
    };
console.log('requestOptions', requestOptions);
    const response = await fetch(`${storeUrl}/api/allocate_amount`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Budget Allocate success:', data);
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
    myHeaders.append('access_token', token);

    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7;

    // Start date: next Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);

    // End date: next Sunday at 23:59:59
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Format dates as YYYY-MM-DD HH:mm:ss
    const startDateFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
    const endDateFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
console.log('startDateFormatted',startDateFormatted);
    const requestUrl = `${storeUrl}/api/get/total_allocation_detail?start_date=${startDateFormatted}&end_date=${endDateFormatted}`;

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
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
    myHeaders.append('access_token', token);

    // Calculate start and end dates for the current week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysSinceMonday = (1 - dayOfWeek + 7) % 7; // Calculate days since the most recent Monday

    // Start date: current Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysSinceMonday);
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
      credentials: 'omit',
    };

    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('Vendor Budget Detail:', data);
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


// create order from manager account

export const createVendorDetailsOrder = async (item) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    myHeaders.append('access_token', token);
    myHeaders.append('Content-Type', 'application/json');

    const body = {
      vendorName: item.vendorName,
      posName: item.posName,
      posDepartment: item.posDepartment,
      barcode: item.barcode,
      posUnitCost: item.posUnitCost,
      invQty: item.qty,
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit',
      body: JSON.stringify(body),
    };
console.log('body:', body);
    const response = await fetch(`${storeUrl}/api/create/vendor_details_order`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();

      console.log(`Order created for ${item.posName}`, responseData); // Log the response data
      return responseData;
    } else {
      console.error('Failed to create order:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating vendor details order:', error);
    return null;
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
    myHeaders.append('access_token', token);
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
      credentials: 'omit',
      body: JSON.stringify(body),
    };

    console.log('Grant Request Body:', body);

    // Perform the API request
    const response = await fetch(`${storeUrl}/api/create/grant_request`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
      console.log('Grant request created successfully:', responseData);
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