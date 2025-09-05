import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  Modal,
  Switch,
  useColorScheme,
  Platform
} from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import promoImg from '../images/sale.gif';
import promoGif from '../images/PlainWhite.jpeg';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Dropdown from './Dropdown';
import { styles } from './AppStyles';
import RNPickerSelect from 'react-native-picker-select';
import { color } from 'react-native-reanimated';
import DropdownForCat from './DropdownForCat';
import DateTimePicker from '@react-native-community/datetimepicker';
import AddPromotionModal from '../components/AddPromotionModal';
import AddExpiryModal from '../components/AddExpiryModal';
import UpdateExpiryModal from '../components/UpdateExpiryModal';
const { DateTime, IANAZone } = require('luxon');

const ProductInformation = ({ item }) => {
  const colorScheme = useColorScheme(); // This will return either 'light' or 'dark'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [new_qty, setNew_qty] = useState('0');
  const [new_name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [newStdPrice, setNewStdPrice] = useState('');
  const [caseCost, setCaseCost] = useState('');
  const [unitInCase, setUnitInCase] = useState('');
  const [vendorCode, setvendorCode] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [taxData, setTaxData] = useState([]);
  const [taxItem, setTexItem] = useState('');
  const [taxToggle, setTaxToggle] = useState(false);
  const [Vendordata, setVendorData] = useState([]);
  const [VendorselectedItem, setVendorSelectedItem] = useState('');
  const [VendorToggle, setVendorToggle] = useState(false);
  const [promotionToggle, setPromotionToggle] = useState(false);
  const [imageModal, setImagemodal] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [tempPromotion, setTempPromotion] = useState(false);
  const [fixedAmount, setFixedAmount] = useState('');
  const [no_Of_Product, setNo_Of_Products] = useState('');
  const [productId, setProductId] = useState('');
  const [is_ebt_product, setIs_ebt_product] = useState(false);
  const [is_otc_product, setIs_otc_product] = useState(false);
  const [taxId, setTaxId] = useState([]);
  const [available_in_pos, setAvailable_In_Pos] = useState(true);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const isFocused = useIsFocused();
  const route = useRoute();
  const [isFocusedQty, setIsFocusedQty] = useState(false);
  const [isFocusedCost, setIsFocusedCost] = useState(false);
  const [isFocusedSell, setIsFocusedSell] = useState(false);
  const [imageBase64, setImageBase64] = useState();
  const [loadingPromo, setLoadingPromo] = useState({ add: false, delete: false })
  const navigation = useNavigation();
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [cat, setCat] = useState([])
  const [selectedCategories, setSelectedCategories] = useState("")
  const [selectedProductType, setSelectedProductType] = useState("")
  // const [showCost, setIsShowCost] = useState(null);
  // const [isShowCostLoading, setIsShowCostLoading] = useState(true);
   const [promoVisible, setPromoVisible] = useState(false);
  //for product Expiry date
  const [isShowExpiry, setIsShowExpiry] = useState(false)
  const [productExpireModel, setProductExpireModel] = useState(false)
  const [productExpireDate, setProductExpireDate] = useState(null)
  const [productExpireDay, setProductExpireDay] = useState(false)
  const [productLotNumber, setProductLotNumber] = useState("")
  const [productNote, setProductNote] = useState("")
  const [showProductExpireDate, setShowProductExpireDate] = useState(false)
  const [productExpireModelUpdate, setProductExpireModelUpdate] = useState(false)
  const [productExpireUpdate, setProductExpireUpdate] = useState([])
  const [showProductExpireDateUpdate, setShowProductExpireUpdate] = useState(false)
  const [showDatePickerFor, setShowDatePickerFor] = useState('')
  const [addExpiryVisible, setAddExpiryVisible] = useState(false);
const [updateExpiryVisible, setUpdateExpiryVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  var selectedCategoriesChange = "";

  // State for Date Picker For Promotion Start.
  const [fetchTimeZoneValue, setfetchTimeZoneValue] = useState('');
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


  const [startDateValueString, setStartDateValueString] = useState();
  const [startDateValue, setStartDateValue] = useState(new Date());
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [endDateValueString, setEndDateValueString] = useState();
  const [endDateValue, setEndDateValue] = useState(new Date());
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);


  // State for Date Picker For Promotion Ends. 
  const showStartDatePickerUpdate = () => {
    setStartDatePickerVisibility(true);
  };

  const hideStartDatePickerUpdate = () => {
    setStartDatePickerVisibility(false);
  };

  // Start & End Date Picker States Starts.
  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
  };

const handleStartDateConfirm = (_event, selectedDate) => {
  if (!selectedDate) return;                // dismissed on Android
  convertTimestampToZoneForStartDate(selectedDate.getTime());
  setStartDateValue(selectedDate);          // keep Date object in sync for the picker
  hideStartDatePicker();
};

const handleEndDateConfirm = (_event, selectedDate) => {
  if (!selectedDate) return;
  convertTimestampToZoneForEndDate(selectedDate.getTime());
  setEndDateValue(selectedDate);
  hideEndDatePicker();
};

  const convertTimestampToZoneForStartDate = (ms) => {
    const myStartDateTime = DateTime.fromMillis(ms, { zone: fetchTimeZoneValue }).startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
    // console.log(myStartDateTime, 'myStartDateTime');
    setStartDateValueString(myStartDateTime);     // <-- string in state
    return myStartDateTime;
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false);
  };


  const convertTimestampToZoneForEndDate = (ms) => {
    const myEndDateTime = DateTime.fromMillis(ms, { zone: fetchTimeZoneValue }).endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
    // console.log(myEndDateTime, 'myEndDateTime');
    setEndDateValueString(myEndDateTime);     // <-- string in state
    return myEndDateTime;
  };
  // Start & End Date Picker States Ends

  //For Product Expiry Handler
    const handleProductExpireDateConfirmUpdate = async (date) => {
      const inputDate = new Date(date);
      let timezone = await AsyncStorage.getItem('tz');
      // Convert the JavaScript Date object to a Luxon DateTime in the desired time zone
      const luxonDateTime = DateTime.fromJSDate(inputDate, {
        zone: timezone, //'America/New_York',
      });
      const isoString = luxonDateTime.toISO();
      // console.log("=============nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn=====",isoString.split("T")[0],showDatePickerFor)
      setProductExpireUpdate(prev => prev.map((item) => {
        if (item.expiry_id == showDatePickerFor) {
          return { ...item, ['expiry_date']: isoString.split("T")[0] };
        }
        return item;
      }));
      hideStartDatePickerUpdateExp()
    }
  
    const productExpiryUpdateSetMethode = (e, id, key) => {
      // console.log('productExpiryUpdateSetMethode=============================>>>>>>>>>>>>>',e,id,productExpireUpdate)
      setProductExpireUpdate(prev => prev.map((item) => {
        if (item.expiry_id == id) {
          return { ...item, [key]: e };
        }
        return item;
      }));
    }
  
    const hideStartDatePickerUpdateExp = () => {
      setShowProductExpireUpdate(false)
    }
  
    const showProductExpireDateSelect = () => {
      setShowProductExpireDate(true)
    }
  
    const hideProductExpireDate = () => {
      setShowProductExpireDate(false)
    }
  
    const handleProductExpireDateConfirm = async (date) => {
      const inputDate = new Date(date);
      let timezone = await AsyncStorage.getItem('tz');
      // Convert the JavaScript Date object to a Luxon DateTime in the desired time zone
      const luxonDateTime = DateTime.fromJSDate(inputDate, {
        zone: timezone, //'America/New_York',
      });
  
      // Convert the Luxon DateTime to an ISO string
      const isoString = luxonDateTime.toISO();
      // console.log(isoString.split("T")[0],'inputDate')
  
      // console.log(isoString, 'isoString');
      setProductExpireDate(isoString);
      hideProductExpireDate();
    }
  
    const haldlerProductExprire = async () => {
      setProductExpireModel(false);
      setLoading(true);
      let current_url;
      let current_access_token;
      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          current_url = storeUrl;
        })
        .catch(error => {
          alert('some error');
          setLoading(false);
        });
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          current_access_token = access_token;
        })
        .catch(error => {
          alert('some error');
        });
      const payload = {
        data: [
          {
            product_id: selectedItem.items[0].id,
            lot_number: productLotNumber,
            expiry_date: productExpireDate.split("T")?.[0],     // YYYY-MM-DD is fine for Odoo
            alert_before: productExpireDay,
            note: productNote,
          },
        ],
      };
  
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: current_access_token,   // works the same without new Headers()
        },
        body: JSON.stringify(payload),          // <── key line
        redirect: 'follow',
        credentials: 'omit',                    // omit cookies
      };
  
      // console.log('Product Expiry data=====================>', requestOptions.body, current_url,payload);
      fetch(`${current_url}/api/product_expiry/add`, requestOptions)
        .then(r => {
          if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
          return r.json();
        })
        .then(result => {
          // console.log('Expiry add →', result);
          alert(result.result.success ? 'Added Successfully' : result.result.error);
          setProductExpireModel(false);
          setShowButton(true)
          setLoading(false);
        })
        .catch(err => {
          console.error('Expiry add error →', err);
          setProductExpireModel(false);
          setLoading(false);
        });
    }
  
    const haldlerProductExprireUpdate = async (id) => {
      setProductExpireModelUpdate(false);
      setLoading(true);
      let current_url;
      let current_access_token;
      let selectedItemPro = productExpireUpdate.filter(e => e.expiry_id == id)?.[0]
      // console.log('selectedItemPro=====================>',selectedItemPro)
      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          current_url = storeUrl;
        })
        .catch(error => {
          alert('some error');
          setLoading(false);
        });
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          current_access_token = access_token;
        })
        .catch(error => {
          alert('some error');
        });
      const payload = {
        data: {
          product_id: selectedItem.items[0].id,
          expiry_line_id: id,
          expiry_date: selectedItemPro.expiry_date.split('T')[0],
          alert_before: selectedItemPro.alert_before,
          note: selectedItemPro.note,
        },
      };

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: current_access_token,   // works the same without new Headers()
        },
        body: JSON.stringify(payload),          // <── key line
        redirect: 'follow',
        credentials: 'omit',                    // omit cookies
      };
  
      // console.log('Product Expiry data Update=====================>', requestOptions.body, current_url,payload,id);
      fetch(`${current_url}/api/product_expiry/update`, requestOptions)
        .then(r => {
          if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
          return r.json();
        })
        .then(result => {
          // console.log('Expiry Update→', result);
          alert(result.result.success ? 'Update Successfully' : result.result.error);
          setProductExpireModelUpdate(false);
          setShowButton(true)
          setLoading(false);
        })
        .catch(err => {
          console.error('Expiry add error →', err);
          setProductExpireModelUpdate(false);
          setLoading(false);
        });
    }
  const handleExpiryAdded = () => {
  setShowButton(true);      // your existing flag
  // optionally refresh expiry list from server
};


    const handleDeleteProductExpire = async (id) => {
      setProductExpireModelUpdate(false);
      setLoading(true);
      let current_url;
      let current_access_token;
      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          current_url = storeUrl;
        })
        .catch(error => {
          alert('some error');
          setLoading(false);
        });
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          current_access_token = access_token;
        })
        .catch(error => {
          alert('some error');
        });
      const payload = {
        data: {
          expiry_line_id: id
        }
      };
  
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: current_access_token,   // works the same without new Headers()
        },
        body: JSON.stringify(payload),          // <── key line
        redirect: 'follow',
        credentials: 'omit',                    // omit cookies
      };
  
      // console.log('Product Expiry data Delete=====================>', requestOptions.body, current_url,payload,id);
      fetch(`${current_url}/api/product_expiry/delete`, requestOptions)
        .then(r => {
          if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
          return r.json();
        })
        .then(result => {
          // console.log('Expiry add →deleteteteeeeeeeeeeee', result);
          alert(result.result.success ? 'Delete Successfully' : result.result.error);
          setProductExpireModelUpdate(false);
          setShowButton(true)
          setLoading(false);
        })
        .catch(err => {
          console.error('Expiry add error →', err);
          setProductExpireModelUpdate(false);
          setLoading(false);
        });
    }

useEffect(() => {
  if (!fetchTimeZoneValue) return;

  const zone = fetchTimeZoneValue;
  const startdatepromo = selectedItem?.promotions?.[0]?.start_date?.split(' ')[0];
  const enddatepromo   = selectedItem?.promotions?.[0]?.end_date?.split(' ')[0];

  const todayStartStr = DateTime.now().setZone(zone).startOf('day').toFormat('yyyy-MM-dd HH:mm:ss');
  const todayEndStr   = DateTime.now().setZone(zone).endOf('day').toFormat('yyyy-MM-dd HH:mm:ss');

  const startStr = startdatepromo ? `${startdatepromo} 00:00:00` : todayStartStr;
  const endStr   = enddatepromo   ? `${enddatepromo} 23:59:59` : todayEndStr;

  setStartDateValueString(startStr);
  setEndDateValueString(endStr);

  // keep the RN pickers in sync (Date objects)
  const startDt = DateTime.fromFormat(startStr, 'yyyy-MM-dd HH:mm:ss', { zone: zone });
  const endDt   = DateTime.fromFormat(endStr,   'yyyy-MM-dd HH:mm:ss', { zone: zone });
  if (startDt.isValid) setStartDateValue(startDt.toJSDate());
  if (endDt.isValid)   setEndDateValue(endDt.toJSDate());
}, [fetchTimeZoneValue, selectedItem]);


  const showAlert = () =>
    Alert.alert('Alert', 'Product Not Found', [
      {
        text: 'Add Now',
        onPress: () => navigation.replace((name = 'AddProduct')),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => navigation.navigate((name = 'Product')),
        style: 'default',
      },
    ]);

  const onFocus = inputType => {
    if (inputType === 'qty') {
      setIsFocusedQty(true);
    } else if (inputType === 'cost') {
      setIsFocusedCost(true);
    } else if (inputType === 'sell') {
      setIsFocusedSell(true);
    }
  };

  const onBlur = inputType => {
    if (inputType === 'qty') {
      setIsFocusedQty(false);
    } else if (inputType === 'cost') {
      setIsFocusedCost(false);
    } else if (inputType === 'sell') {
      setIsFocusedSell(false);
    }
  };

  const { barcode, categories, } = route.params;
  let api_counter = 0;
  let api_counter_rv_last_digit = 0;
  let current_url;
  let TempPrice;
  let current_access_token;

  useEffect(() => {
      let isMounted = true;
    // console.log("useeffect : ", selectedItem)
    if (selectedItem && selectedItem.items[0]?.pos_categ_id[1]) {
      const initialCategoryId = selectedItem.items[0]?.pos_categ_id[1];
      // console.log("useeffect 2 : ", initialCategoryId)
      if (isMounted) {
      setSelectedCategories(initialCategoryId);
      }
      // if(cat){
      //   let tempCat = cat
      //   let tempCatObj = tempCat.filter(e=>e.name==initialCategoryId)
      //   tempCatObj
      // }
    }
          if (isMounted) {

    if (selectedItem && selectedItem.items[0]?.hasOwnProperty("to_weight")) {
      const initialproductType = selectedItem.items[0]?.to_weight ? "lb" : "Unit";
      // console.log("useeffect 2 : ", initialproductType)
      setSelectedProductType(initialproductType);
    }
  }
      // 🧼 Cleanup
  return () => {
    isMounted = false;
  };
  }, [selectedItem]);

  useEffect(() => {
    const FetchAsyncValueInAwait = async () => {
       let isMounted = true;
      try {

        // 1️⃣ get the Zone from AsyncStorage (or use a default value)
        const maybeZone = (await AsyncStorage.getItem('tz')) || 'America/New_York';
        // 2️⃣ translate alias → IANA if needed
        let zone = ZONE_ALIASES[maybeZone] ?? maybeZone;
        // 3️⃣ guard against truly invalid zones
        if (!IANAZone.isValidZone(zone)) {
          console.warn(`"${zone}" is not a valid IANA zone, falling back to UTC.`);
          zone = 'America/New_York';
        }
    if (isMounted) {
        setfetchTimeZoneValue(zone);

        const isShowCostPrice = await AsyncStorage.getItem('is_show_cost_price');
        // setIsShowCost(isShowCostPrice == 'true');
        // setIsShowCostLoading(false);
    }
      } catch (error) {

        console.log('Error in Getting Cost Price Validation Field', error);
        // if (isMounted) {
        // setIsShowCost(false);
        // setIsShowCostLoading(false);
        // }
      }
    };

    FetchAsyncValueInAwait();

    const fetchProductExpireDate = async () => {
      try {
        const isShowEx = await AsyncStorage.getItem('is_show_expiry_date');
        // console.log("isShowEx=========================>",isShowEx)
        setIsShowExpiry(isShowEx == 'true');
      } catch (error) {
        console.log('Error in Getting Expiry Date Validation Field', error);
        setIsShowExpiry(false);
      }
    }
    fetchProductExpireDate()


    if (isFocused) {
      if (route.params.barcode) {
        getProductDetail();
        let CategoryList = categories
        CategoryList?.map(e => {
          e.checked = false
          return { ...e }
        })
        setCat(CategoryList)
        // console.log('testdata>', CategoryList)
      } else {
        Alert('No barcode for this product found');
        setLoading(false);
        navigation.navigate('Product');
      }
    }
  return () => {
        isMounted = false;
    };
  }, []);

  const DeletePromotion = async () => {
    // console.log("DeletePromotion : ", selectedItem?.promotions)
    let Id = selectedItem?.promotions[0].product_id
    let current_url;
    let current_access_token;
    setLoadingPromo(prev => ({ ...prev, delete: true }))
    await AsyncStorage.getItem('storeUrl').then(storeUrl => {
      // console.log('storeUrl : ', storeUrl);
      current_url = storeUrl;
    }).catch(error => {
      alert('some error');
    });
    await AsyncStorage.getItem('access_token')
      .then(access_token => {
        // console.log('access_token : ', access_token);
        current_access_token = access_token;
      }).catch(error => {
        alert('some error');
      });
    var myHeaders = new Headers();

    myHeaders.append('access_token', current_access_token);
    // myHeaders.append(
    //   'Cookie',
    //   'session_id',
    // );
    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit', // Ensures cookies are not sent
    };


    fetch(`${current_url}/api/delete/promotion?product_id=${Id}`, requestOptions)
      .then(response => response.text())
      .then(result => {
        // console.log(result)
        let jasonText = isJsonString(result)
        setLoadingPromo(prev => ({ ...prev, delete: false }));
        if (jasonText) {
          alert(JSON.parse(result).message)
          getProductDetail()
          setShowButton(true)
        } else {
          alert("Some error")
        }
      })
      .catch(error => {
        console.log('error', error)
        setLoadingPromo(prev => ({ ...prev, delete: false }));
      })
      .finaly(() => {
        setLoadingPromo(prev => ({ ...prev, delete: false }));
      })
  }

  function isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  const getProductDetail = async (newBarcode = barcode) => {
    // newBarcode = newBarcode.startsWith("00") ? newBarcode.substring(1) : newBarcode;

    await AsyncStorage.getItem('storeUrl')
      .then(storeUrl => {
        // console.log('storeUrl : ', storeUrl);
        current_url = storeUrl;
      })
      .catch(error => {
        alert('some error');
      });

    await AsyncStorage.getItem('access_token')
      .then(access_token => {
        // console.log('access_token : ', access_token);
        current_access_token = access_token;
      })
      .catch(error => {
        alert('some error');
      });

    await AsyncStorage.getItem('is_promotion_accessible')
      .then(is_promotion_accessible => {
        // console.log('is_promotion_accessible : ', is_promotion_accessible);
        setTempPromotion(is_promotion_accessible);
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

    // console.log('Barcode:', newBarcode);
    // console.log(current_access_token, myHeaders, 'current_access_token');


    let product_details = '';

    fetch(`${current_url}/api/vendorlist`, requestOptions)
      .then(response => response.json())
      .then(result => {
        // console.log('vendor list', result);
        const data = result.map((item) => {
          return { ...item, checked: false }
        })
        // console.log("vendor list data after map", data);
        setVendorData(data);
      })
      .catch(error => {
        alert('Some Problem Fetching Vendor list');
        // console.log('error', error);
      });

    fetch(`${current_url}/api/categories`, requestOptions)
      .then(response => response.json())
      .then(result => {
        // console.log('categorys', result);
        setCat(result);
      })
      .catch(error => {
        alert('Some Problem Fetching Category');
        console.log('error', error);
      });

    // taxes api
    fetch(`${current_url}/api/taxes`, requestOptions)
      .then(response => response.json())
      .then(result => {
        // console.log(result, 'tax');
        const data = result.map((item) => {
          return { ...item, checked: false }
        })
        setTaxData(data);
      })
      .catch(error => {
        alert('Some Problem Fetching Taxes');
        console.log('error', error);
      });

    fetch(
      `${current_url}/api/searchbybarcode/products?barcode=${newBarcode}`,
      requestOptions,
    )
      .then(response => response.text())
      .then(result => {
        // console.log(result, 'result product details');
        if (JSON.parse(result).items?.length > 0) {
          api_counter = 0;
          api_counter_rv_last_digit = 0;
          let parsedResult = JSON.parse(result);
          if (
            parsedResult &&
            parsedResult.items &&
            parsedResult.items?.length > 0
          ) {
            setSelectedItem(parsedResult);
            console.log('parsedResult:',parsedResult);
            // console.log('Promotions[0]?.start_date', parsedResult?.promotions[0]?.start_date ?? null)
            // console.log('Promotions[0]?.end_date', parsedResult?.promotions[0]?.end_date ?? null)

            TempPrice = parsedResult;

            if (TempPrice) {
              // console.log(TempPrice, 'TempPrice Product Details');
              // console.log(TempPrice?.items[0]?.otc, 'OTC VALUE Details');
              setImageBase64(TempPrice.items[0].image_256);
              setNewStdPrice(TempPrice.items[0].standard_price);
              setPrice(TempPrice.items[0].list_price);
              setName(TempPrice.items[0].name);
              setNew_qty(TempPrice.items[0].size);
              setCaseCost(TempPrice.items[0].case_cost);
              setUnitInCase(TempPrice.items[0].unit_in_case);
              setvendorCode(TempPrice?.items[0]?.vendor_ids ?? []);
              setVendorSelectedItem(TempPrice?.items[0]?.vendor_name[1] ?? '');
              setFixedAmount(TempPrice?.promotions[0]?.fix_amount ?? '');
              setNo_Of_Products(TempPrice?.promotions[0]?.no_of_products ?? '');
              setStartDate(TempPrice?.promotions[0]?.start_date ?? null);
              setEndDate(TempPrice?.promotions[0]?.end_date ?? null);
              setProductId(TempPrice?.items[0]?.id ?? '');
              setTaxId(TempPrice?.items[0]?.taxes_id ?? []);
              setIs_ebt_product(TempPrice?.items[0]?.is_ebt_product ?? false);
              setIs_otc_product(TempPrice?.items[0]?.otc ?? false);
              setAvailable_In_Pos(TempPrice?.items[0]?.available_in_pos ?? true)
              setStartDateValueString(parsedResult?.promotions[0]?.start_date ?? null)
              setEndDateValueString(parsedResult?.promotions[0]?.end_date ?? null)
              setProductExpireUpdate(TempPrice?.items[0]?.expiry_details ?? [])
              // setIs_OTC(TempPrice.items[0].otc ?? false);
              // setIs_Ewick(TempPrice?.items[0]?.ewic ?? false);
            }
            product_details = parsedResult;
            navigation.navigate('ProductInformation', { barcode: newBarcode });
            setLoading(false);
          } else {
            showAlert();
            setLoading(false);
          }
        } else {
          if (api_counter < 2) {
            let barcode2 = newBarcode.slice(1, barcode?.length);
            getProductDetail(barcode2);
            api_counter++;
          } else {
            if (api_counter_rv_last_digit < 1) {
              api_counter_rv_last_digit++;
              let barcode2 = barcode.slice(0, barcode?.length - 1);
              getProductDetail(barcode2);
            } else {
              api_counter = 0;
              alert('Barcode ' + barcode + ' Not Found');
              navigation.navigate('Product');
            }
          }
        }
      })
      .catch(error => {
        console.log('error', error);
        alert('error occurred in API.');
        setLoading(false);
        navigation.navigate('Product');
      });
  };

  const priceUpdate = async () => {
    setLoading(true);
    await AsyncStorage.getItem('storeUrl')
      .then(storeUrl => {
        current_url = storeUrl;
      })
      .catch(error => {
        alert('some error');
        setLoading(false);
      });

    await AsyncStorage.getItem('access_token')
      .then(access_token => {
        current_access_token = access_token;
      })
      .catch(error => {
        alert('some error');
        setLoading(false);
      });

    if (!price) {
      alert('Invalid Price');
      setLoading(false);
      return;  // Exit the function if the price is invalid
    }

    var myHeaders_update = new Headers();
    myHeaders_update.append('access_token', current_access_token);
    // myHeaders_update.append('Cookie', 'session_id');

    var requestOptions_update = {
      method: 'PUT',
      headers: myHeaders_update,
      redirect: 'follow',
      credentials: 'omit',
    };

    // First, handle image update separately if the image has changed
    if (imageBase64 != selectedItem.items[0].image_256 && imageBase64 != undefined) {
      let image_update_url = `${current_url}/api/update/product?id=${parseInt(selectedItem.items[0].id)}&image=${imageBase64}`;
      await fetch(image_update_url, requestOptions_update)
        .then(response => response.text())
        .then(result => {
          const parsedResult = JSON.parse(result);
          if (parsedResult.message) {
            alert(parsedResult.message);
          } else {
            throw new Error('Image update failed');
          }
        })
        .catch(error => {
          setLoading(false);
          console.log("imageupdate error======================>", error)
          alert('Something went wrong with the image update!');
          return;  // Exit the function if the image update fails
        });
    }

    // Now, handle the rest of the updates
    let update_api_url = `${current_url}/api/update/product?id=${parseInt(selectedItem.items[0].id)}`;

    if (price != selectedItem.items[0].list_price) {
      update_api_url += `&new_price=${price}`;
    }
    if (newStdPrice != selectedItem.items[0].standard_price) {
      update_api_url += `&new_std_price=${newStdPrice}`;
    }
    if (new_name != selectedItem.items[0].name) {
      update_api_url += `&new_name=${new_name}`;
    }
    if (new_qty != selectedItem.items[0].size) {
      update_api_url += `&size=${new_qty}`;
    }
    if (caseCost != selectedItem.items[0].case_cost) {
      update_api_url += `&case_cost=${caseCost}`;
    }
    if (unitInCase != selectedItem.items[0].unit_in_case) {
      update_api_url += `&unit_in_case=${unitInCase}`;
    }

    if (selectedCategories != selectedItem.items[0].pos_categ_id[1]) {
      let cat_id = cat.filter(e => e.name == selectedCategories)[0];
      let id = cat_id.id;
      update_api_url += `&categ_id=${id}`;
    }

    if (selectedProductType != "") {
      let productType = selectedProductType == "Unit" ? false : true;
      update_api_url += `&to_weight=${productType}`;
    }

    if (vendorCode != selectedItem.items[0].vendor_name) {
      const vendorIds = vendorCode.map((vendor) => {
        if (isObject(vendor)) {
          return vendor.id;
        }
        return vendor;
      });
      update_api_url += `&vendorcode=${vendorIds}`;
    }

    if (taxId != selectedItem.items[0].taxes_id[0]) {
      const selectedTaxIds = taxData
        .filter(tax => tax.checked)
        .map(tax => tax.id);
      update_api_url += `&taxes_id=${selectedTaxIds.join(",")}`;
    }

    if (quantity != 0) {
      update_api_url += `&new_qty=${quantity}`;
    }
    if (is_ebt_product != selectedItem?.items[0]?.is_ebt_product) {
      update_api_url += `&is_ebt_product=${is_ebt_product}`;
    }
    if (is_otc_product != selectedItem?.items[0]?.otc) {
      update_api_url += `&otc=${is_otc_product}`;
    }
    if (available_in_pos != selectedItem?.items[0]?.available_in_pos) {
      update_api_url += `&available_in_pos=${available_in_pos}`;
    }

    await fetch(update_api_url, requestOptions_update)
      .then(response => response.text())
      .then(result => {
        alert(JSON.parse(result).message);
        setShowButton(false);
        setLoading(false);
        navigation.navigate('Product');
      })
      .catch(error => {
        setLoading(false);
        alert('Something went wrong with the update!');
      });
  };

  const isObject = (val) => {
    if (val === null) { return false; }
    return ((typeof val === 'function') || (typeof val === 'object'));
  }

  const onVendorSelect = useCallback((item, index, data,) => {
    let updateVendorData = data;
    // updateVendorData[index].checked = !updateVendorData[index].checked;
    updateVendorData.map(e => {
      if (e.id == item.id) {
        // console.log("onVendorSelect :>>  ",e.id,item.id,!e.checked)
        e.checked = !e.checked
      }
    })
    setVendorData(updateVendorData);
    const updateVendorDatas = updateVendorData.filter((item) => {
      return item.checked
    }).map((selectedVendor) => selectedVendor.id)
    setVendorSelectedItem(updateVendorData[index]);
    setvendorCode(updateVendorDatas);
    if (selectedItem && item.id !== selectedItem.items[0].id[0]) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [selectedItem]);

  const onTaxSelect = useCallback((item, index) => {
    let updatedTaxData = taxData
    updatedTaxData[index].checked = !updatedTaxData[index].checked
    setTaxData(updatedTaxData)
    setTexItem(taxData[index]);
    const updateTaxIds = updatedTaxData.filter((item) => {
      return item.checked
    }).map((selectedTax) => selectedTax.id)
    setTaxId(updateTaxIds);
    if (item.id != selectedItem.items[0].taxes_id[0]) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [taxId, taxData, taxItem, showButton]);

  const handleCaseCostChange = (event, newPrice) => {
    setCaseCost(newPrice);
    if (newPrice != selectedItem.items[0].case_cost) {
      let tempStdPrice = newPrice / unitInCase;
      handleStdPriceChange(event, tempStdPrice.toFixed(2));
      setShowButton(true);
    } else {
      setShowButton(false);
      let tempStdPrice = newPrice / unitInCase;
      handleStdPriceChange(event, tempStdPrice.toFixed(2));
    }
  };

  const handleUnitInCaseChange = (event, newPrice) => {
    setUnitInCase(newPrice);
    if (newPrice != selectedItem.items[0].unit_in_case) {
      let tempStdPrice = caseCost / newPrice;
      handleStdPriceChange(event, tempStdPrice.toFixed(2));
      setShowButton(true);
    } else {
      setShowButton(false);
      let tempStdPrice = caseCost / newPrice;
      handleStdPriceChange(event, tempStdPrice.toFixed(2));
    }
  };

  const onCategoriesSelect = (item, index, data) => {
    if (item && item != "undefined") {
      setSelectedCategories(item.name)
      setShowButton(true);
    }
  }

  const onProductTypeSelect = (item) => {
    let name = item === true ? 'lb' : 'Unit';
    setSelectedProductType(name);
    setShowButton(true);
    setModalVisible(false); // close modal
  };

  const handlePriceChange = (event, newPrice) => {
    setPrice(newPrice);
    if (newPrice != selectedItem.items[0].list_price) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const handleQtyChange = (event, newAddQty) => {
    setNew_qty(newAddQty);

    if (newAddQty != selectedItem.items[0].size) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const handleNew_quantity_Change = (event, newAddQty) => {
    setQuantity(newAddQty);
    if (newAddQty != 0) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const handleNameChange = (event, name) => {
    setName(name);
    if (name != selectedItem.items[0].name) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const handleImageChangeFromGallary = () => {
    //Module is creating tmp images which are going to be cleaned up automatically
    ImagePicker.clean()
      .then(() => {
        // console.log('removed all tmp images from tmp directory');
      })
      .catch(e => {
        alert(e);
      });
    //Call single image picker with cropping
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      includeBase64: true,
      cropping: true,
      forceJpg: true,
      freeStyleCropEnabled: true,
      compressImageQuality: 0.8, // Compress image with quality (from 0 to 1, where 1 is best quality).
    }).then(image => {
      let tempDecode = encodeURIComponent(image.data);
      setImageBase64(tempDecode);
      setImagemodal(false);
      if (image.data != selectedItem.items[0].image_256) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    });
  };

  const handleImageChangeFromCamera = () => {
    //Module is creating tmp images which are going to be cleaned up automatically
    ImagePicker.clean()
      .then(() => {
        // console.log('removed all tmp images from tmp directory');
      })
      .catch(e => {
        alert(e);
      });
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      includeBase64: true,
      cropping: true,
      forceJpg: true,
      freeStyleCropEnabled: true,
      compressImageQuality: 0.8, // Compress image with quality (from 0 to 1, where 1 is best quality).
    }).then(image => {
      let tempDecode = encodeURIComponent(image.data);
      setImageBase64(tempDecode);
      setImagemodal(false);
      if (image.data != selectedItem.items[0].image_256) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    });
  };

  const onToggle_EBT = value => {
    // console.log(is_ebt_product, value, 'is_ebt_product');
    setIs_ebt_product(value);
    if (value != selectedItem?.items[0]?.is_ebt_product) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const onToggle_OTC = value => {
    // console.log(is_ebt_product, value, 'is_ebt_product');
    setIs_otc_product(value);
    if (value != selectedItem?.items[0]?.otc) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const handleStdPriceChange = (event, newStdPrice) => {
    setNewStdPrice(newStdPrice);
    if (newStdPrice != selectedItem.items[0].standard_price) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };



  const onToggleSwitch_Is_In_POS = (value) => {
    setAvailable_In_Pos(value);
    if (value != selectedItem?.items[0]?.available_in_pos) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  let LableVendor = 'VENDOR NAME: ';
  let LableTax = 'TAX: ';
  return (
    <KeyboardAvoidingView style={{ backgroundColor: '#fff', flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ backgroundColor: '#fff', flex: 1 }}>
        <SafeAreaView style={styles.centeredView}>
          {/* LOADING CODE */}
          {isLoading ? (
            <View style={styles.activityIndicator}>
              <ActivityIndicator
                style={{ width: '100%', height: '2%', marginTop: '30%' }}
                size="large"
                color="#228B22"
              />
              <Text style={styles.btnText}>LOADING..</Text>
            </View>
          ) : (
            <View style={styles.modelContainer}>
              {selectedItem && selectedItem.items && selectedItem.items?.length > 0 && (

                <View style={styles.modalView}>

                  {/* TouchableOpacity Save Details Confirmation If Anything Changed Below */}
                  <TouchableOpacity
                    onPress={() => {
                      if (showButton) {
                        Alert.alert(
                          'PRODUCT DETAILS',
                          'PLEASE SAVE YOYR PRODUCT DETAILS FIRST!',
                          [
                            {
                              text: 'CANCEL',
                              onPress: () =>
                                navigation.goBack({ data: { key: 'value' } }),
                            },
                            {
                              text: 'OK',
                              onPress: () => console.log('OK Pressed'),
                            },
                          ],
                          { cancelable: false },
                        );
                      } else {
                        navigation.goBack({ data: { key: 'value' } });
                      }
                    }}>
                    <Text style={styles.closeButton}>❌</Text>
                  </TouchableOpacity>

                  {/* Image Code To Show Image From Product Details and to Edit Image */}
                  <View style={{ alignItems: 'center', marginTop: 5 }}>
                    {imageBase64 ? (
                      <Image
                        style={{
                          width: Platform.OS === 'android' ? 150 : 160,
                          height: Platform.OS === 'android' ? 150 : 160,
                          borderRadius: 20,
                        }}
                        source={
                          imageBase64
                            ? {
                              uri: `data:image/png;base64,${imageBase64}`,
                            }
                            : require('../.././src/images/NO_IMAGE1.png')
                        }
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        style={{
                          width: Platform.OS === 'android' ? 150 : 160,
                          height: Platform.OS === 'android' ? 150 : 160,
                          borderRadius: 20,
                        }}
                        source={
                          selectedItem.items[0]?.image_256
                            ? {
                              uri: `data:image/png;base64,${selectedItem.items[0]?.image_256}`,
                            }
                            : require('../.././src/images/NO_IMAGE1.png')
                        }
                        resizeMode="contain"
                      />
                    )}
                    <TouchableOpacity
                      style={{
                        alignItems: 'center',
                        marginHorizontal: '10%',
                        marginVertical: '1%',
                        borderColor: '#fff',
                        borderWidth: 0.5,
                        padding: '2%',
                        borderRadius: 10,
                        backgroundColor: '#d1e2ff',
                        width: '40%',
                      }}
                      onPress={() => {
                        setImagemodal(true);
                      }}>
                      <Text>EDIT IMAGE</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Photo From GALLERY Selection Code */}
                  <Modal
                    animationType="slide"
                    transparent={false}
                    visible={imageModal}>
                    <View style={{ justifyContent: 'center' }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 23,
                          color: '#000',
                          alignSelf: 'center',
                          marginTop: '50%',
                        }}>
                        CHOOSE & SELECT PHOTO
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                          marginTop: '10%',
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            handleImageChangeFromCamera();
                          }}
                          style={{
                            width: '40%',
                            aspectRatio: 1,
                            borderColor: '#d1e2ff',
                            borderWidth: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 20,
                            backgroundColor: '#d1e2ff',
                          }}>
                          <Text
                            style={{
                              textAlign: 'center',
                              fontSize: 18,
                              color: '#000',
                            }}>
                            CAMERA
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            handleImageChangeFromGallary();
                          }}
                          style={{
                            width: '40%',
                            aspectRatio: 1,
                            borderColor: '#d9ffd1',
                            borderWidth: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 20,
                            backgroundColor: '#d9ffd1',
                          }}>
                          <Text
                            style={{
                              textAlign: 'center',
                              fontSize: 18,
                              color: '#000',
                            }}>
                            GALLERY
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setImagemodal(false);
                        }}
                        style={{
                          alignItems: 'center',
                          marginHorizontal: '20%',
                          marginVertical: '5%',
                          borderColor: '#fff',
                          borderWidth: 0.5,
                          padding: '2%',
                          borderRadius: 20,
                          backgroundColor: '#ffc4c4',
                        }}>
                        <Text
                          style={{
                            fontSize: 20,
                            color: '#ff0000',
                            fontWeight: '400',
                            padding: 8,
                          }}>
                          CANCEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Modal>

                  {/* Name Change Text Input Code */}
                  <TextInput
                    onChangeText={name => {
                      const event = { nativeEvent: { text: name } };
                      handleNameChange(event, name);
                    }}
                    style={styles.textName}>
                    {selectedItem.items[0]?.name}
                  </TextInput>

                  {/* Text To Show Barcode  */}
                  <Text style={styles.textBarcode}>
                    {selectedItem.items[0].barcode}{' '}
                  </Text>

                  {/* Product Details Like Price Cost ETC. */}
                  <View style={styles.horizontalLine} />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>

                    {/* {console.log("cast======================================",selectedItem.items)} */}
                    <View>
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        SIZE
                      </Text>
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        SELL PRICE (USD)
                      </Text>

                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        COST PRICE (USD)
                      </Text>

                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        CASE COST
                      </Text>

                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        UNIT IN CASE
                      </Text>

                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        UPDATE STOCK
                      </Text>

                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        CATEGORY
                      </Text>
{(selectedItem?.items[0]?.margin > 0 || selectedItem?.items[0]?.markup > 0) && (
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        MARGIN
                      </Text>
)}
{(selectedItem?.items[0]?.product_markup > 0) && (
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        MARKUP
                      </Text>
)}
                 {(selectedItem?.items[0]?.cpmargin > 0) && (
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        CP MARGIN
                      </Text>
                    )} 
                  <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        PRODUCT TYPE
                      </Text>
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        SALES COUNT
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.textColon}>:</Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      {(selectedItem?.items[0]?.product_markup > 0) && (
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        :
                      </Text>
)}
                  {(selectedItem?.items[0]?.cpmargin > 0) && (
                      <Text style={{ ...styles.textStyle, marginTop: 15 }}>
                        :
                      </Text>
)}
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                      <Text style={{ ...styles.textColon, marginTop: 15 }}>
                        :
                      </Text>
                    </View>

                    <View>
                      <TextInput
                        editable={true}
                        maxLength={8}
                        onChangeText={newPrice => {
                          const event = { nativeEvent: { text: newPrice } };
                          handleQtyChange(event, newPrice);
                        }}
                        style={[
                          styles.textInputPrice,
                          { marginTop: Platform.OS === 'android' ? 10 : 12 },
                          isFocusedSell ? styles.focused : styles.blurred,
                        ]}
                        onFocus={() => onFocus('sell')}
                        onBlur={() => onBlur('sell')}>
                        {selectedItem.items[0].size}
                      </TextInput>
                      <TextInput
                        editable={true}
                        keyboardType="numeric"
                        returnKeyType="done"
                        maxLength={8}
                        onChangeText={newPrice => {
                          const event = { nativeEvent: { text: newPrice } };
                          handlePriceChange(event, newPrice);
                        }}
                        style={[
                          styles.textInputPrice,
                          { marginTop: Platform.OS === 'android' ? 10 : 12 },
                          isFocusedSell ? styles.focused : styles.blurred,
                        ]}
                        onFocus={() => onFocus('sell')}
                        onBlur={() => onBlur('sell')}>
                        {selectedItem.items[0].list_price}
                      </TextInput>

                      {/* COST PRICE Value Field */}

                      <TextInput
                        defaultValue={newStdPrice.toString()}
                        editable={true}
                        keyboardType="numeric"
                        maxLength={8}
                        onChangeText={newPrice => {
                          const event = { nativeEvent: { text: newPrice } };
                          handleStdPriceChange(event, newPrice);
                        }}
                        style={[
                          styles.textInputPrice,
                          { marginTop: Platform.OS === 'android' ? 10 : 12 },
                          isFocusedSell ? styles.focused : styles.blurred,
                        ]}
                        onFocus={() => onFocus('sell')}
                        onBlur={() => onBlur('sell')}
                      />


                      {/* CASE COST PRICE Value Field */}

                      <TextInput
                        style={[
                          styles.textInputPrice,
                          { marginTop: Platform.OS === 'android' ? 10 : 12 },
                          isFocusedSell ? styles.focused : styles.blurred,
                        ]}
                        onChangeText={newPrice => {
                          const event = { nativeEvent: { text: newPrice } };
                          handleCaseCostChange(event, newPrice);
                        }}
                        onFocus={() => onFocus('sell')}
                        onBlur={() => onBlur('sell')}>
                        {selectedItem?.items[0]?.case_cost}
                      </TextInput>

                      {/* Unit In Case */}

                      <TextInput
                        style={[
                          styles.textInputPrice,
                          { marginTop: Platform.OS === 'android' ? 10 : 12 },
                          isFocusedSell ? styles.focused : styles.blurred,
                        ]}
                        onChangeText={newPrice => {
                          const event = { nativeEvent: { text: newPrice } };
                          handleUnitInCaseChange(event, newPrice);
                        }}
                        onFocus={() => onFocus('sell')}
                        onBlur={() => onBlur('sell')}>
                        {selectedItem?.items[0]?.unit_in_case}
                      </TextInput>

                      {/* Stock */}
                      <TextInput
                        placeholderTextColor="grey"
                        placeholder={selectedItem?.items[0]?.qty_available.toString()}
                        style={[
                          styles.textInputPrice,
                          { marginTop: Platform.OS === 'android' ? 10 : 12 },
                          isFocusedSell ? styles.focused : styles.blurred,
                        ]}
                        onChangeText={newPrice => {
                          const event = { nativeEvent: { text: newPrice } };
                          handleNew_quantity_Change(event, newPrice);
                        }}
                        onFocus={() => onFocus('sell')}
                        onBlur={() => onBlur('sell')}>
                      </TextInput>

                      <View style={{ width: 130, position: 'relative' }}>
                        <Text
                          editable={false}
                          ellipsizeMode="tail"
                          numberOfLines={1}
                          style={[
                            styles.textInputPrice,
                            { marginTop: Platform.OS === 'android' ? 10 : 12 },
                            {
                              color: '#000',
                              width: '100%',
                              textAlign: 'center',
                              marginRight: -10,
                            },
                          ]}>
                          {selectedCategories}
                        </Text>
                        <View
                          style={{
                            padding: 10,
                            borderColor: 'grey',
                            borderRadius: 8,
                            width: '100%',
                            height: 30,
                            marginLeft: 10,
                            marginTop: 10,
                            marginRight: -10,
                            position: 'absolute',
                          }}>
                          <DropdownForCat
                            data={cat}
                            onSelect={onCategoriesSelect}
                            Lable={LableVendor}
                            isToggle={true}
                            value={selectedCategories}
                            multiSelection={true}
                          />
                        </View>
                      </View>
{/* MARGIN */}
{(selectedItem?.items[0]?.margin > 0 || selectedItem?.items[0]?.markup > 0) && (
  <TextInput
    editable={false}
    style={[
      styles.textInputPrice,
      { marginTop: Platform.OS === 'android' ? 10 : 12 },
      { color: '#000' },
    ]}
    onFocus={() => onFocus('sell')}
    onBlur={() => onBlur('sell')}
    value={
      selectedItem?.items[0]?.margin != null
        ? String(selectedItem.items[0].margin)
        : String(selectedItem.items[0].markup)
    }
  />
)}

{/* MARKUP */}
{selectedItem?.items[0]?.product_markup > 0 && (
  <TextInput
    editable={false}
    style={[
      styles.textInputPrice,
      { marginTop: Platform.OS === 'android' ? 10 : 12 },
      { color: '#000' },
    ]}
    onFocus={() => onFocus('sell')}
    onBlur={() => onBlur('sell')}
    value={String(selectedItem.items[0].product_markup)}
  />
)}

{/* CPMARGIN */}
{selectedItem?.items[0]?.cpmargin > 0 && (
  <TextInput
    editable={false}
    style={[
      styles.textInputPrice,
      { marginTop: Platform.OS === 'android' ? 10 : 12 },
      { color: '#000' },
    ]}
    onFocus={() => onFocus('sell')}
    onBlur={() => onBlur('sell')}
    value={String(selectedItem.items[0].cpmargin)}
  />
)}

  


      <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 130,
      }}>
      {/* Display current selection */}
      {/* Trigger Modal */}
      <TouchableOpacity
        style={styles.textInputPrice}
        onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#000', textAlign: 'center' }}>
          {selectedProductType}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Type</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => onProductTypeSelect(false)}>
              <Text style={styles.modalText}>Unit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => onProductTypeSelect(true)}>
              <Text style={styles.modalText}>lb</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: '#ddd' }]}
              onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalText, { color: 'red' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>

                      <TextInput
                        editable={false}
                        style={[
                          styles.textInputPrice,
                          { marginTop: Platform.OS === 'android' ? 10 : 12 },
                          { color: '#000' },
                        ]}
                        onFocus={() => onFocus('sell')}
                        onBlur={() => onBlur('sell')}>
                        {selectedItem?.items[0]?.sales_count}
                      </TextInput>
                    </View>

                  </View>

                  {/* EBT Toggle Code */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      borderColor: 'grey',
                      // backgroundColor: '#fff',
                      borderWidth: 0.5,
                      alignSelf: 'center',
                      alignItems: 'center',
                      padding: '1%',
                      borderRadius: 15,
                      marginVertical: '1%',
                      width: '85%',
                      marginTop: '2%',
                    }}>
                    <Text style={{ margin: '2%', fontSize: 18 }}>
                      EBT PRODUCT
                    </Text>
                    <Switch
                      color="#6495ed"
                      ios_backgroundColor="#3e3e3e"
                      value={is_ebt_product}
                      onValueChange={e => onToggle_EBT(e)}
                    />
                  </View>

                  {/* OTC Toggle Code */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      borderColor: 'grey',
                      // backgroundColor: '#fff',
                      borderWidth: 0.5,
                      alignSelf: 'center',
                      alignItems: 'center',
                      padding: '1%',
                      borderRadius: 15,
                      marginVertical: '1%',
                      width: '85%',
                      marginTop: '2%',
                    }}>
                    <Text style={{ margin: '2%', fontSize: 18 }}>
                      OTC PRODUCT
                    </Text>
                    <Switch
                      color="#6495ed"
                      ios_backgroundColor="#3e3e3e"
                      value={is_otc_product} //CHANGE VALUE HERE TO OTC
                      onValueChange={e => onToggle_OTC(e)}
                    />
                  </View>

                  {/* Available In POS Toggle Code */}
                  <View style={styles.EbtButtons}>
                    <Text style={{ margin: '2%', fontSize: 18 }}>
                      AVAILABLE IN POS
                    </Text>
                    <Switch
                      ios_backgroundColor="#3e3e3e"
                      color="#3784fd"
                      value={available_in_pos}
                      onValueChange={e => onToggleSwitch_Is_In_POS(e)}
                    />
                  </View>

                  {/* ADDING OR DELETING PROMOTION CHECKING CODE */}
                  {tempPromotion == 'true' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        borderColor: 'grey',
                        borderWidth: 0.5,
                        alignSelf: 'center',
                        alignItems: 'center',
                        padding: '1%',
                        borderRadius: 15,
                        marginVertical: '1%',
                        width: '85%',
                      }}>
                      {!selectedItem?.promotions.length ? (
                        <TouchableOpacity
                          onPress={async () => {
                            let timezone = await AsyncStorage.getItem('tz');
                            if (startDate === null || endDate === null) {
                              const currentDate = DateTime.local()
                                .setZone(timezone)//('America/New_York')
                                .toISO({ includeOffset: true });
                              // Get date and time five years from now
                              const futureDate = DateTime.local()
                                .plus({ years: 5 })
                                .setZone(timezone)//('America/New_York')
                                .toISO({ includeOffset: true });
                              setStartDate(currentDate);
                              setEndDate(futureDate);

                            }
                            setPromoVisible(true);
                          }}
                          style={{}}>
                          <Text
                            style={{
                              fontSize: 18,
                              margin: '3%',
                              marginHorizontal: '5%',
                              color: 'blue',
                            }}>
                            {loadingPromo?.add ? "Adding......." : 'ADD PROMOTION'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        // PROMOTOIN EDIT OR DELETE CODE
                        <View>
                          {!promotionToggle ? (
                            <View>
                              <View
                                style={{
                                  justifyContent: 'space-between',
                                  flexDirection: 'row',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    marginHorizontal: '5%',
                                    marginTop: '3%',
                                  }}>
                                  FIX AMOUNT :
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    marginHorizontal: '5%',
                                    color: '#3784fd',
                                    marginTop: '3%',
                                  }}>
                                  {fixedAmount != ''
                                    ? fixedAmount
                                    : selectedItem?.promotions[0]?.fix_amount}
                                </Text>
                              </View>
                              <View
                                style={{
                                  justifyContent: 'space-between',
                                  flexDirection: 'row',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    marginHorizontal: '5%',
                                  }}>
                                  NO. OF PRODUCTS :
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    marginHorizontal: '5%',
                                    color: '#3784fd',
                                  }}>
                                  {no_Of_Product != ''
                                    ? no_Of_Product
                                    : selectedItem?.promotions[0]
                                      ?.no_of_products}
                                </Text>
                              </View>
                               <View
                                    style={{
                                      justifyContent: 'space-between',
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        marginHorizontal: '5%',
                                      }}>
                                      START DATE :
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        marginHorizontal: '5%',
                                        color: '#3784fd',
                                      }}>
                          
                                          {selectedItem?.promotions[0]?.start_date?.split(' ')[0]}
                                    </Text>
                                  </View>
                                     <View
                                    style={{
                                      justifyContent: 'space-between',
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        marginHorizontal: '5%',
                                      }}>
                                      END DATE :
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        marginHorizontal: '5%',
                                        color: '#3784fd',
                                      }}>
                                     {selectedItem?.promotions[0]?.end_date?.split(' ')[0]}
                                    </Text>
                                  </View>
                              <TouchableOpacity
                                onPress={() => {
                                  setPromoVisible(true);
                                }}
                                style={{
                                  alignSelf: 'center',
                                  marginVertical: '3%',
                                  borderColor: 'blue',
                                  borderWidth: 1,
                                  borderRadius: 10,
                                  padding: '3%',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 18,
                                    marginHorizontal: '5%',
                                    color: 'blue',
                                  }}>
                                  {loadingPromo?.add ? "Adding/Editing....." : "ADD / EDIT PROMOTION"}
                                </Text>
                              </TouchableOpacity>

                              {/* DELETE PROMOTION CODE */}
                              {selectedItem?.promotions.length ? (
                                <TouchableOpacity
                                  onPress={() =>
                                    DeletePromotion(
                                      selectedItem?.promotions[0].product_id,
                                    )
                                  }
                                  style={{
                                    alignSelf: 'center',
                                    marginVertical: '3%',
                                    borderColor: 'red',
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    padding: '3%',
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 18,
                                      marginHorizontal: '5%',
                                      color: 'red',
                                    }}>
                                    {loadingPromo?.delete ? "Deleting....." : "DELETE PROMOTION"}
                                  </Text>
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          ) : (
                            // ADD PROMOTION CODE 
                            <TouchableOpacity
                              onPress={() => {
                                setPromoVisible(true)
                              }}
                              style={{}}>
                              <Text
                                style={{
                                  fontSize: 20,
                                  marginHorizontal: '5%',
                                  color: 'blue',
                                }}>
                                ADD PROMOTION
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  ) : null}

<AddPromotionModal
  visible={promoVisible}
  onClose={() => setPromoVisible(false)}
  productId={selectedItem?.items?.[0]?.id}   // pass your product id here
  productAmount={selectedItem?.promotions[0]?.fix_amount ?? ''}
  productBuyNo={selectedItem?.promotions[0]?.no_of_products ?? ''}
  productPromoStartDate={selectedItem?.promotions[0]?.start_date ?? null}
  productPromoEndDate={selectedItem?.promotions[0]?.end_date ?? null}
  onSaved={() => {
    // refresh UI or setShowButton(true) if you need
    setShowButton(true);
  }}
/>

                  <TouchableOpacity
                    onPress={() => {
                      // console.log(vendorCode, 'vendorcode');
                      if (selectedItem?.items[0]?.vendor_name == false) {
                        alert(
                          'No vendor name found ! \n Please select & save a vendor name to toggle.',
                        );
                      } else {
                        setVendorToggle(!VendorToggle);
                      }
                    }}
                    style={{
                      borderColor: vendorCode === 0 ? 'red' : 'grey',
                      backgroundColor: vendorCode === 0 ? '#fcece8' : '#fff',
                      borderWidth: 0.5,
                      alignSelf: 'center',
                      padding: '1%',
                      borderRadius: 15,
                      marginVertical: '3%',
                      width: '85%',
                    }}>
                    {selectedItem?.items[0]?.vendor_name == false ? (
                      <Dropdown
                        data={Vendordata}
                        onSelect={onVendorSelect}
                        Lable={LableVendor}
                        isToggle={true}
                        value={VendorselectedItem}
                        taxes_id={vendorCode}
                        selectedItem={selectedItem}
                      />
                    ) : (
                      <View>
                        {selectedItem?.items[0]?.vendor_ids.length > 0 ? (
                          <View
                            style={{
                              justifyContent: 'space-between',
                              flexDirection: 'row',
                              overflow: 'hidden',
                              alignItems: 'center',
                            }}>
                            <Dropdown
                              data={Vendordata}
                              onSelect={onVendorSelect}
                              Lable={LableVendor}
                              value={VendorselectedItem}
                              isToggle={true}
                              taxes_id={vendorCode}
                              selectedItem={selectedItem}
                            />

                            {/* <Text
                                style={{
                                  fontSize: 16,
                                  marginHorizontal: '5%',
                                }}>
                                VENDOR NAME:
                              </Text> */}
                            {/* <Text
                                style={{
                                  fontSize: 16,
                                  marginHorizontal: '5%',
                                  color: '#3784fd',
                                }}>
                                {selectedItem?.items[0]?.vendor_ids.length ? selectedItem?.items[0]?.vendor_ids.map(e => e.name).join(",\n") : null}
                              </Text> */}
                          </View>
                        ) : (
                          <Dropdown
                            data={Vendordata}
                            onSelect={onVendorSelect}
                            Lable={LableVendor}
                            value={VendorselectedItem}
                            isToggle={true}
                            taxes_id={vendorCode}
                            selectedItem={selectedItem}
                          />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* TAX UPDATE CODING */}
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(vendorCode, 'vendorcode');
                      if (!selectedItem?.items[0]?.taxes_id.length) {
                        alert(
                          'No Tax found ! \n Please select & save a Tax to toggle.',
                        );
                      } else {
                        // console.log('taxdata', taxData);
                        setTaxToggle(!taxToggle);
                      }
                    }}
                    style={{
                      borderColor: vendorCode === 0 ? 'red' : 'grey',
                      backgroundColor: vendorCode === 0 ? '#fcece8' : '#fff',
                      borderWidth: 0.5,
                      alignSelf: 'center',
                      padding: '1%',
                      borderRadius: 15,
                      marginVertical: '3%',
                      width: '85%',
                    }}>
                    {!selectedItem?.items[0]?.taxes_id.length ? (
                      <Dropdown
                        data={taxData}
                        onSelect={onTaxSelect}
                        Lable={LableTax}
                        value={taxItem}
                        isToggle={true}
                      />
                    ) : (
                      <View>
                        {!taxToggle ? (
                          <View
                            style={{
                              justifyContent: 'space-evenly',
                              flexDirection: 'row',
                              overflow: 'hidden',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                marginHorizontal: '5%',
                                borderColor: 'black',
                                borderWidth: 0.5,
                                borderRadius: 5,
                                paddingLeft: 10,
                                paddingRight: 20,
                                paddingBottom: 10,
                                paddingTop: 10,
                              }}>
                              TAX :
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                marginHorizontal: '5%',
                                color: '#3784fd',
                                textAlign: 'center',
                              }}>
                              {/* {selectedItem?.items[0]?.taxes_id.map(
                                  e => e.name + '\n',
                                )} */}
                              {selectedItem?.items[0]?.taxes_id.map(
                                (e, index) => (
                                  <Text key={index}>
                                    {e.name}
                                    {index !==
                                      selectedItem.items[0].taxes_id.length - 1
                                      ? ',\n'
                                      : ''}
                                  </Text>
                                ),
                              )}
                            </Text>
                          </View>
                        ) : (
                          <Dropdown
                            data={taxData}
                            onSelect={onTaxSelect}
                            Lable={LableTax}
                            value={taxItem}
                            isToggle={true}
                            taxes_id={selectedItem?.items[0]?.taxes_id}
                          />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* {this for product expiry start code} */}
                  <Modal animationType="slide" transparent={false} visible={productExpireModel} onRequestClose={() => { setProductExpireModel(!productExpireModel) }}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                      <View style={{ marginVertical: '15%', height: '100%', width: '100%', }}>
                        <Text
                          style={{
                            fontSize: 25,
                            alignSelf: 'center',
                            marginBottom: '10%',
                            color: '#ad7e05',
                            marginBottom: 0,
                          }}>
                          Add Product Expiry
                        </Text>
                        <Image style={{ width: '100%', height: '30%', }}
                          source={promoImg}
                          resizeMode="contain"
                        />
                        <View style={{ backgroundColor: '#fff', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.3, shadowRadius: 3, marginHorizontal: '5%', borderColor: '#939596', borderWidth: 0, marginVertical: '2%', padding: '3%', borderRadius: 20 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              // marginHorizontal: '10%',
                            }}>
                            <Text
                              style={{
                                color: '#000',
                                fontSize: 16,
                                fontWeight: '300',
                              }}>
                              Lot Number :
                            </Text>
                            <TextInput
                              keyboardType="default"
                              returnKeyType="done"
                              onChangeText={e => setProductLotNumber(e)}
                              value={productLotNumber}
                              placeholder="Enter Lot Number"
                              placeholderTextColor="grey"
                              style={styles.ModalTextInput}
                            />
                          </View>

                          {/* NO. OF PRODUCTS TEXT INPUT CODE */}
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              // marginHorizontal: '10%',
                            }}>
                            <Text
                              style={{
                                color: '#000',
                                fontSize: 16,
                                fontWeight: '300',
                              }}>
                              Product Note :
                            </Text>
                            <TextInput
                              keyboardType="default"
                              returnKeyType="done"
                              onChangeText={e => setProductNote(e)}
                              value={productNote}
                              placeholder="Enter Product Note"
                              placeholderTextColor="grey"
                              style={styles.ModalTextInput}
                            />
                          </View>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              // marginHorizontal: '10%',
                            }}>
                            <Text
                              style={{
                                color: '#000',
                                fontSize: 16,
                                fontWeight: '300',
                              }}>
                              Days For Notification :
                            </Text>
                            <TextInput
                              keyboardType="numeric"
                              returnKeyType="done"
                              onChangeText={e => setProductExpireDay(e)}
                              value={productExpireDay}
                              placeholder="Enter Product Expire Day"
                              placeholderTextColor="grey"
                              style={styles.ModalTextInput}
                            />
                          </View>

                          {/* The First View Is For Start Date And Second One Is For End Date */}
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>

                            {/* This Condition Is To Show Either Open Calendar Or Date Picked If First Time Came and No Promotion Is Added Then This Condition Will Be True And Show Open Calendar Button */}
                            {!showProductExpireDate && (
                              <>
                                <Text
                                  style={{
                                    color: '#000',
                                    fontSize: 16,
                                    fontWeight: '300',
                                  }}>
                                  Select Expiry Date :
                                </Text>

                                <TouchableOpacity
                                  onPress={showProductExpireDateSelect}
                                  style={{
                                    backgroundColor: '#fff',
                                    borderColor: 'grey',
                                    borderWidth: 0.5,
                                    borderRadius: 10,
                                    padding: 10,
                                    width: '40%',
                                    alignSelf: 'center',
                                    marginVertical: '3%',
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: '#3784fd',
                                      textAlign: 'center',
                                    }}>

                                    {productExpireDate
                                      ? productExpireDate.split(' ')[0]
                                      : 'Open Calendar'
                                    }
                                  </Text>
                                </TouchableOpacity>
                              </>
                            )}

                            {/* This Condition Is To Show Actual Date Picker Model */}
                            {showProductExpireDate && (
                              <>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: '#3784fd',
                                    textAlign: 'center',
                                  }}>
                                  Select Expiry Date:
                                </Text>
                                <DateTimePicker
                                  value={productExpireDate ? new Date(productExpireDate) : new Date()}
                                  mode="date"
                                  onChange={(event, selectedDate) => {
                                    if (event.type === 'set') {
                                      const starttimeStampValueKey = event.nativeEvent.timestamp;
                                      const myStartDateTime = DateTime.fromMillis(starttimeStampValueKey, { zone: fetchTimeZoneValue }).startOf('day').toFormat('yyyy-MM-dd');
                                      setProductExpireDate(myStartDateTime);
                                    }
                                  }}
                                />
                              </>
                            )}
                          </View>

                          {/* Spacing Between Start Date And End Date */}
                          <View style={{ height: 20 }} />

                        </View>

                        {/* DONE AND CLOSE BUTTONS CODE */}
                        <View
                          style={{
                            justifyContent: 'space-around',
                            flexDirection: 'row',
                            marginVertical: '10%',
                          }}>
                          <TouchableOpacity
                            style={{
                              padding: 15,
                              backgroundColor: '#3784fd',
                              borderColor: '#3784fd',
                              borderWidth: 0.5,
                              borderRadius: 10,
                              alignSelf: 'center',
                              alignItems: 'center',
                            }}
                            onPress={() => haldlerProductExprire()}>
                            <Text
                              style={{
                                fontSize: 16,
                                color: '#fff',
                                fontWeight: '300',
                              }}>
                              Add Expiry
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              padding: 12,
                              backgroundColor: '#fff',
                              borderColor: '#ff0000',
                              borderWidth: 0.5,
                              borderRadius: 10,
                              alignSelf: 'center',
                              alignItems: 'center',
                            }}
                            onPress={() => setProductExpireModel(false)}>
                            <Text
                              style={{
                                fontSize: 16,
                                color: '#ff0000',
                                fontWeight: '300',
                              }}>
                              CLOSE
                            </Text>
                          </TouchableOpacity>
                        </View>

                      </View>
                    </KeyboardAvoidingView>
                  </Modal>
                  
                  <Modal animationType="slide" transparent={false} visible={productExpireModelUpdate} onRequestClose={() => { setProductExpireModelUpdate(!productExpireModelUpdate) }}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                      <View style={{ marginVertical: '15%', height: '100%', width: '100%', }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 }}>
                          <Text
                            style={{
                              fontSize: 25,
                              alignSelf: 'center',
                              marginBottom: '10%',
                              color: '#ad7e05',
                              marginBottom: 0,
                            }}>
                            Update/Delete Expiry
                          </Text>
                          <TouchableOpacity
                            style={{
                              padding: 12,
                              backgroundColor: '#fff',
                              borderColor: '#ff0000',
                              borderWidth: 0.5,
                              borderRadius: 10,
                              alignSelf: 'center',
                              alignItems: 'center',
                            }}
                            onPress={() => setProductExpireModelUpdate(false)}
                          >
                            <Text style={{}}>❌</Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView
                          style={{ flex: 1, }}
                          contentContainerStyle={{ paddingBottom: 24 }}
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled
                        >
                          {productExpireUpdate?.map((item, index) => (
                            <View key={index}>
                              <View style={{ backgroundColor: '#fff', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.3, shadowRadius: 3, marginHorizontal: '5%', borderColor: '#939596', borderWidth: 0, marginVertical: '2%', padding: '3%', borderRadius: 20 }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    // marginHorizontal: '10%',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#000',
                                      fontSize: 16,
                                      fontWeight: '300',
                                    }}>
                                    Lot Number :
                                  </Text>
                                  <TextInput
                                    keyboardType="default"
                                    returnKeyType="done"
                                    onChangeText={e => productExpiryUpdateSetMethode(e, item.expiry_id, 'lot_number')}
                                    value={item.lot_number}
                                    placeholder="Enter Lot Number"
                                    placeholderTextColor="grey"
                                    style={styles.ModalTextInput}
                                  />
                                </View>

                                {/* NO. OF PRODUCTS TEXT INPUT CODE */}
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    // marginHorizontal: '10%',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#000',
                                      fontSize: 16,
                                      fontWeight: '300',
                                    }}>
                                    Product Note :
                                  </Text>
                                  <TextInput
                                    keyboardType="default"
                                    returnKeyType="done"
                                    onChangeText={e => productExpiryUpdateSetMethode(e, item.expiry_id, 'note')}
                                    value={item.note}
                                    placeholder="Enter Product Note"
                                    placeholderTextColor="grey"
                                    style={styles.ModalTextInput}
                                  />
                                </View>

                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    // marginHorizontal: '10%',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#000',
                                      fontSize: 16,
                                      fontWeight: '300',
                                    }}>
                                    Days For Notification :
                                  </Text>
                                  <TextInput
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    onChangeText={e => productExpiryUpdateSetMethode(e, item.expiry_id, 'alert_before')}
                                    value={String(item.alert_before)}
                                    placeholder="Enter Product Expire Day"
                                    placeholderTextColor="grey"
                                    style={styles.ModalTextInput}
                                  />
                                </View>

                                {/* The First View Is For Start Date And Second One Is For End Date */}
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}>

                                  {/* This Condition Is To Show Either Open Calendar Or Date Picked If First Time Came and No Promotion Is Added Then This Condition Will Be True And Show Open Calendar Button */}
                                  {!showProductExpireDateUpdate && (
                                    <>
                                      <Text
                                        style={{
                                          color: '#000',
                                          fontSize: 16,
                                          fontWeight: '300',
                                        }}>
                                        Select Expiry Date :
                                      </Text>

                                      <TouchableOpacity
                                        onPress={() => setShowProductExpireUpdate(true)}
                                        style={{
                                          backgroundColor: '#fff',
                                          borderColor: 'grey',
                                          borderWidth: 0.5,
                                          borderRadius: 10,
                                          padding: 10,
                                          width: '40%',
                                          alignSelf: 'center',
                                          marginVertical: '3%',
                                        }}>
                                        <Text
                                          style={{
                                            fontSize: 16,
                                            color: '#3784fd',
                                            textAlign: 'center',
                                          }}>

                                          {item?.expiry_date
                                            ? item?.expiry_date.split(' ')[0]
                                            : 'Open Calendar'
                                          }
                                        </Text>
                                      </TouchableOpacity>
                                    </>
                                  )}

                                  {/* This Condition Is To Show Actual Date Picker Model */}
                                  {showProductExpireDateUpdate && (
                                    <>
                                      <Text
                                        style={{
                                          fontSize: 16,
                                          color: '#3784fd',
                                          textAlign: 'center',
                                        }}>
                                        Select Expiry Date:
                                      </Text>
                                      <DateTimePicker
                                        value={item?.expiry_date ? new Date(item?.expiry_date) : new Date()}
                                        mode="date"
                                        onChange={(event, selectedDate) => {
                                          if (event.type === 'set') {
                                            const starttimeStampValueKey = event.nativeEvent.timestamp;
                                            const myStartDateTime = DateTime.fromMillis(starttimeStampValueKey, { zone: fetchTimeZoneValue }).startOf('day').toFormat('yyyy-MM-dd');
                                            productExpiryUpdateSetMethode(myStartDateTime, item.expiry_id, 'expiry_date')
                                          }
                                        }}
                                      />
                                    </>
                                  )}
                                </View>

                                {/* Spacing Between Start Date And End Date */}
                                <View style={{ height: 20 }} />

                              </View>
                              <View
                                style={{
                                  justifyContent: 'space-around',
                                  flexDirection: 'row',
                                  marginVertical: '10%',
                                }}>
                                <TouchableOpacity
                                  style={{
                                    padding: 15,
                                    backgroundColor: '#3784fd',
                                    borderColor: '#3784fd',
                                    borderWidth: 0.5,
                                    borderRadius: 10,
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                  }}
                                  onPress={() => haldlerProductExprireUpdate(item.expiry_id)}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: '#fff',
                                      fontWeight: '300',
                                    }}>
                                    Update Expiry
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={{
                                    padding: 12,
                                    backgroundColor: '#fff',
                                    borderColor: '#ff0000',
                                    borderWidth: 0.5,
                                    borderRadius: 10,
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                  }}
                                  onPress={() => handleDeleteProductExpire(item.expiry_id)}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: '#ff0000',
                                      fontWeight: '300',
                                    }}>
                                    Delete Expiry
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </ScrollView>

                      </View>
                    </KeyboardAvoidingView>
                  </Modal>
                  {/* {console.log('isShowExpiry 22222', isShowExpiry)} */}
                  {isShowExpiry &&
                    <>
                      <TouchableOpacity
                        onPress={() => {
              if (!productId) {
      Alert.alert('Product not loaded yet');
      return;
    }

                          setAddExpiryVisible(true);
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: '#6366F1',
                          borderRadius: 12,
                          padding: 5,
                          margin: 25,
                        }}>
                        <Text
                          style={{
                            fontSize: 18,
                            margin: '3%',
                            marginHorizontal: '5%',
                            color: 'blue',
                            textAlign: 'center'
                          }}>
                          Add Product Expiry
                        </Text>

                      </TouchableOpacity>

                 
                      {selectedItem.items[0].expiry_details.length > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                if (!productId) {
        Alert.alert('Product not loaded yet');
        return;
      }
                            setUpdateExpiryVisible(true);
                          }}
                          style={{
                            borderWidth: 1,
                            borderColor: '#6366F1',
                            borderRadius: 12,
                            padding: 5,
                            margin: 25,
                          }}>
                          <Text
                            style={{
                              fontSize: 18,
                              margin: '3%',
                              marginHorizontal: '5%',
                              color: 'blue',
                              textAlign: 'center'
                            }}>
                            Update/Delete Expiry List
                          </Text>
                        </TouchableOpacity>
                       
                      )}
                    </>}
                  {/* {this for product expiry end code} */}

                  {/* SAVE BUTTON */}
                  {showButton && (
                    <TouchableOpacity
                      onPress={priceUpdate}
                      style={{
                        ...styles.submitBtm,
                      }}>
                      <Text style={styles.textButton}>SAVE</Text>
                    </TouchableOpacity>
                  )}

                  {/* ADD TO PRINT LIST CODE */}
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Product', {
                        data: selectedItem.items[0],
                      });
                      // route.params?.setShowLabelOpen(true)
                    }}
                    style={{
                      fontSize: 18,
                      borderRadius: 10,
                      padding: 10,
                      backgroundColor: '#1fc1fc',
                      marginHorizontal: 20,
                      marginBottom: '20%',
                    }}>
                    <Text style={styles.textButton}>ADD TO PRINT LIST</Text>
                  </TouchableOpacity>

                </View>
                
              )}
               <AddExpiryModal
  visible={addExpiryVisible}
  onClose={() => setAddExpiryVisible(false)}
  productId={selectedItem.items[0].id}
  onSuccess={handleExpiryAdded}
/>

<UpdateExpiryModal
  visible={updateExpiryVisible}
  onClose={() => setUpdateExpiryVisible(false)}
  productId={selectedItem.items[0].id}
  expiryList={selectedItem.items[0].expiry_details} // same array you used earlier
  onDelete={handleDeleteProductExpire}               // optional
  onSuccess={() => setShowButton(true)}
/>
            </View>
          )}

        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProductInformation;