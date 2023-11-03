/* eslint-disable react-native/no-inline-styles */
import {View, Text, Animated, TouchableOpacity} from 'react-native';
import React from 'react';

export default function Animate() {
  return (
    <View>
      <Animated.View>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 100 / 2,
            backgroundColor: 'orange',
          }}
        />
      </Animated.View>
      <TouchableOpacity onPress={() => {}}>
        <Text>Animate</Text>
      </TouchableOpacity>
    </View>
  );
}
