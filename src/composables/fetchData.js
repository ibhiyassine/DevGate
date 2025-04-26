import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const fetchUserSubcollection = async (username, subcollectionName) => {
    const subRef = collection(db, "users", username, subcollectionName);
    const snapshot = await getDocs(subRef);
  
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
  
    return items;
  };

export const fetchUser = async (username) => {
  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  } else {
    console.log("No such user!");
    return null;
  }
};