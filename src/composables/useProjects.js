import { ref } from 'vue';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function useProjects(getUsername) {
  const showProjectForm = ref(false);
  const newProject = ref({
    title: '',
    description: '',
    stack: [],
    githubLink: '',
    createdAt: null,
    modifiedDate: null
  });

  const addProject = async () => {
    if (!newProject.value.title || !newProject.value.description || !newProject.value.stack || !newProject.value.githubLink) {
      return;
    }
    try {
      const username = getUsername();
      if (!username) {
        console.error('Username is not available');
        return;
      }
      
      // Normalize and filter stack for unique values
      const uniqueStack = Array.from(new Set(newProject.value.stack.split(',').map(tech => tech.trim().toLowerCase())));
      
      const projectsRef = collection(db, 'users', username, 'projects');
      await addDoc(projectsRef, {
        ...newProject.value,
        stack: uniqueStack,
        createdAt: serverTimestamp(),
        modifiedDate: serverTimestamp()
      });
      
      newProject.value = {
        title: '',
        description: '',
        stack: [],
        githubLink: '',
        createdAt: null,
        modifiedDate: null
      };
      
      showProjectForm.value = false;
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };
  

  return {
    showProjectForm,
    newProject,
    addProject
  };
} 