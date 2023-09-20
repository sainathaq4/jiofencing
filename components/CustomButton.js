import React from 'react'
import { Pressable, StyleSheet,Text, TouchableOpacity } from 'react-native'

const CustomButton = ({title,onPress,backgroundColor}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonStyle,{backgroundColor:title==="Start in background"?"green":"red"}]}>
        <Text style={styles.textStyle}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    textStyle:{
        color:"white",
    },
    buttonStyle:{
        borderRadius:5,
        backgroundColor:'red',
        padding:"2%",
        margin:"2%",
    }
})
export default CustomButton