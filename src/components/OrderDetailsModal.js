// OrderDetailsModal.js
import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { ReceivedQuotation } from '../functions/VendorAccess/function';

const OrderDetailsModal = ({ visible, onClose, orderDetails }) => {
  const [editedLines, setEditedLines] = useState({});

  if (!orderDetails) return null;

  const handleLineChange = (quotationId, productId, field, value) => {
    setEditedLines((prev) => {
      const currentQuotationEdits = prev[quotationId] ? { ...prev[quotationId] } : {};
      const currentLine = currentQuotationEdits[productId] ? { ...currentQuotationEdits[productId] } : {};

      currentLine[field] = value;
      currentQuotationEdits[productId] = currentLine;
      return { ...prev, [quotationId]: currentQuotationEdits };
    });
  };

  const confirmQuotation = async (quotation) => {
    try {
      const quotationId = quotation.quotation.id;
      const linesEdits = editedLines[quotationId] || {};

      const dispatchData = quotation.quotation.quotation_lines.map((line) => {
        const productId = line.product;
        const userEdits = linesEdits[productId] || {};

        return {
          quotationId: quotationId,
          productId: productId,
          received_qty: Number(userEdits.received_qty ?? line.received_qty ?? 0),
          missing_qty: Number(userEdits.missing_qty ?? line.missing_qty ?? 0),
          damaged_qty: Number(userEdits.damaged_qty ?? line.damaged_qty ?? 0),
          dispatch_qty: Number(line.dispatch_qty),
          quantity: Number(line.quantity),
        };
      });

      const response = await ReceivedQuotation(dispatchData);
      if (response.error) {
        alert(response.error);
      } else if (!response.error)
      {
      // alert(response.message);
       alert(response.message);
      }
      else {
        alert('Failed to confirm quotation.');
      }
    } catch (error) {
      console.error('Error confirming quotation:', error);
      alert('Could not confirm quotation.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Order Details</Text>
          <ScrollView>
            {orderDetails.quotations && orderDetails.quotations.length > 0 ? (
              orderDetails.quotations.map((quotation, index) => (
                <Card key={index} style={styles.card}>
                  <Card.Content>
                    <Text style={styles.quotationTitle}>
                      Quotation No: {quotation.quotation.quotationNumber} | Status:{' '}
                      {quotation.quotation.status}
                    </Text>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableHeaderCell}>Product Name</Text>
                      <Text style={styles.tableHeaderCell}>Quantity</Text>
                      <Text style={styles.tableHeaderCell}>Dispatch Qty</Text>
                      <Text style={styles.tableHeaderCell}>Received Qty</Text>
                      <Text style={styles.tableHeaderCell}>Missing Qty</Text>
                      <Text style={styles.tableHeaderCell}>Damaged Qty</Text>
                      <Text style={styles.tableHeaderCell}>Inventory Qty</Text>
                    </View>
                    {quotation.quotation.quotation_lines.map((line, idx) => (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{line.product_name}</Text>
                        <Text style={styles.tableCell}>{line.quantity}</Text>
                        <Text style={styles.tableCell}>{line.dispatch_qty}</Text>
                        {quotation.quotation.status === 'intransit' ? (
                          <>
                            <TextInput
                              style={styles.inputCell}
                              keyboardType="numeric"
                              value={String(
                                editedLines[quotation.quotation.id]?.[line.product]?.received_qty ?? line.received_qty ?? ''
                              )}
                              onChangeText={(value) =>
                                handleLineChange(quotation.quotation.id, line.product, 'received_qty', value)
                              }
                            />
                            <TextInput
                              style={styles.inputCell}
                              keyboardType="numeric"
                              value={String(
                                editedLines[quotation.quotation.id]?.[line.product]?.missing_qty ?? line.missing_qty ?? ''
                              )}
                              onChangeText={(value) =>
                                handleLineChange(quotation.quotation.id, line.product, 'missing_qty', value)
                              }
                            />
                            <TextInput
                              style={styles.inputCell}
                              keyboardType="numeric"
                              value={String(
                                editedLines[quotation.quotation.id]?.[line.product]?.damaged_qty ?? line.damaged_qty ?? ''
                              )}
                              onChangeText={(value) =>
                                handleLineChange(quotation.quotation.id, line.product, 'damaged_qty', value)
                              }
                            />
                          </>
                        ) : (
                          <>
                            <Text style={styles.tableCell}>{line.received_qty}</Text>
                            <Text style={styles.tableCell}>{line.missing_qty}</Text>
                            <Text style={styles.tableCell}>{line.damaged_qty}</Text>
                          </>
                        )}
                        <Text style={styles.tableCell}>{line.invQty}</Text>
                      </View>
                    ))}
                    {quotation.quotation.status === 'intransit' && (
                      <View style={styles.orderdetailsbutton}>
                      <TouchableOpacity
                      style={[styles.addButtonall, styles.confirmButton]}
                      onPress={() => confirmQuotation(quotation)}
                    >
                      <Text style={styles.addButtonText}>Confirm Received</Text>
                    </TouchableOpacity>
                    </View>
                    )}
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text style={styles.noDataText}>No Quotations Found</Text>
            )}
          </ScrollView>
          <View style={styles.orderdetailsbutton}>
             <TouchableOpacity
                      style={[styles.addButtonall]}
                      onPress={onClose}
                    >
                      <Text style={styles.addButtonText}>Close</Text>
                    </TouchableOpacity>
                    </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 5, alignItems: 'center' },
  tableHeaderCell: { flex: 1, fontWeight: 'bold', textAlign: 'center', fontSize: 12 },
  tableCell: { flex: 1, textAlign: 'center', fontSize: 12 },
  inputCell: { flex: 1, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 5, marginHorizontal: 5, textAlign: 'center' },
  confirmButton: { marginTop: 10 },
  closeButton: { marginTop: 15 },
  noDataText: { textAlign: 'center', marginTop: 10, color: '#888' },

  addButtonall:{
    backgroundColor: '#2C62FF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    margin: 10,
    width:"30%",
    justifyContent:"center"
  },

orderdetailsbutton:{
textAlign:"center",
alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    textAlign: "center",
  },
card:{
margin: 5,
  },
});

export default OrderDetailsModal;
