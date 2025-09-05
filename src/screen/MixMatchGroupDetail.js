import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, TextInput, TouchableOpacity, Modal, Dimensions, Alert, useColorScheme, KeyboardAvoidingView } from 'react-native';
import { Button, Dialog, Portal, Provider, IconButton, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
const { height } = Dimensions.get('window');

const MixMatchGroupDetail = ({ route, navigation }) => {
    const colorScheme = useColorScheme(); // This will return either 'light' or 'dark'
    const { group_id } = route.params;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [isNameChanged, setIsNameChanged] = useState(false);
    const [editNameModalVisible, setEditNameModalVisible] = useState(false);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [discountModalVisible, setDiscountModalVisible] = useState(false);
    const [numProductsToBuy, setNumProductsToBuy] = useState('');
    const [productIds, setProductIds] = useState([]);
    const [productDetails, setProductDetails] = useState([]);
    const [productDetailsLoading, setProductDetailsLoading] = useState(false);
    const [numFreeProducts, setNumFreeProducts] = useState('');
    const [discountProductIds, setDiscountProductIds] = useState([]);
    const [discountProductDetails, setDiscountProductDetails] = useState([]);
    const [salePrice, setSalePrice] = useState('');
    const [isAddFreeProduct, setIsAddFreeProduct] = useState(false);
    const [isDiscountForLessQty, setIsDiscountForLessQty] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [isSaleChanged, setSaleIsChanged] = useState(false);
    const [canSave, setCanSave] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [showUpdateButton, setShowUpdateButton] = useState(false);
    const [newstartDate, setNewStartDate] = useState(new Date());
    const [newendDate, setNewEndDate] = useState(new Date());
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [isDaysModalVisible, setDaysModalVisibility] = useState(false);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [selectedDays, setSelectedDays] = useState({});
    const [selectedDaysNames, setSelectedDaysNames] = useState([]);  // Store the selected days' names
    const [isDateChanged, setIsDateChanged] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [timezone, setTimezone] = useState('America/New_York');
    const [initialState, setInitialState] = useState({
        productIds: [],
        productDetails: [],
        discountProductIds: [],
        discountProductDetails: [],
        numProductsToBuy: '',
        numFreeProducts: '',
        isAddFreeProduct: false,
        isDiscountForLessQty: false,
        isActive: false,
        salePrice: '',
        appliedDays: [],  // Initialize appliedDays as an empty array
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    });

    const [displayedStartDate, setDisplayedStartDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
    const [displayedEndDate, setDisplayedEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
    const [testStartDate, setTestStartDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
    const [testEndDate, setTestEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));

    // First useEffect to fetch the days list
      const ZONE_ALIASES = {
    'US/Eastern': 'America/New_York',
    'US/Central': 'America/Chicago',
    'US/Mountain': 'America/Denver',
    'US/Arizona': 'America/Phoenix',
    'US/Pacific': 'America/Los_Angeles',
    'US/Alaska': 'America/Anchorage',
    'US/Aleutian': 'America/Adak',
    'US/Hawaii': 'Pacific/Honolulu',
    'US/Samoa': 'Pacific/Pago_Pago',
    'US/East-Indiana': 'America/Indiana/Indianapolis'
  };

  const allowedZones = [
  'UTC', 'America/New_York', 'Asia/Kolkata', 'Europe/London',
  'America/Chicago','America/Denver','America/Phoenix',
  'America/Los_Angeles','America/Anchorage','America/Adak',
  'Pacific/Honolulu','Pacific/Pago_Pago','America/Indiana/Indianapolis'
];

const ZONE_OFFSETS = {
  'America/New_York': -4,
  'America/Chicago': -5,
  'America/Denver': -6,
  'America/Phoenix': -7,
  'America/Los_Angeles': -7,
  'America/Anchorage': -8,
  'America/Adak': -9,
  'Pacific/Honolulu': -10,
  'Pacific/Pago_Pago': -11,
  'America/Indiana/Indianapolis': -4,
  'Asia/Kolkata': 5.5,
  'Europe/London': 1,
  'UTC': 0
};

    useEffect(() => {
        let isMounted = true;
        const fetchDaysList = async () => {
            try {
                const storeUrl = await AsyncStorage.getItem('storeUrl');
                const accessToken = await AsyncStorage.getItem('access_token');
                if (!storeUrl || !accessToken) {
                    throw new Error('Missing credentials');
                }
                const myHeaders = new Headers();
                myHeaders.append('access_token', accessToken);
                 myHeaders.append('Cookie', 'session_id');
                const requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow',
                    credentials: 'omit',
                };
                const response = await fetch(`${storeUrl}/get/days_list`, requestOptions);
                const result = await response.json();
                if (response.ok) {
                        setDaysOfWeek(result);
                        console.log('day of week:',result)
                    // console.log("days of week result", result);
                } else {
                 console.error('Failed to fetch days list');
                }
            } catch (error) {
                console.error('Error fetching days list:', error);
            }
        };

        fetchDaysList();
        return () => {
        isMounted = false;
    };

    }, [group_id]); // This only runs when the group_id changes

    function parseValidDateOrDefault(dateStr, fallbackDate) {
        const parsedDate = new Date(dateStr);
        return isNaN(parsedDate.getTime()) ? fallbackDate : parsedDate;
    }

    // Second useEffect to fetch group details, dependent on daysOfWeek
    useEffect(() => {
        let isMounted = true;
        if (daysOfWeek.length === 0) return; // Avoid fetching if daysOfWeek isn't ready

        const fetchData = async () => {
            try {
                const storeUrl = await AsyncStorage.getItem('storeUrl');
                const accessToken = await AsyncStorage.getItem('access_token');
                if (!storeUrl || !accessToken) {
                    throw new Error('Missing credentials');
                }
                const myHeaders = new Headers();
                myHeaders.append('access_token', accessToken);
                // myHeaders.append('Cookie', 'session_id');
                const requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow',
                    credentials: 'omit',
                };

                const response = await fetch(`${storeUrl}/api/get_group_detail/${group_id}`, requestOptions);
                const result = await response.json();
                if (Object.keys(result).length === 0) {
                    alert('Please Go To Home Page And Try Again.');
                } else {
                     console.log("group data result test:", result);
                    const startDate = new Date(result.start_date);
                    const endDate = new Date(result.end_date);
                    setTestStartDate(result.start_date)
                    setTestEndDate(result.end_date)
                    const fetchDetails = async (productId) => {
                        const response = await fetch(`${storeUrl}/api/searchbyid/?id=${productId}`, {
                            method: 'GET',
                            headers: myHeaders,
                            redirect: 'follow',
                            credentials: 'omit',
                        });
                        const result = await response.json();
                        return result.items[0];
                    };
                    const productDetailsPromises = (result.product_ids || []).map(id => fetchDetails(id));
                    const discountProductDetailsPromises = (result.discount_product_ids || []).map(id => fetchDetails(id));
                    const fetchedProductDetails = (await Promise.all(productDetailsPromises)).filter(Boolean);
                    const fetchedDiscountProductDetails = (await Promise.all(discountProductDetailsPromises)).filter(Boolean);
                   
                 if (isMounted) {
                        setData(result);
                        setNewName(result.name);
                        setProductIds(result.product_ids || []);
                        setDiscountProductIds(result.discount_product_ids || []);
                        setProductDetails(fetchedProductDetails);
                        setDiscountProductDetails(fetchedDiscountProductDetails);
                        // Use functional state update to ensure correct state merge
                        setDisplayedStartDate(result.start_date || '');
                        setDisplayedEndDate(result.end_date) || '';
                        setInitialState(prevState => ({
                            ...prevState,
                            productIds: result.product_ids || [],
                            productDetails: fetchedProductDetails,
                            discountProductIds: result.discount_product_ids || [],
                            discountProductDetails: fetchedDiscountProductDetails,
                            numProductsToBuy: result.no_of_products_to_buy,
                            numFreeProducts: result.no_of_free_products,
                            isAddFreeProduct: result.no_of_free_products > 0,
                            isActive: result.status,
                            isDiscountForLessQty: result.applicable_for_single_unit,
                            salePrice: result.sale_price || '',
                            appliedDays: result.days_of_week_ids || [],  // Set appliedDays here
                            startDate: startDate,
                            endDate: endDate,
                        }));
                    }
                        // Map the day IDs to their corresponding names
                        if (Array.isArray(result.days_of_week_ids) && Array.isArray(daysOfWeek)) {
                            const selectedNames = result.days_of_week_ids.map(dayId => {
                                const day = daysOfWeek.find(d => d.id === dayId);
                                return day ? day.name : null;
                            }).filter(name => name !== null);
                            setSelectedDaysNames(selectedNames);
                            console.log("selectedNames:",selectedNames);
                        } else {
                            console.error('days_of_week_ids or daysOfWeek is not an array');
                            setSelectedDaysNames([]); // Set to an empty array if there's an error
                        }
                        setIsAddFreeProduct(result.no_of_free_products > 0);
                        setIsActive(result.status);
                        setIsDiscountForLessQty(result.applicable_for_single_unit);
                        setSalePrice(result.sale_price || '');  // Setting initial salePrice
                }
                setLoading(false);
            } catch (error) {
                if (isMounted) {

                    console.error('Error fetching data:', error);
                    setLoading(false);
                }
            }
        };
        fetchData();
         return () => {
        isMounted = false;
    };
    }, [group_id, daysOfWeek]); // This runs when either group_id or daysOfWeek changes

    useEffect(() => {
        // console.log("appliedDays after state update", initialState.appliedDays);
    }, [initialState.appliedDays]);

    useEffect(() => {

        if (isDaysModalVisible && typeof daysOfWeek === 'object' && Object.keys(daysOfWeek).length > 0 && Array.isArray(initialState.appliedDays)) {
            const initialSelectedDays = Object.keys(daysOfWeek).reduce((acc, key) => {
                const day = daysOfWeek[key];
                acc[day.name] = initialState.appliedDays.includes(day.id);
                return acc;
            }, {});
            setSelectedDays(initialSelectedDays);
        }
    }, [isDaysModalVisible, daysOfWeek, initialState.appliedDays]);

    useEffect(() => {
        let isMounted = true;
        const fetchProductDetails = async () => {
               setProductDetailsLoading(true);
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');
            if (!storeUrl || !accessToken) {
                console.error('Missing credentials');
                setProductDetailsLoading(false);
                return;
            }
            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            const fetchDetails = async (productId) => {
                const response = await fetch(`${storeUrl}/api/searchbyid/?id=${productId}`, {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow',
                    credentials: 'omit',
                });
                console.log("access_token:", accessToken, "response:", response);
                const result = await response.json();
                return result.items[0];
            };
            try {
                const productDetailsPromises = productIds.map(id => fetchDetails(id));
                const discountProductDetailsPromises = discountProductIds.map(id => fetchDetails(id));
                const fetchedProductDetails = await Promise.all(productDetailsPromises);
                const fetchedDiscountProductDetails = await Promise.all(discountProductDetailsPromises);
                    setProductDetails(fetchedProductDetails);
                    setDiscountProductDetails(fetchedDiscountProductDetails);
            } catch (error) {
                    console.error('Error fetching product details:', error);
                
            } finally {
                setProductDetailsLoading(false);
            }
        };
        fetchProductDetails();

    return () => {
        isMounted = false;
    };

    }, [productIds, discountProductIds]);
useEffect(() => {
  const FetchAsyncValueInAwait = async () => {
    try {
      const maybeZone = (await AsyncStorage.getItem('tz')) || 'America/New_York';
      let zoneToUse = ZONE_ALIASES[maybeZone] ?? maybeZone;

      if (!allowedZones.includes(zoneToUse)) {
        console.warn(`"${zoneToUse}" is not in allowed list, falling back to America/New_York.`);
        zoneToUse = 'America/New_York';
      }

      setTimezone(zoneToUse);
    } catch (error) {
      console.log('Error in Getting Cost Price Validation Field', error);
    }
  };

  FetchAsyncValueInAwait();
}, []);
    useEffect(() => {
        // Determine if the user can save changes
        if (isAddFreeProduct && discountProductDetails.length > 0) {
            setCanSave(true);
        } else if (!isAddFreeProduct) {
            setCanSave(true);
        } else {
            setCanSave(false);
        }
    }, [isAddFreeProduct, discountProductDetails]);

    const toggleDay = (dayName) => {
        setSelectedDays(prev => ({
            ...prev,
            [dayName]: !prev[dayName],
        }));
    };

    function formatDateToApi(date, isEndDate = false) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const time = isEndDate ? '23:59:59' : '00:00:00';
        return `${year}-${month}-${day} ${time}`;
    }

    const handleUpdateDays = async () => {
        const newDayIds = Object.keys(selectedDays).filter(dayName => selectedDays[dayName])
        .map(dayName => daysOfWeek.find(day => day.name === dayName)?.id)
        .filter(id => id !== undefined);
        const addedDays = newDayIds.filter(id => !initialState.appliedDays.includes(id));
        const removedDays = initialState.appliedDays.filter(id => !newDayIds.includes(id));
        const formattedStartDate = formatDateToApi(new Date(initialState.startDate));
        const formattedEndDate = formatDateToApi(new Date(initialState.endDate), true);
        try {
            setLoading(true);
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');
            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }
            if (addedDays.length > 0) {
                // console.log("days added");
                const myHeaders = new Headers();
                myHeaders.append('access_token', accessToken);
                myHeaders.append('Content-Type', 'application/json');
                // myHeaders.append('Cookie', 'session_id');
                const requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    redirect: 'follow',
                    credentials: 'omit',
                    body: JSON.stringify({
                        id: group_id,
                        days_ids: addedDays,
                        start_date: `${formattedStartDate}`,
                        end_date: `${formattedEndDate}`,
                    }),
                };
                const response = await fetch(`${storeUrl}/mix_match/days/list`, requestOptions);
                const result = await response.json();
                // console.log("result addedDays API: ", result);
            }
            if (removedDays.length > 0) {
                // console.log("days removed");
                const myHeaders = new Headers();
                myHeaders.append('access_token', accessToken);
                myHeaders.append('Content-Type', 'application/json');
                // myHeaders.append('Cookie', 'session_id');
                const requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    redirect: 'follow',
                    credentials: 'omit',
                    body: JSON.stringify({
                        id: group_id,
                        days_ids: removedDays,
                    }),
                };
                const response = await fetch(`${storeUrl}/remove/mix_match/days/list`, requestOptions);
                const result = await response.json();
                // console.log("result removedDays API: ", result);
            }
            setInitialState(prevState => ({
                ...prevState,
                appliedDays: newDayIds,
            }));
            setSelectedDaysNames(newDayIds.map(id => daysOfWeek.find(day => day.id === id).name));

        } catch (error) {
            console.error('Error updating days:', error);
        } finally {
            setLoading(false);
            hideDaysModal();
        }
    };

    const handleUpdateName = async () => {
        try {
            setLoading(true); // Show loader
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');
            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }
            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            myHeaders.append('Content-Type', 'application/json');
            const requestBody = {
                group_id: group_id,
                name: newName,
                no_of_products_to_buy: initialState.numProductsToBuy,
                no_of_free_products: initialState.numFreeProducts,
                status: isActive,
                product_ids: initialState.productIds,
                discount_product_ids: initialState.discountProductIds,
                sale_price: salePrice ? parseFloat(salePrice) : initialState.salePrice,
                applicable_for_single_unit: isDiscountForLessQty, // Add this line
            };
            console.log("uodate applicable_for_single_unit:", isDiscountForLessQty);
            const requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: JSON.stringify(requestBody),
                redirect: 'follow',
                credentials: 'omit',
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout after 30 seconds

            const response = await fetch(`${storeUrl}/api/update/discount_product_group`, { ...requestOptions, signal: controller.signal });
            clearTimeout(timeoutId);

            const result = await response.json();

            // console.log("Result:", result);

            if (response.ok && result.result && result.result.success) {
                setData(prevData => ({ ...prevData, name: newName }));
                setInitialState({ ...initialState, name: newName });
                setIsNameChanged(false);
                setEditNameModalVisible(false);
                setShowUpdateButton(false); // Hide the Update button
            } else {
                // Handle error response
                console.error('Error updating names:', result);
                alert(result.result.message);
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
                alert('Request timed out. Please try again.');
            } else {
                console.error('Error updating name:', error);
                alert('Error updating name. Please try again.');
            }

        } finally {
            setLoading(false); // Hide loader
        }

    };

    const handleUpdateStatus = async () => {
        try {
            setLoading(true); // Show loader
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            myHeaders.append('Content-Type', 'application/json');

            const requestBody = {
                group_id: group_id,
                name: data.name,
                no_of_products_to_buy: initialState.numProductsToBuy,
                no_of_free_products: initialState.numFreeProducts,
                status: isActive,
                product_ids: initialState.productIds,
                discount_product_ids: initialState.discountProductIds,
                sale_price: salePrice ? parseFloat(salePrice) : initialState.salePrice,
                applicable_for_single_unit: isDiscountForLessQty // Add this line
            };

            const requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: JSON.stringify(requestBody),
                redirect: 'follow',
                credentials: 'omit',
            };
            console.log("status udpate check isDiscountForLessQty:", isDiscountForLessQty);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout after 30 seconds

            const response = await fetch(`${storeUrl}/api/update/discount_product_group`, { ...requestOptions, signal: controller.signal });
            clearTimeout(timeoutId);
            const result = await response.json();
            if (response.ok && result.result && result.result.success) {
                setData(prevData => ({ ...prevData, status: isActive }));
                setInitialState({ ...initialState, isActive });
                setShowUpdateButton(false); // Hide the Update button
                alert(result.result.message);
            } else {
                // Handle error response
                console.error('Error updating status:', result);
                alert(result.result.message);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
            } else {
                console.error('Error updating status:', error);
            }
        } finally {
            setLoading(false); // Hide loader
        }
    };

    const handleUpdateSalePrice = async () => {
        try {
            setLoading(true); // Show loader
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            myHeaders.append('Content-Type', 'application/json');

            const requestBody = {
                group_id: data.id,
                name: data.name,
                no_of_products_to_buy: data.no_of_products_to_buy,
                no_of_free_products: 0,
                status: data.status,
                product_ids: data.product_ids,
                discount_product_ids: [],
                sale_price: parseFloat(salePrice),
                applicable_for_single_unit: isDiscountForLessQty // Add this line
                //  add_discount_on_less_qty_of_sale_price: isDiscjountForLessQty // Add this line

            };

            const requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: JSON.stringify(requestBody),
                redirect: 'follow',
                credentials: 'omit',
            };

            const response = await fetch(`${storeUrl}/api/update/discount_product_group`, requestOptions);
            const result = await response.json();
            console.log("sale price result", result);

            if (response.ok && result.result && result.result.success) {
                const clearDiscountRequestBody = {
                    group_id: data.id,
                    discount_product_ids: discountProductIds // Pass the current discount product IDs
                };

                alert(result.result.message);
            } else {
                console.error('Error updating sale price :', result);
                alert(result.result.message);
            }
        } catch (error) {
            console.error('Error updating sale prices', error);
            alert('Error updating sale prices. Please try again.');
        } finally {
            setLoading(false); // Hide loader
        }
    };

    const handleCloseNameModal = () => {
        if (isNameChanged) {
            setConfirmDialogVisible(true); // Show confirmation dialog
        } else {
            setEditNameModalVisible(false);
        }
    };

    const handleScanProduct = async (barcode) => {
        try {
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');

            const response = await fetch(`${storeUrl}/api/searchbybarcode/products?barcode=${barcode}`, {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
                credentials: 'omit',
            });
            const result = await response.json();
            // console.log("result of discount product scan", result);
            // console.log("length of discount product scan", result.items.length);

            // Check if the items array is empty or doesn't exist
            if (!result.items || result.items.length === 0) {
                alert('Product not found');
                // console.log('No items found in the result:', result);
                return; // Exit the function since there's no product to add
            }

            // Proceed only if there's at least one item
            const scannedProduct = result.items[0];

            if (!scannedProduct) {
                alert('Scanned product is undefined or null');
                // console.log('Scanned product is not valid:', scannedProduct);
                return;
            }

            // Check if the scanned product already exists
            if (productIds.includes(scannedProduct.id)) {
                alert('Product already exists in the list');
                return;
            }

            setProductIds([...productIds, scannedProduct.id]);
            setProductDetails([...productDetails, scannedProduct]);
            setIsChanged(true);
        } catch (error) {
            console.error('Error fetching scanned product data:', error);
        }
    };

    const handleScanDiscountProduct = async (barcode) => {
        try {
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');

            const response = await fetch(`${storeUrl}/api/searchbybarcode/products?barcode=${barcode}`, {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
                credentials: 'omit',
            });
            const result = await response.json();
            // console.log("result of discount product scan", result);
            // console.log("length of discount product scan", result.items.length);

            // Check if the items array is empty or doesn't exist
            if (!result.items || result.items.length === 0) {
                alert('Product not found');
                // console.log('No items found in the result:', result);
                return; // Exit the function since there's no product to add
            }

            // Proceed only if there's at least one item
            const scannedDiscountProduct = result.items[0];

            if (!scannedDiscountProduct) {
                alert('Scanned product is undefined or null');
                // console.log('Scanned product is not valid:', scannedDiscountProduct);
                return;
            }

            // Check if the scanned discount product already exists
            if (discountProductIds.includes(scannedDiscountProduct.id)) {
                alert('Discount product already exists in the list');
                return;
            }

            setDiscountProductIds([...discountProductIds, scannedDiscountProduct.id]);
            setDiscountProductDetails([...discountProductDetails, scannedDiscountProduct]);
            setIsChanged(true);
        } catch (error) {
            console.error('Error fetching scanned discount product data:', error);
        }
    };

    const deleteProduct = (id, isDiscount = false) => {
        // console.log("Delete Product Is Clicked");
        if (isDiscount) {
            setDiscountProductIds(discountProductIds.filter(pid => pid !== id));
            setDiscountProductDetails(discountProductDetails.filter(detail => detail.id !== id));
        } else {
            setProductIds(productIds.filter(pid => pid !== id));
            setProductDetails(productDetails.filter(detail => detail.id !== id));
        }

        setIsChanged(true);
        setCanSave(true); // Ensure canSave is set to true to show the update button
    };

    const handleUpdateProductList = async () => {
        try {
            setLoading(true); // Show loader
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            myHeaders.append('Content-Type', 'application/json');

            const updatedNumProductsToBuy = numProductsToBuy ? parseInt(numProductsToBuy, 10) : initialState.numProductsToBuy;

            const requestBody = {
                group_id: group_id,
                name: data.name, // Keep the existing name
                no_of_products_to_buy: updatedNumProductsToBuy,
                // no_of_free_products: initialState.numFreeProducts,
                applicable_for_single_unit: isDiscountForLessQty,
                status: isActive,
                product_ids: productIds,
                offer_type: "quantity_based_offer",
                // discount_product_ids: initialState.discountProductIds,
                sale_price: salePrice ? parseFloat(salePrice) : initialState.salePrice,
            };

            const requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: JSON.stringify(requestBody),
                redirect: 'follow',
                credentials: 'omit',
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout after 30 seconds
            console.log("requestBody", requestBody);
            // First API call to update group details
            const response = await fetch(`${storeUrl}/api/update/discount_product_group`, { ...requestOptions, signal: controller.signal });
            clearTimeout(timeoutId);

            const result = await response.json();

            console.log("Get Result:", result);

            if (response.ok && result.result && result.result.success) {
                // If group details update is successful, proceed to delete product IDs if needed
                const deletedProductIds = initialState.productIds.filter(id => !productIds.includes(id));

                if (deletedProductIds.length > 0) {
                    alert('List Updated Successfully');
                    setProductModalVisible(false);
                } else {
                    // No product IDs to delete, update the state directly
                    setData(prevData => ({
                        ...prevData,
                        product_ids: productIds,
                        no_of_products_to_buy: updatedNumProductsToBuy,
                    }));
                    setInitialState(prevState => ({
                        ...prevState,
                        productIds,
                        numProductsToBuy: updatedNumProductsToBuy,
                    }));
                    setIsChanged(false);
                    setProductModalVisible(false);
                }
            } else {
                // Handle error response for update API
                console.error('Error updating product list:', result);
                if (result.result && result.result.message) {
                    alert(result.result.message);
                } else {
                    console.log("update product list error", result);
                    alert('Error updating product lists. Please try again.')
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
                alert('Request timed out. Please try again.');
            } else {
                console.error('Error updating product list not fetched:', error);
                alert('Error updating product lists. Please try again.');
            }
        } finally {
            setLoading(false); // Hide loader
        }
    };

    const handleUpdateDiscountProductList = async () => {
        try {
            setLoading(true); // Show loader
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }

            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            myHeaders.append('Content-Type', 'application/json');

            const requestBody = {
                group_id: group_id,
                name: data.name, // Keep the existing name
                no_of_products_to_buy: initialState.numProductsToBuy,
                no_of_free_products: numFreeProducts ? parseInt(numFreeProducts, 10) : initialState.numFreeProducts,
                status: isActive,
                product_ids: initialState.productIds,
                discount_product_ids: discountProductIds,
                sale_price: salePrice ? parseFloat(salePrice) : initialState.salePrice,
                // sale_price: 0,
                applicable_for_single_unit: isDiscountForLessQty, // Add this line
                // add_discount_on_less_qty_of_sale_price: false,
            };

            const requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: JSON.stringify(requestBody),
                redirect: 'follow',
                credentials: 'omit',
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout after 30 seconds

            // First API call to update group details
            const response = await fetch(`${storeUrl}/api/update/discount_product_group`, { ...requestOptions, signal: controller.signal });
            clearTimeout(timeoutId);

            const result = await response.json();

            setSalePrice('');
            // console.log("Result:", result);

            if (response.ok && result.result && JSON.parse(result.result).success) {
                // If group details update is successful, proceed to delete discount product IDs if needed
                const deletedDiscountProductIds = initialState.discountProductIds.filter(id => !discountProductIds.includes(id));

                if (deletedDiscountProductIds.length > 0) {
                    const deleteRequestBody = {
                        group_id: group_id,
                        discount_product_ids: deletedDiscountProductIds,
                    };

                    const deleteRequestOptions = {
                        method: 'PUT',
                        headers: myHeaders,
                        body: JSON.stringify(deleteRequestBody),
                        redirect: 'follow',
                    };

                    const deleteResponse = await fetch(`${storeUrl}/api/delete/discount_product_id`, deleteRequestOptions);
                    const deleteResult = await deleteResponse.json();

                    // console.log("Delete Result:", deleteResult);

                    if (deleteResponse.ok && deleteResult.result && JSON.parse(deleteResult.result).success) {
                        // Update the state only after both APIs succeed
                        setData(prevData => ({
                            ...prevData,
                            discount_product_ids: discountProductIds,
                            no_of_free_products: numFreeProducts ? parseInt(numFreeProducts, 10) : initialState.numFreeProducts,
                        }));
                        setInitialState(prevState => ({
                            ...prevState,
                            discountProductIds,
                            numFreeProducts: numFreeProducts ? parseInt(numFreeProducts, 10) : initialState.numFreeProducts,
                        }));
                        setIsChanged(false);
                        setDiscountModalVisible(false);
                    } else {
                        // Handle error response for delete API
                        console.error('Error deleting discount product IDs:', deleteResult);
                        alert('Error deleting discount product IDs. Please try again.');
                    }
                } else {
                    // No discount product IDs to delete, update the state directly
                    setData(prevData => ({
                        ...prevData,
                        discount_product_ids: discountProductIds,
                        no_of_free_products: numFreeProducts ? parseInt(numFreeProducts, 10) : initialState.numFreeProducts,
                    }));
                    setInitialState(prevState => ({
                        ...prevState,
                        discountProductIds,
                        numFreeProducts: numFreeProducts ? parseInt(numFreeProducts, 10) : initialState.numFreeProducts,
                    }));
                    setIsChanged(false);
                    setDiscountModalVisible(false);
                }
            } else {
                // Handle error response for update API
                console.error('Error updating discount product list:', result);
                alert('Error updating discount product list. Please try again.');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
                alert('Request timed out. Please try again.');
            } else {
                console.error('Error updating discount product list:', error);
                alert('Error updating discount product list. Please try again.');
            }
        } finally {
            setLoading(false); // Hide loader
        }
    };

    const handleCloseModal = (isDiscount = false) => {
        if (isChanged) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to update?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => {
                            // console.log("cancel is pressed Productids and Discountids", initialState.productDetails, initialState.discountProductDetails)
                            // Resetting the changes to initial state
                            if (isDiscount) {
                                setDiscountProductIds(initialState.discountProductIds);
                                setDiscountProductDetails(initialState.discountProductDetails);
                                setNumFreeProducts(initialState.numFreeProducts);
                                setIsAddFreeProduct(initialState.isAddFreeProduct);
                                setDiscountModalVisible(false);
                            } else {
                                setProductIds(initialState.productIds);
                                setProductDetails(initialState.productDetails);
                                setNumProductsToBuy(initialState.numProductsToBuy);
                                setProductModalVisible(false);
                            }
                            setIsChanged(false);
                        },
                        style: 'cancel',
                    },
                    {
                        text: 'Update',
                        onPress: () => {
                            // Save the changes
                            if (isDiscount) {
                                handleUpdateDiscountProductList();
                            } else {
                                handleUpdateProductList();
                            }
                        },
                    },
                ]
            );
        } else {
            if (isDiscount) {
                setDiscountModalVisible(false);
            } else {
                setProductModalVisible(false);
            }
        }
    };

    const handleToggleChange = () => {
        setIsAddFreeProduct(!isAddFreeProduct);
        setCanSave(false);
    };

    const handleStatusToggleChange = () => {
        setIsActive(!isActive);
        setIsChanged(true);
        setShowUpdateButton(initialState.isActive !== !isActive); // Show Update button if state changes
    };

    const handleDiscountForLessQtyToggleChange = () => {
        setIsDiscountForLessQty(!isDiscountForLessQty);
        setSaleIsChanged(true);
    };

    const handleConfirmDialogClose = () => {
        setNewName(initialState.name);
        setIsNameChanged(false);
        setEditNameModalVisible(false);
        setConfirmDialogVisible(false); // Hide confirmation dialog
    };

    const handleConfirmDialogUpdate = async () => {
        await handleUpdateName();
        setEditNameModalVisible(false);
        setConfirmDialogVisible(false); // Hide confirmation dialog
    };

    const formatDateWithTime = (date, time) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} ${time}`;
    };


    const handleConfirmStartDate = (date) => {
       const offset = ZONE_OFFSETS[timezone] ?? 0;
      const localMidnight = new Date(date);
       localMidnight.setHours(0, 0, 0, 0);
  // Adjust backward from UTC to desired local time
     const utcDate = new Date(localMidnight.getTime() - offset * 60 * 60 * 1000);
      const formattedStartDate = formatDateWithTime(date, "00:00:00");
          console.log("date:", date);
        console.log("formattedStartDate:", formattedStartDate);
          console.log("Adjusted localDate:", utcDate);

        setDisplayedStartDate(formattedStartDate);  // Update the displayed start date
        setNewStartDate(formattedStartDate);
        setIsDateChanged(true); // Mark as changed
    };

    const handleConfirmEndDate = (date) => {
          const offset = ZONE_OFFSETS[timezone] ?? 0;
          const localMidnight = new Date(date);
          localMidnight.setHours(0, 0, 0, 0);
        // Adjust backward from UTC to desired local time
         const utcDate = new Date(localMidnight.getTime() - offset * 60 * 60 * 1000);
         const formattedEndDate = formatDateWithTime(date, '23:59:59');
         console.log("formattedEndDate:",formattedEndDate);
            console.log("Adjusted localDate:", utcDate);
        setDisplayedEndDate(formattedEndDate);  // Update the displayed end date
        setNewEndDate(formattedEndDate);
        setIsDateChanged(true); // Mark as changed
    };

    const showDaysModal = () => {
        setDaysModalVisibility(true);
    };

    const hideDaysModal = () => {
        setDaysModalVisibility(false);
    };

    const renderProductDetails = (details) => (
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Name</Text>
                <Text style={styles.tableHeaderCell}>UPC</Text>
                <Text style={styles.tableHeaderCell}>Size</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Cost</Text>
            </View>
            {productDetailsLoading ? (
                <ActivityIndicator size="large" />
            ) : (
                details.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{item.name}</Text>
                        <Text style={styles.tableCell}>{item.barcode}</Text>
                        <Text style={styles.tableCell}>{item.size ? item.size : ''}</Text>
                        <Text style={styles.tableCell}>{item.to_weight ? 'LB' : 'UNIT'}</Text>
                        <Text style={styles.tableCell}>${item.standard_price}</Text>
                    </View>
                ))
            )}
        </View>
    );
    const COLUMN_WIDTHS = {
        actions: 60,
        name: 120,
        upc: 100,
        size: 80,
        type: 70,
        price: 80,
    };

    const renderProductDetailsInModal = (details, isDiscount = false) => (
        <ScrollView horizontal>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <View style={{ width: COLUMN_WIDTHS.actions }}>
                        <Text style={styles.tableHeaderCell}>Actions</Text>
                    </View>
                    <View style={{ width: COLUMN_WIDTHS.name }}>
                        <Text style={styles.tableHeaderCell}>Name</Text>
                    </View>
                    <View style={{ width: COLUMN_WIDTHS.upc }}>
                        <Text style={styles.tableHeaderCell}>UPC</Text>
                    </View>
                    <View style={{ width: COLUMN_WIDTHS.size }}>
                        <Text style={styles.tableHeaderCell}>Size</Text>
                    </View>
                    <View style={{ width: COLUMN_WIDTHS.type }}>
                        <Text style={styles.tableHeaderCell}>Type</Text>
                    </View>
                    <View style={{ width: COLUMN_WIDTHS.price }}>
                        <Text style={styles.tableHeaderCell}>Cost</Text>
                    </View>
                </View>
                {productDetailsLoading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    // details.map((item, index) => (
                    Array.isArray(details) && details.length > 0 ? (
                        details.filter(Boolean).map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={{ width: COLUMN_WIDTHS.actions }}>
                                    <IconButton
                                        icon="delete"
                                        size={20}
                                        onPress={() => {
                                            deleteProduct(item.id, isDiscount);
                                            setIsChanged(true);
                                            setCanSave(true);
                                            // setShowUpdateButton(true); // Show Update button when a product is deleted
                                        }}
                                    />
                                </View>
                                <View style={{ width: COLUMN_WIDTHS.name }}>
                                    <Text style={styles.tableCell}>{item.name}</Text>
                                </View>
                                <View style={{ width: COLUMN_WIDTHS.upc }}>
                                    <Text style={styles.tableCell}>{item.barcode}</Text>
                                </View>
                                <View style={{ width: COLUMN_WIDTHS.size }}>
                                    <Text style={styles.tableCell}>{item.size ? item.size : ''}</Text>
                                </View>
                                <View style={{ width: COLUMN_WIDTHS.type }}>
                                    <Text style={styles.tableCell}>{item.to_weight ? 'LB' : 'UNIT'}</Text>
                                </View>
                                <View style={{ width: COLUMN_WIDTHS.price }}>
                                    <Text style={styles.tableCell}>${item.standard_price}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text>No details</Text>
                    )
                )}

            </View>
        </ScrollView>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.loadingContainer}>
                <Text>No data available</Text>
            </View>
        );
    }

    // Function to render selected days
    const renderSelectedDays = () => {
        return selectedDaysNames.length > 0 ? selectedDaysNames.join(', ') : 'No days selected';
    };

    const handleUpdateDates = async () => {
        try {
            setLoading(true);
            const storeUrl = await AsyncStorage.getItem('storeUrl');
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!storeUrl || !accessToken) {
                throw new Error('Missing credentials');
            }
            // Convert startDate and endDate strings into Date objects for comparison
            const parsedStartDate = new Date(newstartDate);
            const parsedEndDate = new Date(newendDate);

            // Validation: Ensure startDate is not greater than endDate
            if (parsedStartDate > parsedEndDate) {
                alert('Start Date cannot be greater than End Date. Please correct the dates.');
                setLoading(false); // Hide the loader
                return; // Exit the function if validation fails
            }

            console.log("newstartDate:",newstartDate,"newendDate",newendDate);
            const myHeaders = new Headers();
            myHeaders.append('access_token', accessToken);
            // myHeaders.append('Cookie', 'session_id');
            myHeaders.append('Content-Type', 'application/json');

            const requestBody = {
                id: group_id,
                days_ids: initialState.appliedDays, // Assuming appliedDays is an array of selected day IDs
                start_date: newstartDate, // Convert Date object to ISO string
                end_date: newendDate, // Convert Date object to ISO string
            };

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(requestBody),
                redirect: 'follow',
                credentials: 'omit',
            };

            const response = await fetch(`${storeUrl}/mix_match/days/list`, requestOptions);
            const result = await response.json();

            if (response.ok) {
                // Update the initial state with the new startDate and endDate
                setInitialState(prevState => ({
                    ...prevState,
                    startDate: new Date(newstartDate),  // Update with the new start date
                    endDate: new Date(newendDate),      // Update with the new end date
                }));
                // console.log("Dates updated successfully:", result);
                alert('Dates updated successfully!');

            } else {
                console.error('Failed to update dates:', result);
                alert('Failed to update dates. Please try again.');
            }
        } catch (error) {
            console.error('Error updating dates:', error);
            alert('Error updating dates. Please try again.');
        } finally {
            setLoading(false); // Hide the loader
        }
    };

    // const handleChange = (event, selectedDate) => {
    //     // On iOS the widget stays up until you explicitly close it,
    //     // on Android it automatically closes once a date is chosen.

    //     if (event.type === 'set' && selectedDate) {
    //         setStartDate(selectedDate);
    //     }
    // };

    return (
        <Provider>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust if you have a header
            >
                <ScrollView style={styles.container}>
                    <View style={styles.detailContainer}>
                        <View style={styles.header}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>{(data.name)}</Text>
                                <IconButton
                                    icon="pencil"
                                    size={20}
                                    onPress={() => {
                                        setNewName(data.name);
                                        setEditNameModalVisible(true);
                                    }}
                                    style={styles.pencilIcon}
                                />
                            </View>
                            <View style={styles.toggleContainerActive}>
                                <Text style={styles.label}>Active</Text>
                                <Switch
                                    value={isActive}
                                    onValueChange={handleStatusToggleChange}
                                />
                            </View>
                        </View>
                        <Button mode="contained" onPress={handleUpdateStatus}>Update</Button>

                        <View style={styles.datePickerContainer}>
                            <View style={styles.dateInput}>
                               <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: 16 , marginTop: 20,marginBottom:20 }}>
                                 Start Date: {displayedStartDate || 'N/A'}
                                  </Text>
                             <View style={{flexDirection:"row"}}>
                            <Button onPress={() => setShowStartDatePicker(true)} mode="outlined" style={{marginRight:"2%"}}>
                                Select Start Date
                              </Button>
                             </View>
                                  {/* End Date */}
                                  <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: 16, marginTop: 20,marginBottom:20 }}>
                                    End Date: {displayedEndDate || 'N/A'}
                                  </Text>
                                 <View style={{flexDirection:"row"}}>
                               <Button onPress={() => setShowEndDatePicker(true)} mode="outlined" style={{marginRight:"2%"}}>
                                Select End Date
                              </Button>
                              </View>
                              {showStartDatePicker && (
                                <DateTimePicker
                                value={new Date()}
                                    mode="date"
                                    // display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                    onChange={(event, date) => {
                                    setShowStartDatePicker(false);
                                     if (event.type === 'set' && date) {
                                            handleConfirmStartDate(date);
                                        }
                                    }}
                                    themeVariant={colorScheme}              // auto light/dark
                                    textColor={colorScheme === 'dark' ? 'white' : 'black'} // iOS only
                                />
                              )}
                              {showEndDatePicker && (
                                  <DateTimePicker
                                    value={new Date()}
                                    mode="date"
                                    onChange={(event, date) => {
                                   setShowEndDatePicker(false);
                                        if (event.type === 'set' && date) {
                                            handleConfirmEndDate(date);
                                        }
                                    }}
                                    themeVariant={colorScheme}
                                    textColor={colorScheme === 'dark' ? 'white' : 'black'}
                                />
                              )}
                            </View>
                        </View>
                        {isDateChanged && (
                            <Button mode="contained" onPress={handleUpdateDates} style={styles.updateButton}>
                                Update Dates
                            </Button>
                        )}
                        <View style={styles.section}>
                            <Text style={styles.label}>Selected Days:</Text>
                            <Text style={styles.value}>{renderSelectedDays()}</Text>
                     </View>
                        <View>
                            <TouchableOpacity style={styles.touchable} onPress={showDaysModal}>
                                <View style={styles.dateInput}>
                                    <Button
                                        mode="contained"
                                        onPress={showDaysModal} // Open the days selection modal
                                        style={styles.selectDaysButton}
                                    >
                                        Select Days
                                    </Button>
                                </View>
                            </TouchableOpacity>
                            <Modal
                                animationType="slide"
                                transparent={false}
                                visible={isDaysModalVisible}
                                onRequestClose={hideDaysModal}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalTitle}>Select Days</Text>
                                    {Array.isArray(daysOfWeek) ? (
                                        daysOfWeek.map((day) => (
                                            <View key={day.id} style={styles.dayToggleRow}>
                                                <Text style={styles.dayLabel}>{day.name}</Text>
                                                <Switch
                                                    value={selectedDays[day.name] || false}
                                                    onValueChange={() => toggleDay(day.name)}
                                                />
                                            </View>
                                        ))
                                    ) : (
                                        <Text>No days available</Text>
                                    )}

                                    <Button mode="contained" onPress={hideDaysModal} style={styles.modalCloseButton}>
                                        Close
                                    </Button>
                                    <Button mode="contained" onPress={handleUpdateDays} style={styles.modalCloseButton}>
                                        Update Days
                                    </Button>
                                </View>
                            </Modal>
                            {loading && <Text>Loading...</Text>}
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Min. Quantity Customers Will Buy: <Text style={styles.value}>{data.no_of_products_to_buy}</Text></Text>
                            <Text style={styles.label}>Products Detail:</Text>
                            {renderProductDetails(productDetails)}
                            <Button mode="contained" onPress={() => setProductModalVisible(true)}>Add/Edit Products</Button>
                        </View>

                        {!isAddFreeProduct && isSaleChanged && (
                            <Button mode="contained" onPress={handleUpdateSalePrice}>Update Sale Price</Button>
                        )}
                        {isAddFreeProduct ? (
                            <View style={styles.section}>
                                <Text style={styles.label}>Quantity of Free Products To Give: <Text style={styles.value}>{data.no_of_free_products}</Text></Text>
                                <Text style={styles.label}>Discount Products Detail:</Text>
                                {renderProductDetails(discountProductDetails)}
                                <Button mode="contained" onPress={() => setDiscountModalVisible(true)}>Add/Edit Discount Products</Button>
                            </View>
                        ) : (
                            <View style={styles.section}>
                                <Text style={styles.label}>Enter Sale Price: (Currently: {salePrice ? `$${salePrice}` : 'Not set'})</Text>
                                <TextInput
                                    style={styles.input}
                                    value={salePrice}
                                    onChangeText={(value) => { setSalePrice(value); setSaleIsChanged(true); }}
                                    keyboardType="numeric"
                                    placeholder="Enter Sale Price"
                                />
                                <View style={styles.toggleContainer}>
                                    <Text style={styles.label}>Applicable for Single Unit</Text>
                                    <Switch
                                        value={isDiscountForLessQty}
                                        onValueChange={handleDiscountForLessQtyToggleChange}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                    <Portal>
                        <Dialog visible={productModalVisible} onDismiss={() => handleCloseModal(false)} style={{ backgroundColor: '#fff' }}>
                            <Dialog.ScrollArea>
                                <ScrollView style={{ maxHeight: height * 0.7 }}>
                                    <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.textstyle}>PROMOTION PRODUCTS</Text>
                                        <IconButton
                                            icon="close-circle"
                                            size={25}
                                            onPress={() => {
                                                setProductModalVisible(false);
                                            }}
                                            style={styles.closeButton}
                                        />
                                    </View>
                                    {/* <ScrollView> */}
                                    <Text>Enter Min. Quantity Customers Will Buy</Text>
                                    <View style={{ position: 'relative' }}>
                                        {numProductsToBuy === '' && (
                                            <Text
                                                style={{
                                                    position: 'absolute',
                                                    left: 10,
                                                    top: 10,
                                                    color: '#999',
                                                    fontWeight: 'bold',
                                                    zIndex: 1,
                                                }}
                                            >
                                                Current: {data.no_of_products_to_buy}
                                            </Text>
                                        )}
                                        <TextInput
                                            style={[styles.input, { zIndex: 2 }]}
                                            value={numProductsToBuy}
                                            onChangeText={(value) => {
                                                setNumProductsToBuy(value);
                                                setIsChanged(true);
                                                setCanSave(true);
                                            }}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <Button mode="contained" onPress={() => navigation.navigate('BarcodeScannerWithProps', { onBarcodeScanned: handleScanProduct })} style={{ marginTop: "3%" }}>
                                        Scan Product
                                    </Button>
                                    {isChanged && <Button mode="contained" onPress={handleUpdateProductList} style={styles.updateButton}>Update</Button>}
                                    <ScrollView>
                                        {renderProductDetailsInModal(productDetails)}
                                    </ScrollView>
                                </ScrollView>
                            </Dialog.ScrollArea>
                        </Dialog>

                        <Dialog visible={discountModalVisible} onDismiss={() => handleCloseModal(true)}>
                            <Dialog.Title>
                                <View style={styles.dialogTitleContainer}>
                                    <Text>Add Discount Products</Text>
                                    <IconButton
                                        icon="close-circle"
                                        size={20}
                                        onPress={() => handleCloseModal(true)}
                                        style={styles.closeButton}
                                    />
                                </View>
                            </Dialog.Title>
                            <Dialog.ScrollArea>
                                <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                                    <Text>Enter Quantity Of Free Products To Give</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={numFreeProducts}
                                        onChangeText={(value) => {
                                            setNumFreeProducts(value);
                                            setIsChanged(true);
                                            setCanSave(true);
                                        }}
                                        keyboardType="numeric"
                                        placeholder={`Current: ${data.no_of_free_products}`}
                                    />
                                    <Button mode="contained" onPress={() => navigation.navigate('BarcodeScannerWithProps', { onBarcodeScanned: handleScanDiscountProduct })}>
                                        Scan Discount Product
                                    </Button>
                                    {isChanged && <Button mode="contained" onPress={handleUpdateDiscountProductList} style={styles.updateButton}>Update</Button>}
                                    {renderProductDetailsInModal(discountProductDetails, true)}
                                </ScrollView>
                            </Dialog.ScrollArea>
                        </Dialog>

                        <Dialog visible={editNameModalVisible} onDismiss={() => setEditNameModalVisible(false)}>
                            <Dialog.Title>Edit Promotion Name</Dialog.Title>
                            <Dialog.Content>
                                <TextInput
                                    style={styles.input}
                                    value={newName}
                                    onChangeText={(value) => {
                                        setNewName(value);
                                        setIsNameChanged(true);
                                    }}
                                    placeholder={`Current: ${data.name}`}
                                />
                            </Dialog.Content>
                            <Dialog.Actions>
                                {isNameChanged && <Button onPress={handleUpdateName}>Update</Button>}
                                <Button onPress={handleCloseNameModal}>Close</Button>
                            </Dialog.Actions>
                        </Dialog>

                        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
                            <Dialog.Title>Unsaved Changes</Dialog.Title>
                            <Dialog.Content>
                                <Text>You have unsaved changes. Do you want to update?</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={handleConfirmDialogClose}>Cancel</Button>
                                <Button onPress={handleConfirmDialogUpdate}>Update</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </ScrollView>
            </KeyboardAvoidingView>
        </Provider>
    );
};

export default MixMatchGroupDetail;

const styles = StyleSheet.create({
    dialogTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    closeButton: {
        marginRight: -10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pencilIcon: {
        marginLeft: 0,
        marginBottom: height * 0.05, // 5% of the screen height
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 30
    },
    title: {
        width: '60%',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,

    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 0,
    },
    value: {
        fontSize: 16,
        fontWeight: '400',
    },
    section: {
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        width: '100%',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 20,
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 5,
    },
    toggleContainerActive: {
        width: '40%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 40,
        marginRight: 40
    },
    scannedList: {
        marginTop: 10,
    },
    scannedItem: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    tableHeaderCell: {
        flex: 1,
        padding: 10,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    tableCell: {
        flex: 1,
        padding: 10,
    },
    cameraImage: {
        width: 30,
        height: 30,
    },
    updateButton: {
        marginTop: 10, // Add some space above the button
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    dateInput: {
        flex: 1,
        marginRight: 10,
    },
    touchableInput: {
        width: '100%',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    dayToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    dayToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    dayLabel: {
        fontSize: 18,
        flex: 1,
    },
    modalCloseButton: {
        marginTop: 20,
    },
    selectDaysButton: {
        marginTop: 10,
    },
    textstyle: {
        fontWeight: "bold",
        marginTop: "3%",
        fontSize: 20
    }
});
