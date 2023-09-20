import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Button, Alert, Text,ScrollView, TextInput, Pressable} from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import onDisplayNotification from './Notification';
import CustomButton from './components/CustomButton';



export default function App() {


  const BACKGROUND_LOCATION = 'BACKGROUND_LOCATION';
  const GEOFENCE_BOUNDARY = 'GEOFENCE_BOUNDARY';
  const [lat,setLat] = useState(12.9874075);
  const [lon,setLon] = useState(77.7366878);
  const [radius,setRadius] = useState(40);
  const [currentLocation,setCurrentLocation] = useState(null);
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
      Alert.alert("Entered region")
      onDisplayNotification({title:"Entered region",body:"Entered region"})
      message="Entered region"
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log("You've left region:", region);
      Alert.alert("Left region")
      onDisplayNotification({title:"Left region",body:"Left region"})
      message="Left region"
    }
  },
);

TaskManager.defineTask(BACKGROUND_LOCATION, async ({data, error}) => {
  if (error) {
    console.error(error.message, 'background location error');
    Alert.alert("background location error")
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
const req = ()=>{
}
const requestPermissions = async () => {
  const foreground = await Location.requestForegroundPermissionsAsync();
  // if (foreground.ios.status !== 'granted') {
  //   console.log(' denied');
  //   onDisplayNotification({title:"location tracking denied",body:"location tracking denied"})
  //   return;
  // }
  if(foreground.granted)
    await Location.requestBackgroundPermissionsAsync();
};
  useEffect(() => {
    requestPermissions();
  }, []);

  // // Start location tracking in background
  const startBackgroundUpdate = async () => {
    // Don't track position if permission is not granted
    const {granted} = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
     requestPermissions()
      console.log('location tracking denied');
      onDisplayNotification({title:"location tracking denied",body:"location tracking denied"})
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
      Alert.alert("Location tracking already started")
      onDisplayNotification({title:"Location tracking already started",body:"Location tracking already started"})
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
      Alert.alert("Location tacking stopped")
      onDisplayNotification({title:"Location tracking stopped",body:"Location tracking stopped"})
    
    }
    if (Location.hasStartedGeofencingAsync) {
      Location.stopGeofencingAsync(GEOFENCE_BOUNDARY);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Button
        onPress={startBackgroundUpdate}
        title="Start in background"
        color="green"
      />
      <Button
        onPress={stopBackgroundUpdate}
        title="Stop background"
        color="red"
      /> */}
      <CustomButton onPress={startBackgroundUpdate} title="Start in background" color="green"/>
      <CustomButton onPress={stopBackgroundUpdate} title="Stop background" color="red"/>
      <View>
        {currentLocation?
        <>
      <Text style={styles.textStyle}> Current Latitude:{currentLocation.latitude}</Text>
      <Text style={styles.textStyle}> Current Longitude:{currentLocation.longitude}</Text>
      <Text style={styles.textStyle}> Current accuracy:{currentLocation.accuracy}</Text>
        </>
    :null}
      <Text style={styles.textStyle}>Geofencing Latitude:{lat}</Text>
      <Text style={styles.textStyle}> Geofencing Longitude:{lon}</Text>
      <Text style={styles.textStyle}>Geofencing Radius:{radius} meters</Text>
      </View>
      <View style={{padding:"5%",flexDirection:"row"}}>
        <Button title='-10' onPress={()=>{
          if(radius>10) setRadius((prev)=>prev-10)
        }}/>
        <Text style={styles.textStyle}>Radius: {radius} meters</Text>
        <Button title='+10' onPress={()=>{setRadius((prev)=>prev+10)}}/>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: 'blue',
    fontSize: 16,
  },
  textInput:{
    borderWidth:1,
    borderColor:'black',
    color: 'blue',
    fontSize: 16,
  }
});