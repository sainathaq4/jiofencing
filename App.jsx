import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Button,
  Alert,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Linking,
  ImageBackground,
} from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import onDisplayNotification from './Notification';
import CustomButton from './components/CustomButton';
import Login from './components/Login';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useRoute, useNavigation} from '@react-navigation/native';
import {ProgressBar, MD3Colors, Divider} from 'react-native-paper';
import Video from 'react-native-video';
import video from './assets/root-map.mp4';
import imageback from './assets/mapbackground.jpeg';

export default function App() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#5D9C59',
          },
          cardStyle: {
            backgroundColor: '#DDF7E3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            width: 350,
            textAlign: 'center',
          },
        }}>
        <Stack.Screen name="Geo Fencing" component={NewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function NewScreen() {
  const BACKGROUND_LOCATION = 'BACKGROUND_LOCATION';
  const GEOFENCE_BOUNDARY = 'GEOFENCE_BOUNDARY';
  const [lat, setLat] = useState(12.9874075);
  const [lon, setLon] = useState(77.7366878);
  const [radius, setRadius] = useState(40);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userIsLoggedIn, setLoggedIn] = useState(false);
  const [validSession, setValidatingSession] = useState(false);
  const [progress, setProgress] = useState(0);

  // request(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
  //   switch (result) {
  //     case RESULTS.UNAVAILABLE:
  //       console.log(
  //         "This feature is not available (on this device / in this context)"
  //       );
  //       break;
  //     case RESULTS.DENIED:
  //       console.log(
  //         "The permission has not been requested / is denied but requestable"
  //       );
  //       break;
  //     case RESULTS.LIMITED:
  //       console.log("The permission is limited: some actions are possible");
  //       break;
  //     case RESULTS.GRANTED:
  //       console.log("The permission is granted");
  //       // Permission has been granted - app can request location coordinates
  //       // getUserLocation();
  //       break;
  //     case RESULTS.BLOCKED:
  //       console.log("The permission is denied and not requestable anymore");
  //       break;
  //   }
  // });

  TaskManager.defineTask(
    GEOFENCE_BOUNDARY,
    ({data: {eventType, region}, error}) => {
      if (error) {
        console.log(error.message, 'geofence error');
        return;
      }
      if (eventType === Location.GeofencingEventType.Enter) {
        console.log("You've entered region:", region);
        Alert.alert('Entered region');
        onDisplayNotification({
          title: 'Entered region',
          body: 'Entered region',
        });
        // message = 'Entered region';
      } else if (eventType === Location.GeofencingEventType.Exit) {
        console.log("You've left region:", region);
        Alert.alert('Left region');
        onDisplayNotification({title: 'Left region', body: 'Left region'});
        // message = 'Left region';
      }
    },
  );

  TaskManager.defineTask(BACKGROUND_LOCATION, async ({data, error}) => {
    if (error) {
      console.error(error.message, 'background location error');
      Alert.alert('background location error');
      return;
    }
    if (data) {
      const {locations} = data;
      const location = locations[0];
      if (location) {
        console.log('Location in background', location.coords);
        setCurrentLocation(location.coords);
        const isTaskDefined = TaskManager.isTaskDefined(GEOFENCE_BOUNDARY);
        if (!isTaskDefined) {
          console.log('Task is not defined');
          return;
        }
        await Location.startGeofencingAsync(GEOFENCE_BOUNDARY, [
          {
            identifier: 'my-geofence',
            latitude: lat,
            longitude: lon,
            radius: radius,
            notifyOnEnter: true,
            notifyOnExit: true,
          },
        ]);
      }
    }
  });
  const req = () => {};
  const requestPermissions = async () => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    // if (foreground.ios.status !== 'granted') {
    //   console.log(' denied');
    //   onDisplayNotification({title:"location tracking denied",body:"location tracking denied"})
    //   return;
    // }
    if (foreground.granted) {
      await Location.requestBackgroundPermissionsAsync();
    }
  };
  useEffect(() => {
    requestPermissions();
  }, []);

  // // Start location tracking in background
  const startBackgroundUpdate = async () => {
    // Don't track position if permission is not granted
    const {granted} = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
      requestPermissions();
      console.log('location tracking denied');
      onDisplayNotification({
        title: 'location tracking denied',
        body: 'location tracking denied',
      });
      return;
    }

    // Make sure the task is defined otherwise do not start tracking
    const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION);
    if (!isTaskDefined) {
      console.log('Task is not defined');

      return;
    }

    // Don't track if it is already running in background
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION,
    );
    if (hasStarted) {
      console.log('Already started');
      Alert.alert('Location tracking already started');
      onDisplayNotification({
        title: 'Location tracking already started',
        body: 'Location tracking already started',
      });
      return;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 20000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Location',
        notificationBody: 'Location tracking in background',
        notificationColor: '#fff',
      },
    });
  };

  const stopBackgroundUpdate = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION,
    );
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION);
      console.log('Location tacking stopped');
      Alert.alert('Location tacking stopped');
      onDisplayNotification({
        title: 'Location tracking stopped',
        body: 'Location tracking stopped',
      });
    }
    if (Location.hasStartedGeofencingAsync) {
      Location.stopGeofencingAsync(GEOFENCE_BOUNDARY);
    }
  };

  const route = useRoute();
  const [currentUrl, setCurrent] = useState({
    email: 'Intial',
    token: 'IntialToken',
  });

  const navigation = useNavigation();

  useEffect(() => {
    console.log(route, 'Anadi');
    if (route.params !== undefined) {
      console.log(route, 'Breached');
      const deepLinkUrl = route.params;
      console.log('Beta', deepLinkUrl, 'Params');
      setCurrent(deepLinkUrl);
      navigation.navigate('Home', {
        email: 'Value 1',
        token: 'Value 2',
      });
    }
  }, [navigation, route]);

  const [deepLink, setDeepLink] = useState('Intial Link');
  useEffect(() => {
    const handleDeepLink = async event => {
      // Extract the URL from the event
      const url = event.url;
      console.log('Matching', event.url, route);
      setDeepLink(event.url);
      if (event.url.length > 1) {
        setLoggedIn(true);
        setProgress(0.2);
      }
      // Handle the URL based on your app's logic
      if (url.startsWith('app://deepLink')) {
        console.log('Matched');
        // Navigate to a specific screen or perform an action
        // based on the deep link URL
      }
    };

    // Add the event listener
    Linking.addEventListener('url', handleDeepLink);

    // Handle initial deep link if the app was launched via a deep link
    Linking.getInitialURL().then(url => {
      console.log('Observer', url);
      if (url) {
        handleDeepLink({url});
      }
    });

    // Remove the event listener when the component unmounts
    return () => {
      Linking?.removeEventListener('url', handleDeepLink);
    };
  }, []);

  useEffect(() => {
    console.log(progress);
    if (progress !== 0) {
      setTimeout(() => {
        setProgress(progress => progress + 0.2);
      }, 1000);
    }
    if (progress > 1) {
      setProgress(0);
      setValidatingSession(true);
    }
  }, [progress]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{
        backgroundColor: '#DDF7E3',
      }}>
      {userIsLoggedIn && validSession && (
        <ImageBackground
          source={imageback}
          resizeMode="cover"
          style={{height: '100%', width: '100%'}}>
          <View
            style={{
              alignItems: 'center',
              position: 'relative',
              justifyContent: 'center',
              top: 100,
            }}>
            <CustomButton
              onPress={startBackgroundUpdate}
              title="Start in background"
              color="green"
            />
            <CustomButton
              onPress={stopBackgroundUpdate}
              title="Stop in background"
              color="red"
            />

            <View
              style={{
                backgroundColor: '#DDF7E3',
                padding: 25,
                borderRadius: 5,
                margin: 20,
                height: 165,
              }}>
              {currentLocation ? (
                <>
                  <Text style={styles.textStyle}>
                    {' '}
                    Current Latitude:{currentLocation.latitude}
                  </Text>
                  <Text style={styles.textStyle}>
                    {' '}
                    Current Longitude:{currentLocation.longitude}
                  </Text>
                  <Text style={styles.textStyle}>
                    {' '}
                    Current accuracy:{currentLocation.accuracy}
                  </Text>
                </>
              ) : null}
              <Text style={styles.textStyle}> Latitude:{lat}</Text>
              <Text style={styles.textStyle}> Longitude:{lon}</Text>
              <Text style={styles.textStyle}>Radius:{radius} meters</Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <Button
                title="-10"
                onPress={() => {
                  if (radius > 10) {
                    setRadius(prev => prev - 10);
                  }
                }}
                style={{margin: '10px'}}
              />
              <Text style={styles.resultStyle}>Radius: {radius} meters</Text>
              <Button
                title="+10"
                onPress={() => {
                  setRadius(prev => prev + 10);
                }}
              />
            </View>
          </View>
        </ImageBackground>
      )}

      {userIsLoggedIn && !validSession && (
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
          <View>
            <Text>Validating the session</Text>
            <ProgressBar progress={progress} color={MD3Colors.error50} />
          </View>
        </View>
      )}
      {!userIsLoggedIn && (
        <View style={styles?.notLoggedInScreen}>
          <Login />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginTop: 15,
  },
  separator: {
    marginVertical: 8,
  },
  textStyle: {
    fontSize: 16,
    borderWidth: 2,
    marginBottom: 10,
    padding: '2%',
    backgroundColor: '#DDF7E3',
    borderRadius: 5,
    borderColor: '#fff',
    alignItems: 'center',
  },
  resultStyle: {
    fontSize: 16,
    borderWidth: 2,
    padding: '2%',
    backgroundColor: '#C7E8CA',
    borderRadius: 5,
    borderColor: '#DDF7E3',
    alignItems: 'center',
    width: 200,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  textInput: {
    padding: '20px',
    color: 'blue',
    fontSize: 16,
  },
  notLoggedInScreen: {
    height: '100%',
    padding: '20px',
    width: '100%',
  },
  buttonStyle: {
    height: 5,
    backgroundColor: '#fff',
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
