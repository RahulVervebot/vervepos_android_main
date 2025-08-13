import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { confirmButtonStyles } from 'react-native-modal-datetime-picker';

const UserRegistrationModal = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [posRole, setPosRole] = useState('cashier');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    let current_url, current_access_token, company_id, company_ids;

    try {
      current_url = await AsyncStorage.getItem('storeUrl');
      current_access_token = await AsyncStorage.getItem('access_token');
      company_id = JSON.parse(await AsyncStorage.getItem('company_id'));
      const storedCompanyIds = await AsyncStorage.getItem('company_ids');
     company_ids = storedCompanyIds ? JSON.parse(storedCompanyIds) : [];
    } catch (error) {
      Alert.alert('Error', 'Failed to get headers or company info');
      return;
    }

    setLoading(true);

    const headers = new Headers();
    headers.append('access_token', current_access_token);
    headers.append('Cookie', 'session_id');
    headers.append('Content-Type', 'application/json');

    const payload = {
      name:name,
      login: email,
      email: email,
      company_id:company_id,
      company_ids:company_ids,
      pos_role: posRole,
      password:password
    };
console.log("payload:",payload);
    fetch(`${current_url}/pos_create_user`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.result?.status === 'success') {
          Alert.alert('Success', 'User created successfully!');
          onClose();
        } else {
          Alert.alert('Error', 'User creation failed!');
          console.log("not success",data);
        }
      })
      .catch(err => {
        setLoading(false);
        Alert.alert('Error', 'Something went wrong');
         console.log("Error",data);
      });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.heading}>Register New User</Text>

          <TextInput
            placeholder="Name"
             placeholderTextColor="#888"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TouchableOpacity onPress={() => setShowRoleModal(true)}>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownText}>{posRole || 'Select Role'}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </View>
          </TouchableOpacity>

          <TextInput
            placeholder="Password"
             placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.buttonRow}>
        <View style={styles.submitButtons}>
         <Text onPress={handleRegister} style={{ padding: '2%', textAlign: 'center', fontSize: 14 }}>{loading ? 'Submitting...' : 'Submit'}</Text>
         </View>
            <View style={styles.closeButtons}>
                    <Text onPress={() => {
    setName('');
    setEmail('');
    setPosRole('cashier');
    setPassword('');
    onClose();
  }}
     style={{ padding: '2%', textAlign: 'center', fontSize: 14 }}>Close</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Role Selection Modal */}
      <Modal visible={showRoleModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowRoleModal(false)}>
          <View style={styles.roleModal}>
            <TouchableOpacity onPress={() => { setPosRole('manager'); setShowRoleModal(false); }}>
              <Text style={styles.roleOption}>Manager</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setPosRole('cashier'); setShowRoleModal(false); }}>
              <Text style={styles.roleOption}>Cashier</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
  },
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleModal: {
    backgroundColor: 'white',
    padding: 15,
    width: 200,
    borderRadius: 10,
  },
  roleOption: {
    fontSize: 18,
    paddingVertical: 10,
    textAlign: 'center',
  },
      submitButtons: {
      padding: '2%',
      color: '#038c7f',
      backgroundColor: '#fff',
      borderColor: '#038c7f',
      borderWidth: 0.5,
      borderRadius: 10,
      alignSelf: 'center',
      width: '45%'
    },
     closeButtons: {
      padding: '2%',
      color: '#f00',
      backgroundColor: '#fff',
      borderColor: '#f00',
      borderWidth: 0.5,
      borderRadius: 10,
      alignSelf: 'center',
      width: '45%'
    },
});

export default UserRegistrationModal;
