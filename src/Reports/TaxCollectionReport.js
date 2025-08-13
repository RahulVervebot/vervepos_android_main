import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';

const TaxCollectionReport = () => {


  return (
    <View style={{backgroundColor: '#fff', margin: '1%', height: '95%'}}>
      <ScrollView>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20, padding: '2%'}}>
            Maharaja Farmers Market
          </Text>
          <Text style={{fontSize: 20, marginBottom: '5%'}}>Hicksville, NY</Text>
          <Text style={{fontSize: 20, marginBottom: '3%'}}>
          Tax Collected By Rate
          </Text>
          <Text style={{fontSize: 15, marginBottom: '5%'}}>
            =====================
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20}}>Print Date:</Text>
          <Text style={{fontSize: 20}}>{new Date().toDateString()}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={{fontSize: 20}}>Print Time:</Text>
          <Text style={{fontSize: 20}}>{new Date().toDateString()}</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15, marginBottom: '2%'}}>
            ===================================
          </Text>
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

        <View style={{marginHorizontal: '5%'}}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>Tax Summary</Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Taxable Sales:</Text>
            <Text style={{fontSize: 20}}>24123.71</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom:'5%'}}>
            <Text style={{fontSize: 20}}>Non Taxable Sales: </Text>
            <Text style={{fontSize: 20}}>1419771.25</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Tax Class :POS</Text>
            <Text style={{fontSize: 20}}> </Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between',marginBottom:'5%'}}>
            <Text style={{fontSize: 20}}>============</Text>
            <Text style={{fontSize: 20}}> </Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <Text style={{fontSize: 20}}>Tax Name:</Text>
            <Text style={{fontSize: 20}}>T = State Sales Tax</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginBottom:'5%'}}>
            <Text style={{fontSize: 20}}>Tax Method:</Text>
            <Text style={{fontSize: 20}}>:By Percent of Sale</Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Rate:</Text>
            <Text style={{fontSize: 20}}>8.6250%</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Tax Collected:</Text>
            <Text style={{fontSize: 20}}>2023.40</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Taxable Amount</Text>
            <Text style={{fontSize: 20}}>23459.71</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Rounding OffSet</Text>
            <Text style={{fontSize: 20}}>3.79</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Adjusted Taxable</Text>
            <Text style={{fontSize: 20}}>23463. 50</Text>
          </View>



   
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 15, marginBottom: '2%'}}>
              -----------------------------------------------
            </Text>
          </View>


          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <Text style={{fontSize: 20}}>Tax Name:</Text>
            <Text style={{fontSize: 20}}>T = Tax2</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginBottom:'5%'}}>
            <Text style={{fontSize: 20}}>Tax Method:</Text>
            <Text style={{fontSize: 20}}>:By Percent of Sale</Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Rate:</Text>
            <Text style={{fontSize: 20}}>0.00%</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Tax Collected:</Text>
            <Text style={{fontSize: 20}}>0.00</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Taxable Amount</Text>
            <Text style={{fontSize: 20}}>0.00</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Rounding OffSet</Text>
            <Text style={{fontSize: 20}}>116.7</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20}}>Adjusted Taxable</Text>
            <Text style={{fontSize: 20}}>116.7</Text>
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

export default TaxCollectionReport;

const styles = StyleSheet.create({});
