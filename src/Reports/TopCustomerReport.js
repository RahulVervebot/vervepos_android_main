import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Button, Title, Text,Paragraph, Provider as PaperProvider, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import nodata from '../images/nodata.jpg';

const TopCustomerReport = ({ navigation, route }) => {
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
  
  const [paymentData, setPaymentData] = useState();
  const [index, setIndex] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const FirstRun = async () => {
      let current_url;
      let current_access_token;

      await AsyncStorage.getItem('storeUrl')
        .then(storeUrl => {
          // console.log('storeUrl : ', storeUrl);
          current_url = storeUrl;
        })
        .catch(error => {
          alert('some error');
        });

      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          // console.log('access_token : ', access_token);
          current_access_token = access_token;
        })
        .catch(error => {
          alert('some error');
        });

      var myHeaders = new Headers();
      // myHeaders.append('Cookie', 'session_id');
      myHeaders.append('access_token', current_access_token);

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'omit', // Ensures cookies are not sent
      };
      // console.log("Top Selling Custome ",requestOptions)

      fetch(
        `${current_url}/api/top-selling/customers?start_date=${route.params.startDate}&end_date=${route.params.endDate}&no_of_items=${route.params.numCustomers}`,
        requestOptions,
      )
        .then(response => response.json())
        .then(result => {
          // console.log(result, 'result');
          result.length < 1 ? alert('Try selecting a different time frame.') : null;
          result ? setPaymentData(result) : null;
        })
        .catch(error => {
          // console.log('error', error);
          alert('Try selecting a different time frame.');
          setPaymentData([]);
          navigation.navigate('TopCustomerReportDateSelect');
        }).finally(() => {
          setLoading(false);
        });
    };
    FirstRun();
  }, [route.params]);

  const onLoadMore = () => {
    // console.log('IndexedPaymentData', index);
    setIndex(index + 10);
  };

  return (
    <PaperProvider>
      <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
        <ScrollView>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Total Customers:</Title>
              <Paragraph style={styles.title}>
                {!loading ? ((paymentData?.customers?.length > 0 ) ? paymentData?.customers?.length:"0") :   <ActivityIndicator />}
              </Paragraph>
            </Card.Content>
          </Card>

          {!loading ? (  paymentData?.customers?.length > 0 ? 
            (paymentData?.customers?.slice(0, index)?.map((data, index) => (
              <Card key={index} style={styles.card}>
                {/* {console.log('data', typeof(data.id))} */}
                <Card.Content>
                  {data?.name ? <Text style={{fontSize:18, color: '#3399ff' }}>Name :{data?.name}</Text>: <Text style={{ color: '#3399ff' }}>Name: NA</Text>}
                  {data?.id ? <Text>ID: {data?.id}</Text> : <Text>ID: NA</Text>}
                  {data?.phone ? <Text>Phone: {data?.phone}</Text> : <Text>Phone: NA</Text>}
                  {data?.order_count ? <Text>Order Count: {data?.order_count}</Text>:<Text>Order Count : NA</Text>}
                  {data?.last_purchase_date ? <Text>Last Purchase Date: {data?.last_purchase_date}</Text> : <Text>Last Purchase Date: NA</Text>}
                  {data?.average_order ? <Text>Average Order: $ {Intl.NumberFormat('en-US').format(data?.average_order)}</Text> : <Text>Average Order: NA</Text>}
                  {data?.amount ? <Text>Total Purchase: $ {Intl.NumberFormat('en-US').format(data?.amount)}</Text> : <Text>Total Purchase: NA</Text>}
                </Card.Content>
              </Card>)
            )): <View>
                 <Image source={nodata} style={styles.image}/>
              </View>
          ) : (
            <View style={{marginVertical: '50%'}}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}

          {paymentData?.customers?.length ? (
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={onLoadMore}>
                <Text style={styles.loadMoreText}>
                  {paymentData?.customers?.length <= index
                    ? 'No More Data !'
                    : 'Load More'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </PaperProvider>
  );
};

export default TopCustomerReport;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginHorizontal: '5%',
    borderColor: '#939596',
    borderWidth: 0,
    marginVertical: '2%',
    padding: '3%',
    borderRadius: 20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    color: '#f58b40',
  },
  loadMoreButton: {
    alignItems: 'center',
    marginHorizontal: '10%',
    marginVertical: '20%',
    borderColor: '#3399ff',
    borderWidth: 0.5,
    padding: '3%',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  loadMoreText: {
    fontSize: 20,
    color: '#3399ff',
    fontWeight: '400',
  },
  image:{
    width:Dimensions.get('window').width,
    height:500
  }
});
