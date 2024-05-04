// Import necessary modules
import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useNavigation, useRoute } from "@react-navigation/native";
import {NativeModules} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { ScrollView } from 'react-native-gesture-handler';
import { User, FIREBASE_AUTH, DB } from "../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, updateDoc, Timestamp  } from "firebase/firestore";

const {TextDetectionModule} = NativeModules;

const ExpCameraScreen = () => {
  const [user, setUser] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [detectedText, setDetectedText] = useState('');
  const {
    hasPermission: cameraHasPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const device = useCameraDevice('back');

  const route = useRoute(); // Use the useRoute hook to access the route object
  const  {foodDocRef}  = route.params;

  const cameraRef = useRef(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      return () => unsubscribe();
    });
    handleCameraPermission();
    console.log(TextDetectionModule);

  }, []);

  const capturePhoto = async () => {
    if (cameraRef.current && cameraHasPermission) {
      try {
        const photo = await cameraRef.current.takePhoto();
        const rollPhoto = await CameraRoll.saveToCameraRoll(photo.path, {
          type: 'photo',
        });
        const fileURI = 'file:///storage/emulated/0/Pictures/'+`${rollPhoto.node.image.filename}`;
        console.log('FileName:', fileURI)
        setImageUri(rollPhoto.node.image.uri);
        recognizeText(rollPhoto.node.image.uri);
        console.log(detectedText, imageUri);
        setTimeout(() => {
           CameraRoll.deletePhotos([fileURI]);
         }, 3000);
      } catch (error) {
        console.error('Failed to take photo:', error);
      }
    }
  };

  const recognizeText = async (imagePath) => {
    if (!imagePath) return;
    try {
      const result = await TextDetectionModule.recognizeImage(imagePath);
      console.log('Result from Text Detection:', result);
      if (result.blocks && result.blocks.length > 0) {
        const text = result.blocks.map(block => block.text).join(' ');
        setDetectedText(text);
        try {
          const event = new Date("2024-05-06");
          console.log(event.toISOString());
          const userRef = await updateDoc(doc(DB, "User", `${user.email}`, "DigitalFridge", `${foodDocRef}`), {
            testText: 'hello',
            expDate: Timestamp.fromDate(event)
          });
          console.log('Product Saved to Database as:', foodDocRef,);
          alert('Product Saved!');
        } catch (error) {
          console.error("Error adding product!", error);
        }
      } else {
        setDetectedText('No text detected');
      }
    } catch (error) {
      console.error('Error recognizing text:', error);
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
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />
      <Button title="Capture" onPress={capturePhoto} />
      <ScrollView>
      {imageUri && (
        <Text style={styles.instructions}>Image captured: {imageUri}</Text>
      )}
      {detectedText && (
        <Text style={styles.instructions}>Detected Text: {detectedText}</Text>
      )}
      </ScrollView>
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
    color: 'black',
  },
});

export default ExpCameraScreen;
