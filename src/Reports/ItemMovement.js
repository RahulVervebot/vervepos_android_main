import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';

const ItemMovement = () => {


  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, padding: '2%'}}>
            Maharaja Farmers Market
          </Text>
          <Text style={{fontSize: 20, marginBottom: '5%'}}>Hicksville, NY</Text>
          <Text style={{fontSize: 20, marginBottom: '3%'}}>
          ITEM MOVEMENT SUMMARY REPORT
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

        <View style={{marginHorizontal: '5%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>ITEMNAME</Text>
            <Text style={{fontSize: 20}}>SOLD AMOUNT</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>---------------</Text>
            <Text style={{fontSize: 20}}>---------------</Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>WHOLE CHICKEN HAI AI</Text>
            <Text style={{fontSize: 20}}>$2500</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>PLUM TOMATO LB</Text>
            <Text style={{fontSize: 20}}>$1200</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>BABY GOAT CLEAN HALAL</Text>
            <Text style={{fontSize: 20}}>$11000</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>GUAVA CHINESE - SKU 77</Text>
            <Text style={{fontSize: 20}}>$2500</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>TAX ITEM</Text>
            <Text style={{fontSize: 20}}>$2500</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>DEST NATURAL DAHT WHOL</Text>
            <Text style={{fontSize: 20}}>$2500</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>BANANA IR</Text>
            <Text style={{fontSize: 20}}>$2500</Text>
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

export default ItemMovement;

const styles = StyleSheet.create({});
