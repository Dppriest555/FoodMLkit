import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH, DB } from "../../FirebaseConfig";

const SavedFoods = () => {
  const [user, setUser] = useState(null);
  const [foodData, setFoodData] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        fetchFoodData(currentUser.email);
      }
    });

    return () => unsubscribe(); // Properly handle the unsubscription on component unmount
  }, []);

  const fetchFoodData = async (email) => {
    try {
      const querySnapshot = await getDocs(
        collection(DB, "User", email, "FoodItems")
      );
      const allFoodData = [];
      querySnapshot.forEach((doc) => {
        allFoodData.push(doc.data());
      });
      setFoodData(allFoodData);
      console.log(allFoodData[0]);
    } catch (error) {
      console.error("Error fetching food data:", error);
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.title}>{item.productName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Food Items</Text>
      <Text style={styles.subtitle}>
        Discover detailed nutritional information about your food with just a
        scan.
      </Text>
      <FlatList
 
        data={foodData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
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
    color: 'black'
  },
  itemContainer: {
    color: 'black',
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default SavedFoods;
