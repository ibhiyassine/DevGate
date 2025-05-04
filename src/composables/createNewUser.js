import { db } from '@/firebase'
import { getDoc, doc, addDoc, Timestamp, setDoc, collection } from 'firebase/firestore'

export async function checkUsername(username) {
  const userRef = await getDoc(doc(db, 'users', username))
  return !(userRef.get('username') == username)
}

export async function addUsername(username, mail, FullName) {
  let user = {
    createdAt: Timestamp.fromDate(new Date()),
    email: mail,
    username: username,
    followings: [],
    followers: [],
    programCounter: 0,
    fullName: FullName,
  }
  try {
    await setDoc(doc(db, 'users', username), user)

    const objectifRef = collection(db, 'users', username, 'objectifs')
    await setDoc(doc(objectifRef, 'init'), {
      initialized: true,
    })
    const projetcRef = collection(db, 'users', username, 'projects')
    await setDoc(doc(projetcRef, 'init'), { initialized: true })
    const skillRef = collection(db, 'users', username, 'skills')
    await setDoc(doc(skillRef, 'init'), { initialized: true })
  } catch (e) {}
}
