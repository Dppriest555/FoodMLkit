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
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (enableOnCodeScanned && codes.length > 0) {
        let value = codes[0]?.value;
        let type = codes[0]?.type;

        console.log(codes[0]);
        if (type === 'qr') {
          openExternalLink(value).catch(error => {
            showAlert('Detail', formatWifiData(value), false);
          });
        } else {
          const countryOfOrigin = getCountryFromBarcode(value);

          console.log(`Country of Origin for ${value}: ${countryOfOrigin}`);
          showAlert(value, countryOfOrigin);
        }
        setEnableOnCodeScanned(false);
      }
    },
  });

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

  const showAlert = (value = '', countryOfOrigin = '', showMoreBtn = true) => {
    Alert.alert(
      value,
      countryOfOrigin,
      showMoreBtn
        ? [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'More',
              onPress: () => {
                setTorchOn(false);
                setEnableOnCodeScanned(true);
                openExternalLink('https://www.barcodelookup.com/' + value);
              },
            },
          ]
        : [
            {
              text: 'Cancel',
              onPress: () => setEnableOnCodeScanned(true),
              style: 'cancel',
            },
          ],
      { cancelable: false },
    );
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
