import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, TextInput, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from "axios";
// const baseUrl = 'https://icmsfrontend.vervebot.io'; // production URL
const baseUrl = 'http://192.168.1.52:3006'; // development URL
 // Replace with your actual base URL


const fetchInvoices = async (vendor) => {
  try {
    console.log("Fetching invoices for vendor:", vendor);
    console.log("URL:", `${baseUrl}/api/invoice/getsavedinvoices`);

    const response = await axios.get(`${baseUrl}/api/invoice/getsavedinvoices`, {
      headers: {
        "Content-Type": "application/json",
        store: "deepanshu_test",
        "mobile-auth": "true",
      },
      params: {
        ...vendor,
      },
      timeout: 100000,
    });

    console.log("Fetched invoices response:", response.data);

    // Ensure we always return an array
    return response.data || [];
  } catch (error) {
    if (error.response) {
      console.error("Server error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response received:", error);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return [];
  }
};



export default function InvoiceList() {
  const navigation = useNavigation();
  const route = useRoute();
  const {vendor} = route.params;
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceList, setInvoiceList] = useState([]);
   useEffect(() => {
  if (vendor) {
    AsyncStorage.setItem('vendor', JSON.stringify(vendor))
      .then(() => console.log('Vendor saved to AsyncStorage'))
      .catch(err => console.error('Error saving vendor:', err));
  }
}, [vendor]);
  
 useEffect(() => {
  const loadInvoices = async () => {
    setLoading(true);
    console.log('Loading invoices for vendor:', vendor);

    const fetchedInvoices = await fetchInvoices(vendor);

    console.log('Fetched invoices:', fetchedInvoices);

    const sorted = fetchedInvoices
      .sort((a, b) => {
        let dateA = new Date(a.SavedDate);
        let dateB = new Date(b.SavedDate);
        if (dateA > dateB) return -1;
        else if (dateA < dateB) return 1;
        else return 0;
      })
      .sort((x, y) => {
        if (x.InvoiceStatus < y.InvoiceStatus) return 1;
        if (x.InvoiceStatus > y.InvoiceStatus) return -1;
        return 0;
      });

    setInvoiceList(sorted);
    setLoading(false);
  };
  loadInvoices();
}, []);


  const handleInvoiceSearch = text => {
    setInvoiceSearch(text);

   let results = [...invoiceList]; // instead of dummyInvoices

    if (text.trim() !== '') {
      results = results.filter(inv =>
        inv.invoiceNo.toLowerCase().includes(text.toLowerCase()),
      );
    }

    // always keep new invoices on top
    results.sort((a, b) => {
      if (a.number_of_newInvoice < b.number_of_newInvoice) return 1;
      if (a.number_of_newInvoice > b.number_of_newInvoice) return -1;
      return 0;
    });

    setInvoiceList(results);
  };

  return (
    <View style={{flex: 1, padding: 16}}>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
        Invoices for {vendor.value}
      </Text>

      <TextInput
        value={invoiceSearch}
        onChangeText={handleInvoiceSearch}
        placeholder="Search Invoice No..."
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      />
      {loading ? (
        <Text style={{textAlign: 'center', color: '#888'}}>Loading invoices...</Text>
      ) : (
      <FlatList
        data={invoiceList}
        keyExtractor={item => item.SavedInvoiceNo.toString()}
        renderItem={({item, index}) => (
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              borderBottomWidth: 1,
              borderColor: '#ddd',
              backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
              alignItems: 'center',
            }}>
            <Text style={{flex: 1}}>{item.SavedInvoiceNo}</Text>
            <Text style={{flex: 1}}>{item.SavedDate}</Text>

            {item.InvoiceStatus === 'not_seen' && (
              <View
                style={{
                  backgroundColor: 'blue',
                  borderRadius: 12,
                  paddingHorizontal: 6,
                  marginRight: 10,
                }}>
                <Text style={{color: 'white', fontSize: 12}}>new</Text>
              </View>
            )}

            <TouchableOpacity
              style={{flex: 1}}
              onPress={() =>
                navigation.navigate('InvoiceDetails', {Invoice: item})
              }>
              <Text style={{color: 'blue'}}>Open</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{textAlign: 'center', color: '#888', marginTop: 20}}>
            No invoices found
          </Text>
        )}
      
    
    
      />)}
    </View>
  );
}
