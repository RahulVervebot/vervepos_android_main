import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSingleProductByBarcode } from '../../functions/DepartmentAccess/function_dep';

const BarcodeSearchModal = ({ visible, onClose, barcode, onItemSelected }) => {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState([]);
  const [itemNo, setItemNo] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!barcode) return;
      setLoading(true);
      try {
        const res = await fetchSingleProductByBarcode(barcode);
        if (res && res.costComparision && res.costComparision.length > 0) {
          setProductData(res.costComparision);
          setItemNo(res.costComparision[0]?.barcode || ''); // Set heading from first item
        } else {
          setProductData([]);
          setItemNo('');
        }
      } catch (error) {
        console.error('Barcode fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [barcode]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Selected Item</Text>

          {loading ? (
            <ActivityIndicator color="blue" />
          ) : productData.length > 0 ? (
            <ScrollView>
              <Text style={styles.itemHeading}>{itemNo}</Text>

              {productData.map((item, index) => (
                <View key={index} style={styles.productBox}>
                  <Text style={styles.itemText}>Vendor: {item.vendorName}</Text>
                  <Text style={styles.itemText}>Case Cost: ${item.invCaseCost}</Text>

                  <TouchableOpacity style={styles.addButton} onPress={() => onItemSelected(item)}>
                    <Text style={styles.buttonText}>Add to Table</Text>
                  </TouchableOpacity>
                </View>
              ))}

            </ScrollView>
          ) : (
            <Text style={styles.notFound}>Product not found</Text>
          )}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BarcodeSearchModal;

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  itemHeading: { fontSize: 17, fontWeight: 'bold', marginBottom: 10, color: 'black' },
  productBox: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 },
  itemText: { marginVertical: 2, fontSize: 15 },
  addButton: { marginTop: 8, backgroundColor: '#2C62FF', padding: 8, borderRadius: 6 },
  buttonText: { color: '#fff', textAlign: 'center' },
  closeText: { marginTop: 15, textAlign: 'center', color: '#2C62FF' },
  notFound: { textAlign: 'center', color: 'gray' },
});
