// Import necessary modules
import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {NativeModules} from 'react-native';


const {TextDetectionModule} = NativeModules;

const ExpCameraScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [detectedText, setDetectedText] = useState('');
  const {
    hasPermission: cameraHasPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const device = useCameraDevice('back');

  const cameraRef = useRef(null);

  useEffect(() => {
    handleCameraPermission();
  }, []);

  useEffect(() => {
    console.log('Camera device:', device);
  }, [device]);

  const capturePhoto = async () => {
    if (cameraRef.current && cameraHasPermission) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'speed',
          enableAutoStabilization: true,
        });
        setImageUri(photo.path);
        recognizeText(imageUri);
        console.log(detectedText + "" + imageUri) 
      } catch (error) {
        console.error('Failed to take photo:', error);
      }
    }
  };

  const recognizeText = async imagePath => {
    try {
      const text = await TextDetectionModule.recognizeImage(imagePath);
      setDetectedText(text);
    } catch (error) {
      console.error(error);
      setDetectedText('Failed to recognize text.');
    }
  };

  const handleCameraPermission = async () => {
    const granted = await requestCameraPermission();

    if (!granted) {
      Alert.alert(
        'Permission required',
        'Camera permission is required to use the camera. Please grant permission in your device settings.',
        [
          {
            text: 'OK',
            onPress: () => console.log('Permission dialog dismissed'),
          },
        ],
      );
      // Optionally, you can use Linking API to open the App Settings
      // Linking.openSettings();
    }
  };

  if (device == null || !cameraHasPermission) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{margin: 10}}>Camera Not Found or Permission Denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
        />
        <Button title="Capture" onPress={capturePhoto} />
        {imageUri && (
          <Text style={styles.instructions}>Image captured: {imageUri}</Text>
        )}
        {detectedText && (
          <Text style={styles.instructions}>Detected Text: {detectedText}</Text>
        )}
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  instructions: {
    fontSize: 18,
    margin: 10,
    color: 'black'
  },
});

export default ExpCameraScreen;
