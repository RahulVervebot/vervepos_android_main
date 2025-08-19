import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Example vendor list (you can replace this with API response later)
const VendorList = [
  { value: "Chetak", slug: "chetak", number_of_newInvoice: 0 },
  { value: "kashmir_snacks_international_inc", slug: "kashmir_snacks_international_inc", number_of_newInvoice: 3 },
  { value: "alsaqr_distribution_llc", slug: "alsaqr_distribution_llc", number_of_newInvoice: 1 },
  { value: "jalaram_produce_2", slug: "jalaram_produce_2", number_of_newInvoice: 0 },
  { value: "aahubarah usa", slug: "aahubarah-usa", number_of_newInvoice: 2 }
];

export default function ICMS_VendorList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    // initial sort (new invoices first)
    const sorted = [...VendorList].sort((a, b) => {
      if (a.number_of_newInvoice < b.number_of_newInvoice) return 1;
      if (a.number_of_newInvoice > b.number_of_newInvoice) return -1;
      return 0;
    });
    setFilteredVendors(sorted);
  }, []);

  const handleVendorSearch = (text) => {
    setSearchTerm(text);

    let results = [...VendorList];
    if (text.trim() !== '') {
      results = results.filter(vendor =>
        vendor.value.toLowerCase().includes(text.toLowerCase())
      );
    }

    // always sort so vendors with new invoices are on top
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
