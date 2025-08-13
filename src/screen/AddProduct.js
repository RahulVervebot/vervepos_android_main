import {View,Text,SafeAreaView,Modal,StyleSheet,Image,ScrollView,TouchableOpacity,ActivityIndicator,TextInput,Alert,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {Switch, IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Dropdown from './Dropdown';
import {useRoute} from '@react-navigation/native';
import data2 from '../../APIvariables.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import BarcodeForNewProduct from '../components/BarcodeForNewProduct';

const AddProduct = () => {
  React.useLayoutEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            color="#000"
          />
        ),
      });
  }, [navigation]);

  const [text, setText] = useState({
    name: '',
    barcode: '',
    standard_price: '',
    detailed_type: 'product',
    list_price: '',
    categ_id: 0,
    // uom_id: 1,
    // uom_po_id: 1,
    available_in_pos: true,
    to_weight: false,
    case_cost: 0,
    unit_in_case: 0,
    qty_available: 0,
    vendorcode: "",
    size: '',
    taxes_id: "",
    is_ebt_product: true,
    image: false,
    // ewic: false,
    // otc: true
  });
  const route = useRoute();
  const [selectedItem, setSelectedItem] = useState('');
  const [VendorselectedItem, setVendorSelectedItem] = useState('');
  const [taxItem, setTexItem] = useState('');
  const [data, setData] = useState([]);
  const [Vendordata, setVendorData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // const [imageBase64, setImageBase64] = useState();
  const [imageModal, setImagemodal] = useState(false);
  const navigation = useNavigation();

  const [selectedValue, setSelectedValue] = useState('');
  const [vendorCode, setvendorCode] = useState("");
  const [taxId, setTaxId] = useState("");

  useEffect(() => {
    const FirstRun = async () => {
      let current_url;
      let current_access_token;
      await AsyncStorage.getItem('storeUrl').then(storeUrl => {
        // console.log('storeUrl : ', storeUrl);
        current_url = storeUrl;
      });
      await AsyncStorage.getItem('access_token')
      .then(access_token => {
        // console.log('access_token : ', access_token);
        current_access_token = access_token;
      })
      .catch(error => {
        alert('some error');
      });

      var myHeaders = new Headers();
      myHeaders.append('access_token', current_access_token);
      myHeaders.append(
        'Cookie',
        'session_id',
      );
      
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit', // Ensures cookies are not sent
      };
      fetch(`${current_url}/api/categories`, requestOptions)
        .then(response => response.json())
        .then(result => {
          // console.log(result, 'category');
          setData(result);
        })
        .catch(error => {
          alert('Some Problem Fetching Category');
          // console.log('error', error);
        });
      fetch(`${current_url}/api/vendorlist`, requestOptions)
        .then(response => response.json())
        .then(result => {
          // console.log(result, 'vendors ');
          setVendorData(result);
        })
        .catch(error => {
          alert('Some Problem Fetching Vendor list');
          // console.log('error', error);
        });
      fetch(`${current_url}/api/taxes`, requestOptions)
        .then(response => response.json())
        .then(result => {
          // console.log(result, 'tax');
          setTaxData(result);
        })
        .catch(error => {
          alert('Some Problem Fetching Taxes');
          // console.log('error', error);
        });
    };
    FirstRun();
  }, []);

  const onVendorSelect = useCallback((item, index, data) => {
    const updatedVendorData = data.map(e => {
      if (e.id === item.id) {
        return {...e, checked: !e.checked};
      }
      return e;
    });
    setVendorData(updatedVendorData);
    const updateVendorDatas = updatedVendorData.filter(item => item.checked).map(item => item.id);
    setVendorSelectedItem(item);
    setvendorCode(updateVendorDatas);
  }, [selectedItem]);

  const onTaxSelect = useCallback((item, index) => {
    const updatedTaxData = taxData.map((taxItem, idx) => {
      if (idx === index) {
        return {...taxItem, checked: !taxItem.checked};
      }
      return taxItem;
    });
    setTaxData(updatedTaxData);
    const updateTaxIds = updatedTaxData.filter(item => item.checked).map(selectedTax => selectedTax.id);
    setTexItem(item);
    setTaxId(updateTaxIds);
  }, [taxData]);
  

  const onToggleSwitch_to_weight = () => {
    // setto_weight(!to_weight);
    setText({...text, to_weight: !text.to_weight});
  };
  const onToggleSwitch_Is_In_POS = () => {
    // setIs_in_POS(!is_in_POS);
    setText({...text, available_in_pos: !text.available_in_pos});
  };
  const onToggle_EBT = () => {
    setText({...text, is_ebt_product: !text.is_ebt_product});
  };
  // const onToggle_OTC = () => {
  //   setText({...text, otc: !text.otc});
  // }
  // const onToggle_Ewick = () => {
  //   setText({...text, ewic : !text.ewic})
  // }

  const onSelect = item => {
    setSelectedItem(item);
    setText({...text, categ_id: item.id});
    // console.log(item, 'item');
  };

  const onVendorSelect1 = item => {
    setVendorSelectedItem(item);
    setText({...text, vendorcode: item.id});
    // console.log(item, 'item');
  };
  const onTaxSelect1 = item => {
    setTexItem(item);
    setText({...text, taxes_id: [item.id]});
    // console.log(item, 'item');
    // console.log(text, 'text');
  };

  const isValidUPC = (barcode) => {
    // Remove leading zeros
    let cleanedBarcode = barcode;

    if (barcode.startsWith('0')) {
      cleanedBarcode = barcode.slice(1);
      // console.log("cleanedBarcode after removing 0", cleanedBarcode);

      // console.log("cleanedBarcode after if statement", cleanedBarcode);
      // UPC-A barcode should be 12 digits long
      if (cleanedBarcode.length !== 12) {
        return false;
      }
    
      // Convert the barcode to an array of numbers
      const digits = cleanedBarcode.split('').map(Number);
    
      // Calculate the check digit using the UPC-A formula
      let sumOdd = 0;
      let sumEven = 0;
    
      for (let i = 0; i < 11; i++) {
        if (i % 2 === 0) {
          sumOdd += digits[i];
        } else {
          sumEven += digits[i];
        }
      }
    
      const totalSum = (sumOdd * 3) + sumEven;
      const checkDigit = (10 - (totalSum % 10)) % 10;
    
      // console.log("checkDigit", checkDigit);
  
      // Check if the calculated check digit matches the last digit of the barcode
      return checkDigit === digits[11];
    } else {
      return false
    }

  };
  
const onBarcodeFound = value => {

  if (isValidUPC(value)) {
    // console.log('The barcode is UPC-A.', value.slice(1));
    handleBarcodeSelection(value.substring(1))
  } else {
    // console.log('The barcode is not UPC-A.', value);
    handleBarcodeSelection(value);
  }

  // OLD Logic For Barcode with UPC-A Issue
  // if (value.startsWith('0')) {
  //     Alert.alert(
  //         'Does this barcode start with zero?',
  //         'Please select the barcode as shown on the product',
  //         [
  //             { text: value.substring(1), onPress: () => handleBarcodeSelection(value.substring(1)) },
  //             { text: value, onPress: () => handleBarcodeSelection(value) },
  //             { text: 'CANCEL', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
  //         ],
  //         { cancelable: false }
  //     );
  // } else {
  //     handleBarcodeSelection(value);
  // }

  setModalVisible(false);
};
const handleBarcodeSelection = selectedValue => {
  setSelectedValue(selectedValue);
  setText({ ...text, barcode: selectedValue });
};

  const onBarcodeCancel = value => {
    // console.log(value);
    setModalVisible(false);
  };

  const handleImageChangeFromGallary = () => {
    //Module is creating tmp images which are going to be cleaned up automatically
    ImagePicker.clean()
      .then(() => {
        console.log('removed all tmp images from tmp directory');
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
      let tempDecode = image.data;
      // setImageBase64(tempDecode);
      setText({...text, image: tempDecode});
      setImagemodal(false);
    });
  };
  const handleImageChangeFromCamera = () => {
    //Module is creating tmp images which are going to be cleaned up automatically
    ImagePicker.clean()
      .then(() => {
        console.log('removed all tmp images from tmp directory');
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
      let tempDecode = image.data;
      // setImageBase64(tempDecode);
      setText({...text, image: tempDecode});
      setImagemodal(false);
    });
  };

  const HandleUpload = async () => {
    let current_url;
    let current_access_token;
    await AsyncStorage.getItem('storeUrl').then(storeUrl => {
      // console.log('storeUrl : ', storeUrl);
      current_url = storeUrl;
    });
    await AsyncStorage.getItem('access_token')
      .then(access_token => {
        // console.log('access_token : ', access_token);
        current_access_token = access_token;
      })
      .catch(error => {
        alert('some error');
      });
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append('access_token', current_access_token);
    // myHeaders.append('Cookie','session_id',);
    myHeaders.append('Content-Type', 'application/json');
  
const vendorIds = Vendordata.filter(item => item.checked).map(item => item.id).join(',');
const taxIds = taxData.filter(item => item.checked).map(item => item.id).join(',');

var raw = JSON.stringify({
  ...text,
  taxes_id: taxIds,
  vendorcode: vendorIds
});
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
       credentials: 'omit',
    };
  
    fetch(`${current_url}/api/add_product`, requestOptions)
      .then(response => response.json())
      .then(result => {
        // console.log(result, 'result');
        if (!result.result) {
          alert('No response from API.');
        } else {
          alert(
            result.result ? result?.result?.message : result?.error?.message,
          );
        }
        navigation.navigate('Product');
        setLoading(false);
      })
      .catch(error => {
        console.log('error', error);
        alert('Some error');
        navigation.navigate('Product');
        setLoading(false);
      });
  };

  let Lable = 'SELECT CATEGORY:  ';
  let LableVendor = 'VENDOR NAME:  ';
  let LableTax = 'SELECT TAX: ';

  return (
    <ScrollView style={{backgroundColor: '#fff', flex: 1}}>
      {/* <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> */}

      <SafeAreaView style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <BarcodeForNewProduct
            onBarcodeCancel={onBarcodeCancel}
            onBarcodeFound={onBarcodeFound}
          />
        </Modal>
        <View>
          <View style={{flexDirection: 'column', alignItems: 'center'}}>
            <Image
              style={{
                width: Platform.OS === 'android' ? 150 : 200,
                height: Platform.OS === 'android' ? 150 : 200,
                borderRadius: 20,
              }}
              source={
                text.image
                  ? {
                      uri: `data:image/png;base64,${text.image}`,
                    }
                  : require('../.././src/images/NO_IMAGE1.png')
              }
              resizeMode="contain"
            />
            <TouchableOpacity
              style={{
                alignItems: 'center',
                marginHorizontal: '1%',
                marginVertical: '2%',
                borderColor: '#fff',
                borderWidth: 0.5,
                padding: '4%',
                borderRadius: 10,
                backgroundColor: '#d1e2ff',
                width: '57%',
              }}
              onPress={() => {
                setImagemodal(true);
              }}>
              <Text>EDIT IMAGE</Text>
            </TouchableOpacity>
          </View>
          <Modal animationType="slide" transparent={false} visible={imageModal}>
            <View style={{justifyContent: 'center'}}>
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
                    borderWidth: 0.1,
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
                    borderWidth: 0.1,
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
                    fontSize: 18,
                    color: '#ff0000',
                    fontWeight: '400',padding:8
                  }}>
                  CANCEL
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <TextInput
            placeholderTextColor="#b87788"
            placeholder="PRODUCT NAME*"
            value={text.name}
            style={{...styles.textInputPrice, marginTop: 15}}
            onChangeText={Value => setText({...text, name: Value})}
          />
          <View
            style={{
              // width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TextInput
              value={text.barcode || selectedValue}
              placeholderTextColor="#b87788"
              placeholder="BARCODE*"
              style={{...styles.textInputPrice, marginTop: 15, width: '69%'}}
              onChangeText={Value => setText({...text, barcode: Value})}
            />
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
              }}>
              <View
                style={{
                  color: '#000',
                  backgroundColor: '#fff',
                  borderColor: '#3784fd',
                  borderWidth: 1,
                  borderRadius: 10,
                  textAlign: 'center',
                  padding: 8,
                  marginTop: 15,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#3784fd',
                    fontWeight: '500',
                    marginHorizontal: '5.5%',
                  }}>
                  SCAN
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TextInput
            value={text.list_price}
            placeholderTextColor="#b87788"
            placeholder="SELL PRICE*"
            style={{...styles.textInputPrice, marginTop: 15}}
            onChangeText={Value => setText({...text, list_price: Value})}
          />
          <TextInput
            value={text.case_cost}
            placeholderTextColor="#a3a3a3"
            placeholder="CASE COST"
            style={{...styles.textInputPrice, marginTop: 15}}
            onChangeText={Value =>
              setText({...text, case_cost: Value})
            }
          />
          <TextInput
            value={text.unit_in_case}
            placeholderTextColor="#a3a3a3"
            placeholder="UNIT IN CASE"
            style={{...styles.textInputPrice, marginTop: 15}}
            onChangeText={Value =>
              setText({...text, unit_in_case: parseInt(Value)})
            }
          />
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
          <TextInput
            // I have commented defaultValue, formattedValue and setText because when I input value it is giving me issues
            // defaultValue={
            //   (text.standard_price && !isNaN(text.standard_price)) ? parseFloat(text.standard_price).toFixed(2) : ''
            // }
            defaultValue={text.standard_price}
            placeholderTextColor="#b87788"
            placeholder="COST PRICE*"
            style={{...styles.textInputPrice, marginTop: 15, width: '69%'}}
            onChangeText={value => {
              // const formattedValue = parseFloat(value.replace(/[^0-9.]/g, '')).toFixed(2);
              // setText({...text, standard_price: formattedValue});
              setText({...text, standard_price: value});
            }}
          />
            <TouchableOpacity
              onPress={() => {
                if (isNaN(text.case_cost / text.unit_in_case)) {
                  // console.log(text, 'text');
                  alert(
                    'CASE COST and UNIT IN CASE are required to calculate cost price.\n OR\n You can add cost price manually.',
                  );
                } else {
                  setText({
                    ...text,
                    standard_price: (
                      text.case_cost / text.unit_in_case
                    ).toString(),
                  });

                  // console.log(text, 'text');
                }
              }}>
              <View
                style={{
                  color: '#000',
                  backgroundColor: '#fff',
                  borderColor: '#009933',
                  borderWidth: 1,
                  borderRadius: 10,
                  textAlign: 'center',
                  padding: 8,
                  marginTop: 15,
                  alignItems: 'center',
                }}>
                <Text
                  style={{fontSize: 16, color: '#009933', fontWeight: '500'}}>
                  CALCULATE
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <TextInput
            value={text.qty_available}
            placeholderTextColor="#a3a3a3"
            placeholder="ADD STOCK"
            style={{...styles.textInputPrice, marginTop: 15}}
            onChangeText={Value =>
              setText({...text, qty_available: parseInt(Value)})
            }
          />
          <TextInput
            value={text.size}
            placeholderTextColor="#a3a3a3"
            placeholder="SIZE"
            style={{...styles.textInputPrice, marginTop: 15}}
            onChangeText={Value => setText({...text, size: Value})}
          />

          <View
            style={{
              borderColor: !text.vendorcode.length ? 'red' : 'grey',
              backgroundColor: !text.vendorcode.length ? '#fcece8' : '#fff',
              borderWidth: 0.5,
              alignSelf: 'center',
              padding: '1%',
              borderRadius: 15,
              marginVertical: '3%',
              width: '100%',
            }}>
            <Dropdown
              data={Vendordata}
              onSelect={onVendorSelect}
              Lable={LableVendor}
              value={VendorselectedItem}
              multiSelection={true}
              isToggle={true}
              selectedItem={selectedItem}
            />
          </View>
          
          <View
            style={{
              borderColor: text.categ_id === 0 ? 'red' : 'grey',
              backgroundColor: text.categ_id === 0 ? '#fcece8' : '#fff',
              borderWidth: 0.5,
              alignSelf: 'center',
              padding: '1%',
              borderRadius: 15,
              marginVertical: '3%',
              width: '100%',
            }}>
            <Dropdown
              data={data}
              onSelect={onSelect}
              Lable={Lable}
              value={selectedItem}
              isSelectedCategory={true}
            />
          </View>
          <View
            style={{
              borderColor: !text.taxes_id.length ? 'red' : 'grey',
              backgroundColor: !text.taxes_id.length ? '#fcece8' : '#fff',
              borderWidth: 0.5,
              alignSelf: 'center',
              padding: '1%',
              borderRadius: 15,
              marginVertical: '3%',
              width: '100%',
            }}>
            <Dropdown
              data={taxData}
              onSelect={onTaxSelect}
              Lable={LableTax}
              isToggle={true}
              value={taxItem}
            />
          </View>
          <View
            style={{
              // flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-evenly',
              marginVertical: '5%',
              borderColor: 'grey',
              borderWidth: 0.5,
              alignSelf: 'center',
              padding: '3%',
              borderRadius: 15,
            }} >
              <View 
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-evenly',
                alignSelf: 'center',
                padding: '3%'
                }} >
            <View style={{alignItems: 'center'}}>
              <Text style={{margin: '2%', fontSize: 13}}>AVAILABLE IN POS</Text>
              <Switch
                color="#3784fd"
                value={text.available_in_pos}
                onValueChange={onToggleSwitch_Is_In_POS}
              />
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={{margin: '2%', fontSize: 13}}>IS WEIGHT</Text>
              <Switch
                color="#3784fd"
                value={text.to_weight}
                onValueChange={onToggleSwitch_to_weight}
              />
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={{margin: '2%', fontSize: 13}}>EBT PRODUCT</Text>
              <Switch
                color="#3784fd"
                value={text.is_ebt_product}
                onValueChange={onToggle_EBT}
              />
            </View>
            </View>

            {/* <View 
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-evenly',
                alignSelf: 'center',
                padding: '3%'
                }} >
            <View style={{alignItems: 'center'}}>
              <Text style={{margin: '2%', fontSize: 14}}>OTC</Text>
              <Switch
                color="#3784fd"
                value={text.otc}
                onValueChange={onToggle_OTC}
              />
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={{margin: '2%', fontSize: 14}}>E-WIC</Text>
              <Switch
                color="#3784fd"
                value={text.ewic}
                onValueChange={onToggle_Ewick}
              />
            </View>
            </View> */}
            
          </View>

          <View style={{justifyContent: 'center', flexDirection: 'row'}}>
            {text.name.length &&
            text.barcode.length &&
            text.standard_price.length &&
            !text.categ_id == 0 &&
            text.list_price.length ? (
              <TouchableOpacity
                onPress={() => {
                  HandleUpload();
                  // console.log(text);
                }}>
                <View
                  style={{
                    ...styles.submitBtm,
                    //backgroundColor: check ? '#02a390' : 'grey',
                  }}>
                  {!loading ? (
                    <Text
                      style={{fontSize: 18, color: '#fff', fontWeight: '500'}}>
                      CREATE A PRODUCT
                    </Text>
                  ) : (
                    <ActivityIndicator size="large" color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  alert(
                    'Please fill at least\n  Name,\n Barcode, \nSell Price, \nCost Price \n & Category\n to add product',
                  );
                }}
                style={{
                  ...styles.submitBtm,
                  backgroundColor: '#d4d4d4',
                }}>
                <Text style={{fontSize: 18, color: '#fff', fontWeight: '500'}}>
                  CREATE A PRODUCT
                </Text>
              </TouchableOpacity>
            )}

            {/* <TouchableOpacity
              onPress={() => {
                console.log(text);
              }}>
              <View
                style={{
                  ...styles.submitBtm,
                  //backgroundColor: check ? '#02a390' : 'grey',
                }}>
                <Text style={{fontSize: 18, color: '#fff', fontWeight: '500'}}>
                  Console json
                </Text>
              </View>
            </TouchableOpacity> */}
          </View>
        </View>
      </SafeAreaView>
      {/* </KeyboardAvoidingView> */}
    </ScrollView>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  centeredViewmodal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    // alignItems: 'center',
    shadowColor: '#000',
    width: '80%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  centeredView: {
    flex: 1,
    margin: 20,
    marginBottom: '50%',
  },

  textInputPrice: {
    borderColor: '#000',
    color: '#000',
    fontSize: 16,
    padding: '3%',
    fontWeight: '300',
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 0.4,
    borderRadius: 10,
  },

  image: {
    width: 150,
    height: 150,
    borderColor: 'lightgrey',
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'flex-end',
    marginLeft: 10,
    alignContent: 'center',
  },

  submitBtm: {
    color: '#000',
    fontSize: 18,
    backgroundColor: '#3784fd',
    borderRadius: 10,
    textAlign: 'center',
    padding: 15,
    marginTop: 30,
  },

  cameraImage: {
    height: 35,
    width: 35,
    marginTop: -25,
    tintColor: '#3784fd',
    marginLeft: 150,
  },
});
