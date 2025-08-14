import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text } from 'react-native';

const SearchTableComponent = ({ tableData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(tableData);

  useEffect(() => {
    // Update filtered data when tableData changes (e.g., on Clear All)
    setFilteredData(tableData);
  }, [tableData]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredData(tableData);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = tableData.filter((item) =>
      item.itemNo.toLowerCase().includes(lowerQuery) ||
      item.barcode.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    );

    setFilteredData(filtered);
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
      <View style={styles.fixedHeader}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col]}>ItemNo</Text>
          <Text style={[styles.tableHeaderCell, styles.col]}>Desc</Text>
          <Text style={[styles.tableHeaderCell, styles.col]}>Size</Text>
          <Text style={[styles.tableHeaderCell, styles.col]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.col]}>UnitPrice</Text>
          <Text style={[styles.tableHeaderCell, styles.col]}>Extended</Text>
          <Text style={[styles.tableHeaderCell, styles.col]}>Pieces</Text>
          <Text style={[styles.tableHeaderCell, styles.col]}>Barcode</Text>
        </View>
      </View>

      {/* Scrollable Table Content */}
      <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
        {filteredData.length === 0 ? (
          <Text style={styles.infoText}>No data available.</Text>
        ) : (
          filteredData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col]}>{item.itemNo}</Text>
              <Text style={[styles.tableCell, styles.col]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.col]}>{item.size}</Text>
              <Text style={[styles.tableCell, styles.col]}>{item.qty}</Text>
              <Text style={[styles.tableCell, styles.col]}>${item.unitPrice}</Text>
              <Text style={[styles.tableCell, styles.col]}>{item.extendedPrice}</Text>
              <Text style={[styles.tableCell, styles.col]}>{item.pieces}</Text>
              <Text style={[styles.tableCell, styles.col]}>{item.barcode}</Text>
            </View>
          ))
        )}
      </ScrollView>
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
  fixedHeader: {
    backgroundColor: '#eee',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
    marginTop: 5
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  scrollContainer: {
    marginTop: 30,
    // maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  col: {
    width: 150,
  },
  infoText: {
    padding: 10,
    fontStyle: 'italic',
    color: 'gray',
  },
});
