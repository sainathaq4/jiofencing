/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import axios from 'axios';
import {
  ActivityIndicator,
  MD2Colors,
  Button,
  TextInput,
  Divider,
  Card,
  Text,
} from 'react-native-paper';
import Video from 'react-native-video';
import video from '../assets/location-pin.mp4';

import message from '../assets/team.png'; // Make sure to provide the correct path to your image.
import SUCCESS from '../assets/SUCCESS.png';
import ERROR from '../assets/team2.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loader, setLoader] = useState(false);
  const [success, setSuccess] = useState('NONE');
  const [error, setError] = useState('NONE');

  const submitEmail = async () => {
    console.log('Login Request');

    console.log(email);

    let data = `{\n   "email":${email}\n}`;

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://e5ckv1gwwh.execute-api.us-east-1.amazonaws.com/Prod/magiclogin',
      headers: {
        'Content-Type': 'text/plain',
      },
      data: data,
    };
    setLoader(true);

    try {
      const response = await axios.request(config);
      console.log(JSON.stringify(response.data));
      setSuccess(
        'Email Sent To Your Inbox! Kindly open mail and click on the magic link.',
      );
    } catch (error) {
      setError('Please verify your email!');
      console.log(error);
    }

    setEmail('');
    setLoader(false);
  };

  return (
    <View style={styles?.container}>
      {success === 'NONE' && error === 'NONE' && (
        <View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 120,
            }}>
            <Video
              source={video} // the video file
              paused={false} // make it start
              repeat={true} // make it a loop
              style={styles.mediaPlayer}
              resizeMode="contain"
            />
          </View>
          {/* <View>
          </View> */}
          <View />
          <View>
            <TextInput
              style={styles.input}
              placeholder=" Email "
              value={email}
              onChangeText={text => setEmail(text)}
              textColor="black"
              editable={!loader}
            />
            {!loader && (
              <Button
                onPress={submitEmail}
                mode="contained"
                style={{backgroundColor: '#5D9C59', fontWeight: '20px'}}>
                Generate Login Link
              </Button>
            )}
            {loader && (
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#DDF7E3',
                  padding: 8,
                  borderRadius: 4,
                }}>
                <Text variant="titleMedium">Genrating magic link.</Text>
                <ActivityIndicator
                  animating={loader}
                  color={MD2Colors.red800}
                  style={{margin: 2}}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {success !== 'NONE' && (
        <View style={styles.success}>
          <Image source={message} style={styles.image} alt="Banner" />
          <Card.Content>
            <Text variant="bodyMedium">{success}</Text>
          </Card.Content>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => setSuccess('NONE')}>
            Go Back
          </Button>
        </View>
      )}
      {error !== 'NONE' && (
        <View style={styles.success}>
          <Image source={ERROR} style={styles.image} alt="Banner" />
          <Card.Content>
            <Text variant="titleLarge">{error}</Text>
          </Card.Content>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => setError('NONE')}>
            Go Back
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    margin: 20,
    width: 250,
    backgroundColor: '#5D9C59',
  },
  button: {
    width: '250px',
    backgroundColor: '#2655C3 !important',
  },
  success: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '20px',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpContainer: {
    width: '80%',
    alignItems: 'center',
  },
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  image: {
    maxWidth: 350,
    maxHeight: 350,
    borderWidth: 2,
    objectFit: 'contain',
    display: 'flex',
    justifyContent: 'center',
  },
  divider: {
    marginVertical: 10,
  },
  signUpSection: {
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: 350,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 25,
    marginTop: 25,
  },
  loginLoader: {
    // Define your loader styles here.
  },
  imageSuccess: {
    maxWidth: 450,
    maxHeight: 350,
    borderWidth: 2,
    objectFit: 'contain',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    left: 25,
  },
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
  },
});

export default Login;
