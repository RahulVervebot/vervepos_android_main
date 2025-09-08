import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const baseUrl = 'http://192.168.1.52:3006';

export default function ICMS_VendorList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [vendorList, setVendorList] = useState([]);

  // Fetch vendor list every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Fetching vendor list:", `${baseUrl}/api/getinvoicelist`);
      fetch(`${baseUrl}/api/getinvoicelist`)
        .then((res) => res.json())
        .then((data) => {
          const cleanedData = data.filter(
            (item) => item && typeof item.value === "string"
          );
          const sortedData = cleanedData.sort((a, b) => {
            if (a.number_of_newInvoice < b.number_of_newInvoice) return 1;
            if (a.number_of_newInvoice > b.number_of_newInvoice) return -1;
            return 0;
          });
          setVendorList(sortedData);
          setFilteredVendors(sortedData);
        })
        .catch((error) => {
          console.error('Error fetching invoice list:', error);
        });
    }, [])
  );

  const handleVendorSearch = (text) => {
    setSearchTerm(text);

    let results = [...vendorList];
    if (text.trim() !== '') {
      results = results.filter(vendor =>
        vendor.value.toLowerCase().includes(text.toLowerCase())
      );
    }

    // Sort so vendors with new invoices are on top
    results.sort((a, b) => {
      if (a.number_of_newInvoice < b.number_of_newInvoice) return 1;
      if (a.number_of_newInvoice > b.number_of_newInvoice) return -1;
      return 0;
    });

    setFilteredVendors(results);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        value={searchTerm}
        onChangeText={handleVendorSearch}
        placeholder="Search Vendor..."
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('InvoiceList', { vendor: item })}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.value}</Text>

            {item.number_of_newInvoice > 0 && (
              <View
                style={{
                  backgroundColor: 'red',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {item.number_of_newInvoice} New
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
            No vendors found
          </Text>
        )}
      />
    </View>
  );
}
