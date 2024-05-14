// Import necessary modules
import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeModules} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {ScrollView} from 'react-native-gesture-handler';
import {User, FIREBASE_AUTH, DB} from '../../FirebaseConfig';
import {onAuthStateChanged} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import ImageEditor from '@react-native-community/image-editor';
import {parse, format} from 'date-fns';

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
  const {foodDocRef} = route.params;

  const cameraRef = useRef(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, user => {
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
        // console.log('Photo Object:', photo);

        // Crop dimensions and offset
        const cropWidth = photo.width * 0.15;
        const cropHeight = photo.height * 0.1;
        const offsetX = (photo.width - cropWidth) / 2.8;
        const offsetY = (photo.height - cropHeight) / 1.8;

        const cropData = {
          offset: {x: offsetX, y: offsetY},
          size: {width: cropWidth, height: cropHeight},
        };

        // Ensure the path is correctly formatted as a URI
        const fileURI = `file://${photo.path}`;
        // console.log('Formatted File URI:', fileURI);

        const croppedImageUri = await ImageEditor.cropImage(fileURI, cropData);
        // console.log('Cropped Image URI:', croppedImageUri);

        // Now, save the cropped image to the camera roll
        const rollPhoto = await CameraRoll.saveToCameraRoll(
          croppedImageUri.path,
          {type: 'photo'},
        );
        // console.log(rollPhoto);
        setImageUri(rollPhoto.node.image.uri); // Assuming croppedImageUri is a valid URI
        recognizeText(rollPhoto.node.image.uri);
      } catch (error) {
        console.error('Failed to take or process photo:', error);
      }
    }
  };

  const recognizeText = async (imagePath) => {
    if (!imagePath) return;
    try {
      const result = await TextDetectionModule.recognizeImage(imagePath);
      console.log('Result from Text Detection:', result);
      if (result.blocks && result.blocks.length > 0) {
        const combinedText = result.blocks.map(block => block.text).join(' ');
        const latestFormattedDate = processText(combinedText);
  
        console.log('Latest Date:', latestFormattedDate);
        setDetectedText(latestFormattedDate || 'No valid date detected');
  
        try {
          const eventDate = latestFormattedDate ? parse(latestFormattedDate, "yyyy/MM/dd", new Date()) : new Date();
          const userRef = await updateDoc(doc(DB, "User", `${user.email}`, "DigitalFridge", `${foodDocRef}`), {
            expDate: Timestamp.fromDate(eventDate)
          });
          console.log('Product Saved to Database with Expiration Date:', latestFormattedDate);
          alert('Product Saved with Expiration Date!');
        } catch (error) {
          console.error("Error updating product!", error);
        }
      } else {
        setDetectedText('No text detected');
      }
    } catch (error) {
      console.error('Error recognizing text:', error);
      setDetectedText('Failed to recognize text.');
    }
  };


// Helper functions to extract, parse, and format dates
function extractDates(text) {
  const datePatterns = [
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g, // MM/DD/YYYY or DD/MM/YYYY
    /\b(\d{1,2})[\/\-\.](\d{4})\b/g,                // MM/YYYY
    /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/g, // YYYY/MM/DD
    /\b(\d{8})\b/g                                // MMDDYYYY
  ];

  let matches, dates = [];
  datePatterns.forEach(pattern => {
    while (matches = pattern.exec(text)) {
      dates.push(matches[0]);
    }
  });
  console.log(dates)
  return dates;
}

function parseDates(dates) {
  const dateFormatMap = [
    { regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: "MM/dd/yyyy" },
    { regex: /^\d{1,2}\/\d{4}$/, format: "MM/yyyy" },
    { regex: /^\d{4}\/\d{1,2}\/\d{1,2}$/, format: "yyyy/MM/dd" },
    { regex: /^\d{8}$/, format: "MMddyyyy" }
  ];

  return dates.map(dateStr => {
    const dateFormat = dateFormatMap.find(fmt => fmt.regex.test(dateStr));
    if (dateFormat) {
      try {
        return parse(dateStr, dateFormat.format, new Date());
      } catch (e) {
        console.error("Failed to parse date:", dateStr, e);
      }
    }
    return null;
  }).filter(date => date); // Filter out nulls
}

function processText(text) {
  const dates = extractDates(text);
  const parsedDates = parseDates(dates);
  const formattedDates = parsedDates.map(date => format(date, "yyyy/MM/dd"));
  
  // Return the latest date
  return formattedDates.sort((a, b) => new Date(b) - new Date(a))[0];
}

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
      <View style={styles.overlay} />
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
    position: 'relative', // Ensure this is set for absolute positioning to work effectively
  },
  camera: {
    width: '100%',
    height: '80%',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    width: '20%', // Adjust based on your needs
    height: '5%', // Adjust based on your needs
    top: '30%', // Adjust based on your needs
    left: '40%', // Adjust based on your needs
    zIndex: 2, // Higher zIndex for overlay
  },
  instructions: {
    fontSize: 18,
    margin: 10,
    color: 'black',
  },
});

export default ExpCameraScreen;
