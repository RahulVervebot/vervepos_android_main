import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const dummyInvoices = [
  { id: 1, invoiceNo: 'INV-1001', invoiceDate: '2025-08-01', InvoiceStatus:"not_seen"},
  { id: 2, invoiceNo: 'INV-1002', invoiceDate: '2025-08-03',InvoiceStatus:"" },
  { id: 3, invoiceNo: 'INV-1003', invoiceDate: '2025-08-05', InvoiceStatus:"not_seen"},
  { id: 4, invoiceNo: 'INV-1004', invoiceDate: '2025-08-06', InvoiceStatus:"not_seen"},
  { id: 5, invoiceNo: 'INV-1005', invoiceDate: '2025-08-07', InvoiceStatus:""},
  { id: 6, invoiceNo: 'INV-1006', invoiceDate: '2025-08-08', InvoiceStatus:""},
  { id: 7, invoiceNo: 'INV-1007', invoiceDate: '2025-08-09', InvoiceStatus:"not_seen"},
  { id: 8, invoiceNo: 'INV-1008', invoiceDate: '2025-08-10', InvoiceStatus:"not_seen"},
  { id: 9, invoiceNo: 'INV-1009', invoiceDate: '2025-08-11', InvoiceStatus:""},
  { id: 10, invoiceNo: 'INV-1010', invoiceDate: '2025-08-12', InvoiceStatus:"" },
];

export default function InvoiceList() {
  const navigation = useNavigation();
  const route = useRoute();
  const { vendor } = route.params;

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceList, setInvoiceList] = useState([]);

  useEffect(() => {
    // initial sort: new invoices first
    const sorted = [...dummyInvoices].sort((a, b) => {
      if (a.number_of_newInvoice < b.number_of_newInvoice) return 1;
      if (a.number_of_newInvoice > b.number_of_newInvoice) return -1;
      return 0;
    });
    setInvoiceList(sorted);
  }, []);

  const handleInvoiceSearch = (text) => {
    setInvoiceSearch(text);

    let results = [...dummyInvoices];
    if (text.trim() !== '') {
      results = results.filter(inv =>
        inv.invoiceNo.toLowerCase().includes(text.toLowerCase())
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
          borderRadius: 8, padding: 10, marginBottom: 10,
        }}
      />

      <FlatList
        data={invoiceList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              borderBottomWidth: 1,
              borderColor: '#ddd',
              backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
              alignItems: 'center',
            }}
          >
            <Text style={{ flex: 1 }}>{item.invoiceNo}</Text>
            <Text style={{ flex: 1 }}>{item.invoiceDate}</Text>

            {item.InvoiceStatus ==="not_seen" && (
              <View
                style={{
                  backgroundColor: 'blue',
                  borderRadius: 12,
                  paddingHorizontal: 6,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12 }}>
                  new
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate('InvoiceDetails', { id: item.id })
              }
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
    </View>
  );
}
