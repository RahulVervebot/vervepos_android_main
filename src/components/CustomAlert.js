import React, {useState} from 'react';
import {View, Text, Modal, TouchableOpacity} from 'react-native';

const CustomAlert = props => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    props.onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{backgroundColor: 'white', padding: 20}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
            {props.title}
          </Text>
          <Text>{props.message}</Text>
          <TouchableOpacity
            style={{alignSelf: 'flex-end', marginTop: 20}}
            onPress={handleClose}>
            <Text style={{color: 'blue'}}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
