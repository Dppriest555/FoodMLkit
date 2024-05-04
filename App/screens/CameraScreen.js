/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { formatWifiData, getCountryFromBarcode, openExternalLink } from '../../src/utils';

export function CameraScreen({ navigation }) {
  const [torchOn, setTorchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to track loading state
  const [enableOnCodeScanned, setEnableOnCodeScanned] = useState(true);
  const {
    hasPermission: cameraHasPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const device = useCameraDevice('back');

  useEffect(() => {
    handleCameraPermission();
  }, []);

  useEffect(() => {
    console.log('Camera device:', device);
  }, [device]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13','code-128','code-39','code-93', 'codabar', 'ean-8', 'upc-a', 'upc-e'],
    onCodeScanned: async codes => {
      setIsLoading(true);
      if (enableOnCodeScanned && codes.length > 0) {
        let value = codes[0]?.value;
        let type = codes[0]?.type;
        try {
          console.log(value, type, codes,)
          const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${value}?fields=product_name,code,allergens,ingredients_hierarchy,nutriments`, {
            method: "GET", // or 'POST'
            headers: {
              "User-Agent": "food_scanner/1.0 (ivan.velkov01@abv.bg)",
            },
          });
          const data = await response.json();
          console.log(data)
          setIsLoading(false);
          if (data.status == 1) {
            navigation.navigate("NutriScreen", {
              response_data: data,
            });
          } else {
            alert("No such product found in the database")
          }
        } catch (error) {
          console.error('Error:', error);
        }
        setEnableOnCodeScanned(false);
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#BA2C73" />
      </View>
    );
  }

  const handleCameraPermission = async () => {
    const granted = await requestCameraPermission();

    if (!granted) {
      Alert.alert(
        'Permission required',
        'Camera permission is required to use the camera. Please grant permission in your device settings.',
        [
          { text: 'OK', onPress: () => console.log('Permission dialog dismissed') }
        ]
      );
      // Optionally, you can use Linking API to open the App Settings
      // Linking.openSettings();
    }
  };


  const RoundButtonWithImage = () => {
    return (
      <TouchableOpacity
        onPress={() => setTorchOn(prev => !prev)}
        style={styles.buttonContainer}>
        <View style={styles.button}></View>
      </TouchableOpacity>
    );
  };

  if (device == null || !cameraHasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ margin: 10 }}>Camera Not Found or Permission Denied</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RoundButtonWithImage />
      <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        torch={torchOn ? 'on' : 'off'}
        onTouchEnd={() => setEnableOnCodeScanned(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
    right: 20,
    top: 20,
  },
  button: {
    backgroundColor: '#FFF', // Button background color
    borderRadius: 50, // Make it round
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImage: {
    width: 25,
    height: 25,
  },
});
