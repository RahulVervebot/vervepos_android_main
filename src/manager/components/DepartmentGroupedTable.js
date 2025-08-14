import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const DepartmentGroupedTable = ({
  poTableData,
  updateQty,
  updateUnitQty,
  handleManualQtyChange,
  handleManualUnitQtyChange,
  handleRemoveItem,
  departmentRemainingMap,
  departmentBudgetMap,
}) => {
  const groupedData = poTableData.reduce((acc, item) => {
    const dept = item.departmentName || 'Unknown Department';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(item);
    return acc;
  }, {});
  const [appType, setAppType] = useState(null);
  useEffect(() => {
    const initializeData = async () => {
      const now = new Date();
      const apptype = await AsyncStorage.getItem('apptype');
      setAppType(apptype);
    };
    initializeData();
  }, []);
  return (
    <View>
      {Object.entries(groupedData).map(([departmentName, items], deptIndex) => {
        const departmentTotal = items.reduce(
          (sum, item) => sum + (parseFloat(item.totalPrice) || 0),
          0
        );

        return (

          <View key={deptIndex}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                marginVertical: 10,
                color: '#2C62FF',
              }}
            >

              Department: {departmentName} |  Total: ${departmentTotal.toFixed(2)} | Total Budget: ${departmentBudgetMap[departmentName]?.toFixed(2) ?? 'N/A'}  | Remaining Budget: ${departmentRemainingMap[departmentName] != null
                ? (departmentRemainingMap[departmentName] - departmentTotal).toFixed(2)
                : 'N/A'}
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.col]}>Item Name</Text>
                <Text style={[styles.cell, styles.col]}>ItemNo</Text>
                <Text style={[styles.cell, styles.colval]}>Unit Cost</Text>
                <Text style={[styles.cell, styles.col]}>unitQty</Text>
                <Text style={[styles.cell, styles.colval]}>Case Cost</Text>
              {  appType === 'warehouse' ? <Text style={[styles.cell, styles.colval]}>InStock</Text> : <Text></Text>}
                 <Text style={[styles.cell, styles.col]}>Qty</Text>
                <Text style={[styles.cell, styles.colval]}>Total</Text>
                <Text style={[styles.cell, styles.col]}>Barcode</Text>
                <Text style={[styles.cell, styles.col]}>Vendor Name</Text>
                <Text style={[styles.cell, styles.colval]}>Remove</Text>
              </View>
              {items.map((item, index) => {
                const posUnitCost = parseFloat(item.posUnitCost) || 0;
                const invCaseCost = parseFloat(item.invCaseCost) || 0;
                const totalPrice = parseFloat(item.totalPrice) || 0;
                return (
                  <ScrollView nestedScrollEnabled={true}>
                  <View key={item.barcode} style={styles.tableRow}>
                    <Text style={[styles.cell, styles.col]}>{item.posName} - ({item.posSize})</Text>
                    <Text style={[styles.cell, styles.colval]}>{item.itemNo}</Text>
                    <Text style={[styles.cell, styles.colval]}>${posUnitCost.toFixed(2)}</Text>
                    <View style={[styles.cell, styles.col, styles.qtyContainer]}>
                      <TouchableOpacity
                        onPress={() => updateUnitQty(item.barcode, -1)}
                        style={styles.qtyButtonremove}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.qtyInput}
                        keyboardType="numeric"
                        value={String(item.unitQty)}
                        onChangeText={(text) =>
                          handleManualUnitQtyChange(item.barcode, text)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => updateUnitQty(item.barcode, 1)}
                        style={styles.qtyButton}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.cell, styles.colval]}>${invCaseCost.toFixed(2)}</Text>
                    {  appType === 'warehouse' ?    <Text style={[styles.cell, styles.colval]}>{item.invQty}</Text> : <Text></Text>}
                    <View style={[styles.cell, styles.col, styles.qtyContainer]}>
                      <TouchableOpacity
                        onPress={() => updateQty(item.barcode, -1)}
                        style={styles.qtyButtonremove}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.qtyInput}
                        keyboardType="numeric"
                        value={String(item.qty)}
                        onChangeText={(text) =>
                          handleManualQtyChange(item.barcode, text)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => updateQty(item.barcode, 1)}
                        style={styles.qtyButton}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.cell, styles.colval, { color: '#2C62FF' }]}>
                      ${totalPrice.toFixed(2)}
                    </Text>
                    <Text style={[styles.cell, styles.col]}>{item.barcode}</Text>
                    <Text style={[styles.cell, styles.col]}>{item.vendorName}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.barcode)}
                      style={[styles.cell, styles.colval]}
                    >
                      <Text style={{ color: 'red', fontWeight: 'bold', textAlign: "center" }}>X</Text>
                    </TouchableOpacity>
                  </View>
                  </ScrollView>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default DepartmentGroupedTable;

const styles = StyleSheet.create({
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
  },
  col: {
    width: 170,
  },
  colval: {
    width: 70,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButton: {
    backgroundColor: '#2C62FF',
    padding: 5,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  qtyButtonremove: {
    backgroundColor: '#ff0000',
    padding: 5,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  qtyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  qtyInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 40,
    textAlign: 'center',
    borderRadius: 5,
    padding: 4,
    fontSize: 13,
  },
});
