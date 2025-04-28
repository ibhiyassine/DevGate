import { ref } from 'vue';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function useSkills(getUsername) {
  const showSkillForm = ref(false);
  const newSkill = ref({
    title: '',
    level: 1,
    createdAt: null,
    modifiedDate: null
  });

  const addSkill = async () => {
    try {
      const username = getUsername();
      if (!username) {
        console.error('Username is not available');
        return;
      }
      const skillsRef = collection(db, 'users', username, 'skills');
      await addDoc(skillsRef, {
        ...newSkill.value,
        createdAt: serverTimestamp(),
        modifiedDate: serverTimestamp()
      });
      newSkill.value = {
        title: '',
        level: 1,
        createdAt: null,
        modifiedDate: null
      };
      showSkillForm.value = false;
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  return {
    showSkillForm,
    newSkill,
    addSkill
  };
} 