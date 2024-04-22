import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { User, FIREBASE_AUTH, DB } from "../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";


export default function NutriScreen() {
  const [activeTab, setActiveTab] = useState("ingredients");
  const [user, setUser] = useState(User);

  const navigation = useNavigation();
  const route = useRoute(); // Use the useRoute hook to access the route object
  const { response_data } = route.params;

  const productName = response_data.product.product_name;
  const allergens = response_data.product.allergens.replace("en:", ""); // Removing the 'en:' prefix for display
  const nutri = response_data.product.nutriments["energy-kcal"];

  const HandleSaveFoodItem = async () => {
    try{
    const userCollection = collection(DB, "Users");
    const userRef = await setDoc(doc(DB , "User", `${user.email}`, "FoodItems", `${productName}` ),{
      productName: productName,
      nutrients: response_data.product.nutriments,
      allergens: allergens,
    });
    //const foodRef = await setDoc(doc(DB, "Users", `${user.email}`, "Saved Foods",`${productName}`))
    console.log('Product Saved to Database as: ' + productName)
    alert('Product Saved!')
  }catch(error){
    console.error("Error adding product!", error)
  }
  }

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      return () => unsubscribe();
    });
  }, []);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView style={[styles.headerContainer, styles.shadowProp]}>
          <Text style={styles.headerText}>{productName}</Text>
          <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "ingredients" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("ingredients")}
          >
            <Text style={styles.tabText}>Ingredients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "detailedView" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("detailedView")}
          >
            <Text style={styles.tabText}>Detailed View</Text>
          </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
      {activeTab === "ingredients" && (
        <View style={styles.body}>
          <View style={[styles.bodyContainer, styles.shadowProp]}>
            <View style={styles.allergensSection}>
              <Text style={styles.allergensLabel}>Allergens</Text>
              <View style={styles.allergensList}>
                <View style={styles.allergenItem}>
                  <Image
                    source={require("../../assets/images/gluten.png")}
                    style={styles.icon}
                  />
                  <Text>Gluten</Text>
                </View>
                <View style={styles.allergenItem}>
                  <Image
                    source={require("../../assets/images/eggs.png")}
                    style={styles.icon}
                  />
                  <Text>Eggs</Text>
                </View>
                <View style={styles.allergenItem}>
                  <Image
                    source={require("../../assets/images/milk.png")}
                    style={styles.icon}
                  />
                  <Text>Milk</Text>
                </View>
              </View>
            </View>

            <View style={styles.ingredientsSection}>
              <Text style={styles.ingredientsLabel}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                <View style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>Carbs</Text>
                  <View style={styles.ingredientNumberC}>
                    <Text style={styles.ingredientText}>
                      {response_data.product.nutriments.carbohydrates} g
                    </Text>
                  </View>
                </View>
                {/* Repeat the ingredient item for each ingredient */}
                <View style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>Kcal</Text>
                  <View style={styles.ingredientNumberC}>
                    <Text style={styles.ingredientText}>{nutri}</Text>
                  </View>
                </View>
                <View style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>Fat</Text>
                  <View style={styles.ingredientNumberC}>
                    <Text style={styles.ingredientText}>
                      {response_data.product.nutriments.fat} g
                    </Text>
                  </View>
                </View>
                <View style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>Sugars</Text>
                  <View style={styles.ingredientNumberC}>
                    <Text style={styles.ingredientText}>
                      {response_data.product.nutriments.sugars} g
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      {activeTab === "detailedView" && (
        <View style={styles.contentContainer}>
          {/* Content for Detailed View tab */}
          <Text>Detailed View content goes here...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveButton, styles.shadowProp]}
        onPress={HandleSaveFoodItem}
      >
        <Text style={styles.saveButtonText}>SAVE FOOD ITEM</Text>
      </TouchableOpacity>
    </View>
    /*
    <View style={styles.container}>
      <Text style={styles.title}>Allergens & Nutritional Values</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.title}>{productName}</Text>
      <Text style={styles.title}>{allergens}</Text>
      <Text style={styles.title}>Carbs: {response_data.product.nutriments.carbohydrates}</Text>
      <Text style={styles.title}>Kcal: {nutri}</Text>
      <Text style={styles.title}>Fat: {response_data.product.nutriments.fat}</Text>
      <Text style={styles.title}>Sugars: {response_data.product.nutriments.sugars}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <TouchableOpacity onPress={testing}><Text>BUTTON</Text></TouchableOpacity>
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
    */
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#E59500",
    width: "100%",
    height: 130,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    padding: 20,
  },
  headerContainer: {
    marginTop: 40,
    alignSelf: "center",
    justifyContent: "center",
    width: "90%",
    height: 140,
    borderRadius: 15,
    backgroundColor: "#F7F7F7",
  },
  shadowProp: {
    elevation: 10,
    shadowColor: "#2A2B2E",
  },
  headerText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
  tabContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginTop: 15
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  body: {
    padding: 20,
    width: "100%",
  },
  bodyContainer: {
    borderRadius: 15,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#F7F7F7",
    marginTop: 30,
    padding: 6,
  },
  allergensSection: {
    marginBottom: 20,
  },
  allergensLabel: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#3D3E43",
  },
  allergensList: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginTop: 20,
  },
  allergenItem: {
    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
  },
  ingredientsSection: {
    marginBottom: 5,
  },
  ingredientsLabel: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#3D3E43",
  },
  ingredientsList: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  ingredientItem: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 50,
    height: 110,
    margin: 8,
    borderColor: "black",
    borderWidth: 1,
  },
  ingredientText: {
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#E59500",
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    marginBottom: 30,
    height: 40,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#F5F5F5",
    fontWeight: "bold",
    fontSize: 18,
  },
  ingredientNumberC: {
    backgroundColor: "#81C5F6",
    width: 45,
    height: 55,
    borderRadius: 30,
    borderColor: "black",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
});
