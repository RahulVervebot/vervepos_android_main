import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, Modal, Pressable, ImageBackground, KeyboardAvoidingView, Linking } from 'react-native';
import CheckBox from 'react-native-check-box';
import { useNavigation } from '@react-navigation/native';
import VervebotLogo from '../images/vervebotLogo.png';
import BgImageNew from '../images/BgImageNew.png';
import { styles } from './AppStyles';

import filepath from '../../APIvariables.json';
import { white } from 'react-native-paper/lib/typescript/src/styles/themes/v2/colors';

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
  // let loginUrl;
  // let loginDb;
  // let loginOTP;

  const [userData, setUserData] = useState({
    username: '',
    password: '',
    dbname: '',
    user_full_name: '',
  });

  function login() {
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
            // console.log('is_show_cost_price console', responseData.is_show_cost_price);

            await AsyncStorage.setItem('name', responseData.user_full_name);
            // await AsyncStorage.setItem('dbname', userData.dbname);
            await AsyncStorage.setItem('username', userData.username);
            await AsyncStorage.setItem('password', userData.password);
            await AsyncStorage.setItem('lang', responseData.user_context.lang);
            await AsyncStorage.setItem('tz', responseData.user_context.tz);
            await AsyncStorage.setItem('uid', responseData.user_context.uid.toString());
            if (responseData.hasOwnProperty('is_show_cost_price')) {
              await AsyncStorage.setItem('is_show_cost_price', responseData.is_show_cost_price.toString());
            } else {
              await AsyncStorage.setItem('is_show_cost_price', 'true');
            }
            // console.log("is_show_expiry_date===========>", responseData.is_show_expiry_date);
            if (responseData.hasOwnProperty('is_show_expiry_date')) {
              await AsyncStorage.setItem('is_show_expiry_date', responseData.is_show_expiry_date.toString());
              console.log("is_show_expiry_date:","true");
            } else {
              await AsyncStorage.setItem('is_show_expiry_date', 'false');
                console.log("is_show_expiry_date:","false");
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

            await AsyncStorage.setItem(
              'company_id',
              JSON.stringify(responseData.company_id)

            );
            await AsyncStorage.setItem(
              'company_ids',
              JSON.stringify(responseData.company_ids)
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
            // await AsyncStorage.setItem(
            //   'is_pos_manager',
            //   'true',
            // );
            // console.log("dbname in login", userData.dbname);

            navigation.navigate('Home', {
              db: userData.dbname,
              login: userData.username,
              password: userData.password,
              user_full_name: responseData.user_full_name,
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
  // function urlCheck() {
  //   let current_url;
  //   AsyncStorage.getItem('storeUrl')
  //     .then(storeUrl => {
  //       console.log('storeUrl : ', storeUrl);
  //       current_url = storeUrl;
  //     })
  //     .catch(error => {
  //       alert('some error');
  //     });
  // }

  const BeforeLoginStoreCheck = () => {
    try {
      setLoading_page(true);
      let usernameAfterEmailSplit = userData.username.split('@')[1];
      fetch('https://cms.vervebot.io/storelist.json')
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{}}>
      <ScrollView style={{}}>
        <View style={{ flex: 1 }}>
          <ImageBackground style={{}}
            source={(uri = BgImageNew)}
            resizeMode="cover">

            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <ImageBackground style={{ flex: 1 }}
                source={(uri = BgImageNew)}
                resizeMode="cover">

                <View style={styles.DelightModelView}>
                  <Text style={styles.DelightModelText}> {otpInput ? 'VERIFY STORE PIN' : 'SELECT STORE'} </Text>
                  <ScrollView>
                    {item?.length
                      ? item?.map(element =>
                        Object.entries(element).map(([key, value]) => {
                          return (
                            <View style={{}}>
                              {otpInput ? null : (

                                <TouchableOpacity style={styles.StoreOtpBtn}
                                  onPress={() => {
                                    AsyncStorage.setItem(
                                      'storeUrl',
                                      value.split(',')[0],
                                    );
                                    AsyncStorage.setItem('storeName', key);
                                    setloginUrl(value.split(',')[0]);
                                    setloginDB(value.split(',')[1]);
                                    setloginOTP(value.split(',')[2]);
                                    setOtpInput(!otpInput);
                                  }} >
                                  <Image style={{ width: 70, height: 70, borderRadius: 10, }}
                                    source={(uri = VervebotLogo)}
                                    resizeMode="contain"
                                  ></Image>
                                  <Text style={{ fontSize: 17, alignSelf: 'center', padding: '3%' }}> {key} </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        }),
                      )
                      : null}
                    {otpInput ? (
                      <View style={{ marginTop: '20%' }}>
                        <TextInput style={styles.OtpTextInputStyle}
                          value={otp}
                          onChangeText={e => {
                            setOtp(e);
                          }}
                          placeholder="ENTER STORE PIN"
                          placeholderTextColor="#A9A9A9"
                        />
                        {otp?.length >= 4 ? (
                          <TouchableOpacity style={styles.LoginOtpBtn}
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
                            }}  >
                            <Text style={{ fontSize: 21, color: '#fff', fontWeight: '600' }}> VERIFY </Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.OtpValidationView}>
                            <Text style={{ fontSize: 21, color: '#5A5A5A', fontWeight: '600' }}> VERIFY </Text>
                          </View>
                        )}
                      </View>
                    ) : null}
                  </ScrollView>
                  <Pressable style={styles.ModelPressableBtn}
                    onPress={() => {
                      setModalVisible(!modalVisible);
                      setOtpInput(false);
                      setOtp();
                    }}>
                    <Text style={{ fontSize: 21, color: '#ff0000', fontWeight: '500', padding: 10, }}>CANCEL</Text>
                  </Pressable>
                </View>
              </ImageBackground>
            </Modal>

            <View style={{}}>
              <View style={{}}>
                <Image style={styles.LogoImage}
                  source={(uri = VervebotLogo)}
                  resizeMode="contain"
                />
                <Text style={styles.PosForRetailText}> POS FOR RETAIL </Text>
              </View>

              <View style={{}}>
                <Text style={styles.LoginText}>LOGIN</Text>
                <Text style={styles.SignIntoContinueText}> SIGN IN TO CONTINUE </Text>
                <TextInput style={styles.UserNameTxtInput}
                  placeholder="USERNAME"
                  placeholderTextColor="black"
                  value={userData.username}
                  autoCapitalize="none"
                  onChangeText={e => {
                    setUserData(prev => {
                      return {
                        ...prev,
                        username: e,
                      };
                    });
                  }}
                />
                <TextInput style={styles.LoginPasswordTxtInput}
                  secureTextEntry
                  placeholder="PASSWORD"
                  placeholderTextColor="black"
                  value={userData.password}
                  autoCapitalize="none"
                  onChangeText={e => {
                    setUserData(prev => {
                      return {
                        ...prev,
                        password: e,
                      };
                    });
                  }}
                />
                <View style={styles.CheckBoxView}>
                  <View style={{ flexDirection: 'row', alignSelf: 'center', }}>
                    <CheckBox
                      onClick={() => {
                        setCheck(prev => !prev);
                      }}
                      checkBoxColor={'white'}
                      checkedCheckBoxColor={'white'}
                      isChecked={check}
                    />
                    <Text style={styles.TCText}> I HAVE READ AND AGREED WITH THE</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(TCUrl)}>
                      <Text style={styles.TCTextForLinking}>T&C. </Text>
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
                    disabled={!check}>
                    <View
                      style={{
                        ...styles.submitBtm, opacity: check ? null : 0.5,
                        backgroundColor: check ? 'white' : '#249bd6'
                      }}>
                      <Text style={{ ...styles.LoginBtnText, color: check ? 'black' : 'white' }}> LOGIN </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {loading_page ? (
              <View style={styles.LoadingPageView}>
                <View style={{ top: '45%' }}>
                  <ActivityIndicator
                    animating={loading_page}
                    size="large"
                    color="white"
                  />
                  <View>
                    <Text style={{ alignSelf: 'center', color: 'white' }}> LOADING... </Text>
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