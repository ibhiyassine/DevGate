<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { fetchUserSubcollection } from '../composables/fetchData.js';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const props = defineProps({
  username: {
    type: String,
    required: true
  },
  isDashboard: {
    type: Boolean,
    default: false
  }
});

const skills = ref([]);
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;
const editingSkill = ref(null);
const editedTitle = ref('');
const editedLevel = ref(1);

const validSkills = computed(() => {
  return skills.value
    .filter(skill => skill.title && skill.title.trim() !== '')
    .map(skill => ({
      ...skill,
      level: Number(skill.level) || 1
    }));
});

const startEditing = (skill) => {
  editingSkill.value = skill.id;
  editedTitle.value = skill.title;
  editedLevel.value = Number(skill.level) || 1;
};

const cancelEditing = () => {
  editingSkill.value = null;
  editedTitle.value = '';
  editedLevel.value = 1;
};

const updateSkill = async (skillId) => {
  try {
    const skillRef = doc(db, 'users', props.username, 'skills', skillId);
    await updateDoc(skillRef, {
      title: editedTitle.value,
      level: Number(editedLevel.value),
      modifiedDate: new Date()
    });
    editingSkill.value = null;
  } catch (err) {
    console.error('Error updating skill:', err);
    error.value = 'Failed to update skill';
  }
};

const deleteSkill = async (skillId) => {
  try {
    loading.value = true;
    skills.value = await fetchUserSubcollection(props.username, 'skills');
    skills.value=skills.value    
    .filter(skill => skill.id !== "init")
  } catch (err) {
    console.error('Error deleting skill:', err);
    error.value = 'Failed to delete skill';
  }
};

const setupSkillsListener = () => {
  if (unsubscribe) {
    unsubscribe();
  }

  const skillsRef = collection(db, 'users', props.username, 'skills');
  unsubscribe = onSnapshot(skillsRef, (snapshot) => {
    skills.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  }, (err) => {
    console.error('Error listening to skills:', err);
    error.value = err.message || 'Failed to load skills';
    loading.value = false;
  });
};

onMounted(() => {
  setupSkillsListener();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

watch(() => props.username, () => {
  loading.value = true;
  setupSkillsListener();
});
</script>

<template>
  <div class="skills-section">
    <h3>Skills</h3>
    
    <div v-if="loading">Loading skills...</div>
    
    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="setupSkillsListener">Try Again</button>
    </div>
    
    <div v-else-if="validSkills.length > 0">
      <div v-for="skill in validSkills" :key="skill.id" class="skill-card">
        <div class="skill-content">
          
          <div class="skill-header">
            <h4>{{ skill.title }}</h4>
            
            <span v-if="skill.category || skill.type" class="skill-badge">{{ skill.category || skill.type }}</span>
          </div>
          <div v-if="skill.lastUsed || skill.experienceYears" class="skill-meta">
            <span v-if="skill.lastUsed">Last used: {{ skill.lastUsed }}</span>
            <span v-if="skill.experienceYears">• {{ skill.experienceYears }} yrs exp</span>
          </div>
          <div class="skill-level">
            <div class="progress-bar">
              <div 
                class="progress" 
                :style="{ width: `${(skill.level || 1) * 33.33}%` }"
              ></div>
            </div>
            <span class="level-text">{{ 
              skill.level === 1 ? 'Beginner' : 
              skill.level === 2 ? 'Intermediate' : 
              skill.level === 3 ? 'Expert' : 'Beginner'
            }}</span>
          </div>
        </div>
      </div>
      <RouterLink :to="`/skillVisualization/${username}`" >Visualisation</RouterLink>

    </div>
    
    <p v-else>No skills listed</p>
  </div>
</template>

<style scoped>
.skills-section {
  margin-top: 20px;
}

button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.skill-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 15px;
  background: var(--primary-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.skill-content {
  flex: 1;
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.level-text {
  font-size: 0.9em;
  font-weight: bold;
  color: var(--text-color);
  min-width: 100px;
  text-align: right;
}

.skill-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.delete-btn:hover {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.edit-input {
  padding: 8px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background: var(--background-color);
  color: white;
  flex: 1;
}

.edit-select {
  padding: 8px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background: var(--background-color);
  color: white;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
}

.save-btn {
  background: var(--accent-color);
  color: white;
}

.cancel-btn {
  background: var(--secondary-color);
  color: var(--text-color);
}
</style> 