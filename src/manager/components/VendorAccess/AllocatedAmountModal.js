import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import {fetchCategories } from '../../../functions/VendorAccess/function';
const AllocatedAmountModal = ({ isModalVisible, setIsModalVisible }) => {

    const [categories, setCategories] = useState([]); // State for storing categories
    const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories
    const [accessToken, setAccessToken] = useState(''); // Token for API access
    const [storeUrl, setStoreUrl] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
          setLoadingCategories(true);
          const fetchedCategories = await fetchCategories(accessToken, storeUrl, setCategories, setLoadingCategories);
          console.log('accessToken', accessToken);
          setLoadingCategories(false); // Stop category loading
        };
    
        loadCategories();
      }, [accessToken, storeUrl]);
    
      // Extract and sort the active categories from the fetched categories data
      const sortedActiveCategories = categories?.categories
        ?.filter((category) => category.status === 'active')
        ?.sort((a, b) => a.name.localeCompare(b.name)) || [];

return(
  <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {loadingCategories ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Text style={styles.modalTitle}>Allocated Budget</Text>
            <ScrollView>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>Category Name</Text>
                  <Text style={styles.tableHeaderCell}>Allocated Amount</Text>
                  <Text style={styles.tableHeaderCell}>Balance</Text>
                </View>
                {sortedActiveCategories.map((category) =>
                  category.pos_categ_ids.map((cat) => (
                    <View key={cat.id} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{category.name}</Text>
                      <Text style={styles.tableCell}>${category.allocatedAmount.toFixed(2)}</Text>
                      <Text style={styles.tableCell}>${category.remainingAmount.toFixed(2)}</Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </>
        )}
      </View>
    </View>
  </Modal>
);

};
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    padding: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  tableCellInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    borderRadius: 5,
  },
});
export default AllocatedAmountModal;