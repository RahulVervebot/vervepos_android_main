// ManualItemAdder.js
import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';

import {getSingleDepartmentCurrentWeek, fetchVendorList,getTotalAllocationCurrentWeek} from  "../../functions/DepartmentAccess/function_dep"
const ManualItemAdder = ({ visible, onClose, onAdd }) => {
  const [item, setItem] = useState({
    posName: '',
    product_id:'',
    posSize: '',
    itemNo: '',
    posUnitCost: '',
    invCaseCost: '',
    qty: '1',
    unitQty: '0',
    barcode: '',
    vendorName: '',
  });
  const [vendorList, setVendorList] = useState([]);
  const [vendorDropdownVisible, setVendorDropdownVisible] = useState(false);
  const [departmentAllocations, setDepartmentAllocations] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentDropdownVisible, setDepartmentDropdownVisible] = useState(false);


  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const allVendors = await fetchVendorList('');
        const sortedNames = allVendors.sort((a, b) => a.localeCompare(b));
        setVendorList(sortedNames);
        console.log("vendorList:",vendorList);
      } catch (err) {
        console.warn("Error fetching vendors:", err);
      }
    };

    fetchVendors();
  }, []);


  useEffect(() => {
    const initializeData = async () => {
      try {
        const allocationDetails = await getTotalAllocationCurrentWeek();
        if (
          allocationDetails &&
          allocationDetails.status === 'success' &&
          Array.isArray(allocationDetails.data) &&
          allocationDetails.data.length > 0
        ) {
          // The first array element
          const firstRecord = allocationDetails.data[0];
          // Full weekly info if you want it
          // Specifically the array of department allocations
          if (firstRecord.department_allocations) {
            setDepartmentAllocations(firstRecord.department_allocations);
            console.log("department data in manula",departmentAllocations);
          }
        }
      } catch (error) {
        console.error('Error fetching allocation details', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const handleChange = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const totalPrice = (parseFloat(item.invCaseCost) || 0) * parseInt(item.qty || 1);
    const departmentName = selectedDepartment.category_name;
    const caseQty = 1;
    const  barcode = 'NEW-PRODUCT';
    const posDepartment =  selectedDepartment.category_name;
       let departmentDetails = {};
          try {
            const response = await getSingleDepartmentCurrentWeek(selectedDepartment.category_name);
            console.log('departmentresponse',response);
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
          }
          
          const  departmentId = departmentDetails.departmentId || 0;
          const departmentAllocationId = departmentDetails.departmentAllocationId || 0;
          const departmentRemainingAmount = departmentDetails.departmentRemainingAmount || 0;

          const formattedItem = {
            ...item,
            qty: parseInt(item.qty),
            posUnitCost: parseFloat(parseFloat(item.posUnitCost || 0).toFixed(2)),
            invCaseCost: parseFloat(parseFloat(item.invCaseCost || 0).toFixed(2)),
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            departmentName,
            posDepartment,
            barcode,
            departmentId,
            departmentAllocationId
          };
        
          onAdd(formattedItem);
    setItem({ posName: '', posSize: '', itemNo: '', posUnitCost: '', invCaseCost: '', qty: caseQty,unitQty:0, vendorName: '' });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Add Manual Item</Text>
          {['posName', 'posSize', 'itemNo', 'posUnitCost', 'invCaseCost'].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={field}
              keyboardType={['posUnitCost', 'invCaseCost', 'qty'].includes(field) ? 'numeric' : 'default'}
              value={item[field]}
              onChangeText={(text) => handleChange(field, text)}
            />
          ))}

          {/* Department Dropdown */}
<TouchableOpacity
  style={styles.input}
  onPress={() => setDepartmentDropdownVisible(!departmentDropdownVisible)}
>
  <Text>{selectedDepartment?.category_name || "Select Department"}</Text>
</TouchableOpacity>

{departmentDropdownVisible && (
  <FlatList
    style={styles.dropdown}
    data={departmentAllocations}
    keyExtractor={(item) => item.departmentId.toString()}
    renderItem={({ item: dept }) => (
      <TouchableOpacity
        onPress={() => {
          setSelectedDepartment(dept);
          setDepartmentDropdownVisible(false);
        }}
      >
        <Text style={styles.dropdownItem}>{dept.category_name}</Text>
      </TouchableOpacity>
    )}
  />
)}


          {/* Vendor Dropdown */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setVendorDropdownVisible(!vendorDropdownVisible)}
          >
            <Text>{item.vendorName || "Select Vendor"}</Text>
          </TouchableOpacity>

          {vendorDropdownVisible && (
            <FlatList
              style={styles.dropdown}
              data={vendorList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: vendor }) => (
                <TouchableOpacity
                  onPress={() => {
                    setItem((prev) => ({ ...prev, vendorName: vendor }));
                    setVendorDropdownVisible(false);
                  }}
                >
<Text style={styles.dropdownItem}>
  {vendor.replace(/[-_]/g, ' ').toUpperCase()}
</Text>
</TouchableOpacity>
              )}
            />
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ManualItemAdder;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
  },
  dropdown: {
    maxHeight: 150,
    backgroundColor: '#f9f9f9',
    color:"#000",
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    color: '#000', // Ensures black text
    backgroundColor: '#fff', // Optional for clarity
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#2C62FF',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f00',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});