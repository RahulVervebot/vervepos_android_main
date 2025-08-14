import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Pressable, Modal, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import promoGif from '../../../images/homeBG.webp';
import VervebotLogo from '../../../images/vervebotLogo.png'
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import { err } from 'react-native-svg/lib/typescript/xml';
import BgImageNew from '../../../images/BgImageNew.png';
import OneSignal from 'react-native-onesignal';
import {
  getTotalAllocationCurrentWeek,
} from '../../../functions/DepartmentAccess/function_dep';
import TopVendorBarChart from '../../../components/TopVendorBarChart';
import { useFocusEffect } from '@react-navigation/native';
import TotalBudgetCard,{ useBudgetData } from '../../../components/TotalBudgetCard';
const VendorManagerDashboard = () => {
  const navigation = useNavigation();  // Get the navigation object
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  // const [totalspend, setTotalSpend] = useState(1);
  const [allocationData, setAllocationData] = useState({
    allocated_amount: 0,
    remaining_allocated_amount: 0,
    remainingPOBalance: 0,
  });
  // const [tempSalePrint, settempSalePrint] = useState(false)
  const [tempMeneger, setTempmanager] = useState(false);
  // const [startDateFormatted, setStartDateFormatted] = useState('');
  // const [endDateFormatted, setEndDateFormatted] = useState('');
  const [tempPromotion, setTempPromotion] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [otpInput, setOtpInput] = useState(false);
  const [otp, setOtp] = useState();
  const [item, setItem] = useState([]);
  const [loginUrl, setloginUrl] = useState(null);
  const [loginDb, setloginDB] = useState(null);
  const [loginOTP, setloginOTP] = useState(null);
  const [loading_page, setLoading_page] = useState(false);
  const [usernameState, setIUsernameState] = useState();
  const [passwordState, setPassword] = useState();
  const [storeNameState, setStoreNameState] = useState();
  const [tempStoreName, setTempStoreName] = useState();  
     const [appType, setAppType] = useState(null);
       const { budgetloading, startDateFormatted, endDateFormatted, activeDepartmentBudget, totalspend } = useBudgetData();
     
  const route = useRoute();
  AsyncStorage.getItem('is_pos_manager')
    .then(is_pos_manager => {
      // is_pos_manager will be a string: 'true' or 'false'
      setTempmanager(is_pos_manager);
    })

  const initializeData = useCallback(async () => {
    setLoading(true);
    const apptype = await AsyncStorage.getItem('apptype');
    setAppType(apptype);
    try {
      const roleFromStorage = await AsyncStorage.getItem('user_role');
      const warehouseId = await AsyncStorage.getItem('warehouseId');
      OneSignal.setExternalUserId(roleFromStorage + warehouseId);
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      const daysUntilMonday = (dayOfWeek + 6) % 7;
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - daysUntilMonday);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      const startDatecurr = `${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(
        startDate.getDate()
      ).padStart(2, '0')}-${startDate.getFullYear()}`;
      const endDatecurr = `${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(
        endDate.getDate()
      ).padStart(2, '0')}-${endDate.getFullYear()}`;
      setStartDateFormatted(startDatecurr);
      setEndDateFormatted(endDatecurr);
      const allocationDetails = await getTotalAllocationCurrentWeek();
      if (
        allocationDetails &&
        allocationDetails.status === 'success' &&
        Array.isArray(allocationDetails.data) &&
        allocationDetails.data.length > 0
      ) {
        const { allocated_amount, remaining_allocated_amount, remainingPOBalance, cashBalance,accountBalance } = allocationDetails.data[0];
        const usedallocated = allocated_amount - remainingPOBalance;
        setAllocationData({ allocated_amount, remaining_allocated_amount, remainingPOBalance, usedallocated,cashBalance,accountBalance });
        const progressValue = allocated_amount
          ? remainingPOBalance / allocated_amount
          : 0;
        setTotalSpend(progressValue);
      }
   

    } catch (error) {
      console.error('Error fetching vendor names or allocation details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      initializeData();
    }, [initializeData])
  );

  useEffect(() => {
    AsyncStorage.getItem('ManageAccount').then(val => {
      // val will be 'true' or 'false'
      // If you want an automatic redirect:
      if (val === 'true') {
        if (tempMeneger === 'true') {
          navigation.replace('VendorPOData');
        } else {
          navigation.replace('DepartmentAccount');
        }
      }
    });

  }, [tempMeneger]);

  console.log('routes :', route);
  let tempStoreUrl;
  // AsyncStorage.removeItem('access_token');
  const BeforeLoginStoreCheck = () => {
    try {
      setLoading_page(true);
      let usernameAfterEmailSplit = usernameState.split('@')[1];
      fetch('https://cms.vervebot.io/storelist.json')
        .then(x => x.json())
        .then(y => {
          console.log(y);
          if (y[0]?.hasOwnProperty(usernameAfterEmailSplit)) {
            setItem(y[0][usernameAfterEmailSplit]);
            console.log("cms list", item);
            setModalVisible(true);
            setLoading_page(false);
          } else {
            alert('Email not found');
            console.log(usernameAfterEmailSplit);
            setLoading_page(false);
          }
        });
    } catch (error) {
      setLoading_page(false);
      alert('Some error try again in sometime.');
      console.log(error);
    }
  };
  async function login() {
    console.log('login');
    try {
      setLoading_page(true);
      // Prepare POST request with JSON:
      const response = await fetch(`${loginUrl}/api/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameState,
          password: passwordState,
        }),
        credentials: 'omit', // ensures cookies are not sent
      });
      const responseData = await response.json();
      console.log('Login response: ', responseData);

      // The new API returns { access, refresh }
      const accessToken = responseData.access;
      const refreshToken = responseData.refresh;
      if (!accessToken) {
        alert('Invalid username or password');
        setLoading_page(false);
        return;
      }

      // Store both tokens
      await AsyncStorage.setItem('access_token', accessToken);

      if (refreshToken) {
        await AsyncStorage.setItem('refresh_token', refreshToken);
      }

      if (responseData.user_context) {
        await AsyncStorage.setItem('lang', responseData.user_context.lang);
        await AsyncStorage.setItem(
          'tz',
          responseData.user_context.tz,
        );

        await AsyncStorage.setItem(
          'uid',
          responseData.user_context.uid.toString(),
        );
      }

      // If your response includes is_pos_manager / is_promotion_accessible:
      if (responseData?.is_pos_manager) {
        await AsyncStorage.setItem(
          'is_pos_manager',
          responseData.is_pos_manager.toString(),
        );
      } else {
        await AsyncStorage.setItem('is_pos_manager', 'false');
      }
      if (responseData.user.groups[0]) {
        await AsyncStorage.setItem(
          'user_role',
          responseData.user.groups[0],
        )
      }
      if (responseData?.is_promotion_accessible) {
        await AsyncStorage.setItem(
          'is_promotion_accessible',
          responseData.is_promotion_accessible.toString(),
        );
      } else {
        await AsyncStorage.setItem('is_promotion_accessible', 'false');
      }
      // If you want to store the DB name:
      await AsyncStorage.setItem('dbname', loginDb);

      // Firestore or other post-login tasks
      await fetchFirebaseDataAfterLogin();

      // The rest of your original logic for navigation, etc.
      if (toggleChecked === 'checked') {

        await AsyncStorage.setItem('ManageAccount', 'true');
        const user_role = await AsyncStorage.getItem(
          'user_role');
        console.log('user_role_login', user_role);
        if (user_role === 'manager') {
          console.log('user_role', user_role);
          await AsyncStorage.setItem(
            'is_pos_manager',
            'true',
          );
          navigation.navigate('Root');

        } else if (user_role === 'account_manager') {
          navigation.navigate('Root');

        }
      }
      setLoading_page(false);
    } catch (error) {
      console.log('error in login:', error);
      alert('Error Occurred in API.');
      setLoading_page(false);
    }
  }
  AsyncStorage.getItem('access_token')
    .then(access_token => {
      console.log('access_token : ', access_token);
      if (access_token == null) {
        navigation.navigate('Login');
      }
      // use the access_token value here
    })
    .catch(error => {
      // handle error here
    });
  let is_manager = '';
  AsyncStorage.getItem('is_pos_manager')
    .then(is_pos_manager => {
      console.log('is_pos_manager : ', is_pos_manager);
      setTempmanager(is_pos_manager);
    })
    .catch(error => {
      alert('some error');
    });
  AsyncStorage.getItem('is_promotion_accessible')
    .then(is_promotion_accessible => {
      console.log('is_promotion_accessible : ', is_promotion_accessible);
      setTempPromotion(is_promotion_accessible);
    })
    .catch(error => {
      alert('some error');
    });

  AsyncStorage.getItem('username')
    .then(username => {
      console.log('username : ', username);
      setIUsernameState(username);
    })
    .catch(error => {
      alert('some error');
    });

  AsyncStorage.getItem('password')
    .then(password => {
      console.log('password : ', password);
      setPassword(password);
    })
    .catch(error => {
      alert('some error');
    });

  AsyncStorage.getItem('storeName')
    .then(storeName => {
      console.log('storeName : ', storeName);
      setStoreNameState(storeName);
    })
    .catch(error => {
      alert('some error');
    });

  console.log(tempMeneger, 'is_manager');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', height: '100%' }}>
        <ScrollView>
          {/* Modal Start */}
          {/* <View style={{backgroundColor:'red'}}> */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <ImageBackground style={{ flex: 1, width: '100%', height: '100%' }}
              source={BgImageNew}
              resizeMode="cover" >
              <View
                style={{
                  marginTop: '40%',
                  width: '80%',
                  alignSelf: 'center',
                  borderColor: 'black',
                  borderWidth: 0.5,
                  padding: '5%',
                  borderRadius: 15, backgroundColor: 'rgba(245, 245, 245, 1)'
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    margin: '5%',
                    fontSize: 18,
                    color: 'black', fontWeight: 'bold'
                  }}>
                  {otpInput ? 'VERIFY STORE PIN' : 'SELECT STORE'}
                </Text>
                <ScrollView>
                  {item?.length
                    ? item?.map(element =>
                      Object.entries(element).map(([key, value]) => {
                        return (
                          <View>
                            {otpInput ? null : (
                              <TouchableOpacity
                                onPress={() => {
                                  console.log(
                                    value.split(',')[0],
                                    key,
                                    'key and url',
                                  );
                                  tempStoreUrl = value.split(',')[0];
                                  setTempStoreName(key);
                                  setloginUrl(value.split(',')[0]);
                                  setloginDB(value.split(',')[1]);
                                  setloginOTP(value.split(',')[2]);
                                  setOtpInput(!otpInput);
                                }}
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  borderColor: 'black',
                                  borderWidth: 0.5,
                                  padding: '2%',
                                  margin: '1%',
                                  borderRadius: 10,
                                }}>
                                <Image style={{ width: 70, height: 70, borderRadius: 10, }}
                                  source={VervebotLogo}
                                  resizeMode="contain" >
                                </Image>
                                <Text
                                  style={{ fontSize: 16, alignSelf: 'center', padding: '3%' }}>{key}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      }),
                    )
                    : null}
                  {otpInput ? (
                    <View style={{ marginTop: '20%' }}>
                      <TextInput
                        value={otp}
                        onChangeText={e => {
                          setOtp(e);
                        }}
                        placeholder="PIN"
                        placeholderTextColor="grey"
                        style={{
                          borderColor: 'black',
                          borderWidth: 0.5,
                          width: '90%',
                          padding: '4%',
                          marginVertical: '2%',
                          fontSize: 16,
                          borderRadius: 10,
                          overflow: 'hidden',
                          alignSelf: 'center',
                        }}
                      />
                      {otp?.length >= 4 ? (
                        <TouchableOpacity
                          onPress={() => {
                            console.log(loginOTP, 'loginOTP');
                            if (loginOTP === otp) {
                              setOtpInput(!otpInput);
                              setModalVisible(!modalVisible);
                              setOtp();
                              login();
                            } else {
                              alert('Wrong PIN');
                            }
                          }}
                          style={{
                            alignItems: 'center',
                            marginHorizontal: '10%',
                            marginVertical: '5%',
                            borderColor: '#fff',
                            borderWidth: 0.5,
                            padding: '2%',
                            borderRadius: 20,
                            backgroundColor: '#3399ff',
                          }}>
                          <Text
                            style={{
                              fontSize: 21,
                              color: '#fff',
                              fontWeight: '500', padding: '3%'
                            }}>
                            VERIFY
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View
                          style={{
                            alignItems: 'center',
                            marginHorizontal: '10%',
                            marginVertical: '5%',
                            borderColor: '#fff',
                            borderWidth: 0.5,
                            padding: '2%',
                            borderRadius: 20,
                            backgroundColor: '#a6a6a6',
                          }}>
                          <Text
                            style={{
                              fontSize: 21,
                              color: '#fff',
                              fontWeight: '500', padding: '3%'
                            }}>
                            VERIFY
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </ScrollView>
                <Pressable
                  style={{
                    alignItems: 'center',
                    marginHorizontal: '10%',
                    // marginVertical: '5%',
                    borderColor: '#ff0000',
                    borderWidth: 0.5,
                    padding: '2%',
                    borderRadius: 20,
                    backgroundColor: '#fff', marginTop: '10%'
                  }}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    setOtpInput(false);
                    setOtp();
                  }}>
                  <Text
                    style={{ fontSize: 21, color: '#ff0000', fontWeight: '500', padding: '2%' }}>
                    CANCEL
                  </Text>
                </Pressable>
              </View>
            </ImageBackground>
          </Modal>
          {/* </View> */}
          {/* Modal end */}
    <TotalBudgetCard
      budgetloading={budgetloading}
      startDateFormatted={startDateFormatted}
      endDateFormatted={endDateFormatted}
      activeDepartmentBudget={activeDepartmentBudget}
      totalspend={totalspend}
    />
    <View
                    style={{
                      padding: '3%',
                    }}>
     <View
              style={{
                flexDirection: 'row'
              }}>
              <View style={styles.warehousecatainerlocation}>
                <View
                  style={styles.warehousemap}>
                  <Image
                    style={styles.graph}
                    source={require('../../../../src/images/LocationIcon.png')}
                  />
                  <Text style={{ textAlign: 'left', fontWeight: '700', fontSize: 16 }}>
                    {storeNameState}
                  </Text>
                </View>
              </View>
              <View style={styles.budgetWarehouseButtons}>
                <TouchableOpacity
                  style={styles.headerwarehousebutton}
                  onPress={() => BeforeLoginStoreCheck()}
                >
                  <Text style={styles.buttonWarehouseText}>Change Location</Text>
                </TouchableOpacity>
              </View>

              <View>
              </View>


            </View>

  <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              marginHorizontal: '2%',
              borderColor: '#939596',
              borderWidth: 1,
              marginVertical: '0%',
              padding: '3%',
              borderRadius: 20,
              borderColor: '#f9f9f9',
              marginTop: '5%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <View style={styles.container}>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => navigation.navigate('DepartmentPOData')}>
                  <Image
                    style={styles.logo}
                    source={require('../../../../src/images/CreatePO.png')}
                  />
                  <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }}>
                    CREATE{'\n'} PO
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.container}>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => navigation.navigate('DepartmentReport')}>
                  <Image
                    style={styles.logo}
                    source={require('../../../../src/images/department_report_image.png')}
                  />
                  <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }}>
                    DEPARTMENT {'\n'}REPORT
                  </Text>
                </TouchableOpacity>
              </View>
              {/* {tempSalePrint == 'true' ? ( */}
              <View style={styles.container}>
                <TouchableOpacity style={{ alignItems: 'center' }}
                  onPress={() => navigation.navigate('OrderReport')}>
                  <Image style={styles.logo}
                    source={require('../../../../src/images/Vendor-Report-icon.png')}
                  />
                  <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }}>VENDOR {'\n'}REPORT</Text>
                </TouchableOpacity>
              </View>
              {/* )  */}
            </View>
            <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
              <View style={styles.container}>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() =>
                    navigation.navigate(
                      'DepartmentRequestAmount'
                    )
                  }>
                  <Image
                    style={styles.logo}
                    source={require('../../../../src/images/Budget-Request-Icon.png')}
                  />
                  <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }}>
                    DEPARTMENT {'\n'}BUDGET
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.container}>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => navigation.navigate('PONextWeek')}>
                  <Image
                    style={styles.logo}
                    source={require('../../../../src/images/NextWeek.png')}
                  />
                  <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }}>
                    NEXT WEEK{'\n'} PO
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.container}>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => navigation.navigate('DepartmentRequestBudgetNextWeek')}>
                  <Image
                    style={styles.logo}
                    source={require('../../../../src/images/Next-Week-Budget-Icon.png')}
                  />
                  <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }}>
                    NEXT WEEK {'\n'}BUDGET
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </View>
     
          <TopVendorBarChart />
        </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  boxText: {
    padding: '1%',
    fontSize: 20,
    color: '#000',
    fontWeight: '400',
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    marginTop: 10,
    padding: 8,
    width: '30%',
    borderColor: '#000',
    shadowColor: '#000',
    elevation: 5,
  },

  logo: {
    width: 73,
    height: 62,
    justifyContent: 'center',
    aspectRatio: 1,
  },

  topcard: {
    backgroundColor: '#2C62FF',
    width: '100%',
    padding: 10,
  },
  row: {
    marginHorizontal: '5%',
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleTextWhite: {
    color: '#fff',
  },
  budgetrow:{
    flexDirection:'row',
  },
  buttonWarehouseText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  headerwarehousebutton: {
    backgroundColor: '#23729d',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetWarehouseButtons: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: '30%',
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
  warehousecatainerlocation: {
    width: '70%',
    paddingHorizontal: 10,
    paddingVertical: 10,

  },
});

export default VendorManagerDashboard;
