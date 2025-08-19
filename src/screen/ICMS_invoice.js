import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const dummyInvoices = [
  { id: 1, invoiceNo: 'INV-1001', invoiceDate: '2025-08-01' },
  { id: 2, invoiceNo: 'INV-1002', invoiceDate: '2025-08-03' },
  { id: 3, invoiceNo: 'INV-1003', invoiceDate: '2025-08-05' },
];

export default function InvoiceList() {
    
  const navigation = useNavigation();
  const route = useRoute();
  const { vendor } = route.params; // vendor passed from previous screen
    console.log('Vendor:', vendor);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceList, setInvoiceList] = useState(dummyInvoices);

  const handleInvoiceSearch = text => {
    setInvoiceSearch(text);
    if (text.trim() === '') {
      setInvoiceList(dummyInvoices);
      return;
    }
    const results = dummyInvoices.filter(inv =>
      inv.invoiceNo.toLowerCase().includes(text.toLowerCase())
    );
    setInvoiceList(results);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Invoices for {vendor.value}
      </Text>

      <TextInput
        value={invoiceSearch}
        onChangeText={handleInvoiceSearch}
        placeholder="Search Invoice No..."
        style={{
          borderWidth: 1, borderColor: '#ccc',
          borderRadius: 8, padding: 10, marginBottom: 10
        }}
      />

      <FlatList
        data={invoiceList}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              borderBottomWidth: 1,
              borderColor: '#ddd',
              backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
            }}
          >
            <Text style={{ flex: 1 }}>{item.invoiceNo}</Text>
            <Text style={{ flex: 1 }}>{item.invoiceDate}</Text>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('InvoiceDetails', { id: item.id })}
            >
              <Text style={{ color: 'blue' }}>Open</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
            No invoices found
          </Text>
        )}
      />

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: 'red',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Back to Vendor Search
        </Text>
      </TouchableOpacity>
    </View>
  );
}
