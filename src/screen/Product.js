import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    ActivityIndicator,
    Alert,
    Button,
    RefreshControl,
    Modal,
    ScrollView,
    BackHandler,
    KeyboardAvoidingView,
    useColorScheme,
    Platform,
    Linking,
    PermissionsAndroid
  } from 'react-native';
  import React, { useState, useEffect, useRef} from 'react';
  import { useNavigation } from '@react-navigation/native';
  import { useIsFocused } from '@react-navigation/native';
  import { SafeAreaView } from 'react-navigation';
  import FloatingAddButton from '../components/FloatingAddButton';
  import RNFS from 'react-native-fs';
  import XLSX from 'xlsx';
  import { throttle } from 'lodash';
  // import {useRoute} from '@react-navigation/native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import Dropdown from './Dropdown';
  import ZSDKModule from '../../ZSDKModule.js';
  import DateTimePicker from '@react-native-community/datetimepicker';
  const { DateTime } = require('luxon');
  // import data from '../../APIvariables.json';
  async function ensureBtScanReady() {
  if (Platform.OS !== 'android') return true;

  const api = Platform.Version;
  const wants = api >= 31
    ? ['android.permission.BLUETOOTH_SCAN','android.permission.BLUETOOTH_CONNECT',
       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
       PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  // 1) Check current state
  const checks = await Promise.all(wants.map(p => PermissionsAndroid.check(p)));
  if (checks.every(Boolean)) return true;

  // 2) Request
  const res = await PermissionsAndroid.requestMultiple(wants);

  const granted = wants.every(p => res[p] === PermissionsAndroid.RESULTS.GRANTED);
  if (granted) return true;

  // 3) If user ticked “Don’t ask again”, you won’t see a dialog — open settings
  const blocked = wants.some(p => res[p] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
  if (blocked) {
    // Tell user to enable: Settings → Apps → YourApp → Permissions → Nearby devices + Location
    Linking.openSettings();
  }
  return false;
}


  const Product = ({ route, clicked }) => {

    const colorScheme = useColorScheme(); // This will return either 'light' or 'dark'
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loading_page, setLoading_page] = useState(false);
    const [offset, setOffset] = useState(1);
    const [searchOffset, setSearchOffset] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [typedBarcode, setTypedBarcode] = useState('');
    const [ManualWord, SetmanualWord] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearch, setisSearch] = useState(false);
    const [data, setData] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [categ_select, setCateg_select] = useState('');
    const [SearchKeyword, setSearchKeyword] = useState('');
    const [printList, setPrintList] = useState([]);
    const [showLabel, setShowLabel] = useState(false);
    const isFocused = useIsFocused();
    const [is_Focused, setIsFocused] = useState(false);
    const [AddIpToggle, setAddIpToggle] = useState(false);
    const [categ_id_for_url, setCateg_id_for_url] = useState('')
    const [IpAddress, setIpAddress] = useState('');
    const [inputValue, setInputValue] = useState('1');
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [startDate, setStartDate] = useState(null);  // Initialize with null or default date
    const [endDate, setEndDate] = useState(null);  // Initialize with null or default date
    const [startLuxonDate, setLuxonStartDate] = useState(null);  // Initialize with null or default date
    const [endLuxonDate, setLuxonEndDate] = useState(null);  // Initialize with null or default date
    const [timezone, setTimezone] = useState('America/New_York'); // default value
    const handleClear = () => SetmanualWord('');
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const flatListRef = useRef(null);
    const textInputRef = useRef(null);
    const [printers, setPrinters] = useState([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [buttonTitle, setButtonTitle] = useState('Click to Discover Bluetooth Printers');
    const [discoveredPrintersList, setDiscoveredPrintersList] = useState([]);
    const showStartDatePicker = () => {
      setStartDatePickerVisibility(true);
    };
    const showEndDatePicker = () => {
      setEndDatePickerVisibility(true);
    };
    const onDateChange = (event, selectedDate) => {
      if (isStartDatePickerVisible) {
        setStartDate(selectedDate || startDate);
        setStartDatePickerVisibility(false);
      } else if (isEndDatePickerVisible) {
        setEndDate(selectedDate || endDate);
        setEndDatePickerVisibility(false);
      }
    };

    const fetchResultsForDateRange = async () => {
      try {
        // Retrieve timezone, access token, and store URL from AsyncStorage
        const [timezone, accessToken, storeUrl] = await Promise.all([
          AsyncStorage.getItem('tz'),
          AsyncStorage.getItem('access_token'),
          AsyncStorage.getItem('storeUrl'),
        ]);
  
        if (!accessToken) {
          console.log("No access token available.");
          setNoDataMessage("Access token not available. Please login again.");
          throw new Error("Access token not available.");
        }
  
        if (!storeUrl) {
          Alert.alert("Error", "Store URL not found in storage.");
          throw new Error("Store URL not found.");
        }
  

        // Normalize the timezone value
        let normalizedTimezone = timezone === 'US/Eastern' ? 'America/New_York' : timezone;
  
        // Convert start and end dates to ISO strings using Luxon and the correct timezone
        const inputStartDate = new Date(startDate);
        const luxonStartDateTime = DateTime.fromJSDate(inputStartDate, {
          zone: normalizedTimezone,
        });
        const isoStartString = luxonStartDateTime.toISO();
        setLuxonStartDate(isoStartString);
  
        const inputEndDate = new Date(endDate);
        const luxonEndDateTime = DateTime.fromJSDate(inputEndDate, {
          zone: normalizedTimezone,
        });

        const isoEndString = luxonEndDateTime.toISO();
        setLuxonEndDate(isoEndString);
  
        // Format passStartDate and passEndDate with specific times
        const passStartDate = isoStartString.split('T')[0] + ' 00:00:00';
        const passEndDate = isoEndString.split('T')[0] + ' 23:59:59';
       console.log("passStartDate:",passStartDate);
        // Prepare headers for the API request
        const myHeaders = new Headers();
        myHeaders.append("access_token", accessToken);
        // myHeaders.append('Cookie', 'session_id');

        const requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow',
          credentials: 'omit', // Ensures cookies are not sent
        };
  
        // console.log("storeUrl", storeUrl);
        // console.log("passStartDate", passStartDate);
        // console.log("passEndDate", passEndDate);
        // Make the API request

        const response = await fetch(
          `${storeUrl}/api/track_products?start_date=${passStartDate}&end_date=${passEndDate}`,
          requestOptions
        );

        const result = await response.text();
        // console.log("Result", result);
  
        let parsedResult;
        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          console.error("Failed to parse result:", e);
          alert('Unexpected response format. Please try again.');
          return;
        }
  
        if (Array.isArray(parsedResult)) {
          // console.log("parsedResult", parsedResult);
          const mappedData = parsedResult.map(item => ({
            id: item.product_id,
            name: item.product_name,
            list_price: item.new_price,
            barcode: item.barcode,
            image_256: false,
            to_weight: false,
            pos_categ_id: [null, null],
            uom_po_id: [null, null],
            standard_price: item.new_price,
            size: item.size && item.size !== 'false' && item.size !== 'False' && item.size !== 'N/A' ? item.size : "",
            case_cost: false,
            unit_in_case: false,
            qty_available: 0,
            vendor_name: false,
            vendor_ids: [],
            markup: false,
            sales_count: 0,
            taxes_id: [{ id: 1, name: "NO TAX" }],
            is_ebt_product: false,
            ewic: false,
            otc: false,
          }));
  
          setPrintList(prevPrintList => {
            const newItems = mappedData.filter(
              newItem => !prevPrintList.some(
                existingItem => existingItem.id === newItem.id // or use a different unique property like `barcode`
              )
            );
            return [...prevPrintList, ...newItems];
          });
  
        } else {
          console.error("Unexpected response format: ", result);
          alert('Unexpected response format. Please try again.');
        }
      } catch (error) {
        console.error("Error fetching data: ", error.message);
        alert('An error occurred while fetching data. Please try again.');
      }
    };
  
    const handleClearBarCode = () => {
      setTypedBarcode('');
    };
  
    let Lable = 'SELECT CATEGORY:  ';
  
    // const route = useRoute();
    const numColumns = 2;
    const navigation = useNavigation();
    const keys_to_keep = ['name', 'list_price', 'barcode', 'size'];
    const redux1 = list =>
      list.map(o => Object.fromEntries(keys_to_keep.map(k => [k, o[k]])));
    let newArray = redux1(printList);
    newArray = newArray.map(function (x) {
      x.list_price = '$ ' + x.list_price.toFixed(2);
      return x;
    });
  
    let current_url;
    let current_access_token;
    // console.log(route.params, 'route.params');
  
    AsyncStorage.getItem('access_token')
      .then(access_token => {
        // console.log('access_token : ', access_token);
        current_access_token = access_token;
      })
      .catch(error => {
        alert('some error');
      });
  
    var myHeaders = new Headers();
    myHeaders.append('access_token', current_access_token);
    // myHeaders.append(
    //   'Cookie',
    //   'session_id',
    // );
  
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit', // Ensures cookies are not sent
    };
  
  
    useEffect(() => {
      discoverPrinters();
    }, []);
  
    useEffect(() => {
      let found = printList.some(el => el?.id === route.params?.data?.id);
      let UnknownFound = printList.some(el => el == undefined);
      if (UnknownFound) {
        setPrintList([]);
      }

      if (!found && route.params != undefined) {
        let temp_printlist = [...printList, route.params?.data];
        setPrintList(temp_printlist);
      }
    }, [route.params]);
  
    useEffect(() => {
      setDataSource([]);
      if (isFocused) {
        if (dataSource.length === 0) {
          First_Api_Request();
        }
      }
    }, [isFocused]);
  
    useEffect(() => {
      const clearText = navigation.addListener('focus', () => {
        handleClear('')
        handleClearBarCode('')
      })
      return clearText
    }, [navigation]);
  
    function debounce(func, delay) {
      let timerId;
  
      return function (args) {
        clearTimeout(timerId);
  
        timerId = setTimeout(() => {
          // console.log('deboun : ', args);
          func(args);
        }, delay);
      };
    }

    const handleInputChange = (text) => {
      if (text === '' || /^\d*$/.test(text)) {
        setInputValue(text);
        // console.log("setInputValue", text);
      } else {
        Alert.alert('Error', 'Please enter a valid integer number');
      }
    };
  
    function wrapTextByWords(text, maxLength, maxLines) {
      const words = text.split(/\s+/);
      const lines = [];
      let currentLine = "";
  
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
  
        if (!currentLine) {
          // Start the first word in the line
          currentLine = word;
        } else if ((currentLine + " " + word).length <= maxLength) {
          // It fits in the current line
          currentLine += " " + word;
        } else {
          // Current line is full; push it and start a new one
          lines.push(currentLine);
          currentLine = word;
  
          // If we've reached maxLines, stop adding more lines
          if (lines.length >= maxLines) {
            break;
          }
        }
      }
  
      // After the loop, if there's an unfinished line and we still have space for it, push it
      if (currentLine && lines.length < maxLines) {
        lines.push(currentLine);
      }
  
      return lines.slice(0, maxLines);
    }
  
    function limitTo60Characters(str) {
      if (!str) return "";
  
      // If it's already 60 characters or less, return as-is.
      if (str.length < 60) {
        return str;
      }
      // Split into individual characters (including spaces), 
      // take the first 60, then rejoin
      return str.split("").slice(0, 60).join("") + "...";
    }
    
  
    const printTestLabel = (printer) => {
      // We'll accumulate ALL label ZPL here
      let allZplCommands = "";
                  
      // 1) Loop over each product in printList
      printList.forEach((elem) => {
        // Escape double-quotes in the name
        let escapedProductName = elem.name.replace(/"/g, '^FH^FD22^FH^');
        escapedProductName = limitTo60Characters(escapedProductName);
  
        // 3) Decide if you also want to measure actual character length
        const nameLength = escapedProductName.length;
  
        // Make sure listPrice starts with "$ "
        let listPrice = elem.list_price.toString();
        // console.log("listPrice:", listPrice);
  
        if (!listPrice.includes('$')) {
          listPrice = '$ ' + parseFloat(elem.list_price).toFixed(2);
        } else {
          listPrice = parseFloat(elem.list_price).toFixed(2);
          listPrice = '$ ' + listPrice; // unify format
        }
  
        // Truncate size to max 7 or 8 characters and remove false
        const sizeValue = (elem.size && elem.size !== "false" && elem.size !== false)
        ? elem.size.toString().substring(0, 8)
        : "";
  
        // 4) Decide how to wrap finalName (2 lines if >26 or >50 chars):
        let finalName = "";
        if (nameLength > 50) {
          const lines = wrapTextByWords(escapedProductName, 50, 2);
          finalName = lines.join("\n");
        } else if (nameLength > 26) {
          const lines = wrapTextByWords(escapedProductName, 26, 2);
          finalName = lines.join("\n");
        } else {
          // If <= 26, still wrap at 26 (just in case)
          const lines = wrapTextByWords(escapedProductName, 26, 2);
          finalName = lines.join("\n");
        }
  
        // 5) Build ZPL for this single item
        //    Use += if you want to keep building a larger string
        //    for multiple items
  
        allZplCommands += `
          ^XA
            ^FO5,20
            ^A0,30,40
            ^FB550,2,2,C
            ^FD${finalName}^FS
          
            ^FO60,80
            ^FB480,1,0,C
            ^BY1.7,1,5
            ^BCN,30,N,N,N
            ^FD${elem.barcode}^FS
          
            ^FO20,145
            ^A0,50,60
            ^FB250,1,0,C
            ^FD${sizeValue}^FS
  
            ^FO133,160
            ^A0,60,60
            ^FB550,2,0,C
            ^FD${listPrice}^FS
          
          ^XZ
        `;
  
 
      });
  
      // 6) After building one giant ZPL string for ALL items,
      //    add the "media.type" command if you want:


  const number = parseInt(inputValue) || 1;
      for (let i = 0; i < number; i++) {
        // if (Platform.OS === 'ios') {
        //   // iOS typically uses the friendlyName
        //   ZSDKModule.zsdkWriteBluetooth(printer.name, allZplCommands);
        // } else {
        //   // Android typically uses MAC address
          const mac_sn = printer.name.split(', ');
          const macAddress = mac_sn[0];
          console.log("macAddress:",macAddress);
        //    ZSDKModule.zsdkWriteBluetooth(macAddress, singleZplCommand);
        //   // ZSDKModule.zsdkWriteBluetooth(macAddress, allZplCommands + zplCommand2);
        // }
          console.log('Sending ZPL Command:', allZplCommands);
        ZSDKModule.zsdkWriteBluetooth(macAddress, allZplCommands);
      }
    
             // 7) Now print it `number` times:
      // Reset your quantity if needed
  
      setInputValue('1');
  
      Alert.alert(
        'Print Successful',
        'Do you want to clear the print list?',
        [
          {
            text: 'YES',
            onPress: () => {
              setTimeout(() => {
                setPrintList([]);
                setShowLabel(false);
              }, 1000);
            },
          },
          {
            text: 'NO',
            onPress: () => {
              console.log('NO pressed');
            },
          },
        ],
        { cancelable: false }
      );
    };
  
  
const discoverPrinters = async () => {
        const ok = await ensureBtScanReady();
if (!ok) {
      setPrinters([]);
      setIsDiscovering(true);
      setButtonTitle('Scanning for Zebra Printers ...');
      ZSDKModule.zsdkPrinterDiscoveryBluetooth(
        (error, discoveredPrinters) => {
          setIsDiscovering(false);
          setButtonTitle('Click to Discover Bluetooth Printers');
          console.log("click")
          if (error) {
            console.error(`Error found! ${error}`);
          }

          var printersJson = JSON.parse(discoveredPrinters);
        console.log("printersJson:",discoveredPrinters);
          var printersArray = [];
          if (Platform.OS === 'ios') {
            for (var i = 0; i < printersJson.length; i++) {
              printersArray.push({ id: i, name: `${printersJson[i].friendlyName}` });
            }
          } else {
            for (var i = 0; i < printersJson.length; i++) {
              printersArray.push({ id: i, name: `${printersJson[i].address}, ${printersJson[i].friendlyName}` });
            }
          }
  
          // console.log(printersArray);
          setDiscoveredPrintersList(printersArray);
        }
      );
    }
    };
  
    const Go_clicked = throttle(async () => {
      await AsyncStorage.getItem('storeUrl').then(storeUrl => {
        // console.log('storeUrl : ', storeUrl);
        current_url = storeUrl;
      });
      // console.log(ManualWord, 'ManualWord');
      setLoading_page(true);
  
      fetch(
        `${current_url}/api/search/products?keyword=${ManualWord}&pagesize=${pageSize}&page_no=${searchOffset}${categ_id_for_url}`,
        requestOptions,
      )
        .then(response => response.json())
        .then(data => {
          setPageSize(prev => prev + 10);
  
          setDataSource(data.items);
          setIsLoading(false);
          setLoading_page(false);
        })
        .catch(error => {
          console.log('error', error);
          setIsLoading(false);
          setLoading_page(false);
        });
    }, 2000);
  
    const First_Api_Request = async () => {
      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          // console.log('storeUrl : ', storeUrl);
          current_url = storeUrl;
        })
        .catch(error => {
          alert('some error');
        });
      setLoading_page(true);
  
  
      fetch(
        `${current_url}/api/search/products?pagesize=${pageSize}&page_no=${offset}${categ_id_for_url}`,
        requestOptions,
      )
        .then(response => response.json())
        .then(data => {
          // console.log(data, 'Data ');
          setPageSize(prev => prev + 10);
  
          setDataSource(data.items);
          setIsLoading(false);
          //SetmanualWord('')
          setLoading_page(false);
        })
        .catch(error => {
          console.log('error', error);
          alert('Some Problem in API, Please try later.');
          setIsLoading(false);
          setLoading_page(false);
        });
  
      fetch(`${current_url}/api/categories`, requestOptions)
        .then(response => response.json())
        .then(result => {
          // console.log('categorys', result);
          setData(result);
        })
        .catch(error => {
          alert('Some Problem Fetching Category');
          console.log('error', error);
        });
    };
  
    const exportDataToExcel = () => {
      // console.log('exportDataToExcel');
      // Created Sample data
      //let sample_data_to_export = [{id: '1', name: 'First User'},{ id: '2', name: 'Second User'},{ id: '3', name: 'Third User'}];
      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(newArray);
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      // Write generated excel to Storage
      RNFS.writeFile(
        RNFS.DocumentDirectoryPath + '/Label_file.xlsx',
        wbout,
        'ascii',
      )
        .then(r => {
          console.log('Success');
          alert('File Saved ✅\n name : Label_file.xlsx ');
          setPrintList([]);
          setShowLabel(false);
          // console.log(RNFS.DocumentDirectoryPath);
        })
        .catch(e => {
          console.log('Error', e);
          alert("🙁 Some Error !!! \nCan't save file.");
        });
    };
  
    function isJsonString(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }
  
    let TempIP_Address;
  
    const PrintBarcodeList = async () => {
      try {
        if (!TempIP_Address) {
          Alert.alert('Error', 'Please add a valid IP address first');
          return;
        }
  
        // const isLocalIP = TempIP_Address.includes('192.168.') ||
        //   TempIP_Address.includes('10.0.') ||
        //   TempIP_Address.includes('172.16.') ||
        //   TempIP_Address.includes('localhost') ||
        //   TempIP_Address.includes('127.0.0.1');
  
        // Format and validate the URL
        let url = TempIP_Address;
        // try {
        //   if (!url.startsWith('http://') && !url.startsWith('https://')) {
        //     url = 'http://' + url;
        //   }
        //   new URL(url); // Validate URL format
        // } catch (e) {
        //   Alert.alert('Error', 'Invalid IP address or URL format');
        //   return;
        // }
  
        // Process print requests
        const printCount = parseInt(inputValue) || 1;
        let successCount = 0;
  
        for (let i = 0; i < printCount; i++) {
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              },
              body: JSON.stringify(newArray)
            });
  
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
  
            const result = await response.text();
            const parsedResult = isJsonString(result) ? JSON.parse(result) : null;
  
            if (parsedResult?.operation === 'success') {
              successCount++;
            } else {
              throw new Error('Print operation failed');
            }
  
          } catch (error) {
            Alert.alert('Print error', error.message);
            console.error(`Print attempt ${i + 1} failed:`, error);
            continue;
          }
        }
  
        // Show results
        if (successCount === printCount) {
          Alert.alert(
            'Success',
            'All barcodes printed successfully!',
            [
              {
                text: 'Clear Print List',
                onPress: () => {
                  setPrintList([]);
                  setShowLabel(false);
                }
              },
              { text: 'Keep List', onPress: () => setShowLabel(false) }
            ]
          );
        } else {
          Alert.alert(
            'Partial Success',
            `${successCount} out of ${printCount} prints completed successfully.`
          );
        }
  
      } catch (error) {
        console.error('PrintBarcodeList error:', error);
        Alert.alert('Error', 'Failed to print barcodes. Please try again.');
      }
    };
  
    const checkIP = async () => {
      // console.log("my input value checkip", inputValue);
      await AsyncStorage.getItem('IP_Address')
        .then(IP_Address => {
          // console.log('IP_Address : ', IP_Address);
          TempIP_Address = IP_Address;
        })
        .catch(error => {
          alert('some error', error);
        });
      if (TempIP_Address?.length) {
        // console.log('Print response success')
        PrintBarcodeList();
      } else {
        alert('Please add IP');
      }
    };
  
    const Delete_Selected_Label = label => {
      // console.log(label, 'label');
      const filteredLabel = printList.filter(item => item !== label);
      setPrintList(filteredLabel);
    };
  
    const onSelect = item => {
      setSelectedItem(item);
      setCateg_select(item.id);
      setCateg_id_for_url(`&category_id=${item.id}`)
      const selectedId = `&category_id=${item.id}`
      // console.log(item, 'item');
      reloadCategory(selectedId)
    };
  
    const reloadCategory = async (selectedId) => {
      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          // console.log('storeUrl : ', storeUrl);
          current_url = storeUrl;
        })
        .catch(error => {
          alert('some error');
        });
      setLoading_page(true);
  
  
      fetch(
        `${current_url}/api/search/products?pagesize=${pageSize}&page_no=${offset}${selectedId}`,
        requestOptions,
      )
        .then(response => response.json())
        .then(data => {
          // console.log(data, 'Data ');
          setPageSize(prev => prev + 10);
  
          setDataSource(data.items);
          setIsLoading(false);
          //SetmanualWord('')
          setLoading_page(false);
        })
        .catch(error => {
          console.log('error', error);
          alert('Some Problem in API, Please try later.');
          setIsLoading(false);
          setLoading_page(false);
        });
      fetch(`${current_url}/api/categories`, requestOptions)
        .then(response => response.json())
        .then(result => {
          // console.log(result);
          setData(result);
        })
        .catch(error => {
          alert('Some Problem Fetching Category');
          console.log('error', error);
        });
    };
  
    const RenderItem = ({ item }) => {
      return (
        <SafeAreaView style={styles.mainContainer}>
          <View style={styles.container}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ProductInformation', {
                  barcode: item.barcode,
                  categories: data,
                  setShowLabelOpen: (val) => setShowLabel(val),
                })
              }>
              <View style={styles.priceContainer}>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Image
                  style={styles.logo}
                  source={
                    item.image_128
                      ? { uri: `data:image/png;base64,${item.image_128}` }
                      : require('../.././src/images/NO_IMAGE1.png')
                  }
                  resizeMode="contain"
                />
              </View>
  
              <Text style={styles.txtName}>{item.name}</Text>
              <Text style={styles.txtBarcode}>{item.barcode}</Text>
              <Text style={styles.txtPrice}>
                $ {item.list_price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    };
  
    const loadMore = () => {
      setIsLoading(true);
      if (ManualWord?.length < 1) {
        First_Api_Request();
      } else {
        Go_clicked();
      }
      console.log('Loading more');
    };
  
    const renderFooter = () => {
      return (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={loadMore}
            style={styles.loadMoreBtn}>
            {isLoading ? (
              <View style={styles.indicatorContainer}>
                <ActivityIndicator
                  size="small"
                  color="green"
                  style={{ marginLeft: -8, padding: '3%', marginBottom: '10%' }}
                />
              </View>
            ) : (
              <Text style={styles.btnText}>LOAD MORE</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    };
  
    return (
      <SafeAreaView style={styles.productContainer}>
  
        {/* Search start */}
        <View style={styles.searchContainer}>
          <View
            style={
              clicked ? styles.searchBar__clicked : styles.searchBar__unclicked
            }>
            <Image
              style={styles.image}
              source={require('../.././src/images/icons8-search-100.png')}
            />
            <TextInput
              ref={textInputRef}
              onChangeText={e => SetmanualWord(e)}
              value={ManualWord}
              onClear={handleClear}
              placeholder="SEARCH PRODUCT"
              placeholderTextColor="grey"
              selectionColor="#34a9f1"
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={styles.input}></TextInput>
            <View
              style={{
                flexDirection: 'row',
                marginTop: -50,
                marginHorizontal: 18,
                zIndex: 1,
              }}>
              {/* {is_Focused ? ( */}
              {false ? (
                <TouchableOpacity
                  style={{ marginLeft: -45, position: 'absolute' }}
                  onPress={handleClear}>
                  <Image
                    style={{
                      height: 35,
                      width: 35,
                      margin: 10,
                      marginTop: 8,
                      tintColor: 'grey',
                      zIndex: 1,
                    }}
                    source={require('../.././src/images/icons8-close-64.png')}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{ marginLeft: -40, position: 'absolute', marginTop: 5 }}
                  onPress={() => navigation.navigate('Barcode', { isBarcode: true })}>
                  <Image
                    style={{ ...styles.cameraImage }}
                    source={require('../.././src/images/compact-camera.png')}
                  />
                </TouchableOpacity>
              )}
  
              <TouchableOpacity
                style={{
                  backgroundColor: '#3784fd',
                  position: 'absolute',
                  padding: Platform.OS === 'android' ? 15 : 12,
                  marginTop: Platform.OS === 'android' ? 0 : 4,
                  // paddingRight: 10,
                  // paddingLeft: 10,
                  borderBottomRightRadius: 30,
                  borderTopRightRadius: 30,
                }}
  
                onPress={() => {
                  Go_clicked();
                }
                }
              >
                <Text style={styles.txtSearch}>SEARCH</Text>
              </TouchableOpacity>
            </View>
          </View>
  
        </View>
        {/* search end */}
  
        {/* barcode search  start */}
  
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            alignItems: 'center',
            width: '95%',
            justifyContent: 'space-evenly',
          }}>
          <TextInput
            value={typedBarcode}
            onChangeText={e => {
              setTypedBarcode(e)
            }}
            onClear={handleClearBarCode}
            placeholder="SEARCH BARCODE "
            placeholderTextColor={'#000'}
            style={{
              borderColor: '#adadad',
              borderWidth: 1,
              width: '70%',
              backgroundColor: '#fff',
              padding: '3%',
              borderRadius: 16,
              // marginHorizontal: '2%',
            }}
          />
          {typedBarcode.length ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ProductInformation', {
                  barcode: typedBarcode,
                  categories: data
                })
              }
              style={{
                backgroundColor: '#038c7f',
                padding: '3%',
                borderColor: '#adadad',
                borderWidth: 1,
                borderRadius: 16,
              }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>SEARCH</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (!typedBarcode.length) {
                  alert('Please type barcode to search.');
                }
              }}
              style={{
                backgroundColor: '#adadad',
                padding: '3%',
                borderColor: '#adadad',
                borderWidth: 1,
                borderRadius: 16,
              }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>SEARCH</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* barcode search end */}
  
        {/* Modal start */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showLabel}
          onRequestClose={() => {
            setShowLabel(!showLabel);
          }}>
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
  
              <View style={styles.content}>
                <View>
                  <Text style={{ fontSize: 18, color: '#3784fd', fontWeight: '500' }}>
                    LABELS: {printList.length}
                  </Text>
                </View>
  
                <ScrollView
                  style={{
                    height: '70%',
                    borderColor: '#000',
                    borderWidth: 0,
                    marginHorizontal: '6%',
                    borderRadius: 18,
                    paddingVertical: '2%',
                  }}>
                  {printList?.map(element => (
                    <View
                      style={{
                        alignItems: 'center',
                        borderColor: '#000',
                        backgroundColor: '#fff',
                        borderWidth: 0.2,
                        padding: '3%',
                        margin: '1%',
                        width: '90%',
                        alignSelf: 'center',
                        borderRadius: 15,
                      }}>
                      <Text>{element?.name}</Text>
                      <Text>$ {element?.list_price}</Text>
                      <Text> {element?.size}</Text>
                      <Image
                        style={{ width: '50%', height: 150 }}
                        source={require('../.././src/images/barcodeSample.png')}
                      />
                      <Text>{element?.barcode}</Text>
  
                      <TouchableOpacity
                        onPress={() => Delete_Selected_Label(element)}
                        style={{
                          padding: 10,
                          backgroundColor: '#fff',
                          borderColor: '#ff0000',
                          borderWidth: 0.2,
                          width: '90%',
                          alignItems: 'center',
                          borderRadius: 10,
                          margin: '2%',
                        }}>
                        <Text style={{ color: '#ff0000', fontSize: 16 }}> DELETE </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
  
                <View
                  style={{
                    justifyContent: 'space-around',
                    flexDirection: 'row',
                    marginVertical: '3%', width: '90%', alignSelf: 'center'
                  }}>
                  <TouchableOpacity
                    onPress={() => exportDataToExcel()}
                    style={styles.saveExcelBtn}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '300', textAlign: 'center' }}>
                      SAVE EXCEL{' '}
                    </Text>
                  </TouchableOpacity>
  
                  <TouchableOpacity
                    style={styles.closeBtnStyle}
                    onPress={() => setShowLabel(false)}>
                    <Text style={{ fontSize: 18, color: '#ff0000', fontWeight: '300', textAlign: 'center' }}>
                      CLOSE
                    </Text>
                  </TouchableOpacity>

                </View>
                <View style={styles.printerBtnsView}>
                  <TouchableOpacity
                    onPress={() => checkIP()}
                    style={styles.printButtons} >
                    <Text style={{ padding: '2%', textAlign: 'center', fontSize: 14 }}>PRINT VIA USB</Text>
                  </TouchableOpacity>
 
                  <TouchableOpacity
                    style={styles.printButtons}
                    onPress={() => {
                      if (discoveredPrintersList.length > 0) {
                        const printerButtons = discoveredPrintersList.map(printer => {
                          return { text: printer.name, onPress: () => printTestLabel(printer) };
                        });
                        printerButtons.push({ text: 'CANCEL', onPress: () => console.log('OK pressed') });
                        Alert.alert(
                          'Printers', 'Please select the Printer as shown!',
                          printerButtons, { cancelable: true });
                      } else {
                         discoverPrinters();
                        Alert.alert(
                          'Printers', 'No printers found try again!',
                          [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
                        );
                          
                      }
                    }}>
                    <Text style={{ padding: '1%', textAlign: 'center', fontSize: 14 }}>PRINT VIA BLUETOOTH</Text>
                  </TouchableOpacity>
                </View>
  
                <View style={styles.printerBtnsView}>
                  <TouchableOpacity style={styles.clearPrintListBtn}
                    onPress={() => {
                      Alert.alert('Barcode list',
                        'Do you want to clear the print list!',
                        [{
                          text: 'YES', onPress: () => {
                            setPrintList([])
                            setShowLabel(false)
                          }
                        },
                        { text: 'NO', onPress: () => { console.log('NO pressed') } }
                        ], { cancelable: false })
                    }} >

                    <Text style={{ padding: '2%', textAlign: 'center', fontSize: 14 }}>CLEAR PRINT LIST</Text>

                  </TouchableOpacity>

                  <TextInput style={styles.printQtyTextinput}
                    keyboardType="numeric"
                    onChangeText={handleInputChange}
                    value={inputValue}
                    placeholder="PRINT QTY"
                  />
                </View>
  
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
  
        {/* New Modal for Date Selection */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showDatePickerModal}
          onRequestClose={() => {
            setShowDatePickerModal(false);
          }}>

          <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '80%', padding: 20, backgroundColor: '#f9f9f9', borderRadius: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                Select Date (Price Changes)
              </Text>
  
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 16 }}>Start Date:</Text>
                <TouchableOpacity onPress={showStartDatePicker}>
                  <Text style={{ fontSize: 16, color: startDate ? 'black' : 'grey' }}>
                    {startDate ? startDate.toDateString() : 'Select Start Date'}
                  </Text>
                </TouchableOpacity>
  
              </View>
              {isStartDatePickerVisible && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  style={{ marginLeft: 10 }} // Optional: adjust margin for spacing
                  textColor={colorScheme === 'dark' ? 'white' : 'black'}  // Change text color based on theme
                />
              )}
  
              <View
                style={{
                  borderBottomColor: '#bbb',  // Color of the line
                  borderBottomWidth: 1,        // Thickness of the line
                  marginVertical: 20,          // Optional: Add vertical spacing above and below the line
                }}
              />
  
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 16 }}>End Date:</Text>
                <TouchableOpacity onPress={showEndDatePicker}>
                  <Text style={{ fontSize: 16, color: endDate ? 'black' : 'grey' }}>
                    {endDate ? endDate.toDateString() : 'Select End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
  
              {isEndDatePickerVisible && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  textColor={colorScheme === 'dark' ? 'white' : 'black'}  // Change text color based on theme
                />
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: '#3784fd',
                    borderRadius: 10,
                  }}
                  onPress={() => {
                    fetchResultsForDateRange();
                    setShowDatePickerModal(false);
                  }}>
                  <Text style={{ color: '#fff' }}>GET PRODUCTS</Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: '#ff0000',
                    borderRadius: 10,
                  }}
                  onPress={() => setShowDatePickerModal(false)}>
                  <Text style={{ color: '#fff' }}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Modal end */}

        {AddIpToggle ? (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              alignItems: 'center',
              width: '95%',
              justifyContent: 'space-around',
              marginVertical: '1%',
            }}>
            <TextInput
              defaultValue={IpAddress}
              onChangeText={e => {
                setIpAddress(e);
                // console.log(IpAddress, 'barcode typed');
              }}
              placeholder="TYPE IP:PORT"
              placeholderTextColor={'#adadad'}
              style={{
                borderColor: '#adadad',
                borderWidth: 1,
                width: '70%',
                backgroundColor: '#fff',
                padding: '3%',
                borderRadius: 16,
                marginHorizontal: '2%',
              }}
            />
            {IpAddress.length ? (
              <TouchableOpacity
                onPress={async () => {
                  setIpAddress('');
                  await AsyncStorage.setItem('IP_Address', IpAddress);
                  setAddIpToggle(false);
                  alert('IP Saved');
                }}
                style={{
                  backgroundColor: '#038c7f',
                  padding: '3%',
                  borderColor: '#adadad',
                  borderWidth: 1,
                  borderRadius: 16,
                  width: '18%',
                  alignItems: 'center',
                }}>
                <Text style={{ color: '#fff' }}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (!IpAddress.length) {
                    alert('Please type IP Address.');
                  }
                }}
                style={{
                  backgroundColor: '#adadad',
                  padding: '3%',
                  borderColor: '#adadad',
                  borderWidth: 1,
                  borderRadius: 16,
                  width: '18%',
                  alignItems: 'center',
                }}>
                <Text style={{ color: '#fff' }}>ADD</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
  
        <TouchableOpacity
          onPress={() => {
            setShowLabel(true);
          }}
          style={styles.barCodePrintListBtn}>
          <Text style={{ color: '#3784fd', fontSize: 16, fontWeight: '600' }}>
            BARCODE PRINT LIST
          </Text>
          <Text style={{ color: 'red', fontSize: 16, fontWeight: '400' }}>
            {printList.length}
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          onPress={() => {
            setShowDatePickerModal(true);
          }}
          style={styles.barCodePrintListBtn}>
          <Text style={{ color: '#008080', fontSize: 14, fontWeight: '600' }}>
            GET PRINT LIST BY PRICE CHANGE DATE
          </Text>
        </TouchableOpacity>
  
        <View style={{ justifyContent: 'space-around', flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => {
              setAddIpToggle(!AddIpToggle);
            }}
            style={{
              marginVertical: '2%',
              borderRadius: 10,
              padding: 10,
              backgroundColor: '#fff',
              borderColor: '#ff9d00',
              borderWidth: 0.5,
              marginHorizontal: 2,
              alignItems: 'center',
              width: '40%',
            }}>
            <Text style={{ color: '#ff9d00', fontSize: 16, fontWeight: '600' }}>
              {!AddIpToggle ? 'ADD IP' : 'CLOSE'}
            </Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={() => checkIP()}
            style={styles.printViaUSBBtn}>
            <Text style={styles.printViaUSBText}>PRINT VIA USB</Text>
          </TouchableOpacity>
        </View>
        {/* //Product Page */}
  
        <TouchableOpacity style={styles.printViaBluetoothBtn}
          onPress={() => {
            if (discoveredPrintersList.length > 0) {
              const printerButtons = discoveredPrintersList.map(printer => {
                return { text: printer.name, onPress: () => printTestLabel(printer) };
              });
              printerButtons.push({ text: 'CANCEL', onPress: () => console.log('OK pressed') });
              Alert.alert(
                'Printers', 'Please select the Printer as shown!',
                printerButtons, { cancelable: true });
            } else {
              discoverPrinters();
              Alert.alert(
                'Printers', 'No printer found!',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
              );
            }
          }}>
          <Text style={styles.printViaBluetoothText}>PRINT VIA BLUETOOT</Text>
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: 'lightgrey',
            marginHorizontal: '2%',
            borderRadius: 10, paddingLeft: 10
          }}>
          <Dropdown
            data={data}
            onSelect={onSelect}
            Lable={Lable}
            value={selectedItem}
            isSelectedCategory={true}
          />
        </View>
        {categ_select ?
          <TouchableOpacity
            onPress={() => {
              setSelectedItem('')
              setCateg_select('')
              setCateg_id_for_url('')
            }
            }
            style={{
              backgroundColor: '#ffcccc',
              alignItems: 'center',
              marginHorizontal: '1%',
              borderRadius: 10,
              padding: '2%',
              marginTop: '2%',
              borderColor: '#ff0000',
              borderWidth: 0.5, width: '90%', alignSelf: 'center'
            }}>
            <Text style={{ color: '#ff0000', fontSize: 18 }}>REMOVE CATEGORY</Text>
          </TouchableOpacity> : null}
        {!loading ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator
              size="small"
              color="darkgreen"
              style={{ marginLeft: 2 }}
            />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={styles.flatlistContainer}
            data={dataSource}
            renderItem={({ item }) => <RenderItem item={item} />}
            numColumns={numColumns}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.5}
            keyExtractor={(item, index) => item.id}
            enableEmptySections={true}
            refreshControl={
              <RefreshControl
                refreshing={loading_page}
                onRefresh={() => {
                  setPageSize(10);
                  setDataSource([]);
                  function refresh() {
                    First_Api_Request();
                  }
                  let debouce_refresh = debounce(refresh, 100);
                  debouce_refresh();
                }}
              />
            }
          />
        )}
        <FloatingAddButton />
  
        {loading_page ? (

              <ActivityIndicator
                animating={loading_page}
                size="large"
                color="white"
              />
      
        ) : null}
      </SafeAreaView>
    );
  };
  export default React.memo(Product);
  
  const styles = StyleSheet.create({
    mainContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '45%',
      margin: 10,
      marginTop: 5,
      justifyContent: 'space-evenly',
    },
  
    container: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 10,
      width: '100%',
      shadowColor: '#000',
      elevation: 2,
      borderColor: '#000',
      borderWidth: 0.3,
    },
  
    content: {
      flex: 1,
      justifyContent: 'flex-end', // Adjust according to your layout
      padding: 16,
    },
  
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  
    imageContainer: {
      borderWidth: 0.5,
      borderColor: '#000',
      padding: 2,
    },
  
    txtPrice: {
      color: '#0572b5',
      fontWeight: '800',
      textAlign: 'center',
      margin: '2%'
    },
  
    image: {
      alignItems: 'center',
    },
  
    icon: {
      fontSize: 18,
      color: 'gray',
      paddingLeft: 8,
    },
  
    logo: {
      width: 150,
      height: 150,
      marginTop: 5,
      borderRadius: 10
    },
  
    txtName: {
      textAlign: 'center',
      fontWeight: 'bold',
      marginTop: 10,
      color: 'black',
    },
  
    txtBarcode: {
      textAlign: 'center',
      fontWeight: '400',
      marginTop: 5,
      color: 'black',
    },
  
    productContainer: {
      flex: 1,
    },
  
    searchContainer: {
      flexDirection: 'row',
      width: '95%',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: '2%'
    },
  
    product_Details: {
      width: 20,
      height: 20,
    },
  
    searchBar__unclicked: {
      padding: -10,
      flexDirection: 'row',
      width: '95%',
      margin: 10,
      borderColor: '#34a9f1',
      borderWidth: 1,
      backgroundColor: '#FFF',
      borderRadius: 30,
      alignItems: 'center',
    },
    searchBar__clicked: {
      padding: 10,
      flexDirection: 'row',
      width: '95%',
      backgroundColor: '#000',
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
  
    image: {
      height: 20,
      width: 20,
      margin: 10,
      tintColor: 'grey',
    },
  
    cameraImage: {
      height: 24,
      width: 22,
      margin: 10,
      marginTop: 8,
      tintColor: 'grey',
      zIndex: 1,
    },
  
    input: {
      fontSize: 16,
      // marginLeft: '2%',
      width: '60%',
      color: 'black',
    },
  
    txtSearch: {
      color: '#fff',
      fontWeight: '500',
      fontSize: 15,
    },
  
    indicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
  
    flatlistContainer: {
      marginTop: 10,
    },
  
    centeredView: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      flex: 1,
    },
  
    modalView: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 10,
      shadowColor: '#000',
      width: '80%',
      opacity: 1,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  
    submitBtm: {
      color: '#000',
      fontSize: 18,
      borderRadius: 10,
      padding: 10,
    },
  
    modalText: {
      textAlign: 'center',
      fontSize: 16,
      color: 'grey',
      fontWeight: 'bold',
    },
  
    footer: {
      padding: 5,
      justifyContent: 'space-around',
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: Platform.OS === 'android' ? 0 : 15,
    },
    loadMoreBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '500',
      textAlign: 'center',
      backgroundColor: '#1E90FF',
      padding: '3%',
      borderRadius: 20,
      marginBottom: '10%',
    },
    printButtons: {
      padding: '2%',
      backgroundColor: '#fff',
      borderColor: '#038c7f',
      borderWidth: 0.5,
      borderRadius: 10,
      alignSelf: 'center',
      width: '45%'
    },
    clearPrintListBtn: {
      padding: '2%',
      backgroundColor: '#fff',
      borderColor: '#038c7f',
      borderWidth: 0.5,
      borderRadius: 50,
      alignSelf: 'center',
      width: '45%'
    },
    saveExcelBtn: {
      padding: '3%',
      backgroundColor: '#3784fd',
      borderColor: '#fff',
      borderWidth: 0.5,
      borderRadius: 10,
      width: '45%'
    },
    closeBtnStyle: {
      padding: '3%',
      backgroundColor: '#fff',
      borderColor: '#ff0000',
      borderWidth: 0.5,
      borderRadius: 10, width: '45%'
    },
    printerBtnsView: {
      flexDirection: 'row',
      alignSelf: 'center',
      justifyContent: 'space-evenly',
      width: '90%',
      paddingBottom: 10
    },
    printViaBluetoothBtn: {
      width: '90%',
      borderColor: 'green',
      borderWidth: 0.5,
      borderRadius: 10,
      alignSelf: 'center',
      padding: 10,
      marginBottom: 10
    },
    printViaUSBBtn: {
      marginVertical: '2%',
      borderRadius: 10,
      padding: 10,
      backgroundColor: '#fff',
      borderColor: '#009933',
      borderWidth: 0.5,
      marginHorizontal: 2,
      alignItems: 'center',
      width: '40%',
    },
    printViaUSBText: {
      color: '#009933',
      fontSize: 15,
      fontWeight: '600'
    },
    printViaBluetoothText: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '500',
      color: '#009933'
    },
    barCodePrintListBtn: {
      marginVertical: '2%',
      borderRadius: 10,
      padding: '3%',
      backgroundColor: '#fff',
      borderColor: '#3784fd',
      borderWidth: 0.5,
      marginHorizontal: 2,
      alignSelf: 'center',
      justifyContent: 'space-around',
      flexDirection: 'row',
      width: '90%',
    },
    printQtyTextinput: {
      padding: '2%',
      backgroundColor: '#fff',
      borderColor: '#038c7f',
      borderWidth: 0.5,
      borderRadius: 50,
      textAlign: 'center',
      width: '45%'
    }
  
  });