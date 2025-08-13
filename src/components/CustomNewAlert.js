import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const CustomNewAlert = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCancel = () => {
    // console.log('Cancel Pressed');
    setModalVisible(false);
  };

  const handleOK = () => {
    // console.log('OK Pressed');
    setModalVisible(false);
  };

  return (
    <View>
      {/* Your other content */}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
            <Text>Does this barcode starts with zero?</Text>
            <Text>Please select the barcode as shown on the product</Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity onPress={handleCancel} style={{ marginRight: 20 }}>
                <Text style={{ color: 'red' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleOK} style={{ marginLeft: 20 }}>
                <Text style={{ color: 'blue' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomNewAlert;
