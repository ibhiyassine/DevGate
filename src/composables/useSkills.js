import { ref } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export function useSkills(getUsername) {
  const showSkillForm = ref(false)
  const newSkill = ref({
    title: '',
    level: 1,
    createdAt: null,
    modifiedDate: null,
  })

  const addSkill = async () => {
    if (!newSkill.value.title.trim()) {
      return
    }
    try {
      const username = getUsername()
      if (!username) {
        return
      }
      const skillsRef = collection(db, 'users', username, 'skills')
      await addDoc(skillsRef, {
        title: newSkill.value.title,
        level: Number.parseInt(newSkill.value.level),
        createdAt: serverTimestamp(),
        modifiedDate: serverTimestamp(),
      })
      newSkill.value = {
        title: '',
        level: 1,
        createdAt: null,
        modifiedDate: null,
      }
      showSkillForm.value = false
    } catch (err) {}
  }

  return {
    showSkillForm,
    newSkill,
    addSkill,
  }
}
