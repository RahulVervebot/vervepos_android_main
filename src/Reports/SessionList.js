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

const SessionList = ({navigation}) => {
  const [paymentData, setPaymentData] = useState();

  const [index, setIndex] = useState(10);

  useEffect(() => {
    var myHeaders = new Headers();

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(`${data.POS_API}/api/sessions`, requestOptions)
      .then(response => response.json())
      .then(result => {
        // console.log(result);
        result.length < 1
          ? alert('Some error occurred. Try selecting a different time frame.')
          : null;
        result ? setPaymentData(result) : null;
      })
      .catch(error => {
        // console.log('error', error);
        alert('Some error occurred ');
        setPaymentData([]);
      });
  }, []);

  const onLoadMore = () => {
    // console.log('IndexedPaymentData', index);
    setIndex(index + 10);
  };

  const onSessionPress = (id) => {
    // console.log('id is ..', id);
    navigation.navigate('Zreport', {
     id:id
    });
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
            <Text style={{fontSize: 20, fontWeight: '300', color: '#3399ff'}}>
              Total Sessions:
            </Text>
            <Text style={{fontSize: 20, fontWeight: '300', color: '#3399ff'}}>
              {paymentData?.length ?? <ActivityIndicator />}
            </Text>
          </View>
        </View>

        {paymentData ? (
          paymentData?.slice(0, index)?.map((data, index) => (
            <TouchableOpacity
              onPress={()=> {onSessionPress(data.id)}}
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
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Id: </Text>
                <Text style={styles.boxtext}>{data?.id}</Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Name: </Text>
                <Text style={styles.boxtext}>{data?.name}</Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Start at: </Text>
                <Text style={styles.boxtext}>{data?.start_at}</Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Stop at: </Text>
                <Text style={styles.boxtext}>{data?.stop_at}</Text>
              </View>
            </TouchableOpacity>
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

export default SessionList;

const styles = StyleSheet.create({
  boxtext: {
    fontSize: 20,
    fontWeight: '300',
  },
});
