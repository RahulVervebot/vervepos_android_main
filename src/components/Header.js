import React from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const Header = ({ title }) => {
  return (
    <Appbar.Header style={styles.header}>
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6200ee', // Customize the background color
    elevation: 4,
  },
});
