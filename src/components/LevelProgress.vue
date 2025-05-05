<script setup>
import { ref, computed, onMounted } from 'vue'
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
const animationActive = ref(false)

const level = computed(() => Math.floor(props.hours / 50))
const progress = computed(() => {
  const remainingHours = props.hours % 50
  return (remainingHours / 50) * 100
})

onMounted(() => {
  setTimeout(() => {
    animationActive.value = true
  }, 300)
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
    if (hoursToAdd.value <= 0) return
    
    const newTotalHours = props.hours + parseInt(hoursToAdd.value)
    const userRef = doc(db, 'users', props.username)
    await updateDoc(userRef, {
      programCounter: newTotalHours,
      modifiedDate: new Date()
    })
    isEditingHours.value = false
  } catch (err) {
    console.error('Error updating hours:', err)
  }
}
</script>

<template>
  <div class="level-progress" :class="{ 'editing-mode': isEditingHours }">
    <template v-if="isEditingHours">
      <div class="edit-hours">
        <h3 class="edit-hours-title">Update Programming Hours</h3>
        <div class="current-hours">
          Current: <span class="hours-value">{{ hours }}h</span>
        </div>
        <div class="add-hours">
          <label for="hoursInput" class="hours-label">Hours to add</label>
          <input 
            id="hoursInput"
            type="number" 
            v-model="hoursToAdd" 
            class="hours-input" 
            min="0" 
            placeholder="Enter hours" 
            autocomplete="off"
          />
        </div>
        <div class="hours-actions">
          <button 
            @click="updateHours" 
            class="save-btn"
            :disabled="hoursToAdd <= 0"
          >
            <span class="btn-icon">+</span> Add Hours
          </button>
          <button @click="cancelEditingHours" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="progress-circle">
        <svg class="progress-ring" width="220" height="220">
          <circle class="progress-ring-circle-bg" stroke-width="10" fill="transparent" r="95" cx="110" cy="110" />
          <circle 
            class="progress-ring-circle" 
            stroke-width="10" 
            fill="transparent" 
            r="95" 
            cx="110" 
            cy="110" 
            :style="{
              strokeDasharray: `${2 * Math.PI * 95} ${2 * Math.PI * 95}`,
              strokeDashoffset: animationActive ? `${2 * Math.PI * 95 * (1 - progress / 100)}` : `${2 * Math.PI * 95}`
            }" 
          />
        </svg>
        <div class="progress-content">
          <span class="level">Level {{ level }}</span>
          <span class="hours">{{ hours }}h</span>
          <span class="next-level">Next level in {{ 50 - (hours % 50) }}h</span>
        </div>
      </div>
      <button v-if="isDashboard" @click="startEditingHours" class="edit-hours-btn" aria-label="Add hours">
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
  padding: 25px;
  background: var(--primary-color);
  border-radius: var(--border-radius);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.level-progress.editing-mode {
  background: linear-gradient(to bottom right, var(--primary-color), #fcfcfc);
}

.progress-circle {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 5px 0;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle-bg {
  stroke: var(--secondary-color);
  opacity: 0.15;
}

.progress-ring-circle {
  stroke: var(--accent-color);
  transition: stroke-dashoffset 1.2s ease-in-out;
  filter: drop-shadow(0 0 3px rgba(0, 100, 255, 0.2));
}

.progress-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 80%;
}

.level {
  font-size: 2em;
  font-weight: bold;
  color: var(--text-color);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.5px;
}

.hours {
  font-size: 1.4em;
  color: var(--text-color);
  font-weight: 500;
}

.next-level {
  font-size: 0.95em;
  color: var(--text-color);
  opacity: 0.85;
  margin-top: 5px;
}

.edit-hours {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 250px;
  padding: 10px;
}

.edit-hours-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.3em;
  font-weight: 600;
  text-align: center;
}

.current-hours {
  color: var(--text-color);
  font-size: 1.1em;
  font-weight: 500;
}

.hours-value {
  font-weight: 700;
  color: var(--accent-color);
}

.add-hours {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.hours-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius);
  text-align: center;
  font-size: 1.2em;
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.hours-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  outline: none;
}

.hours-label {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 0.95em;
  align-self: flex-start;
  margin-left: 2px;
}

.hours-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 10px;
}

.save-btn,
.cancel-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

.save-btn {
  background: linear-gradient(135deg, var(--accent-color), #3a81d8);
  color: white;
  box-shadow: none;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a81d8, var(--accent-color));
  transform: scale(1.02);
}

.save-btn:disabled {
  background: #b9c5d6;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: var(--text-color);
  border: 1px solid var(--secondary-color);
  box-shadow: none;
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.02);
}

.edit-hours-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.icon-btn {
  font-size: 2em;
  transition: transform 0.3s ease;
}

.edit-hours-btn:hover .icon-btn {
  transform: rotate(90deg);
  color: #3a81d8;
}

@media (max-width: 768px) {
  .progress-circle {
    width: 180px;
    height: 180px;
  }
  
  .progress-ring {
    width: 180px;
    height: 180px;
  }
  
  .progress-ring-circle, .progress-ring-circle-bg {
    r: 75;
    cx: 90;
    cy: 90;
  }
  
  .level {
    font-size: 1.6em;
  }
  
  .hours {
    font-size: 1.2em;
  }
}
</style>