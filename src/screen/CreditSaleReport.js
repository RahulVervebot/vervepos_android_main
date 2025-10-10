import {StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Title, IconButton, Paragraph } from 'react-native-paper';
import LoadingModal from '../components/LoadingModal';
import { Image } from 'react-native';
import nodata from '../images/nodata.jpg';

const safeStr = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
};

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
    const getAllCreditOrders = async () => {
      try {
        const [current_access_token, current_url] = await Promise.all([
          AsyncStorage.getItem('access_token'),
          AsyncStorage.getItem('storeUrl'),
        ]);

        const myHeaders = new Headers();
        myHeaders.append('access_token', current_access_token || '');

        const qs = `start_date=${encodeURIComponent(route.params.startDate)}&end_date=${encodeURIComponent(route.params.endDate)}`;
        const requestOptions = { method: 'GET', headers: myHeaders, redirect: 'follow', credentials: 'omit' };

        const resp = await fetch(`${current_url}/api/pos/hold_orders?${qs}`, requestOptions);
        const text = await resp.text();

        // Force-parse and guard non-JSON responses
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          console.error('Non-JSON response from server:', text);
          throw new Error('Invalid server response');
        }

        setData(parsed);
      } catch (error) {
        console.log('error', error);
        alert('Try selecting a different time frame');
      } finally {
        setLoading(false);
      }
    };

    getAllCreditOrders();
  }, [route.params]);

  return (
    <View>
      <ScrollView style={styles.container}>
        {!loading && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{fontSize: 20, color: '#000'}}>Start Date:</Text>
                <Text style={{fontSize: 20, color: '#000'}}>{safeStr(route.params.startDate)}</Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{fontSize: 20, color: '#000'}}>End Date:</Text>
                <Text style={{fontSize: 20, color: '#000'}}>{safeStr(route.params.endDate)}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {data?.orders?.length > 0 ? (
          <Card style={styles.card}>
            <Title style={{textAlign: 'center', fontSize: 25, fontWeight: 'bold', fontFamily:'System', marginVertical:10}}>
              Credit Sale Report
            </Title>

            {data.orders.map((o) => (
              <Card key={safeStr(o.orderId)} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <Paragraph>{safeStr(o.orderReference)}</Paragraph>
                  <Paragraph>Order ID  : {safeStr(o.orderId)}</Paragraph>
                  <Paragraph>Session   : {safeStr(o.posSession)}</Paragraph>
                  <Paragraph>Cashier   : {safeStr(o.userName)}</Paragraph>
                  {o.partnerName ? (<Paragraph>Customer : {safeStr(o.partnerName)}</Paragraph>) : null}
                  <Paragraph>Date     : {safeStr(o.orderDate)}</Paragraph>
                  <Paragraph>Total    : ${Number(o.totalAmount || 0).toFixed(2)}</Paragraph>
                  <Paragraph>Status   : {safeStr(o.orderStatus)}</Paragraph>
                </Card.Content>
              </Card>
            ))}

            <View style={styles.divider} />

            <Title style={{textAlign: 'center', marginVertical:10}}>
              TOTAL ORDERS: {safeStr(data.totalOrders)}
            </Title>
            <Title style={{textAlign: 'center', marginVertical:10}}>
              TOTAL AMOUNT: ${Number(data.totalOrdersAmount || 0).toFixed(2)}
            </Title>
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
