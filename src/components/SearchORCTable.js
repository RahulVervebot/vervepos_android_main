import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Dropdown } from 'react-native-element-dropdown';

const SearchTableComponent = ({ tableData,setTableData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(tableData);
  useEffect(() => {
    // Update filtered data when tableData changes (e.g., on Clear All)
    setFilteredData(tableData);
  }, [tableData]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // if (!query) {
    //   setFilteredData(tableData);
    //   return;
    // }

    if (!query) return setTableData([...tableData]);

    const lowerQuery = query.toLowerCase();
    const filtered = tableData.filter((item) =>
      item.itemNo.toLowerCase().includes(lowerQuery) ||
      item.barcode.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    );

    setFilteredData(filtered);
  };

  const handleInputChange = (index, key, value) => {
    const updated = [...tableData];
    updated[index][key] = value;
    setTableData(updated);
  };

  const handleRemove = (index) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    setTableData(updated);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchBox}
        placeholder="Search by ItemNo, Barcode, or Description..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {/* Fixed Header */}
  <View>
  <View style={styles.tableHeader}>
  <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>S.No.</Text>
  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>ItemNo</Text>
  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Desc</Text>
  <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>Qty</Text>
  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>UnitPrice</Text>
  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Extended</Text>
  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Condition</Text>
  <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>❌</Text>
</View>

<ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
      {filteredData.length === 0 ? (
        <Text style={styles.infoText}>No data available.</Text>
      ) : (
        filteredData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
        
          {item.manuallyAdded ? (
            <>
              <TextInput
              style={[styles.tableCell, { flex: 0.5 }]}
              value={item.SerialNoInInv}
              onChangeText={(text) => handleInputChange(index, 'SerialNoInInv', text)}
            />
            <TextInput
            style={[styles.tableCell, { flex: 1 }]}
            value={item.itemNo}
            onChangeText={(text) => handleInputChange(index, 'itemNo', text)}
          />
          <TextInput
          style={[styles.tableCell, { flex: 2 }]}
          value={item.description}
          onChangeText={(text) => handleInputChange(index, 'description', text)}
        />
            <TextInput
              style={[styles.tableCell, { flex: 0.6 }]}
              value={item.qty}
              onChangeText={(text) => handleInputChange(index, 'qty', text)}
            />
              <TextInput
              style={[styles.tableCell, { flex: 1 }]}
              value={item.unitPrice}
              onChangeText={(text) => handleInputChange(index, 'unitPrice', text)}
            />
              <TextInput
              style={[styles.tableCell, { flex: 1 }]}
              value={item.extendedPrice}
              onChangeText={(text) => handleInputChange(index, 'extendedPrice', text)}
            />
            </>
          ) : (
            <>
            <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.SerialNoInInv}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.itemNo}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.description}</Text>
            <Text style={[styles.tableCell, { flex: 0.6 }]}>{item.qty}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.unitPrice}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.extendedPrice}</Text>
            </>
          )}

          <Dropdown
            style={[styles.dropdown, { flex: 1 }]}
            data={[
              { label: 'Normal', value: 'normal' },
              { label: 'Damage', value: 'damage' },
              { label: 'Return', value: 'return' },
            ]}
            labelField="label"
            valueField="value"
            value={item.condition || 'normal'}
            onChange={(selected) => handleInputChange(index, 'condition', selected.value)}
            placeholder="Select"
          />
          <Text style={[styles.tableCell, { flex: 0.6 }]} onPress={() => handleRemove(index)}>
            ❌
          </Text>
        </View>
        ))
      )}

    </ScrollView>
  </View>
    </View>
  );
};

export default SearchTableComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  searchBox: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  scrollContainer: {
    marginTop: 30,
  },
  
  col: {
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    padding: 10,
    fontStyle: 'italic',
    color: 'gray',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#bbb',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableCell: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  dropdown: {
    height: 35,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
    fontSize: 12,
  },
  scrollContainer: {
    flexGrow: 1,
    maxHeight: '88%', // or fixed px if you prefer
  },
});