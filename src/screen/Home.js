import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Image, Pressable, Modal, ActivityIndicator, ImageBackground,PermissionsAndroid, Platform } from 'react-native';
import promoGif from '../images/homeBG.webp';
import VervebotLogo from '../images/vervebotLogo.png'
import BgImageNew from '../images/BgImageNew.png';
import Geolocation from 'react-native-geolocation-service';

const Home = () => {
  const navigation = useNavigation();  // Get the navigation object
  const [data, setData] = useState();
  const lastDistanceAlertAtRef = React.useRef(0);
  // const [tempSalePrint, settempSalePrint] = useState(false)
  const [tempMeneger, setTempmanager] = useState(false);
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
 const [modalVisibleRegistration, setModalVisibleRegistration] = useState(false);
  const route = useRoute();

useEffect(() => {
  let isMounted = true;
  let isFetching = false;
  const controller = new AbortController();

  const AUTH_KEYS = [
    'loginDb',
    'is_pos_manager',
    'username',
    'password',
    'storeName',
    'storeUrl',
    'access_token',
  ];

  // --- distance helpers ---
  const toRad = (deg) => (deg * Math.PI) / 180;
  const haversineMeters = (lat1, lon1, lat2, lon2) => {
    if (
      [lat1, lon1, lat2, lon2].some(
        (v) => v === null || v === undefined || Number.isNaN(Number(v))
      )
    ) return NaN;

    const R = 6371000; // meters
    const φ1 = toRad(Number(lat1));
    const φ2 = toRad(Number(lat2));
    const Δφ = toRad(Number(lat2) - Number(lat1));
    const Δλ = toRad(Number(lon2) - Number(lon1));

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Allow Location',
            message: 'We need your location to verify activity.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS prompts automatically
        return true;
      }
    } catch (e) {
      console.warn('Permission error:', e);
      return false;
    }
  };

  const getLocationOnce = () =>
    new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(null), 10000);

      Geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = pos.coords || {};
          resolve({ latitude, longitude });
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('getCurrentPosition error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    });

  const checkAuth = async () => {
    if (isFetching) return;
    isFetching = true;

    try {
      const storeUrl = await AsyncStorage.getItem('storeUrl');
     const is_location_feature_enabled = await AsyncStorage.getItem('is_location_feature_enabled');  
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!storeUrl || !accessToken) throw new Error('Missing credentials');
      console.log("is_location_feature_enabled:",is_location_feature_enabled);
      if(is_location_feature_enabled == 'True'){
      const headers = new Headers();
      headers.append('access_token', accessToken);
      headers.append('Cookie', 'session_id');

      const response = await fetch(`${storeUrl}/api/pos/app/check_authentication`, {
        method: 'GET',
        headers,
        redirect: 'follow',
        credentials: 'omit',
        signal: controller.signal,
      });

      if (!isMounted) return;

      let storelat = null;
      let storelong = null;

      if (response.status === 200) {
        const data = await response.json();
        console.log('auth data:', data);
        storelat = data?.companyLocationDetail?.latitude ?? null;
        storelong = data?.companyLocationDetail?.longitude ?? null;
        console.log('storelat:', storelat, 'storelong:', storelong);
      } else if (response.status === 401) {
        console.log('check state', response.status);
        // await AsyncStorage.multiRemove(AUTH_KEYS);
          navigation.navigate('Login');
      } else {
        console.warn('Auth check returned status:', response.status);
      }

      // === Location + distance check on same cadence ===
      const hasPerm = await requestLocationPermission();
      if (!hasPerm) {
        console.log('Location permission not granted');
        return;
      }

      const loc = await getLocationOnce();
      if (!loc) {
        console.log('Location unavailable this cycle');
        return;
      }

      console.log('Current location:', loc.latitude, loc.longitude);

      if (storelat != null && storelong != null && response.status === 200) {
        const distance = haversineMeters(
          Number(loc.latitude),
          Number(loc.longitude),
          Number(storelat),
          Number(storelong)
        );

        if (Number.isFinite(distance)) {
          // 50 meters threshold
          console.log("distance:",distance);
          if (distance > 50) {
            const now = Date.now();
            // alert at most once every 2 minutes
            if (now - lastDistanceAlertAtRef.current > 2 * 60 * 1000) {
              Alert.alert(
                'Out of range',
                'you are far from store , make sure you are in store'
              );
              lastDistanceAlertAtRef.current = now;
             navigation.navigate('Login');
            }
            console.log(`Distance from store: ${distance.toFixed(1)} m (too far)`);
          } else {
            console.log(`Distance from store: ${distance.toFixed(1)} m (OK)`);
          }
        } else {
          console.warn('Invalid coordinates; could not compute distance');
        }
      } else {
        console.warn('Store coordinates missing; skip distance check');
      }
   } } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
      }
    } finally {
      isFetching = false;
    }
  };

  // fire once immediately, then every 10s (your code comment said 20s)
  checkAuth();
  const intervalId = setInterval(checkAuth, 10000);

  return () => {
    isMounted = false;
    controller.abort();
    clearInterval(intervalId);
    Geolocation.stopObserving?.();
  };
}, [navigation]);

  // console.log('routes :', route);
  let tempStoreUrl;

  // AsyncStorage.removeItem('access_token');
  const BeforeLoginStoreCheck = () => {
    try {
      setLoading_page(true);
      let usernameAfterEmailSplit = usernameState.split('@')[1];
      fetch('https://cms.vervebot.io/storelist.json')
        .then(x => x.json())
        .then(y => {
          // console.log(y);
          if (y[0]?.hasOwnProperty(usernameAfterEmailSplit)) {
            setItem(y[0][usernameAfterEmailSplit]);
            // console.log("cms list", item);
            setModalVisible(true);
            setLoading_page(false);
          } else {
            alert('Email not found');
            // console.log(usernameAfterEmailSplit);
            setLoading_page(false);
          }
        });
    } catch (error) {
      setLoading_page(false);
      alert('Some error try again in sometime.');
      console.log(error);
    }
  };

  const login = () => {
    // console.log('login');
    var myHeaders = new Headers();
    myHeaders.append(
      'Cookie',
      'session_id',
    );
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    setLoading_page(true);
    fetch(
      `${loginUrl}/api/auth/token?db=${loginDb}&login=${usernameState}&password=${passwordState}`,
      requestOptions,
    )
      .then(response => response.text())
      .then(async result => {
        // console.log('result is:', result);
        let responseData = JSON.parse(result);
        let acc_token = responseData.access_token;
        // console.log('acc_token ', acc_token);

        if (acc_token === undefined) {
          alert('Invalid  username or password');
          setLoading_page(false);
        } else {
          if (responseData.access_token !== '') {
            await AsyncStorage.setItem(
              'access_token',
              responseData.access_token,
            );
            await AsyncStorage.setItem(
              'loginAuthDetails',
              JSON.stringify(responseData),
            );
            await AsyncStorage.setItem('storeName', tempStoreName);
            setStoreNameState(tempStoreName);
            await AsyncStorage.setItem('storeUrl', loginUrl);
            setLoading_page(false);
          } else {
            alert('something went wrong !');
            setLoading_page(false);
          }
        }
      })
      .catch(error => {
        console.log('error', error);
        alert('Error Occured in API.');
        setLoading_page(false);
      });
  };

  AsyncStorage.getItem('access_token')
    .then(access_token => {
      // console.log('access_token : ', access_token);
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
      // console.log('is_pos_manager : ', is_pos_manager);
      setTempmanager(is_pos_manager);
    })
    .catch(error => {
      alert('some error');
    });

  AsyncStorage.getItem('is_promotion_accessible')
    .then(is_promotion_accessible => {
      // console.log('is_promotion_accessible : ', is_promotion_accessible);
      setTempPromotion(is_promotion_accessible);
    })
    .catch(error => {
      alert('some error');
    });

  AsyncStorage.getItem('username')
    .then(username => {
      // console.log('username : ', username);
      setIUsernameState(username);
    })
    .catch(error => {
      alert('some error');
    });

  AsyncStorage.getItem('password')
    .then(password => {
      // console.log('password : ', password);
      setPassword(password);
    })
    .catch(error => {
      alert('some error');
    });

  AsyncStorage.getItem('storeName')
    .then(storeName => {
      // console.log('storeName : ', storeName);
      setStoreNameState(storeName);
    })
    .catch(error => {
      alert('some error');
    });

  // console.log(tempMeneger, 'is_manager');

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5]', height: '100%' }}>
      <ImageBackground
        source={promoGif}
        resizeMode="cover"
        style={{ justifyContent: 'center' }}>
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
                                  // console.log(
                                  //   value.split(',')[0],
                                  //   key,
                                  //   'key and url',
                                  // );
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
                            // console.log(loginOTP, 'loginOTP');
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
          <View style={{ marginTop: '25%' }}>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                marginHorizontal: '5%',
                borderColor: '#939596',
                borderWidth: 1,
                marginVertical: '0%',
                padding: '3%',
                borderRadius: 20,
                borderColor: 'rgba(126, 129, 255, 0.5)',
              }}>
              {!loading_page ? (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginHorizontal: '5%',
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        marginBottom: 20,
                      }}>
                      USER :
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        marginBottom: 20,
                      }}>
                      {usernameState}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginHorizontal: '5%',
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        marginBottom: 20,
                      }}>
                      LOCATION :
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        marginBottom: 20,
                      }}>
                      {storeNameState}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => BeforeLoginStoreCheck()}
                    style={{
                      borderColor: 'rgba(126, 129, 255, 0.5)',
                      borderWidth: 0,
                      width: '70%',
                      alignSelf: 'center',
                      alignItems: 'center',
                      padding: '2%',
                      borderRadius: 10,
                      backgroundColor: '#3784fd',
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 16,
                        color: '#fff', padding: 5,
                        
                      }}>
                      CHANGE LOCATION
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginVertical: '20%' }}>
                  <ActivityIndicator size="large" color="#000" />
                </View>
              )}
            </View>
            <View
              style={[styles.menuContainer, { marginTop: '5%' }]}>
              <View style={styles.menuGrid}>
                {/* First Row: Products and Reports */}
                <View style={styles.menuRow}>
                  <View style={styles.menuItem}>
                    <TouchableOpacity
                      style={styles.menuButton}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('Product')}>
                      <Image
                        style={styles.menuIcon}
                        source={require('../.././src/images/product.png')}
                      />
                      <Text style={styles.menuText}>PRODUCTS</Text>
                    </TouchableOpacity>
                  </View>

                  {tempMeneger === 'true' && (
                    <View style={styles.menuItem}>
                      <TouchableOpacity
                        style={styles.menuButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Reports')}>
                        <Image
                          style={styles.menuIcon}
                          source={require('../.././src/images/report_image.png')}
                        />
                        <Text style={styles.menuText}>POS REPORTS</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {/* Second Row: Print Sheet and Promotion */}
                <View style={styles.menuRow}>
                  <View style={styles.menuItem}>
                    <TouchableOpacity
                      style={styles.menuButton}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('PrintSales')}>
                      <Image
                        style={styles.menuIcon}
                        source={VervebotLogo}
                        resizeMode='contain'
                      />
                      <Text style={styles.menuText}>PRINT SHEET</Text>
                    </TouchableOpacity>
                  </View>

                  {tempPromotion === 'true' && (
                    <View style={styles.menuItem}>
                      <TouchableOpacity
                        style={styles.menuButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('PromotionList')}>
                        <Image
                          style={styles.menuIcon}
                          source={require('../.././src/images/promotion.png')}
                        />
                        <Text style={styles.menuText}>PROMOTIONS</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
      
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: '5%',
    borderWidth: 1,
    padding: '3%',
    borderRadius: 20,
    borderColor: 'rgba(126, 129, 255, 0.5)',
  },
  menuGrid: {
    padding: 12,
    width: '100%',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 32,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
     margin: 5,
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(126, 129, 255, 0.3)',
    width: 150,
  },
  menuButton: {
    alignItems: 'center',
    padding: 16,
    height: 130,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
  },
  menuIcon: {
    width: 65,
    height: 65,
    marginBottom: 12,
  },
  menuText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#000',
    letterSpacing: 0.5,
  },
  boxText: {
    padding: '1%',
    fontSize: 20,
    color: '#000',
    fontWeight: '400',
  },
  // Box: {
  //   borderColor: '#000',
  //   borderWidth: 1,
  //   margin: '1%',
  //   padding: '2%',
  //   borderRadius: 5,
  //   backgroundColor: 'white',
  //   width: '30%',
  //   height: 100,
  // },

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
  // input: {
  //   margin: 10,
  //   height: 50,
  //   width: '90%',
  //   backgroundColor: 'white',
  //   borderColor: '#000',
  //   borderWidth: 1,
  //   color: '#000',
  //   padding: '1%',
  //   fontSize: 20,
  //   borderRadius: 10,
  // },
  logo: {
    width: 73,
    height: 62,
    justifyContent: 'center',
    aspectRatio: 1,
  },
});

export default Home;
