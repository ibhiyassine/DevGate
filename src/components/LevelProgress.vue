<script setup>
import { ref, computed } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const props = defineProps({
  hours: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  isDashboard: {
    type: Boolean,
    default: false
  }
})

const isEditingHours = ref(false)
const hoursToAdd = ref(0)

const level = computed(() => Math.floor(props.hours / 50))
const progress = computed(() => {
  const remainingHours = props.hours % 50
  return (remainingHours / 50) * 100
})

const startEditingHours = () => {
  hoursToAdd.value = 0
  isEditingHours.value = true
}

const cancelEditingHours = () => {
  isEditingHours.value = false
  hoursToAdd.value = 0
}

const updateHours = async () => {
  try {
    const newTotalHours = props.hours + parseInt(hoursToAdd.value)
    const userRef = doc(db, 'users', props.username)
    await updateDoc(userRef, {
      programCounter: newTotalHours,
      modifiedDate: new Date()
    })
    isEditingHours.value = false
  } catch (err) {

  }
}
</script>

<template>
  <div class="level-progress">
    <template v-if="isEditingHours">
      <div class="edit-hours">
        <div class="current-hours">
          Current hours: {{ hours }}h
        </div>
        <div class="add-hours">
          <input type="number" v-model="hoursToAdd" class="hours-input" min="0" placeholder="Hours to add" />
          <span class="hours-label">hours to add</span>
        </div>
        <div class="hours-actions">
          <button @click="updateHours" class="save-btn">Add Hours</button>
          <button @click="cancelEditingHours" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="progress-circle">
        <svg class="progress-ring" width="200" height="200">
          <circle class="progress-ring-circle-bg" stroke-width="8" fill="transparent" r="90" cx="100" cy="100" />
          <circle class="progress-ring-circle" stroke-width="8" fill="transparent" r="90" cx="100" cy="100" :style="{
            strokeDasharray: `${2 * Math.PI * 90 * progress / 100} ${2 * Math.PI * 90}`,
            strokeDashoffset: '0'
          }" />
        </svg>
        <div class="progress-content">
          <span class="level">Level {{ level }}</span>
          <span class="hours">{{ hours }}h</span>
          <span class="next-level">Next level in {{ 50 - (hours % 50) }}h</span>
        </div>
      </div>
      <button v-if="isDashboard" @click="startEditingHours" class="edit-hours-btn">
        <span class="material-icons fs-2 icon-btn">add_circle</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.level-progress {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--primary-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.progress-circle {
  position: relative;
  width: 200px;
  height: 200px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle-bg {
  stroke: var(--secondary-color);
  opacity: 0.2;
}

.progress-ring-circle {
  stroke: var(--accent-color);
  transition: stroke-dasharray 0.3s ease;
}

.progress-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level {
  font-size: 1.8em;
  font-weight: bold;
  color: var(--text-color);
}

.hours {
  font-size: 1.2em;
  color: var(--text-color);
}

.next-level {
  font-size: 0.9em;
  color: var(--text-color);
  opacity: 0.7;
}

.edit-hours {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 200px;
}

.current-hours {
  color: black;
  font-size: 1.1em;
  margin-bottom: 10px;
}

.add-hours {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
}

.hours-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
 

  text-align: center;
  font-size: 1.2em;
}

.hours-label {
  color: black;
  opacity: 0.7;
  font-size: 0.9em;
}

.hours-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.save-btn,
.cancel-btn {
  flex: 1;
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
  box-shadow: none;
}

.cancel-btn {
  background: var(--secondary-color);
  color: var(--text-color);
}

.edit-hours-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  color: gray;
}
</style>