import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export async function authStateListener(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user !== undefined && user !== null) {
            callback(user);
        } else {
            callback(null);
        }
    });
}
