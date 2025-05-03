import { db, auth } from '@/firebase'
import { getDoc, doc } from 'firebase/firestore'

const curUser = auth.currentUser ? auth.currentUser.displayName : 'yassine'
const userRef = doc(db, 'users', curUser)

export async function getFollowings() {
  try {
    const docRef = await getDoc(userRef)
    let friends = docRef.get('followers').map((user) => user.id)
    return friends
  } catch (e) {}
}
