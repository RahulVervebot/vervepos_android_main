import {StyleSheet, Text, View, ScrollView, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import { enableLayoutAnimations } from 'react-native-reanimated';
import  data2 from '../../APIvariables.json'

const SalesReport = ({route, navigation}) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const getAllProducts = async () => {
      var myHeaders = new Headers();
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      fetch(
        `${data2.POS_API}/api/pos/sale-report?start_date=${route.params.startDate}&end_date=${route.params.endDate}`,
        requestOptions,
      )
        .then(response => response.text())
        .then(result => {
          setData(JSON.parse(result));
          // console.log('data found see data in state', JSON.parse(result));
        })
        .catch(error => {
          console.log('error', error)
          alert('Some error, Try Selecting a different Time frame')
          navigation.navigate('SalesReportDateSelect');
        });
    };
    getAllProducts();
  }, []);

  const handleCasher=(e)=>{

    navigation.navigate('SalesReportClicked', {
        e:e
      })
  }

  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, marginBottom: '3%', marginTop: '5%',color:'#000'}}>
            Sales Report
          </Text>
          <Text style={{fontSize: 15, marginBottom: '5%',color:'#000'}}>
            =====================
          </Text>
        </View>
<View style={{marginHorizontal:'5%'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20,color:'#000'}}>Start Date:</Text>
          <Text style={{fontSize: 20,color:'#000'}}>{route.params.startDate}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20,color:'#000'}}>End Date:</Text>
          <Text style={{fontSize: 20,color:'#000'}}>{route.params.endDate}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20,color:'#000'}}>Total Amount:</Text>
          <Text style={{fontSize: 20,color:'#000'}}>{data?.amount_total_without_tax}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20,color:'#000'}}>Amount Tax:</Text>
          <Text style={{fontSize: 20,color:'#000'}}>{data?.amount_tax}</Text>
        </View>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%',color:'#000'}}>
            ===================================
          </Text>
        </View>

        <View style={{marginHorizontal: '5%'}}>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, marginBottom: '1%',color:'#000'}}>Users</Text>
          <Text style={{fontSize: 15, marginBottom: '1%',color:'#000'}}>
            --------------------
          </Text>
        </View>

          {data ? (
            data?.order_summary?.map((e, i) => (
               <View key={i}>
              <TouchableOpacity
              onPress={()=>handleCasher(e)}
                style={{flexDirection: 'row', justifyContent: 'space-between',backgroundColor:'#e3e3e3',margin:'1%', padding:'2.5%',borderRadius:10}}>
                <Text style={{fontSize: 20,color:'#000'}}>{e.user} </Text>
                <Text style={{fontSize: 20,color:'#000'}}>{e.gross_total}</Text>
              </TouchableOpacity>
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
            <Text style={{fontSize: 20,color:'#000'}}>End Of Report</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SalesReport;

const styles = StyleSheet.create({});
