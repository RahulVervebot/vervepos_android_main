import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Logout from '../screen/Logout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableHighlight } from 'react-native-gesture-handler';

const CustomDrawer = props => {
  const navigation = useNavigation();
  async function custom_Logout() {
  await AsyncStorage.removeItem('loginDb');
   await AsyncStorage.removeItem('is_pos_manager');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('password');
    await AsyncStorage.removeItem('storeName');
    await AsyncStorage.removeItem('storeUrl');
    await AsyncStorage.removeItem('access_token').then(() => {
      navigation.navigate('Login');
    });

    // console.log('Logging out');
  }
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: '#3478F5' }}>
        <View>
          <Text
            style={{
              fontWeight: 'bold',
              color: '#fff',
              fontSize: 18,
              padding: 15,
            }}>
            Vervebot
          </Text>

          <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}>
            <DrawerItemList {...props}></DrawerItemList>
            <View
              style={{
                padding: 5,
                borderTopColor: '#CCC',
                borderTopWidth: 1,
                backgroundColor: '#fff',
                marginTop: 15,
              }}></View>
          </View>

          <TouchableHighlight onPress={() => custom_Logout()}>
            <View
              style={{
                backgroundColor: '#fff',
                flexDirection: 'row',
                paddingTop: 10,
                paddingBottom: 10,
                // borderRadius: 10,
              }}>
              <Image
                style={{
                  height: 30,
                  width: 30,
                  marginLeft: 13,
                }}
                source={require('../images/logout.png')}
              />
              <Text
                style={{
                  borderColor: '#fff',
                  paddingLeft: 13,
                  //   paddingRight: 20,
                  fontWeight: '500',
                  paddingTop: 5,
                  color: '#696969',
                }}>
                Logout
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomDrawer;
