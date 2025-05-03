import { ref } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export function useObjectives(getUsername) {
  const showObjectiveForm = ref(false)
  const newObjective = ref({
    title: '',
    status: 0,
    createdAt: null,
    modifiedDate: null,
  })

  const addObjective = async () => {
    try {
      const username = getUsername()
      if (!username) {
        return
      }
      const objectivesRef = collection(db, 'users', username, 'objectifs')
      const objectiveData = {
        ...newObjective.value,
        status: Number(newObjective.value.status),
        createdAt: serverTimestamp(),
        modifiedDate: serverTimestamp(),
      }
      await addDoc(objectivesRef, objectiveData)
      newObjective.value = {
        title: '',
        status: 0,
        createdAt: null,
        modifiedDate: null,
      }
      showObjectiveForm.value = false
    } catch (err) {}
  }

  return {
    showObjectiveForm,
    newObjective,
    addObjective,
  }
}
