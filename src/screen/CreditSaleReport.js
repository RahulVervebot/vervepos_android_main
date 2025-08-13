import {StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Title, IconButton, Paragraph } from 'react-native-paper';
import LoadingModal from '../components/LoadingModal';
import { Image } from 'react-native';
import nodata from '../images/nodata.jpg';

const CreditSaleReport = ({route, navigation}) => {
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
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {

    console.log('route.params : ', route.params);

    const getAllCreditOrders = async () => {
      let current_access_token;
      let current_url;
      await AsyncStorage.getItem('access_token')
        .then(access_token => {
          console.log('access_token : ', access_token);
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
        `${current_url}/api/pos/hold_orders?start_date=${route.params.startDate}&end_date=${route.params.endDate}`,
        requestOptions,
      )
        .then(response => response.text())
        .then(result => {
          // console.log(result);
          setData(JSON.parse(result));
          setLoading(false);
        })
        .catch(error => {
          console.log('error', error);
          setLoading(false);
          alert('Try Selecting a different Time frame');
        });
    };
    getAllCreditOrders();
  }, []);

  // console.log("State Data", data);

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
                  {route.params.startDate}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{fontSize: 20, color: '#000'}}>End Date:</Text>
                <Text style={{fontSize: 20, color: '#000'}}>
                  {route.params.endDate}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {data?.orders?.length > 0 ? (
          <Card style={styles.card}>
            <Title style={{textAlign: 'center', fontSize: 25,fontWeight: 'bold',fontFamily:'System',marginVertical:10 }}>Credit Sale Report</Title>

            {data.orders.map((o) => (
              <Card key={o.orderId} style={{ marginBottom: 12 }}>
                <Card.Content>
                  {/* rename keys here as you like */}
                  <Paragraph>{o.orderReference}</Paragraph>
                  <Paragraph>Order ID&nbsp;&nbsp;: {o.orderId}</Paragraph>
                  <Paragraph>Session&nbsp;&nbsp;: {o.posSession}</Paragraph>
                  <Paragraph>Cashier&nbsp;&nbsp;: {o.userName}</Paragraph>
                  {o.partnerName && (<Paragraph>Customer : {o.partnerName}</Paragraph>)}
                  <Paragraph>Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {o.orderDate}</Paragraph>
                  <Paragraph>Total&nbsp;&nbsp;: ${o.totalAmount.toFixed(2)}</Paragraph>
                  <Paragraph>Status&nbsp;: {o.orderStatus}</Paragraph>
                </Card.Content>
              </Card>
            ))}
            <View style={styles.divider} />
          
            <Title style={{textAlign: 'center',marginVertical:10}}>TOTAL ORDERS: {data.totalOrders}</Title>
            <Title style={{textAlign: 'center',marginVertical:10}}>TOTAL AMOUNT: ${data.totalOrdersAmount}</Title>

          </Card>
        ) 
        : loading ? (
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

export default CreditSaleReport;

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
