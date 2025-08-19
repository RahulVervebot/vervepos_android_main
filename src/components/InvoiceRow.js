
import React, {memo} from 'react';
import {View, Text, TouchableOpacity, Button, StyleSheet} from 'react-native';
const InvoiceRow = memo(({ item, index, isExpanded, onToggle, onLongPress, selectedIds ,onEdit}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      onLongPress={() => onLongPress(item.id)}
      style={[
        styles.card,
        selectedIds.has(item.id) && styles.selectedRow,
      ]}
      activeOpacity={0.7}
    >
      {/* Row cells */}
      <View
        style={[
          styles.row,
          { backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' },
        ]}
      >
        <Text style={[styles.cell, { flex: 2 }]}>{item.barcode}</Text>
        <Text
          style={[styles.cell, { flex: 2.5 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.description}
        </Text>
        <Text style={[styles.cell, { flex: 0.7, textAlign: 'center' }]}>
          {item.unitInCase}
        </Text>
        <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>
          {item.extendedPrice.toFixed(2)}
        </Text>
        <Text style={[styles.cell, { flex: 0.8, textAlign: 'center' }]}>
          {item.unitPrice.toFixed(2)}
        </Text>
      </View>

      {/* Expanded section */}
      {isExpanded && (
        <View style={styles.expanded}>
          {[
            ['Barcode', item.barcode],
            ['Available in POS', 'Yes'],
            ['Qty Shipped', '12'],
            ['U. Cost', `$${item.unitPrice}`],
            ['Item No', `ITM_${item.id}`],
            ['Link Product', 'View Product'],
            ['Description', item.description],
            ['Size', '500ml'],
            ['Units in Case', item.unitInCase],
            ['Case Cost', `$${item.extendedPrice}`],
            ['Extended Price', `$${(item.unitPrice * item.unitInCase).toFixed(2)}`],
            ['Unit Price', `$${item.unitPrice}`],
            ['Mark Up (%)', '25%'],
          ].map(([label, value], idx) => (
            <View key={idx} style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>{label}:</Text>
              <Text
                style={[
                  styles.expandedValue,
                  label === 'Link Product' && { color: 'blue' },
                ]}
                numberOfLines={label === 'Description' ? 0 : 1}
              >
                {value}
              </Text>
            </View>
          ))}
          <Button
            title="Edit"
            onPress={() => onEdit(item)}
            color="#007BFF"
          />
        </View>
      )}
    </TouchableOpacity>
  );
});


export default InvoiceRow;

const styles = StyleSheet.create({
  card: {
    marginVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    padding: 10,
  },
  cell: {
    fontSize: 12.6,
  },
  expanded: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  expandedRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    alignItems: 'flex-start',
  },
  expandedLabel: {
    flex: 1,
    fontSize: 12.6,
    fontWeight: '600',
  },
  expandedValue: {
    flex: 2,
    fontSize: 12.6,
    color: '#000',
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff'
  },
  selectedRow: {
    backgroundColor: '#d0f0c0' // light green highlight
  }
  
});
