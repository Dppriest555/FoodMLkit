import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import { Camera } from 'react-native-vision-camera-v3-text-recognition';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export function ExpCameraScreen(props) {
  const [text, setText] = useState(null);
  const device = useCameraDevice('back');
  const { hasPermission: cameraHasPermission, requestPermission: requestCameraPermission } = useCameraPermission();

  useEffect(() => {
    const handleCameraPermission = async () => {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Camera permission is required to use the camera. Please grant permission in your device settings.',
          [{ text: 'OK', onPress: () => console.log('Permission dialog dismissed') }]
        );
      }
    };

    handleCameraPermission();

    const initCamera = async () => {
      if (Platform.OS === 'android') {
        console.log("KILL MEEEE");
      }
    };

    initCamera();
  }, []);

  if (device == null || !cameraHasPermission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const logText = () => console.log(text);

  return (
    <View style={styles.container}>
      <Camera
        // frameProcessor={null}
        device={device}
        style={StyleSheet.absoluteFill}
        isActive={true}
        options={{ language: "latin" }}
        callback={(data) => setText(data)}
        {...props}
      />
      {/* <Text style={styles.textOutput}>{text ? text : 'No text recognized yet'}</Text> */}
      <TouchableOpacity style={styles.button} onPress={logText}>
        <Text>PRESS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  textOutput: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center'
  },
  button: {
    padding: 10,
    margin: 10,
    backgroundColor: 'blue',
    color: 'white'
  }
});

export default ExpCameraScreen;
