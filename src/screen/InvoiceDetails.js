//invoxie deatail.js
import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Button,
  StyleSheet
} from 'react-native';
import EditProduct from "../components/EditProduct.js";
import InvoiceRow from '../components/InvoiceRow.js';


// Enable Layout Animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InvoiceDetails() {
  const itemsRef = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      barcode: String(1000000000 + i),
      description: `Product ${i + 1} with a long description for testing.`,
      unitInCase: 24,
      extendedPrice: 480.0,
      unitPrice: 20.0,
    }))
  );
  const [expandedId, setExpandedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());


  const openModal = useCallback((item) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  const handleLongPress = (id) => {
  setSelectedIds(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
};
  const handleSave = useCallback((updatedItem, commit = true) => {
    if (commit) {
      itemsRef.current = itemsRef.current.map((it) =>
        it.id === updatedItem.id ? updatedItem : it
      );
      closeModal();
    } else {
      setSelectedItem(updatedItem);
    }
  }, [closeModal]);

  const toggleExpand = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prevId) => (prevId === id ? null : id));
  }, []);

  const renderHeader = useCallback(() => (
    <View style={styles.headerRow}>
      {['Barcode', 'P. Info', 'U.C', 'Case Cost', 'Ext. Price'].map((title, idx) => (
        <Text
          key={idx}
          style={[styles.headerText, idx === 0 ? { flex: 2 } :
                                     idx === 1 ? { flex: 2.5 } :
                                     idx === 2 ? { flex: 0.7 } :
                                     idx === 3 ? { flex: 1 } : { flex: 0.8 }]}
        >
          {title}
        </Text>
      ))}
    </View>
  ), []);

 

 const renderItem = useCallback(
  ({ item, index }) => (
    <InvoiceRow
      item={item}
      index={index}
      isExpanded={expandedId === item.id}
      onToggle={() => toggleExpand(item.id)}
      onLongPress={handleLongPress}      // ✅ pass handler
      selectedIds={selectedIds}    
      onEdit = {openModal}      // ✅ pass state
    />
  ),
  [expandedId, toggleExpand, handleLongPress, selectedIds]
);

  const FloatingButton = ({ onPress, title }) => (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={{ flexDirection: 'column', gap: 4 }}>
          <Text style={styles.summaryText}>INV No: <Text style={styles.summaryValue}>INV_125</Text></Text>
          <Text style={styles.summaryText}>V. Name: <Text style={styles.summaryValue}>Chetak</Text></Text>
          <Text style={styles.summaryText}>S. Date: <Text style={styles.summaryValue}>{new Date().toLocaleDateString()}</Text></Text>
        </View>
        <View style={{ flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <Text style={styles.summaryText}>No. Units: <Text style={styles.summaryValue}>{itemsRef.current.reduce((sum, i) => sum + i.unitInCase, 0)}</Text></Text>
          <Text style={styles.summaryText}>E. Price: <Text style={styles.summaryValue}>${itemsRef.current.reduce((sum, i) => sum + i.extendedPrice, 0).toFixed(2)}</Text></Text>
          <Text style={styles.summaryText}>C. Cost: <Text style={styles.summaryValue}>${itemsRef.current.reduce((sum, i) => sum + i.unitPrice, 0).toFixed(2)}</Text></Text>
        </View>
      </View>

      {/* List */}
      <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 8 }}>
        <FlatList
          data={itemsRef.current}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          initialNumToRender={6}
          windowSize={5}
          removeClippedSubviews
        />
        <EditProduct
          visible={isModalVisible}
          item={selectedItem}
          onClose={closeModal}
          onSave={handleSave}
        />
        <FloatingButton onPress={() => alert('Floating button pressed!')} title="+" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    padding: 10
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12.6,
    textAlign: 'center'
  },
  card: {
    marginVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    padding: 10
  },
  cell: {
    fontSize: 12.6
  },
  expandedSection: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  expandedRow: (border) => ({
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: border ? 0.5 : 0,
    borderColor: '#ccc',
    alignItems: 'flex-start'
  }),
  expandedLabel: {
    flex: 1,
    fontSize: 12.6,
    fontWeight: '600'
  },
  expandedValue: {
    flex: 2,
    fontSize: 12.6,
    color: '#000'
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#007bff',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  fabText: {
    color: 'white',
    fontSize: 24
  },
  summaryBar: {
    height: 90,
    margin: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#8FD9FB',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  summaryValue: {
    fontWeight: '400'
  }
});
