import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// keep vendor list in separate file if big
const VendorList = [
  { value: "Chetak", slug: "chetak" },
  { value: "kashmir_snacks_international_inc", slug: "kashmir_snacks_international_inc" },
  { value: "alsaqr_distribution_llc", slug: "alsaqr_distribution_llc" },
  { value: "jalaram_produce_2", slug: "jalaram_produce_2" },
  { value: "aahubarah usa", slug: "aahubarah-usa" }
];

export default function ICMS_VendorList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState(VendorList);

  const handleVendorSearch = text => {
    setSearchTerm(text);
    if (text.trim() === '') {
      setFilteredVendors(VendorList);
      return;
    }
    const results = VendorList.filter(vendor =>
      vendor.value.toLowerCase().startsWith(text.toLowerCase())
    );
    setFilteredVendors(results);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        value={searchTerm}
        onChangeText={handleVendorSearch}
        placeholder="Search Vendor..."
        style={{
          borderWidth: 1, borderColor: '#ccc',
          borderRadius: 8, padding: 10, marginBottom: 10
        }}
      />

      <FlatList
        data={filteredVendors}
        keyExtractor={item => item.slug}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('InvoiceList', { vendor: item })}
            style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
          >
            <Text style={{ fontSize: 16 }}>{item.value}</Text>
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
