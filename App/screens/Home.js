import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getAuth, signOut} from 'firebase/auth';
import messaging from '@react-native-firebase/messaging';

const Home = () => {
  const navigation = useNavigation();

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const getToken = async () => {
    const token = await messaging().getToken();
    console.log('Token = ' + token);
  };

  useEffect(() => {
    requestUserPermission();
    getToken();

  }, []);

  const auth = getAuth();
  const logout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch(error => {
        // An error happened.
      });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, styles.shadowProp]}>Food Scanner</Text>
      <Image
        source={require('../../assets/images/hero_image.png')}
        style={styles.heroImage}
      />
      <View style={styles.footer}>
        <Text style={styles.subtitle}>
          Discover detailed nutritional information about your food with just a
          scan.
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, styles.shadowPropButton]}
          onPress={() => navigation.navigate('CameraScreen')}>
          <Text style={styles.saveButtonText}>SAVE FOOD ITEM</Text>
        </TouchableOpacity>
        {/* <Button title="Log Out" onPress={logout} color="#007BFF" /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E59500',
    justifyContent: 'space-between',
  },
  heroImage: {
    width: '100%',
    height: '47%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#EBEBEB',
  },
  shadowProp: {
    textShadowColor: 'rgba(0, 0, 0, 0.50)',
    textShadowRadius: 10,
    textShadowOffset: {width: -0.3, height: 4},
  },
  shadowPropButton: {
    elevation: 4,
    shadowColor: 'rgba(0, 0, 0, 0.50)',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',

    color: '#000',
    padding: 15,
  },
  saveButton: {
    backgroundColor: '#E59500',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    height: 40,
    justifyContent: 'center',
    width: '80%',
  },
  saveButtonText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    justifyContent: 'space-around',
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    top: 10,
    borderRadius: 20,
    height: 200,
    width: '90%',
  },
});

export default Home;
