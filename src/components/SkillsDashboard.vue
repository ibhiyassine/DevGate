<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { db } from '@/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useSkills } from '@/composables/useSkills'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const { showSkillForm, newSkill, addSkill } = useSkills(() => props.username)
const skills = ref([])
const loading = ref(true)
const error = ref(null)
let unsubscribe = null
const editingSkill = ref(null)
const editedTitle = ref('')
const editedLevel = ref(1)

function add_skill() {
  if (newSkill.value.title.trim()) {
    skills.value.push({
      title: newSkill.value.title,
      level: Number.parseInt(newSkill.value.level),
    })
  }
  addSkill()
}

const startEditing = (skill) => {
  editingSkill.value = skill.id
  editedTitle.value = skill.title
  editedLevel.value = Number(skill.level) || 1
}

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
    const skillRef = doc(db, 'users', props.username, 'skills', skillId);
    await deleteDoc(skillRef);
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
    skills.value = skills.value.filter((skill) => skill.id !== 'init')
    loading.value = false;
  }, (err) => {
    console.error('Error listening to skills:', err);
    error.value = err.message || 'Failed to load skills';
    loading.value = false;
  });
};


watch(() => props.username, () => {
  loading.value = true;
  setupSkillsListener();
});


onMounted(() => {setupSkillsListener();})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <div class="skills-section">
    <div class="d-flex justify-content-between">
      <h3 class="ms-4">Skills</h3>
      <span class="material-icons fs-2 add-btn" @click="showSkillForm = !showSkillForm">
        {{ showSkillForm ? 'cancel' : 'add_circle' }}
      </span>
    </div>
    <div v-if="showSkillForm" class="add-form">
      <input v-model="newSkill.title" placeholder="Skill Title" />
      <select v-model="newSkill.level">
        <option value="1">Beginner</option>
        <option value="2">Intermediate</option>
        <option value="3">Expert</option>
      </select>
      <button
        id="addSkill"
        class="d-flex align-items-center justify-content-center"
        @click="add_skill"
      >
        <span class="material-icons"> save </span>Save Skill
      </button>
    </div>

    <div v-if="loading">Loading skills...</div>

    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="setupSkillsListener">Try Again</button>
    </div>

    <div v-else-if="skills.length > 0">
      <div v-for="skill in skills" :key="skill.id" class="skill-card">
        <span class="material-icons style" @click="deleteSkill(skill.id)"> delete </span>
        <div
          class="skill-icon"
          @mouseover="skill.isEditing = true"
          @mouseleave="skill.isEditing = false"
          @click="startEditing(skill)"
        >
          <span class="material-icons">{{ skill.isEditing ? 'edit' : skill.icon || 'code' }}</span>
        </div>
        <div class="skill-content">

            <template v-if="editingSkill === skill.id">
              <div class="skill-header">
                <input v-model="editedTitle" class="edit-input" />
                <select v-model.number="editedLevel" class="edit-select">
                  <option :value="1">Beginner</option>
                  <option :value="2">Intermediate</option>
                  <option :value="3">Expert</option>
                </select>
                <div class="edit-actions">
                  <button @click="updateSkill(skill.id)" class="save-btn">Save</button>
                  <button @click="cancelEditing" class="cancel-btn">Cancel</button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="skill-header">
                <h4>{{ skill.title }}</h4>

                <span v-if="skill.category || skill.type" class="skill-badge">{{
                  skill.category || skill.type
                }}</span>
                <div v-if="skill.lastUsed || skill.experienceYears" class="skill-meta">
                  <span v-if="skill.lastUsed">Last used: {{ skill.lastUsed }}</span>
                  <span v-if="skill.experienceYears">• {{ skill.experienceYears }} yrs exp</span>
                </div>
              </div>
              <div class="skill-level">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: `${(skill.level || 1) * 33.33}%` }"></div>
                </div>
                <span class="level-text">{{
                  skill.level === 1
                    ? 'Beginner'
                    : skill.level === 2
                    ? 'Intermediate'
                    : skill.level === 3
                    ? 'Expert'
                    : 'Beginner'
                }}</span>
              </div>
            </template>
        </div>
      </div>
    </div>

    <p v-else>No skills listed</p>
  </div>
</template>

<style scoped>
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
  box-shadow: none;
}

.save-btn {
  background: var(--accent-color);
  color: white;
}

.cancel-btn {
  background: var(--secondary-color);
  color: var(--text-color);
}

.skills-section {
  margin-top: 20px;
}

ul {
  padding-left: 20px;
}

button {
  padding: 5px 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.skill-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.skill-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
}
.skill-icon:hover {
  background-color: rgb(160, 231, 160);
  cursor: pointer;
}

.skill-content {
  flex: 1;
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skill-badge {
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.85em;
}

.skill-meta {
  color: #888;
  font-size: 0.92em;
  margin-bottom: 6px;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background-color: #4caf50;
}

.level-text {
  font-size: 0.9em;
  font-weight: bold;
}
.style {
  color: rgb(230, 108, 108);
}
.style:hover {
  color: red;
  cursor: pointer;
}
.add-btn:hover {
  cursor: pointer;
  color: gray;
}
.add-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: #ececec;
  border-radius: var(--border-radius);
}

#addSkill {
  box-shadow: none !important;
  background-color: var(--secondary-color);
}
</style> 