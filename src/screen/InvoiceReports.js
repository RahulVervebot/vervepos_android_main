import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ImageBackground, Alert, ActivityIndicator, View, Text } from 'react-native';
import { List, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import promoGif from '../images/homeBG.webp';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InvoiceReports = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [storeUrl, setStoreUrl] = useState(null);

  const checkIcmsStatus = async (token, url) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append('access_token', token);
      // myHeaders.append('Cookie', 'session_id');

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit',
      };

      const response = await fetch(`${url}/api/icms_menu_status`, requestOptions);
      // console.log("response of api", response.json());

      // Manually check if it's a Promise-like object
      const dataPromise = response.json();

      if (dataPromise instanceof Promise) {
        const data = await dataPromise;
        // console.log("Data From Menu API", data);

        if (data.message === 'True') {
          console.log('API data success');
        } else {
          Alert.alert('ICMS FEATURE INACTIVE', 'Please contact at info@vervebot.io or try again');
          navigation.navigate('Home');
        }
      } else {
        console.error('Failed to resolve data', dataPromise);
      }

      //   if (!response.ok) {
      //     throw new Error('Failed to fetch ICMS status');
      //   }

      //   const data = await response.json();

      //   if (data.result?.message === 'True') {
      //     console.log('API data success');
      //   } else {
      //     throw new Error('ICMS Feature Inactive');
      //   }
      
      } catch (error) {
        Alert.alert('ICMS FEATURE INACTIVE', 'Please contact at info@vervebot.io or try again');
        navigation.navigate('Home');
      } finally {
        setLoading(false);
      }

    };

    const fetchAsyncValuesAndCheckStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const url = await AsyncStorage.getItem('storeUrl');

        if (!token || !url) {
          throw new Error('Failed to retrieve access token or store URL');
        }

        setAccessToken(token);
        setStoreUrl(url);

        checkIcmsStatus(token, url);
      } catch (error) {
        Alert.alert('Error', error.message);
        navigation.navigate('Home');
      }
    };

    useFocusEffect(
      React.useCallback(() => {
        fetchAsyncValuesAndCheckStatus();
      }, [navigation])
    );

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 20 }}>Checking ICMS Status...</Text>
        </View>
      );
    }

    return (
      <ImageBackground
        source={promoGif}
        resizeMode="cover"
        style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView>
          <List.Section>
            <List.Item
              title="ICMS PRODUCT STALL REPORT"
              left={() => <Avatar.Icon size={40} icon="cart-outline" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('IcmsProductStallReport')}
              style={styles.listItem}
            />

            <List.Item
              title="INVOICE DATA REPORT"
              left={() => <Avatar.Icon size={40} icon="credit-card" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('InvoiceDataReport')}
              style={styles.listItem}
            />

            <List.Item
              title="ICMS INVENTORY REPORT"
              left={() => <Avatar.Icon size={40} icon="clock-outline" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('IcmsInventoryReport')}
              style={styles.listItem}
            />
          </List.Section>
        </ScrollView>
      </ImageBackground>
    );
  };

  export default InvoiceReports;

  const styles = StyleSheet.create({
    listItem: {
      marginTop: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      marginVertical: 4,
      borderRadius: 8,
      paddingVertical: 8,
      paddingLeft: 5,
      marginHorizontal: 10,
    },
  });
