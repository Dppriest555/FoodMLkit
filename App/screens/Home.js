import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";


const Home = () => {
  const navigation = useNavigation();

  const auth = getAuth();
  const logout = () => {
    signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Scanner</Text>
      <Text style={styles.subtitle}>
        Discover detailed nutritional information about your food with just a
        scan.
      </Text>
      <Button
        title="Start Scanning"
        onPress={() => navigation.navigate("CameraScreen")}
        color="#007BFF"
      />
      <Button
        title="Log Out"
        onPress={logout}
        color="#007BFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000"
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#000"
  },
});

export default Home;
