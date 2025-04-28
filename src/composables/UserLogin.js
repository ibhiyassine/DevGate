import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function loginUser(username, password) {
    try {
        // First, get the user document to find their email
        const userDocRef = doc(db, "users", username);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return "User not found.";
        }

        const userData = userDoc.get("email");

        // Use the email from the user document to sign in
        const userCredential = await signInWithEmailAndPassword(
            auth,
            userData,
            password
        );

        return "";
    } catch (error) {
        console.error("Error in loginUser:", error);
        return "Error in loginUser";
    }
}
