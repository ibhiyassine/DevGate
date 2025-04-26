import { ref } from "vue";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export function getusers() {
    const users = ref([]);

    const fetchUsers = async () => {
        const querySnapshot = await getDocs(collection(db, "users"));
        users.value = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    };
    

    return {
        users,
        fetchUsers,
    };
}
