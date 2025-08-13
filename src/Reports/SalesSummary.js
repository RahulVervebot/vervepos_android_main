import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';

const SalesSummary = () => {


  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, padding: '2%'}}>
            Maharaja Farmers Market
          </Text>
          <Text style={{fontSize: 20, marginBottom: '5%'}}>Hicksville, NY</Text>
          <Text style={{fontSize: 20, marginBottom: '3%'}}>
            SALES SUMMARY REPORT
          </Text>
          <Text style={{fontSize: 15, marginBottom: '5%'}}>
            =====================
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20}}>Print Date:</Text>
          <Text style={{fontSize: 20}}>{new Date().toDateString()}</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            ===================================
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20}}>Start Date:</Text>
          <Text style={{fontSize: 20}}>{new Date().toDateString()}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20}}>End Date:</Text>
          <Text style={{fontSize: 20}}>{new Date().toDateString()}</Text>
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            ===================================
          </Text>
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, marginBottom: '2%'}}>
            AMOUNT RECETVED BY TENDER
          </Text>
        </View>
        <View style={{marginHorizontal:'5%'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Cash:</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Master Card:</Text>
          <Text style={{fontSize: 20}}>$1200</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>AMEX:</Text>
          <Text style={{fontSize: 20}}>$11000</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Discover:</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Visa:</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Customer Account:</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>EBT Foodstamp:</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>EBT CASH BENEFIT:</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Debit Card:</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            --------------------------------------------
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Gross Amount:</Text>
          <Text style={{fontSize: 20}}>$130527.38</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>NonRevenue Amount:</Text>
          <Text style={{fontSize: 20}}>$0.00</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            -----------------------------------------------
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Gross Sale:</Text>
          <Text style={{fontSize: 20}}>$130527.38</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Total Taxes:</Text>
          <Text style={{fontSize: 20}}>$201.37</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            -----------------------------------------------
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Net Sale:</Text>
          <Text style={{fontSize: 20}}>£120226 06</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            -----------------------------------------------
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
          <Text style={{fontSize: 20}}>End Of Report</Text>
        </View>

        </View>
        
      </ScrollView>
    </View>
  );
};

export default SalesSummary;

const styles = StyleSheet.create({});
