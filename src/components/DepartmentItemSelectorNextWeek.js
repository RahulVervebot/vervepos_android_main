import React, { useState,useEffect,useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Button,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import { getSingleDepartmentNextWeek } from "../functions/DepartmentAccess/function_dep"
import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * Reusable component to:
 * 1) Display a list of departments
 * 2) On picking a department, fetch items (via a passed-in function)
 * 3) Show those items in a modal for user to select and set quantities
 * 4) Return the selected items to the parent
 */

const DepartmentItemSelector = ({
  categories = [],
  fetchItemsForDepartment, // <--- use this name
  onItemsSelected,         // callback to parent with array of { ...item, qty }
  visible,
  onClose,
}) => {
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [DepartmentName, setDepartmentName] = useState([]);
  const [DepartmentId, setDepartmentId] = useState([]);
  const [DepartmentStatus, setDepartmentStatus] = useState([]);
  const [selectedModalItems, setSelectedModalItems] = useState([]);
  const [modalSelectedItems, setModalSelectedItems] = useState({});
  const [itemModalSearchQuery, setItemModalSearchQuery] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [SingleDepartment, setSingleDepartment] = useState('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [apiSearchQuery, setApiSearchQuery] = useState('');
      const [searchLoading, setSearchLoading] = useState(false);
        const latestQueryRef = useRef('');
          const [accessToken, setAccessToken] = useState('');
          const [storeUrl, setStoreUrl] = useState('');
  // Step 1: choose a department -> fetch items -> open items modal
  const handleDepartmentSelect = async (deptId, DepartmentName) => {
    try {
      setLoadingItems(true);
      setDepartmentName(DepartmentName);
      setDepartmentId(deptId);
      const depatmentdetails = await getSingleDepartmentNextWeek(DepartmentName);
      setSingleDepartment(depatmentdetails.data[0].department_allocations[0]);
      console.log('SginleCategory:',);
      // const items = await fetchItemsForDepartment(deptId);
      // setFilteredItems(items || []);
      // Reset any previous selection
      setSelectedModalItems([]);
      setModalSelectedItems({});
      setLoadingItems(false);
      setIsItemsModalVisible(true);
      // if (items && items.length > 0) {
      //   setIsItemsModalVisible(true);
      // } else {
      //   alert("No items found for this department.");
      // }
    } catch (error) {
      setLoadingItems(false);
      console.warn("Error fetching items for dept:", error);
      alert("Failed to load items. Please try again.");
    }
  };
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (apiSearchQuery.length > 0) {
        handleApiSearch(apiSearchQuery);
      } else {
        setFilteredItems([]);
      }
    }, 500); // delay in ms

    return () => clearTimeout(delayDebounce); // cleanup previous timer
  }, [apiSearchQuery]);
  useEffect(() => {
    const fetchTokens = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const url = await AsyncStorage.getItem('storeUrl');
      setAccessToken(token);
      setStoreUrl(url);
    };
    fetchTokens();
  }, []);

  const handleApiSearch = async (query) => {
    try {
      setSearchLoading(true);
      latestQueryRef.current = query; // Save the current query
      console.log("accessToken:",accessToken);
      const fullurl = `${storeUrl}/api/vendor_management/data/department?departmentId=${DepartmentId}&q=${query}`;
      if (!accessToken || !storeUrl) return;
      const response = await fetch(fullurl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log("result:",result);
      console.log("query:", query);
      console.log("fullurl:",fullurl);
      // ❗ Ignore results if it's not for the latest query
      if (latestQueryRef.current !== query) return;
      if (result && result.data) {
        setFilteredItems(result.data.slice(0, 15));
      } else {
        setFilteredItems([]);
      }
    } catch (error) {
      console.error("API search error:", error);
    }
    finally {
      setSearchLoading(false);
    }
  };

  // Step 2: toggle the checkbox for each item
  const toggleCheckbox = (barcode) => {
    setSelectedModalItems((prev) => {
      if (prev.includes(barcode)) {
        return prev.filter((code) => code !== barcode);
      } else {
        return [...prev, barcode];
      }
    });
  };

  // Step 3: quantity +/- in items modal
  const updateQtyInModal = (barcode, increment) => {
    setModalSelectedItems((prevItems) => {
      const currentQty = prevItems[barcode] || 1;
      const newQty = currentQty + increment > 0 ? currentQty + increment : 1;
      return { ...prevItems, [barcode]: newQty };
    });
  };

  // Filter items in the items modal
  const modalFilteredItems = filteredItems
    .reduce((acc, item) => {
      // optional dedupe by barcode
      const existingItem = acc.find((i) => i.barcode === item.barcode);
      if (!existingItem) acc.push(item);
      return acc;
    }, [])
    .filter((item) => {
      const productName = item.itemNo?.toLowerCase() || "";
      const barcode = item.barcode?.toLowerCase() || "";
      const query = itemModalSearchQuery.toLowerCase();
      return (
        productName.includes(query) ||
        barcode.includes(query)
      );
    });

  // Step 4: user taps “Add Selected Items”
  const handleAddToCart = () => {
    const remaining = parseFloat(calculatedRemainingBudget());
    if (remaining < 0) {
      setShowBudgetModal(true);
      return;
    }

    // Filter the selected items from all fetched items
    let selectedItemsData = filteredItems.filter((item) =>
      selectedModalItems.includes(item.barcode)
    );

    // Optional: ensure unique barcodes
    const uniqueByBarcode = {};
    selectedItemsData.forEach((item) => {
      if (!uniqueByBarcode[item.barcode]) {
        uniqueByBarcode[item.barcode] = item;
      }
    });
    selectedItemsData = Object.values(uniqueByBarcode);

    // Construct final array with quantity
    const finalArray = selectedItemsData.map((item) => {
      const qty = modalSelectedItems[item.barcode] || 1;
      const unitQty = 0;
      
      return {
        ...item,
        qty,
        unitQty,
        departmentRemainingAmount: calculatedRemainingBudget(),  // <-- Add this
        departmentAllocationId: SingleDepartment.departmentAllocationId,
        departmentId: SingleDepartment.departmentId
      };
    });

    // Pass it back to the parent
    onItemsSelected(finalArray);
    setApiSearchQuery('');
    // Close everything
    setIsItemsModalVisible(false);
    onClose();
  };
  const calculatedRemainingBudget = () => {
    let totalCost = 0;
    filteredItems.forEach(item => {
      if (selectedModalItems.includes(item.barcode)) {
        const qty = modalSelectedItems[item.barcode] || 1;
        totalCost += (item.invCaseCost || 0) * qty;
      }
    });

    const allocated = parseFloat(SingleDepartment?.departmentRemainingAmount || 0);
    return (allocated - totalCost).toFixed(2); // rounding to 2 decimals
  };

  return (
    <View>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Choose Department */}
            {!isItemsModalVisible && (
              <>
                <Text style={styles.modalTitle}>Select Department</Text>
                <ScrollView style={{ width: "100%", maxHeight: 400 }}>
                  {categories
                    ?.filter((dept) => dept.departmentStatus === 'active') // ✅ Only active departments
                    .sort((a, b) => a.category_name.localeCompare(b.category_name))
                    .map((dept) => (
                      <View style={styles.departmentRow} key={dept.departmentId}>
                        <Text style={styles.departmentName}>{dept.category_name}</Text>
                        <TouchableOpacity
                          style={[styles.addbutton]}
                          onPress={() => handleDepartmentSelect(dept.departmentId, dept.category_name)}
                        >
                          <Text style={styles.buttonText}>Search Items</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                </ScrollView>
                {loadingItems ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : null}

                <TouchableOpacity
                  style={[styles.closeButton, { marginTop: 10 }]}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Items Modal */}
            {isItemsModalVisible && (
              <>
                <View style={styles.departmentheader}>
                  <Text style={styles.modalTitle}>Budget: {SingleDepartment.departmentAllocatedAmount} | </Text>
                  {/* <Text style={styles.modalTitle}>Remaining Budget: {SingleDepartment.departmentRemainingAmount}</Text> */}
                  <Text style={styles.modalTitle}>Remaining Budget: {calculatedRemainingBudget()}</Text>
                </View>
                <Text style={styles.modalTitle}>Select Items For {DepartmentName}</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Items..."
                  // value={itemModalSearchQuery}
                  // onChangeText={setItemModalSearchQuery}
                  value={apiSearchQuery}
                  onChangeText={(text) => {
                    setApiSearchQuery(text);
                  }}
                />
         {searchLoading ? (
                         <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />
                       ) : (     
 modalFilteredItems.length > 0 ? (
  <FlatList
  data={modalFilteredItems}
  keyExtractor={(item, index) => item.barcode || index.toString()}
  style={{ height: 400, width: "100%", marginVertical: 10 }}
  renderItem={({ item }) => {
    const isChecked = selectedModalItems.includes(item.barcode);
    const itemQty = modalSelectedItems[item.barcode] || 1;
    return (
      <View style={styles.itemRow}>
        <CheckBox
          value={isChecked}
          onValueChange={() => toggleCheckbox(item.barcode)}
        />
        <TouchableOpacity
          style={{ marginLeft: 8, flex: 1 }}
          onPress={() => toggleCheckbox(item.barcode)}
        >
          <Text>{item.posName} | {item.invCaseCost}</Text>
        </TouchableOpacity>
        {isChecked && (
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={[styles.qtyButton, { backgroundColor: "red" }]}
              onPress={() => updateQtyInModal(item.barcode, -1)}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 5 }}>{itemQty}</Text>
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
  }}
  initialNumToRender={15}
  maxToRenderPerBatch={15}
  windowSize={10}
  removeClippedSubviews={true}
/>

) : (
  <Text></Text>
)
)}

               
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[styles.addButton]}
                    onPress={handleAddToCart}
                  >
                    <Text style={styles.addButtonText}>Add Selected Items</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.closeButton, { marginLeft: 5 }]}
                    onPress={() => setIsItemsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={showBudgetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 300 }]}>
            <Text style={styles.modalTitle}>Insufficient Budget</Text>

            <Text style={{ textAlign: "center", marginBottom: 15 }}>
              Your current selection exceeds the department's remaining budget.{"\n"}
              Please remove some items or request for more budget.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBudgetModal(false)}
            >
              <Text style={styles.closeButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DepartmentItemSelector;

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
  departmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 8,
  },
  departmentName: {
    flex: 1,
    fontSize: 16,
  },
  searchInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 10,
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
  },
  addButton: {
    backgroundColor: "green",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    margin: 1
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
  addbutton: {
    backgroundColor: '#2C62FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  departmentheader: {
    flexDirection: "row"
  }
});
