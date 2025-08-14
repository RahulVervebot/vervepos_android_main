// VendorItemSelector.js
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
 ActivityIndicator,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import {getSingleDepartmentCurrentWeek} from  "../functions/DepartmentAccess/function_dep"
const VendorItemSelector = ({
  visible,
  onClose,
  vendorList = [],
  fetchItemsForVendor,
  onItemsSelected,
}) => {
  // Vendor search
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [additemloading, setItemLoading] = useState(false);
  // Items for a chosen vendor
  const [vendorItems, setVendorItems] = useState([]);
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);

  // Item selection
  const [selectedModalItems, setSelectedModalItems] = useState([]); // array of barcodes
  const [modalSelectedItems, setModalSelectedItems] = useState({}); // { barcode: qty }
  const [itemSearchQuery, setItemSearchQuery] = useState("");

  const [loadingVendorItems, setLoadingVendorItems] = useState(false);

  // Filter vendor list by search query
  const filteredVendorList = vendorList.filter((v) =>
    v.toLowerCase().includes(vendorSearchQuery.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────
  //  1) Pick a vendor -> fetch items -> show items modal
  // ─────────────────────────────────────────────────────────────
  const handleVendorSelect = async (vendor) => {

    setSelectedVendor(vendor);
   
    try {
      setLoadingVendorItems(true);
      const items = await fetchItemsForVendor(vendor);
      console.log('vendor items',items);
      setVendorItems(items);
      setLoadingVendorItems(false);

      // Reset any old selections
      setSelectedModalItems([]);
      setModalSelectedItems({});

      if (items.length > 0) {
        setIsItemsModalVisible(true);
         
      } else {
        alert("No items found for this vendor.");
       
      }
    } catch (err) {
      setLoadingVendorItems(false);
       
      console.log("Error fetching vendor items:", err);
      alert("Failed to load items for that vendor");
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  2) Toggle item selection
  // ─────────────────────────────────────────────────────────────
  const toggleCheckbox = (barcode) => {
    setSelectedModalItems((prev) =>
      prev.includes(barcode)
        ? prev.filter((b) => b !== barcode)
        : [...prev, barcode]
    );
  };

  // ─────────────────────────────────────────────────────────────
  //  3) Increment/decrement qty in items modal
  // ─────────────────────────────────────────────────────────────
  const updateQtyInModal = (barcode, increment) => {
    setModalSelectedItems((prevItems) => {
      const currentQty = prevItems[barcode] || 1;
      const newQty = currentQty + increment > 0 ? currentQty + increment : 1;
      return { ...prevItems, [barcode]: newQty };
    });
  };

  // ─────────────────────────────────────────────────────────────
  //  4) Filter the vendor items by search query
  // ─────────────────────────────────────────────────────────────
  const filteredVendorItems = vendorItems
    .reduce((acc, item) => {
      // optional dedupe
      if (!acc.find((existing) => existing.barcode === item.barcode)) {
        acc.push(item);
      }
      return acc;
    }, [])
    .filter((item) => {
      const name = (item.posName || "").toLowerCase();
      const barcode = (item.barcode || "").toLowerCase();
      const dept = (item.posDepartment || "").toLowerCase();
      const query = itemSearchQuery.toLowerCase();
      return (
        name.includes(query) || barcode.includes(query) || dept.includes(query)
      );
    });

  // ─────────────────────────────────────────────────────────────
  //  5) “Add Selected Items” → pass to parent, clear search fields
  // ─────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
         setItemLoading(true);
    const selectedData = filteredVendorItems.filter((item) =>
      selectedModalItems.includes(item.barcode)
    );
  
    const finalArray = [];
    const unitQty = 0;
    for (const item of selectedData) {
      const qty = modalSelectedItems[item.barcode] || 1;
  
      let departmentDetails = {};
      try {
        const response = await getSingleDepartmentCurrentWeek(item.departmentName);
        if (
          response &&
          response.status === "success" &&
          response.data.length > 0 &&
          response.data[0].department_allocations.length > 0
        ) {
          departmentDetails = response.data[0].department_allocations[0];
        }
  
      } catch (error) {
        console.warn("Error fetching dept for item:", item.departmentName, error);
             setItemLoading(false);
      }
  
      finalArray.push({
        ...item,
        qty,
        unitQty,
        departmentId: departmentDetails.departmentId || 0,
        departmentAllocationId: departmentDetails.departmentAllocationId || 0,
        departmentRemainingAmount: departmentDetails.departmentRemainingAmount || 0,
      });
    }
       setItemLoading(false);
    onItemsSelected(finalArray);
    setVendorSearchQuery("");
    setItemSearchQuery("");
    setIsItemsModalVisible(false);
    onClose();
  };
  

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          {/* STEP 1: Choose vendor */}
          {!isItemsModalVisible && (
            <>
              <Text style={styles.modalTitle}>Select Vendor</Text>
              <TextInput
                style={styles.vendorSearchInput}
                placeholder="Search Vendors..."
                value={vendorSearchQuery}
                onChangeText={setVendorSearchQuery}
              />
              <ScrollView style={{ maxHeight: 300, width: "100%", marginTop: 10 }}>
                {filteredVendorList.length > 0 ? (
                  filteredVendorList.map((vendor, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.vendorRow}
                      onPress={() => handleVendorSelect(vendor)}
                    >
                      <Text style={styles.vendorText}>{vendor.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text>No matching vendors</Text>
                )}
              </ScrollView>
              {loadingVendorItems && (
                <Text style={{ marginTop: 10, color: "blue" }}>
                  Loading items...
                </Text>
              )}
              <TouchableOpacity
                style={[styles.closeButton, { marginTop: 15 }]}
                onPress={() => {
                  // Also clear search if user closes mid-way
                  setVendorSearchQuery("");
                  onClose();
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2: Vendor items */}
          {isItemsModalVisible && (
            <>
              <Text style={styles.modalTitle}>Vendor: {selectedVendor}</Text>
              <TextInput
                style={styles.vendorSearchInput}
                placeholder="Search Items..."
                value={itemSearchQuery}
                onChangeText={setItemSearchQuery}
              />
              <ScrollView style={{ maxHeight: 300, width: "100%", marginTop: 10 }}>
                {filteredVendorItems.length > 0 ? (
                  filteredVendorItems.map((item, index) => {
                    const isChecked = selectedModalItems.includes(item.barcode);
                    const itemQty = modalSelectedItems[item.barcode] || 1;
                    return (
                      <View key={index} style={styles.itemRow}>
                        <CheckBox
                          value={isChecked}
                          onValueChange={() => toggleCheckbox(item.barcode)}
                        />
                        <TouchableOpacity
                          style={{ marginLeft: 8, flex: 1 }}
                          onPress={() => toggleCheckbox(item.barcode)}
                        >
                          <Text>{item.posName}</Text>
                        </TouchableOpacity>
                        {isChecked && (
                          <View style={styles.qtyContainer}>
                            <TouchableOpacity
                              style={[styles.qtyButton, { backgroundColor: "red" }]}
                              onPress={() => updateQtyInModal(item.barcode, -1)}
                            >
                              <Text style={styles.qtyButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={{ marginHorizontal: 6 }}>{itemQty}</Text>
                            <TouchableOpacity
                              style={[styles.qtyButton, { backgroundColor: "green" }]}
                              onPress={() => updateQtyInModal(item.barcode, 1)}
                            >
                              <Text style={styles.qtyButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <Text>No items found</Text>
                )}
              </ScrollView>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  onPress={handleAddToCart}
                  style={[styles.addButton]}
                >
                   {additemloading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                  <Text style={styles.addButtonText}>Add Selected Items</Text>
                                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.closeButton, { marginRight: 10 }]}
                  onPress={() => {
                    // If user goes back to vendor list, we can clear item search
                    setItemSearchQuery("");
                    setIsItemsModalVisible(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default VendorItemSelector;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  vendorSearchInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  vendorRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  vendorText: {
    fontSize: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  qtyContainer: {
    flexDirection: "row",
    marginLeft: 10,
    alignItems: "center",
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: "row-reverse",
    marginTop: 15,
    justifyContent: "flex-start",
  },
  addButton: {
    backgroundColor: "green",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 15,
  },
});
