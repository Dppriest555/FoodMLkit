import 'react-native-gesture-handler';
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./FirebaseConfig";

import Login from "./App/screens/Login";
import Home from "./App/screens/Home";
import { CameraScreen } from './App/screens/CameraScreen';
import NutriScreen from "./App/screens/Nutriscreen";
import SavedFoods from "./App/screens/SavedFoods";
import ExpCameraScreen from './App/screens/ExpCameraScreen';
import useCheckExpirations from './App/hooks/ExpirationCheck';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigation for logged in user
function DrawerNavigation() {
  return (
    <Drawer.Navigator screenOptions={{headerTransparent: false}} >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="CameraScreen" component={CameraScreen} />
      <Drawer.Screen name="Saved Foods" component={SavedFoods} />
      <Drawer.Screen name="ExpCameraScreen" component={ExpCameraScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  useCheckExpirations();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Show drawer navigation when the user is logged in
          <Stack.Screen name="Drawer" component={DrawerNavigation} />
        ) : (
          // Show login screen when no user is logged in
          <Stack.Screen name="Login" component={Login} />
        )}
          <Stack.Screen name="NutriScreen" component={NutriScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
