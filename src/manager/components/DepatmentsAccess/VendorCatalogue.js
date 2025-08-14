import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { fetchVendorList, VendorProfile } from '../../../functions/DepartmentAccess/function_dep';

const VendorCatalogue = () => {
  const [vendorNames, setVendorNames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [vendorProfile, setVendorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState(''); // << New search for products

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const names = await fetchVendorList();
        const sortedNames = names.sort((a, b) => a.localeCompare(b));
        setVendorNames(sortedNames);
      } catch (error) {
        console.error('Error fetching vendor names', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const filteredVendors = vendorNames.filter((vendor) =>
    vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVendorClick = async (vendor) => {
    setProfileLoading(true);
    try {
      const profileData = await VendorProfile(vendor);
      if (profileData) {
        setVendorProfile(profileData);
        setModalVisible(true);
        setProductSearchQuery(''); // reset product search input
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Filter products inside modal based on product search box
  const filteredProducts = vendorProfile?.productList.filter(product => {
    const searchLower = productSearchQuery.toLowerCase();
    return (
      product.productName?.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <View style={styles.container}>
 <TextInput
        style={styles.searchInput}
        placeholder="Search vendors..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView style={styles.listContainer}>
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor, index) => (
              <TouchableOpacity key={index} style={styles.vendorBox} onPress={() => handleVendorClick(vendor)}>
                <Text style={styles.vendorText}>{vendor.toUpperCase()}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResults}>No vendors found</Text>
          )}
        </ScrollView>
      )}

      {/* Vendor Profile Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            {profileLoading ? (
              <ActivityIndicator size="large" color="blue" />
            ) : vendorProfile ? (
              <ScrollView>
                <Text style={styles.modalTitle}>{vendorProfile.vendorName.toUpperCase()}</Text>
                <Text style={styles.modalSubtitle}>Products: {vendorProfile.noOfProducts}</Text>

                {/* NEW Product Search Input inside Modal */}
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products by name or barcode..."
                  value={productSearchQuery}
                  onChangeText={setProductSearchQuery}
                />

                {/* Table header */}
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.headerCell]}>Product ID</Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>Barcode</Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>Product Name</Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>Case Cost</Text>
                </View>

                {/* Table rows */}
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{product.productId}</Text>
                      <Text style={styles.tableCell}>{product.barcode || '-'}</Text>
                      <Text style={styles.tableCell}>{product.productName || '-'}</Text>
                      <Text style={styles.tableCell}>${product.invCaseCost.toFixed(2)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>No matching products found</Text>
                )}


              </ScrollView>
            ) : (
              <Text style={styles.noResults}>No profile found</Text>
            )}
                            {/* Close button */}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VendorCatalogue;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  listContainer: { flexGrow: 1 },
  vendorBox: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  vendorText: { fontSize: 16 },
  noResults: { textAlign: 'center', marginTop: 20, color: 'gray' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%', maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  modalSubtitle: { fontSize: 16, marginBottom: 15 },
  tableRow: { flexDirection: 'row', marginBottom: 8 },
  tableCell: { flex: 1, fontSize: 14, paddingHorizontal: 2 },
  headerCell: { fontWeight: 'bold', fontSize: 15 },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2C62FF',
    paddingVertical: 10,
    borderRadius: 6,
  },
  closeButtonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});
