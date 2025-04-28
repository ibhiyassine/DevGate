<script setup>
import { ref, onMounted } from 'vue'
import { fetchUserSubcollection } from '../composables/fetchData.js'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const skills = ref([])
const loading = ref(true)
const error = ref(null)

const fetchSkills = async () => {
  try {
    loading.value = true
    skills.value = await fetchUserSubcollection(props.username, 'skills')
    skills.value = skills.value.filter((skill) => skill.id !== 'init')
  } catch (err) {
    console.error('Error fetching skills:', err)
    error.value = err.message || 'Failed to load skills'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSkills)
</script>

<template>
  <div class="skills-section">
    <h3 class="ms-4">Skills</h3>

    <div v-if="loading">Loading skills...</div>

    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchSkills">Try Again</button>
    </div>

    <div v-else-if="skills.length > 0">
      <div v-for="skill in skills" :key="skill.id" class="skill-card">
        <span class="material-icons style"> delete </span>
        <div
          class="skill-icon"
          @mouseover="skill.isEditing = true"
          @mouseleave="skill.isEditing = false"
        >
          <span class="material-icons">{{ skill.isEditing ? 'edit' : skill.icon || 'code' }}</span>
        </div>
        <div class="skill-content">
          <div class="skill-header">
            <h4>{{ skill.title }}</h4>

            <span v-if="skill.category || skill.type" class="skill-badge">{{
              skill.category || skill.type
            }}</span>
          </div>
          <div v-if="skill.lastUsed || skill.experienceYears" class="skill-meta">
            <span v-if="skill.lastUsed">Last used: {{ skill.lastUsed }}</span>
            <span v-if="skill.experienceYears">• {{ skill.experienceYears }} yrs exp</span>
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
        </div>
      </div>
    </div>

    <p v-else>No skills listed</p>
  </div>
</template>

<style scoped>
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
.style{
    color: rgb(230, 108, 108);
    
}
.style:hover{
    color:red;
    cursor: pointer;
}
</style> 