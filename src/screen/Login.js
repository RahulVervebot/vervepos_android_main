import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, Modal, Pressable, ImageBackground, KeyboardAvoidingView, Linking,StyleSheet } from 'react-native';
import CheckBox from 'react-native-check-box';
import { useNavigation } from '@react-navigation/native';
import VervebotLogo from '../images/vervebotLogo.png';
import BgImageNew from '../images/BgImageNew.png';
import { styles } from './AppStyles';
import Icon from 'react-native-vector-icons/Feather';
import { dbPromise } from '../firebaseConfig'; // Ensure Firebase config is correct
import { ToggleButton } from 'react-native-paper';
import OneSignal from 'react-native-onesignal';
const stylesmanager = StyleSheet.create({
  toggleButton: {
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#fff', // color when checked
  },
  unchecked: {
    backgroundColor: 'transparent',
  },
  inputContainer: {
    alignSelf: 'center',
    textAlign: 'center',
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center',
  },
  LoginPasswordTxtInput: {
    flex: 1, // Takes up the remaining space
  },
  iconContainer: {
    marginLeft: '-5%',
  },
});
const LoginForm = ({ }) => {
  const [check, setCheck] = useState(false);
  const [loader, setLoader] = useState(false);
  const [loading_page, setLoading_page] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [otpInput, setOtpInput] = useState(false);
  const [otp, setOtp] = useState();
  const [item, setItem] = useState([]);
  const [loginUrl, setloginUrl] = useState(null);
  const [loginDb, setloginDB] = useState(null);
  const [loginOTP, setloginOTP] = useState(null);
  const navigation = useNavigation();
  const TCUrl = 'https://vervebot.io/privacy-policy/';
  const [showPassword, setShowPassword] = useState(false);
   const [budgettype, setBudgetType] = useState('');
    const [toggleChecked, setToggleChecked] = useState('unchecked'); 
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    dbname: '',
    user_full_name: '',
  });

  async function login() {
    console.log('login');
    try {
      setLoading_page(true);
      // Prepare POST request with JSON:
      const response = await fetch(`${loginUrl}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
        }),
        credentials: 'omit', // ensures cookies are not sent
      });
      const responseData = await response.json();
      console.log('responseDataassigned_warehouses:',responseData.user.assigned_warehouses);
      console.log('responseDataassigned:',responseData.user);
     const warehouseId = responseData.user.assigned_warehouses[0].warehouseId;
     const assignedWarehouses = responseData.user.assigned_warehouses;

     if (Array.isArray(assignedWarehouses) && assignedWarehouses.length > 0) {
       await AsyncStorage.setItem('warehouseIdList', JSON.stringify(assignedWarehouses));
     
       // If you still want to store the first warehouse separately
       await AsyncStorage.setItem('warehouseId', assignedWarehouses[0].warehouseId.toString());
     } else {
       console.warn('No assigned warehouses found in response.');
     }
      const accessToken = responseData.access;
      if (responseData?.user?.stores && responseData.user.stores.length > 0) {
        const storeId = responseData.user.stores[0]; // Extract first store ID
        await AsyncStorage.setItem('store_id', storeId.toString());
      } else {
        console.log('Store ID not found in response');
      }
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
      // If your old code expects user_full_name, user_context, etc., you may need a separate API call
      // For now, let's handle them IF they exist in the response (some DRF setups do not provide these)
      if (responseData.user_full_name) {
        await AsyncStorage.setItem('name', responseData.user_full_name);
        await AsyncStorage.setItem('username', userData.username);
        await AsyncStorage.setItem('password', userData.password);
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

      // Save the user's login info
      await AsyncStorage.setItem(
        'loginAuthDetails',
        JSON.stringify(userData),
      );

      // If your response includes is_pos_manager / is_promotion_accessible:
      if (responseData?.is_pos_manager) {
        await AsyncStorage.setItem(
          'is_pos_manager',
          responseData.is_pos_manager.toString(),
        );
      } else {
        await AsyncStorage.setItem('is_pos_manager', 'false');
      }

      if(responseData.user.groups[0]){
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
      const user_role =  await AsyncStorage.getItem(
          'user_role');
          console.log('user_role_login', user_role);
        if (user_role === 'manager') {
          console.log('user_role', user_role);
          await AsyncStorage.setItem(
            'is_pos_manager',
            'true',
          );
          navigation.reset({
            index: 0,
            routes: [{ name: 'Root' }],
          });

        } else if(user_role === 'account_manager') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Root' }],
          });
   
        }
        else if(user_role === 'store_manager') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Root' }],
          });
        }
      }

      setLoading_page(false);
    } catch (error) {
      console.log('error in login:', error);
      alert('Error Occurred in API.');
      setLoading_page(false);
    }
  }

    function loginHome() {
    // console.log('login');
    var myHeaders = new Headers();
    myHeaders.append(
      'Cookie', 'session_id',
    );
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'omit', // Ensures cookies are not sent
    };

    // console.log("loginDb", loginDb);
    AsyncStorage.setItem('dbname', loginDb);

    setLoading_page(true);
    fetch(
      `${loginUrl}/api/auth/token?db=${loginDb}&login=${userData.username}&password=${userData.password}`,
      requestOptions,
    )
      .then(response => response.text())
      .then(async result => {
        // console.log('result ', result);
        let responseData = JSON.parse(result);
        const acc_token = responseData.access_token;
        // console.log('acc_token ', acc_token);
        if (acc_token === undefined) {
          alert('Invalid  username or password');
          setLoading_page(false);
        } else {
          if (responseData.access_token !== '') {
            console.log('All Login Values', responseData);
            // await fetchFirebaseDataAfterLogin();
            // console.log('is_show_cost_price console', responseData.is_show_cost_price);

            await AsyncStorage.setItem('name', responseData.user_full_name);
            // await AsyncStorage.setItem('dbname', userData.dbname);
            await AsyncStorage.setItem('username', userData.username);
            await AsyncStorage.setItem('password', userData.password);
            await AsyncStorage.setItem('lang', responseData.user_context.lang);
            await AsyncStorage.setItem('tz', responseData.user_context.tz);
            await AsyncStorage.setItem('uid', responseData.user_context.uid.toString());

     console.log("responseData home:",responseData);
            if (responseData.hasOwnProperty('is_show_cost_price')) {
              await AsyncStorage.setItem('is_show_cost_price', responseData.is_show_cost_price.toString());
            } else {
              await AsyncStorage.setItem('is_show_cost_price', 'true');
            }
            // console.log("is_show_expiry_date===========>", responseData.is_show_expiry_date);
            if (responseData.hasOwnProperty('is_show_expiry_date')) {
              await AsyncStorage.setItem('is_show_expiry_date', responseData.is_show_expiry_date.toString());
            } else {
              await AsyncStorage.setItem('is_show_expiry_date', 'false');
            }

            // Key To Show Credit Sale Report In Reporting Section
            if (responseData.hasOwnProperty('is_show_credit_sale')) {
              await AsyncStorage.setItem('is_show_credit_sale', responseData.is_show_credit_sale.toString());
              // console.log("responseData.is_show_cost_price", responseData.is_show_credit_sale);
            } else {
              await AsyncStorage.setItem('is_show_credit_sale', 'false');
            }

            await AsyncStorage.setItem(
              'loginAuthDetails',
              JSON.stringify(userData),
            );
            // console.log('user_full_name ', responseData.user_full_name);
            await AsyncStorage.setItem(
              'access_token',
              responseData.access_token,
            );
            if (responseData?.is_pos_manager && responseData?.uid !== 2) {
              await AsyncStorage.setItem(
                'is_pos_manager',
                responseData.is_pos_manager.toString(),
              );
            } else if (responseData?.uid === 2) {
              await AsyncStorage.setItem(
                'is_pos_manager',
                'true',
              );
            }  // console.log("is_pos_manager", responseData.is_pos_manager);
            else {
              await AsyncStorage.setItem('is_pos_manager', 'false');
            }
            if (responseData?.is_promotion_accessible) {
              await AsyncStorage.setItem(
                'is_promotion_accessible',
                responseData.is_promotion_accessible.toString(),
              );
            } else {
              await AsyncStorage.setItem('is_promotion_accessible', 'false');
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'Root' }],
            });

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
  }


  const BeforeLoginStoreCheck = () => {
    try {
      setLoading_page(true);
      let usernameAfterEmailSplit = userData.username.split('@')[1];
      fetch('https://cms.vervebot.io/storelist.json') //
        .then(x => x.json())
        .then(y => {
          // console.log("storelist data", y);
          if (y[0]?.hasOwnProperty(usernameAfterEmailSplit)) {
            setItem(y[0][usernameAfterEmailSplit]);
            // console.log(item, 'item');
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

   const fetchFirebaseDataAfterLogin = async () => {
    try {

      const db = await dbPromise; // Ensure Firestore is initialized
      const loginDb = await AsyncStorage.getItem('dbname');
      console.log("loginDbs:",loginDb);

      if (loginDb) {
      //  const docRef = await firestore.collection('managerapp').doc(loginDb).get();
        const docRef = db.collection('managerapp').doc(loginDb);
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          console.log('data', data.budget_type);
          await AsyncStorage.setItem('budget_type', data.budget_type);
          AsyncStorage.setItem('po_pdf', data.pdf);
          AsyncStorage.setItem('store_address', data.address);
          AsyncStorage.setItem('store_full_name', data.storename);
          AsyncStorage.setItem('ocrurl', data.ocrurl);
          AsyncStorage.setItem('ocruploadstore', data.ocruploadstore);
          AsyncStorage.setItem('signalappid', data.signalappid);
          AsyncStorage.setItem('signalchannelid', data.signalchannelid);
          AsyncStorage.setItem('signalrestkey', data.signalrestkey);
          AsyncStorage.setItem('apptype', data.apptype);
          setBudgetType(data.budget_type);
          console.log('Firebase data fetched and stored in AsyncStorage');
          OneSignal.setAppId(data.signalappid);
        } else {
          console.error('Firebase document does not exist');
        }

      } else {
        console.error('LoginDB not found in AsyncStorage');
      }

    } catch (error) {
      console.error('Failed to retrieve Firebase data:', error);
    }

  };

 return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{}}>
      <ScrollView style={{}}>
        <View style={{ flex: 1, backgroundColor:"#1B66AB" }}>
          <ImageBackground
            style={{}}
            source={BgImageNew}
            resizeMode="cover"
          >
            {/* ────────────────────────────────────────────────────────────────────────
                MODAL: SELECT STORE + VERIFY STORE PIN
               ──────────────────────────────────────────────────────────────────────── */}
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <ImageBackground
                style={{ flex: 1, backgroundColor:"#1B66AB" }}
                source={BgImageNew}
                resizeMode="cover"
              >
                <ScrollView>
                  <View style={styles.DelightModelView}>
                    <Text style={styles.DelightModelText}>
                      {otpInput ? 'VERIFY STORE PIN' : 'SELECT STORE'}
                    </Text>

                    <ScrollView>
                      {item?.length
                        ? item?.map(element =>
                            Object.entries(element).map(([key, value]) => {
                              return (
                                <View key={key}>
                                  {!otpInput && (
                                    <TouchableOpacity
                                      style={styles.StoreOtpBtn}
                                      onPress={() => {
                                        AsyncStorage.setItem('storeUrl', value.split(',')[0]);
                                        AsyncStorage.setItem('storeName', key);
                                         AsyncStorage.setItem('username', userData.username);
                                         AsyncStorage.setItem('password', userData.password);
                                        setloginUrl(value.split(',')[0]);
                                        setloginDB(value.split(',')[1]);
                                        setloginOTP(value.split(',')[2]);
                                        setOtpInput(!otpInput);
                                      }}
                                    >
                                      <Image
                                        style={{
                                          width: 70,
                                          height: 70,
                                          borderRadius: 10,
                                        }}
                                        source={VervebotLogo}
                                        resizeMode="contain"
                                      />
                                      <Text
                                        style={{
                                          fontSize: 17,
                                          alignSelf: 'center',
                                          padding: '3%',
                                        }}
                                      >
                                        {key}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              );
                            })
                          )
                        : null}

                      {otpInput ? (
                        <View style={{ marginTop: '20%' }}>
                          <TextInput
                            style={styles.OtpTextInputStyle}
                            value={otp}
                            onChangeText={e => setOtp(e)}
                            placeholder="ENTER STORE PIN"
                            placeholderTextColor="#A9A9A9"
                          />
                          {otp?.length >= 4 ? (
                            <TouchableOpacity
                              style={styles.LoginOtpBtn}
                              onPress={() => {
                                console.log(loginOTP, 'loginOTP');
                                if (loginOTP === otp) {
                                  setOtpInput(!otpInput);
                                  setModalVisible(!modalVisible);
                                  setOtp();
                                  toggleChecked === 'checked' ? login() : loginHome();

                                } else {
                                  alert('Wrong PIN');
                                }
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 21,
                                  color: '#fff',
                                  fontWeight: '600',
                                }}
                              >
                                VERIFY
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.OtpValidationView}>
                              <Text
                                style={{
                                  fontSize: 21,
                                  color: '#5A5A5A',
                                  fontWeight: '600',
                                }}
                              >
                                VERIFY
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : null}
                    </ScrollView>

                    <Pressable
                      style={styles.ModelPressableBtn}
                      onPress={() => {
                        setModalVisible(!modalVisible);
                        setOtpInput(false);
                        setOtp();
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 21,
                          color: '#ff0000',
                          fontWeight: '500',
                          padding: 10,
                        }}
                      >
                        CANCEL
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </ImageBackground>
            </Modal>
            {/* ──────────────────────────────────────────────────────────────────────── */}

            <View style={{}}>
              <View style={{}}>
                <Image
                  style={styles.LogoImage}
                  source={VervebotLogo}
                  resizeMode="contain"
                />
                <Text style={styles.PosForRetailText}>POS FOR RETAIL</Text>
              </View>

              <View style={{}}>
                <Text style={styles.LoginText}>LOGIN</Text>
                <Text style={styles.SignIntoContinueText}>SIGN IN TO CONTINUE</Text>

                <TextInput
                  style={styles.UserNameTxtInput}
                  placeholder="USERNAME"
                  placeholderTextColor="black"
                  value={userData.username}
                  autoCapitalize="none"
                  onChangeText={e => {
                    setUserData(prev => ({ ...prev, username: e }));
                  }}
                />

                {/* Password field with eye icon */}
                <View style={stylesmanager.inputContainer}>
                  <TextInput
                    style={styles.LoginPasswordTxtInput}
                    secureTextEntry={!showPassword}
                    placeholder="PASSWORD"
                    placeholderTextColor="black"
                    value={userData.password}
                    autoCapitalize="none"
                    onChangeText={e => {
                      setUserData(prev => ({ ...prev, password: e }));
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(prev => !prev)}
                    style={stylesmanager.iconContainer}
                  >
                    <Icon
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={24}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>

                {/* Manager Dashboard toggle */}
                <View
                  style={{
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: 'white', marginRight: 10 }}>
                    Tap to Access Manager Dashboard
                  </Text>

                 <ToggleButton
  icon={toggleChecked === 'checked' ? 'check' : 'close'}
  value="check"
  color="white"
  style={[
    stylesmanager.toggleButton,
    toggleChecked === 'checked'
      ? stylesmanager.checked
      : stylesmanager.unchecked,
  ]}
  status={toggleChecked}
  onPress={() => {
    setToggleChecked(toggleChecked === 'checked' ? 'unchecked' : 'checked');
  }}
/>

                </View>

                <View style={styles.CheckBoxView}>
                  <View
                    style={{ flexDirection: 'row', alignSelf: 'center' }}
                  >
                    <CheckBox
                      onClick={() => setCheck(prev => !prev)}
                      checkBoxColor={'white'}
                      checkedCheckBoxColor={'white'}
                      isChecked={check}
                    />
                    <Text style={styles.TCText}>I HAVE READ AND AGREED WITH THE</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(TCUrl)}>
                      <Text style={styles.TCTextForLinking}>T&C.</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.LoginBtnView}>
                  <TouchableOpacity
                    onPress={() => {
                      if (userData.username !== '' && userData.password !== '') {
                        BeforeLoginStoreCheck();
                      } else {
                        alert('Please Fill In Required Fields');
                      }
                    }}
                    disabled={!check}
                  >
                    <View
                      style={{
                        ...styles.submitBtm,
                        opacity: check ? null : 0.5,
                        backgroundColor: check ? 'white' : '#249bd6',
                      }}
                    >
                      <Text
                        style={{
                          ...styles.LoginBtnText,
                          color: check ? 'black' : 'white',
                        }}
                      >
                        LOGIN
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {loading_page ? (
              <View style={styles.LoadingPageView}>
                <View style={{ top: '45%' }}>
                  <ActivityIndicator animating={loading_page} size="large" color="white" />
                  <View>
                    <Text style={{ alignSelf: 'center', color: 'white' }}>LOADING...</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </ImageBackground>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

};

export default LoginForm;