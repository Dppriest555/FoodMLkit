import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { User, FIREBASE_AUTH, DB } from "../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { Notifications } from 'react-native-notifications';

const useCheckExpirations = () => {
    const [user, setUser] = useState(null);
    const [product, setProduct] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
            setUser(currentUser); // This will trigger a re-render
        });

        return () => unsubscribe(); // Properly handle the unsubscription on component unmount
    }, []);

    useEffect(() => {
        if (user) {
            checkExpirations();  // Now checkExpirations is called only when user is updated and truthy
        }
    }, [user]);  // Dependency array includes user, ensuring the effect runs when user changes

    const checkExpirations = async () => {
        Notifications.registerRemoteNotifications();
        
        if (user && user.email) {
            const today = new Date();
            const nextTwoDays = new Date(today);
            nextTwoDays.setDate(today.getDate() + 2); // Change to check for the next two days

            const expirationQuery = query(
                collection(DB, "User", user.email, "DigitalFridge"),
                where("expDate", ">=", Timestamp.fromDate(today)),
                where("expDate", "<=", Timestamp.fromDate(nextTwoDays))
            );
            console.log("Exp Querry:" + expirationQuery)

            try {
                const querySnapshot = await getDocs(expirationQuery);
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    setProduct(product)
                    if (product) {
                        Notifications.postLocalNotification({
                            title: "Expiration Alert",
                            body: `${product.productName} is expiring soon! Check it before ${product.expDate.toDate().toLocaleDateString()}`,
                            sound: "default",
                            category: "SOME_CATEGORY",
                            userInfo: { id: doc.id }
                        });
                    }
                });
                console.log(product)
            } catch (error) {
                console.error("Error fetching expiring products:", error);
            }
        } else {
            console.log("User is not logged in");
        }
    };
};

export default useCheckExpirations;