import { db, auth } from '@/firebase'
import { authStateListener } from './authStateListener'
import { getDoc, doc } from 'firebase/firestore'


export async function getFollowings() {
    let curUser = '';
    await authStateListener((user) => {
        if(user){
            curUser = user.displayName;
        }
        else{
            console.log("Error in finding user");
        }
    })
    const userRef = doc(db, 'users', curUser)
  try {
    const docRef = await getDoc(userRef)
    let friends = docRef.get('followings').map((user) => user.id)
    return friends
  } catch (e) {}
}
