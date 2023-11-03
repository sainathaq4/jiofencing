import React from 'react';
import {Pressable, StyleSheet, Text, TouchableOpacity} from 'react-native';

const CustomButton = ({title, onPress, backgroundColor}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.buttonStyle,
        {
          backgroundColor:
            title === 'Start in background' ? '#5D9C59' : '#DF2E38',
        },
      ]}>
      <Text style={styles.textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    color: 'white',
  },
  buttonStyle: {
    borderRadius: 5,
    backgroundColor: 'red',
    padding: '4%',
    margin: '2%',
    fontWeight: 600,
    alignItems: 'center',
  },
});
export default CustomButton;
