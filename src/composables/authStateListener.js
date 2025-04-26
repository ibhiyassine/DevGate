import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export async function authStateListener(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user !== undefined && user !== null) {
            console.log("user connected");
            callback(user);
        } else {
            console.log("user not connected");
            callback(null);
        }
    });
}
