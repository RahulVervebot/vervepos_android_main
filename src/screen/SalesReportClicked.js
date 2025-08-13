import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';

const SalesReportClicked = ({route}) => {
  const data = route.params.e;
  // console.log(data, 'data');
  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop:'5%'}}>
          <Text style={{fontSize: 20,color:'#000'}}>User:</Text>
          <Text style={{fontSize: 20,color:'#000'}}>{data?.user}</Text>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20,color:'#000'}}>Total Sales: </Text>
          <Text style={{fontSize: 20,color:'#000'}}>{data?.total_sales}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20,color:'#000'}}>Gross Total: </Text>
          <Text style={{fontSize: 20,color:'#000'}}>{data?.gross_total}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20,color:'#000'}}>Tax: </Text>
          <Text style={{fontSize: 20,color:'#000'}}>{data?.tax}</Text>
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%',color:'#000'}}>
            ===================================
          </Text>
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, marginBottom: '3%',color:'#000'}}>Categories</Text>
          <Text style={{fontSize: 15, marginBottom: '5%',color:'#000'}}>
            --------------------
          </Text>
        </View>
        <View style={{marginHorizontal: '5%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20,color:'#000'}}>Name</Text>
            <Text style={{fontSize: 20,color:'#000'}}>Amount</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20,color:'#000'}}>---------</Text>
            <Text style={{fontSize: 20,color:'#000'}}>---------</Text>
          </View>

          {data ? (
            data?.categories.map((e, i) => (
              <View
                key={i}
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontSize: 20,color:'#000'}}>{e.name}</Text>
                <Text style={{fontSize: 20,color:'#000'}}>{e.amount}</Text>
              </View>
            ))
          ) : (
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <Text style={{fontSize: 20,color:'#000'}}>Loading...</Text>
            </View>
          )}



        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, marginBottom: '3%',color:'#000'}}>Payments</Text>
          <Text style={{fontSize: 15, marginBottom: '5%',color:'#000'}}>
            --------------------
          </Text>
        </View>
        <View style={{marginHorizontal: '5%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20,color:'#000'}}>Name</Text>
            <Text style={{fontSize: 20,color:'#000'}}>Amount</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20,color:'#000'}}>---------</Text>
            <Text style={{fontSize: 20,color:'#000'}}>---------</Text>
          </View>

          {data ? (
            data?.payments.map((e, i) => (
              <View
                key={i}
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontSize: 20,color:'#000'}}>{e.name}</Text>
                <Text style={{fontSize: 20,color:'#000'}}>{e.total}</Text>
              </View>
            ))
          ) : (
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <Text style={{fontSize: 20,color:'#000'}}>Loading...</Text>
            </View>
          )}

          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 15, marginBottom: '2%',color:'#000'}}>
              -----------------------------------------------
            </Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            <Text style={{fontSize: 15,color:'#000'}}>End Of Report</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default SalesReportClicked;

const styles = StyleSheet.create({});
