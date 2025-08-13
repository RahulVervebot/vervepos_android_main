import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import data2 from '../../APIvariables.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Card, Title, IconButton} from 'react-native-paper';
import LoadingModal from '../components/LoadingModal';
import nodata from '../images/nodata.jpg';

const TopSellingProducts = ({route, navigation}) => {
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
  // console.log(route.params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllProducts = async () => {
      let current_access_token;
      let current_url;
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          // console.log('access_token : ', access_token);
          current_access_token = access_token;
        })
        .catch(error => {
          alert('some error');
        });

      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          // console.log('storeUrl : ', storeUrl);
          current_url = storeUrl;
        })
        .catch(error => {
          alert('some error');
        });

      var myHeaders = new Headers();
      myHeaders.append('access_token', current_access_token);
      // myHeaders.append('Cookie', 'session_id');
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit', // Ensures cookies are not sent
      };

      fetch(
        `${current_url}/api/top-selling/products?start_date=${route.params.startDate}&end_date=${route.params.endDate}&no_of_items=${route.params.numProducts}`,
        requestOptions,
      )
        .then(response => response.text())
        .then(result => {
          setData(JSON.parse(result));
          setLoading(false);
        })
        .catch(error => {
          console.log('error', error);
          setLoading(false);
          alert('Try Selecting a different Time frame');
          // navigation.navigate('TopSellingProductDateSelect');
        });
    };
    getAllProducts();
    return () => {
       console.log('cleanup'); 
    } 
  }, []);

  // console.log('data from product api', data);
  return (
    <View>
      <ScrollView style={styles.container}>
        {!loading && (
          <Card style={styles.card}>
            <Card.Content>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{fontSize: 20, color: '#000'}}>Start Date:</Text>
                <Text style={{fontSize: 20, color: '#000'}}>
                  {data?.start_date || route.params.startDate}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{fontSize: 20, color: '#000'}}>End Date:</Text>
                <Text style={{fontSize: 20, color: '#000'}}>
                  {data?.end_date || route.params.endDate}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        {data?.products ? (
          <Card style={styles.card}>
            <Title style={{textAlign: 'center', marginVertical:10, fontSize: 25,fontWeight: 'bold',fontFamily:'System' }}>Product Information</Title>
            <View style={styles.divider} />
            {data?.products && (
              <Card.Content>
                <View style={{marginHorizontal: 0}}>
                  {data?.products.map((e, i) => (
                    <View key={i}>
                      {e?.name && (
                        <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                          <Text style={{fontSize: 20, color: '#000'}}> Name{' '}</Text>
                          <Text style={{fontSize: 20,overflow: 'hidden',color: '#000',}}>{e.name.toLowerCase()} </Text>
                        </View>
                      )}
                      {e?.uom && (
                        <View style={{flexDirection: 'row',justifyContent: 'space-between', }}>
                          <Text style={{fontSize: 20, color: '#000'}}> UOM{' '}</Text>
                          <Text style={{fontSize: 20, color: '#000'}}>{e.uom}</Text>
                        </View>
                      )}
                      {e?.sale && (
                        <View style={{ flexDirection: 'row',justifyContent: 'space-between',}}>
                          <Text style={{fontSize: 20, color: '#000'}}> Sale Price</Text>
                          <Text style={{fontSize: 20, color: '#000'}}>{Number.isInteger(e.sale)? e.sale : e.sale.toFixed(2)} </Text>
                        </View>
                      )}
                      {e?.qty && (
                        <View style={{flexDirection: 'row',justifyContent: 'space-between',}}>
                          <Text style={{fontSize: 20, color: '#000'}}>QTY</Text>
                          <Text style={{fontSize: 20, color: '#000'}}>{Number.isInteger(e.qty) ? e.qty : e.qty.toFixed(2)}</Text>
                        </View>
                      )}

                      {e?.total && (
                        <View style={{flexDirection: 'row',justifyContent: 'space-between',}}>
                          <Text style={{fontSize: 20, color: '#000'}}>Total</Text>
                          <Text style={{fontSize: 20, color: '#000'}}>${Intl.NumberFormat('en-US').format(Math.round(e.total),)}</Text>
                        </View>
                      )}
                      <View style={styles.divider} />
                    </View>
                  ))}
                </View>
              </Card.Content>
            )}
            <Title style={{textAlign: 'center',marginVertical:10}}>End Of Report</Title>
          </Card>
        ) : loading ? (
          <LoadingModal visible={loading} />
        ) : (
          <View>
            <Image source={nodata} style={styles.image}/>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TopSellingProducts;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: '1%',
    height: '95%',
  },
  image: {
    width: Dimensions.get('window').width,
    height: 500,
  },
  card: {
    marginHorizontal: '5%',
    marginVertical: '2%',
    borderRadius: 20,
  },
  divider: {
    width: '100%', 
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});
