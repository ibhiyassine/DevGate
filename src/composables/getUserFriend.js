import { db, auth } from '@/firebase'
import { authStateListener } from './authStateListener'
import { getDoc, doc } from 'firebase/firestore'

let curUser = auth.currentUser && auth.currentUser.displayName ? auth.currentUser.displayName : 'yassine'
const userRef = doc(db, 'users', curUser)

export async function getFollowings() {
    await authStateListener((user) => {
        if(user){
            curUser = user.displayName;
        }
        else{
            console.log("Error in finding user");
        }
    })
  try {
    const docRef = await getDoc(userRef)
    let friends = docRef.get('followings').map((user) => user.id)
    return friends
  } catch (e) {}
}
