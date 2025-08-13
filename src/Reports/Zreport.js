import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import data from '../../APIvariables.json';

const Zreport = ({route, navigation}) => {
  const [Data, setData] = useState();

  useEffect(() => {
    var myHeaders = new Headers();

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(
      `${data.POS_API}/api/zreport?session_id_report=${route.params.id}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        // console.log(result);
        result.length < 1 ? alert('Some error occurred') : null;
        result ? setData(result) : null;
      })
      .catch(error => {
        // console.log('error', error);
        alert('Some error occurred ');
        navigation.navigate('SessionList');
        setData([]);
      });
  }, []);

  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{alignItems: 'center', marginVertical: '10%'}}>
          <Text style={{...styles.boxtext, fontSize: 25, color: '#000'}}>
            Z Report{' '}
          </Text>
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{...styles.boxtext, color: '#3399ff'}}>Amount</Text>
        </View>

        <View style={styles.boxQualities}>
          {Data?.session_amt_data ? (
            <View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Discount: </Text>
                <Text style={styles.boxtext}>
                  {Math.round(Data?.session_amt_data?.discount)}{' '}
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Final Total: </Text>
                <Text style={styles.boxtext}>
                  {Math.round(Data?.session_amt_data?.final_total)}{' '}
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Refunded amount: </Text>
                <Text style={styles.boxtext}>
                  {Math.round(Data?.session_amt_data?.refunded_amount)}{' '}
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Tax: </Text>
                <Text style={styles.boxtext}>
                  {Data?.session_amt_data?.tax}{' '}
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Total gross: </Text>
                <Text style={styles.boxtext}>
                  {Math.round(Data?.session_amt_data?.total_gross)}{' '}
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.boxtext}>Total sale: </Text>
                <Text style={styles.boxtext}>
                  {Math.round(Data?.session_amt_data?.total_sale)}{' '}
                </Text>
              </View>
            </View>
          ) : (
            <ActivityIndicator style={{marginVertical: '20%'}} size="large" />
          )}
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{...styles.boxtext, color: '#3399ff'}}>
            Products Sold
          </Text>
        </View>

        <View style={styles.boxQualities}>
          <View>
            {Data?.session_amt_data?.products_sold ? (
              Object.entries(Data?.session_amt_data?.products_sold).map(
                ([key, value]) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.boxtext}>{key} :</Text>
                      <Text style={styles.boxtext}>
                        {Math.round(value.toString())}
                      </Text>
                    </View>
                  );
                },
              )
            ) : (
              <ActivityIndicator style={{marginVertical: '20%'}} size="large" />
            )}
          </View>
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{...styles.boxtext, color: '#3399ff'}}>
            Payment By Tender
          </Text>
        </View>
        <View style={styles.boxQualities}>
          {Data?.session_payment_by_tender ? (
            <View>
              {Data?.session_payment_by_tender.map(e => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.boxtext}>{e.card_type}</Text>
                    <Text style={styles.boxtext}>{Math.round(e.amount)}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <ActivityIndicator style={{marginVertical: '20%'}} size="large" />
          )}
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{...styles.boxtext, color: '#3399ff'}}>Payment</Text>
        </View>

        <View style={styles.boxQualities}>
          {Data?.session_payment_data ? (
            <View>
              {Data?.session_payment_data.map(e => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.boxtext}>{e.name}</Text>
                    <Text style={styles.boxtext}>{Math.round(e.total)}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <ActivityIndicator style={{marginVertical: '20%'}} size="large" />
          )}
        </View>

        <View style={{alignItems: 'center'}}>
          <Text style={{...styles.boxtext, color: '#3399ff'}}>Tax</Text>
        </View>

        <View style={styles.boxQualities}>
          <View>
            {Data?.session_tax_data ? (
              Object.entries(Data?.session_tax_data).map(([key, value]) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.boxtext}>{key} :</Text>
                    <Text style={styles.boxtext}>
                      {Math.round(value.toString())}
                    </Text>
                  </View>
                );
              })
            ) : (
              <ActivityIndicator
                style={{marginVertical: '20%'}}
                size={'large'}
              />
            )}
          </View>
        </View>
        <View style={{alignItems: 'center', marginVertical: '10%'}}>
          <Text style={{...styles.boxtext, color: '#f58b40'}}>
            All amount and numbers are rounded.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Zreport;

const styles = StyleSheet.create({
  boxtext: {
    fontSize: 20,
    fontWeight: '300',
    marginVertical: '0.5%',
  },
  boxQualities: {
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
  },
});
