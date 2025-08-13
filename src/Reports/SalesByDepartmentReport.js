import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';

const SalesByDepartmentReport = ({route}) => {
// console.log(route.params.data)

  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, padding: '2%'}}>
            Maharaja Farmers Market
          </Text>
          <Text style={{fontSize: 20, marginBottom: '5%'}}>Hicksville, NY</Text>
          <Text style={{fontSize: 20, marginBottom: '3%'}}>
          Sales By Department
          </Text>
          <Text style={{fontSize: 15, marginBottom: '5%'}}>
            =====================
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20}}>Register Number:</Text>
          <Text style={{fontSize: 20}}>0</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20}}>Print Date:</Text>
          <Text style={{fontSize: 20}}>{new Date().toDateString()}</Text>
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


        <View style={{marginHorizontal:'5%'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>DEPARTMENT</Text>
          <Text style={{fontSize: 20}}>AMOUNT</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>---------------</Text>
          <Text style={{fontSize: 20}}>---------------</Text>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>ATTA</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>BREAD/ROTI/NAAN</Text>
          <Text style={{fontSize: 20}}>$1200</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>CANDY N CHOCOLATE</Text>
          <Text style={{fontSize: 20}}>$11000</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>CANFOOD</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>CEREALS</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>DATRY</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>DALS N BEANS</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>DISPOSABLE</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>EGGS</Text>
          <Text style={{fontSize: 20}}>$2500</Text>
        </View>

       
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            -----------------------------------------------
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20}}>Total Sale:</Text>
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

export default SalesByDepartmentReport;

const styles = StyleSheet.create({});
