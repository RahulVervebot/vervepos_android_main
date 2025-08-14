// src/functions/function.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
// Adjusted fetchManagerDataForRequest function
export const fetchManagerDataForRequest = async (token, url, setData, setLoading) => {
  try {
    const storedtoken = await AsyncStorage.getItem('access_token');
    const storedurl = await AsyncStorage.getItem('storeUrl');
    // const user_id = await AsyncStorage.getItem('uid');
    // if (!user_id) {
    //   console.error('User ID not found in AsyncStorage');
    //   throw new Error('User ID is required');
    // }
  
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

    const response = await fetch(`${storedurl}/api/get_grant_requests`, requestOptions);

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
   //   console.log('Grant Requests:', JSON.stringify(grantRequests, null, 2));
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

export const postApprovalRequest = async (token, url, approvalData, setLoading) => {
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

    const response = await fetch(`${storedurl}/api/approve_grant_request`, requestOptions);

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
    Alert.alert('Error', error.message);
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

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      // //credentials: 'omit',
    };

    // Append month and year as query parameters to the URL
    const response = await fetch(`${storeUrl}/api/get/category_details/`, requestOptions);
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
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: body,
      redirect: 'follow',
      //credentials: 'omit',
    };
   
    const response = await fetch(`${storeUrl}/api/create/category/vendor`, requestOptions);
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
    Alert.alert('Error', error.message);
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

    const response = await fetch(`${storeUrl}/api/vendor_management/alliances`, requestOptions);
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

export const fetchCategoryProducts = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const cagteid = await AsyncStorage.getItem('categoryid');
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
    const response = await fetch(`${storeUrl}/api/product_by_category?categoryId=${cagteid}`, requestOptions);
    const text = await response.text();
    console.log('PO Response Text (raw):', response);
    // Replace both NaN and Infinity with null
    const sanitizedText = text.replace(/\bNaN\b/g, 'null').replace(/\bInfinity\b/g, 'null');

    try {
      const data = JSON.parse(sanitizedText);
    //  console.log('Parsed Response Data:', JSON.stringify(data[0], null, 2));
      const vendorDetails = data.Products || [];
      console.log('Category Product', data.Products);
      console.log('vendorDetails',vendorDetails);
      // Store vendor details in AsyncStorage
      for (let vendor of vendorDetails) {
        const {productName, barcode } = vendor;
        // await AsyncStorage.setItem(`vendor_${id}_details`, JSON.stringify({ 
        //   barcode,
        //   productName,
        // }));
      }

      return vendorDetails;
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

// request extra vendor budget for current week
export const RequestExtraBudget = async (VendorName, amount ,message) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    
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
        start_date: startDateFormatted, // Format as "YYYY-MM-DD HH:MM:SS"
        end_date: endDateFormatted,
        vendor_name: VendorName,
        amount_requested: amount,
        message: message
      
      }),
    };

    const response = await fetch(`${storeUrl}/api/submit_grant_request`, requestOptions);
    if (response.ok) {
      const data = await response.json();
   //   console.log('Request Submitted:', data);
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
// allocate department price for manager

export const distributeAllocatedAmountVendor = async (VendorName, amount) => {

  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    
    const myHeaders = new Headers();
    myHeaders.append('Authorization',  `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json'); // Set content type for JSON payload

    // Calculate start and end dates for the upcoming week (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 6) % 7; // Calculate days until the next Monday

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

export const distributeAllocatedAmountVendorCurrentWeek = async (VendorName, amount) => {
  try {

    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');

    const distributevendorName = await AsyncStorage.getItem('distributevendorName');
    console.log('distributevendorName',VendorName);
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
        start_date: startDateFormatted, // Format as "YYYY-MM-DD HH:MM:SS"
        end_date: endDateFormatted,
        vendor_name: VendorName,
        allocated_amount: amount,
      }),
    };

    const response = await fetch(`${storeUrl}/api/allocate_vendor_amount`, requestOptions);
    const faildreponse = await response.json();
    if (response.ok) {
      const data = await response.json();
      console.log('Distribution success:', data);
      return data;
    } else {
      Alert.alert(faildreponse.message);
      console.error('Failed to distribute allocated amount:', faildreponse.message);
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

export const AllocatedBudgetAllVendorCurrentWeek = async (amount) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    
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
    const requestUrl = `${storeUrl}/api/get/total_allocation_detail?start_date=${startDateFormatted}&end_date=${endDateFormatted}`;

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
    const requestUrl = `${storeUrl}/api/get/total_allocation_detail?start_date=${startDateFormatted}&end_date=${endDateFormatted}`;
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

// order for next week

export const createNextWeekOrder = async (items) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
    const myHeaders = new Headers();
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7;     // Start date: current Monday at 00:00:00
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + daysUntilMonday);
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
      orders: items.map((item) => ({
        vendorName: item.vendorName,
        posName: item.posName,
        posSize: item.posSize,
        posDepartment: item.posDepartment,
        barcode: item.barcode,
        posUnitCost: item.posUnitCost,
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
    const response = await fetch(`${storeUrl}/api/create/vendor_manager_order`, requestOptions);
    const responsetest = await response.json();
    if (response.ok) {
      const responseData = await response.json();
       console.log('invoiceNumber',responseData);
     // console.log(`Order created for ${item.posName}`, responseData); // Log the response data
      return responseData;
    } else {
      console.error('Failed to create order:', responsetest);
      return null;
    }
  } catch (error) {
    console.error('Error creating vendor details order:', error);
    return null;
  }
};
// create order from manager account

export const createVendorDetailsOrder = async (items) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const storeUrl = await AsyncStorage.getItem('storeUrl');
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
console.log('items',items);
    const body = {
      orders: items.map((item) => ({
        vendorName: item.vendorName,
        posName: item.posName,
        posSize: item.posSize,
        posDepartment: item.posDepartment,
        barcode: item.barcode,
        posUnitCost: item.posUnitCost,
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
    //   body: body,
     body: JSON.stringify(body),
    };
console.log('body:', body);
    const response = await fetch(`${storeUrl}/api/create/vendor_manager_order`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
       console.log('invoiceNumber',responseData);
     // console.log(`Order created for ${item.posName}`, responseData); // Log the response data
      return responseData;
    } else {
      console.error('Failed to  Current create order:', response.json());
      return null;
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
      `${storedurl}/api/get/vendor_management_order?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
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
    console.log('Parsed Response Data:', JSON.stringify(data, null, 2));

    if (data.status === 'success') {
      const invoices = data.data.invoices || [];
      console.log('Invoices:', JSON.stringify(invoices, null, 2));
      setData(invoices); // Set the invoices data
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


export const fetchStoreOrder = async (startDate, endDate, setData, setLoading) => {
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
      `${storedurl}/order-management/list?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
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
    setData(data.orders); 
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

// update po for vendor
export const UpdatePOVendor = async (items) => {
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
      orders: items.map((item) => ({
        vendorName: item.vendorName || "",
        posName: item.posName || "",
        posSize: item.posSize || "",
        posDepartment: item.posDepartment || "",
        barcode: item.barcode || "",
        posUnitCost: item.posUnitCost || 0,
        invCaseCost: item.invCaseCost || 0,
        invQty: Number(item.invQty ?? item.qty ?? 0),
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
      method: 'PUT',
      headers: myHeaders,
      redirect: 'follow',
     //maxRedirects: 20,
    // credentials: 'omit',
      body: JSON.stringify(body),
    };

    const url = `${storeUrl}/api/vendor_management_order_line/update/${itemin}`;
    console.log('🌍 Fetching:', url);

    const response = await fetch(url, requestOptions);

    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Success:', responseData);
      return responseData;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to update order:', errorData);
      return null;
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
  console.log('quotationNumber',quotationNumber);
  console.log('dispatchData',dispatchData);
    // Prepare the request body
    const requestBody = {
      quotationNumber: quotationNumber ,
      dispatchData: Array.isArray(dispatchData) ? dispatchData : [dispatchData],
    };

    // Prepare request options
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
     redirect: 'follow',
     credentials: 'omit',
     body: JSON.stringify(requestBody),
    };
    
    console.log('Submitting quotation review with:', requestBody);
    // Construct the full URL
    const url = `${storeUrl}/api/quotation-line-review/`;

    console.log('Request URL:', url);
    // Debug info
 

    // Make the POST request
    const response = await fetch(url, requestOptions);

    // Otherwise, parse directly to JSON
    const data = await response.json();
    
    console.log('Response received:', data);
    return data;

  } catch (error) {
    console.error('Error submitting quotation review:', error);
    return null;
  }
};

export const SubmitDispatch = async (orderid) => {
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


    // Prepare request options
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
     redirect: 'follow',
     credentials: 'omit',
    };
    
    // Construct the full URL
    const url = `${storeUrl}/update-quotation-status/${orderid}/`;

    console.log('Request URL:', orderid);
    // Debug info
 

    // Make the POST request
    const response = await fetch(url, requestOptions);

    // Otherwise, parse directly to JSON
    const data = await response.json();
    
    console.log('Response received:', data);
    return data;

  } catch (error) {
    console.error('Error submitting quotation review:', error);
    return null;
  }
};

export const ReceivedQuotation = async (dispatchData) => {
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
     console.log('dispatchData',dispatchData);
    // Prepare the request body
    const requestBody = {
      dispatchData: Array.isArray(dispatchData) ? dispatchData : [dispatchData],
    };
    // Prepare request options
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
    redirect: 'follow',
   //  credentials: 'omit',
   body: JSON.stringify(requestBody.dispatchData),
  };

    // Construct the full URL
    const url = `${storeUrl}/update-quotation-line/confirm-order/`;

    // Debug info
    console.log('Submitting quotation review with:', requestBody.dispatchData);
    console.log('Request URL:', url);

    // Make the POST request
    const response = await fetch(url, requestOptions);

    // Otherwise, parse directly to JSON
    const data = await response.json();

    console.log('Response received:', data);
    return data;

  } catch (error) {
    console.error('Error submitting quotation review:', error);
    return null;
  }
};

export const OrderProceedStore = async (orderid) => {
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
 
    // Prepare request options
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
    redirect: 'follow',
   //  credentials: 'omit',
  };

    // Construct the full URL
    const url = `${storeUrl}/orders/processed/${orderid}/`;

    // Debug info
    console.log('Request URL:', url);

    // Make the POST request
    const response = await fetch(url, requestOptions);

    // Otherwise, parse directly to JSON
    const data = await response.json();

    console.log('Response received:', data);
    return data;

  } catch (error) {
    console.error('Error submitting quotation review:', error);
    return null;
  }
};