import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import data from '../../APIvariables.json';

const ProductStockReport = ({navigation, route}) => {
  const [paymentData, setPaymentData] = useState();

  const [index, setIndex] = useState(10);

  useEffect(() => {
    var myHeaders = new Headers();

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(
      `${data.POS_API}/api/pos/stockreport?start_date=${route.params.startDate}&end_date=${route.params.endDate}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        // console.log(result);
        result.length < 1
          ? alert('Some error occurred. Try selecting a different time frame.')
          : null;
        result ? setPaymentData(result) : null;
      })
      .catch(error => {
        console.log('error', error);
        alert('Some error occurred ');
        setPaymentData([]);
      });
  }, []);

  const onLoadMore = () => {
    // console.log('IndexedPaymentData', index);
    setIndex(index + 10);
  };



  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View
          style={{
            backgroundColor: '#fff',
            shadowOffset: {width: 1, height: 3},
            shadowOpacity: 0.3,
            shadowRadius: 3,
            marginHorizontal: '5%',
            borderColor: '#939596',
            borderWidth: 0,
            marginVertical: '2%',
            padding: '3%',
            borderRadius: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: '5%',
              marginVertical: '2.5%',
            }}>
            <Text style={{fontSize: 20, fontWeight: '300', color: '#f58b40'}}>
              Total Products:
            </Text>
            <Text style={{fontSize: 20, fontWeight: '300', color: '#f58b40'}}>
              {paymentData?.length ?? <ActivityIndicator />}
            </Text>
          </View>
        </View>

        {paymentData ? (
          paymentData?.slice(0, index)?.map((data, index) => (
            <View
              style={{
                backgroundColor: '#fff',
                shadowOffset: {width: 1, height: 3},
                shadowOpacity: 0.3,
                shadowRadius: 3,
                marginHorizontal: '5%',
                borderColor: '#939596',
                borderWidth: 0,
                marginVertical: '2%',
                padding: '3%',
                borderRadius: 20,
              }}
              key={index}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                <Text style={{...styles.boxtext, color:'#3399ff'}}>{data?.product}</Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Id: </Text>
                <Text style={styles.boxtext}>{data?.product_id}</Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Stock quantity: </Text>
                <Text style={styles.boxtext}>{data?.stock_quantity}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{marginVertical: '50%'}}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}

        {paymentData ? (
          <View style={{alignItems: 'center'}}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                marginHorizontal: '10%',
                marginVertical: '20%',
                borderColor: '#3399ff',
                borderWidth: 0.5,
                padding: '3%',
                borderRadius: 20,
                backgroundColor: '#fff',
              }}
              onPress={onLoadMore}>
              <Text style={{fontSize: 20, color: '#3399ff', fontWeight: '400'}}>
                {paymentData?.length <= index ? 'No More Data !' : 'Load More'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default ProductStockReport;

const styles = StyleSheet.create({
  boxtext: {
    fontSize: 20,
    fontWeight: '300',
  },
});
