import { StyleSheet, ScrollView, ImageBackground } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { List, Avatar, IconButton } from 'react-native-paper';
import imagesPath from '../constants/imagesPath';
import promoGif from '../images/homeBG.webp';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Reports = ({route, navigation}) => {
  console.log("inside reports.js");

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

   /* ---------------- load flag from storage ---------------- */
   const [showCreditSale, setShowCreditSale] = useState(false);  // hidden by default

  useFocusEffect(
    useCallback(() => {
      // console.log('Reports screen is now focused');
  
      let isActive = true;               // protect against race conditions
      (async () => {
        try {
          const flag = await AsyncStorage.getItem('is_show_credit_sale');
          // console.log("flag value", flag);
          if (isActive) setShowCreditSale(flag == 'true');
        } catch (err) {
          console.warn('Failed to read flag', err);
        }
      })();
  
      return () => {
        isActive = false;                // cleanup when screen goes out of focus
      };
    }, [])
  );

  //  console.log("showCreditSale", showCreditSale);

  return (
    <ImageBackground
      source={promoGif}
      resizeMode="cover"
      style={{ flex: 1, justifyContent: 'center' }}>
      <ScrollView>
        <List.Section>
          <List.Item
            title="SALES SUMMARY REPORT"
            left={() => <Avatar.Icon size={40} icon="credit-card" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('PaymentReport')}
            style={styles.listItem}
          />
          <List.Item
            title="HOURLY REPORTS"
            left={() => <Avatar.Icon size={40} icon="clock-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('ReportsByHours')}
            style={styles.listItem}
          />
          <List.Item
            title="TOP CUSTOMERS LIST"
            left={() => <Avatar.Icon size={40} icon="account-group-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('TopCustomerReportDateSelect')}
            style={styles.listItem}
          />
          <List.Item
            title="TOP SELLING PRODUCTS"
            left={() => <Avatar.Icon size={40} icon="cart-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('TopSellingProductDateSelect')}
            style={styles.listItem}
          />
          <List.Item
            title="TOP SELLING CATEGORIES"
            left={() => <Avatar.Icon size={40} icon="shape-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('TopSellingCategoriesDateSelect')}
            style={styles.listItem}
          />

          {/* Report For Credit Sale */}
          {/* show only when flag === true */}
          {showCreditSale && (
            <List.Item
              title="Credit Sale Report"
              left={() => <Avatar.Icon size={40} icon="shape-outline" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() =>
                navigation.navigate('CreditSaleReportDateSelection')
              }
              style={styles.listItem}
            />
          )}

        </List.Section>
      </ScrollView>
    </ImageBackground>
  );
};

export default Reports;

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
