import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {useTheme} from '@react-navigation/native';
import {
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';

import Text from 'src/components/Text';
import Icon from 'src/components/Icon';
import Card from 'src/components/Card';
import ActivityIndicator from './ActivityIndicator';

import nodeType from 'src/helpers/nodeType';
import renderNode from 'src/helpers/renderNode';
import {fonts, sizes} from 'src/configs/fonts';

const defaultSearchIcon = {
  size: 20,
  name: 'search',
  type: 'material',
};
const defaultClearIcon = {
  name: 'close-circle',
  size: 20,
};

const defaultCameraIcon = {
  name: 'camera',
  size: 20,
  type: 'material',
};

const SearchBar = ({
  value,
  cancelButtonProps,
  cancelButtonTitle,
  clearIcon,
  containerStyle,
  inputContainerStyle,
  inputContentStyle,
  inputStyle,
  showLoading,
  loadingProps,
  searchIcon,
  cameraIcon,
  showCancel,
  cancelComponent,
  theme,
  ...attributes
}) => {
  const inputRef = useRef(null);
  const {colors} = useTheme();
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(value ? value === '' : true);

  const onFocus = event => {
    attributes.onFocus(event);
    UIManager.configureNextLayoutAnimation && LayoutAnimation.easeInEaseOut();

    setHasFocus(true);
    setIsEmpty(value === '');
  };

  const onBlur = event => {
    attributes.onBlur(event);

    if (showCancel !== 'allways') {
      UIManager.configureNextLayoutAnimation && LayoutAnimation.easeInEaseOut();
      setHasFocus(false);
    }
  };

  const onChangeText = text => {
    attributes.onChangeText(text);
    setIsEmpty(text === '');
  };

  const onBarCodeScanner = () => {
    attributes.onBarCodeScanner();
  };

  const clear = () => {
    inputRef.current.clear();
    onChangeText('');
    attributes.onClear();
  };

  const cancel = () => {
    if (value !== '') {
      onChangeText('');
    }
    if (showCancel !== 'hidden') {
      UIManager.configureNextLayoutAnimation && LayoutAnimation.easeInEaseOut();
      setHasFocus(false);
    }

    setTimeout(() => {
      inputRef.current.blur();
      attributes.onCancel();
    }, 0);
  };

  return (
    <View style={StyleSheet.flatten([styles.container, containerStyle])}>
      <Card secondary style={[styles.inputContainer, inputContainerStyle]}>
        {searchIcon
          ? renderNode(Icon, searchIcon, {
              color: colors.secondaryText,
              containerStyle: styles.searchIcon,
              ...defaultSearchIcon,
            })
          : null}
        <View style={[styles.inputContent, inputContentStyle]}>
          <TextInput
            testID="searchInput"
            placeholderTextColor={colors.secondaryText}
            {...attributes}
            ref={inputRef}
            onFocus={onFocus}
            onBlur={onBlur}
            style={[styles.input, inputStyle]}
            onChangeText={onChangeText}
          />
        </View>
        <TouchableOpacity onPress={onBarCodeScanner}>
          {cameraIcon && isEmpty
            ? renderNode(Icon, cameraIcon, {
                color: colors.secondaryText,
                containerStyle: styles.cameraIcon,
                ...defaultCameraIcon,
              })
            : null}
        </TouchableOpacity>

        <View style={styles.viewIconRight}>
          {showLoading ? (
            <ActivityIndicator
              key="loading"
              size="small"
              style={StyleSheet.flatten([styles.iconRight, loadingStyle])}
              {...otherLoadingProps}
            />
          ) : null}
          {!isEmpty
            ? renderNode(Icon, clearIcon, {
                color: colors.secondaryText,
                containerStyle: styles.iconRight,
                ...defaultClearIcon,
                key: 'cancel',
                onPress: onClear,
              })
            : null}
        </View>
      </Card>
      {showCancel === 'allways' || (showCancel === 'focus' && hasFocus) ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={buttonDisabled ? null : onCancel}
          style={[styles.buttonCancel, buttonStyle]}
          {...otherCancelButtonProps}>
          {cancelComponent ? (
            cancelComponent
          ) : (
            <Text medium>{cancelButtonTitle}</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  cancelButtonProps: PropTypes.object,
  cancelButtonTitle: PropTypes.string,
  clearIcon: PropTypes.node,
  searchIcon: PropTypes.node,
  cameraIcon: PropTypes.node,
  loadingProps: PropTypes.object,
  showLoading: PropTypes.bool,
  onClear: PropTypes.func,
  onCancel: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChangeText: PropTypes.func,
  onBarCodeScanner: PropTypes.func,
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputContentStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  showCancel: PropTypes.oneOf(['always', 'focus', 'hidden']),
  cancelComponent: PropTypes.node,
};

SearchBar.defaultProps = {
  value: '',
  cancelButtonTitle: 'Cancel',
  loadingProps: {},
  cancelButtonProps: {},
  showLoading: false,
  onClear: () => null,
  onCancel: () => null,
  onFocus: () => null,
  onBlur: () => null,
  onChangeText: () => null,
  onBarCodeScanner: () => null,
  searchIcon: defaultSearchIcon,
  clearIcon: defaultClearIcon,
  cameraIcon: defaultCameraIcon,
  showCancel: 'focus',
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },
  input: {
    height: 46,
    paddingHorizontal: 11,
    fontFamily: fonts.regular,
    fontSize: sizes.h5,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContent: {
    flex: 1,
  },
  viewIconRight: {
    flexDirection: 'row',
  },
  iconRight: {
    marginRight: 11,
  },
  searchIcon: {
    marginLeft: 11,
  },
  cameraIcon: {
    marginLeft: 11,
  },
  buttonCancel: {
    marginLeft: 10,
    height: 46,
    justifyContent: 'center',
  },
});

export default function Search(props) {
  const theme = useTheme();
  return <SearchBar {...props} theme={theme} />;
}
