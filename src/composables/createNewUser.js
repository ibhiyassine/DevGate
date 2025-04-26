import { db } from "@/firebase";
import { getDoc, doc, addDoc, Timestamp, setDoc,collection } from "firebase/firestore";


export async function checkUsername(username) {
    const userRef = await getDoc(doc(db, "users", username));
    return !(userRef.get("username") == username);    
}

export async function addUsername(username, mail) {
    let user = {
        createdAt: Timestamp.fromDate(new Date()),
        mail: mail,
        username: username,
        connection:[],
        followers:[],
        programCounter:0,

    };
    try{

       await setDoc(doc(db, "users", username), user);

        const objectifRef = collection(db, "users", username, "objectifs");
        await addDoc(objectifRef, {
            initialized: true,
        });
        const projetcRef = collection(db, "users", username, "projects");
        await addDoc(projetcRef, { initialized: true });
        const skillRef = collection(db, "users", username, "skills");
        await addDoc(skillRef, { initialized: true });
    }
    catch(e){
        console.error("YASSINE USER CAN'T BE CREATED", e);
    }
}