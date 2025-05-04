import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'

const logout = async () => {
  if (auth.currentUser) {
    try {
      await signOut(auth)
    } catch (error) {}
  } else {
    alert('No user is logged in')
  }
}

export { logout }
