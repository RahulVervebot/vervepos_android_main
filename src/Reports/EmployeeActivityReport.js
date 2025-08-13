import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';

const EmployeeActivityReport = () => {


  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, padding: '2%'}}>
            Maharaja Farmers Market
          </Text>
          <Text style={{fontSize: 20, marginBottom: '5%'}}>Hicksville, NY</Text>
          <Text style={{fontSize: 20, marginBottom: '3%'}}>
          EMPLOYEE ACTIVITY REPORT
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
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>User ID: </Text>
            <Text style={{fontSize: 20}}> ANJALI</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>------------------</Text>

          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Void/Deletes (83)</Text>
            <Text style={{fontSize: 20}}>$783.67</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Item Returns (239)</Text>
            <Text style={{fontSize: 20}}>$340.59</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>No-Sale Count (40)</Text>
            <Text style={{fontSize: 20}}>$0.00</Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>User ID: </Text>
            <Text style={{fontSize: 20}}> BAKERY</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>------------------</Text>

          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Void/Deletes (83)</Text>
            <Text style={{fontSize: 20}}>$783.67</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Item Returns (239)</Text>
            <Text style={{fontSize: 20}}>$340.59</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>No-Sale Count (40)</Text>
            <Text style={{fontSize: 20}}>$0.00</Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>User ID: </Text>
            <Text style={{fontSize: 20}}> CHCHAT</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>------------------</Text>

          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Void/Deletes (83)</Text>
            <Text style={{fontSize: 20}}>$783.67</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Item Returns (239)</Text>
            <Text style={{fontSize: 20}}>$340.59</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>No-Sale Count (40)</Text>
            <Text style={{fontSize: 20}}>$0.00</Text>
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

export default EmployeeActivityReport;

const styles = StyleSheet.create({});
