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

const objectives = ref([]);
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;
const editingObjective = ref(null);
const editedTitle = ref('');
const editedStatus = ref('0');

const validObjectives = computed(() => {
  return objectives.value.filter(objective => objective.title && objective.title.trim() !== '');
});

const startEditing = (objective) => {
  editingObjective.value = objective.id;
  editedTitle.value = objective.title;
  editedStatus.value = objective.status.toString();
};

const cancelEditing = () => {
  editingObjective.value = null;
  editedTitle.value = '';
  editedStatus.value = '0';
};

const updateObjective = async (objectiveId) => {
  try {
    const objectiveRef = doc(db, 'users', props.username, 'objectifs', objectiveId);
    await updateDoc(objectiveRef, {
      title: editedTitle.value,
      status: Number(editedStatus.value),
      modifiedDate: new Date()
    });
    editingObjective.value = null;
  } catch (err) {
    console.error('Error updating objective:', err);
    error.value = 'Failed to update objective';
  }
};

const deleteObjective = async (objectiveId) => {
  try {
    loading.value = true;
    objectives.value = await fetchUserSubcollection(props.username, 'objectifs');
    objectives.value=objectives.value    
    .filter(objective => objective.id !== "init")
  } catch (err) {
    console.error('Error deleting objective:', err);
    error.value = 'Failed to delete objective';
  }
};

const setupObjectivesListener = () => {
  if (unsubscribe) {
    unsubscribe();
  }

  const objectivesRef = collection(db, 'users', props.username, 'objectifs');
  unsubscribe = onSnapshot(objectivesRef, (snapshot) => {
    objectives.value = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Objective data:', data);
      return {
        id: doc.id,
        ...data
      };
    });
    loading.value = false;
  }, (err) => {
    console.error('Error listening to objectives:', err);
    error.value = err.message || 'Failed to load objectives';
    loading.value = false;
  });
};

onMounted(() => {
  setupObjectivesListener();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

watch(() => props.username, () => {
  loading.value = true;
  setupObjectivesListener();
});
</script>

<template>
  <div class="objectives-section">
    <h3>Objectives</h3>
    
    <div v-if="loading">Loading objectives...</div>
    
    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="setupObjectivesListener">Try Again</button>
    </div>
    
    <div v-else-if="validObjectives.length > 0">
      <div v-for="objective in validObjectives" 
           :key="objective.id" 
           class="objective-item"
           :class="{ 'completed': objective.status === 1 }">
        <div class="objective-header">
          <div class="objective-left">
            <span class="material-icons status-icon">
              {{ objective.status === 1 ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <template v-if="isDashboard && editingObjective === objective.id">
              <input v-model="editedTitle" class="edit-input" />
              <select v-model="editedStatus" class="edit-select">
                <option value="0">In Progress</option>
                <option value="1">Completed</option>
              </select>
              <div class="edit-actions">
                <button @click="updateObjective(objective.id)" class="save-btn">Save</button>
                <button @click="cancelEditing" class="cancel-btn">Cancel</button>
              </div>
            </template>
            <template v-else>
              <h4>{{ objective.title }}</h4>
              <span class="objective-badge" :class="objective.status === 1 ? 'completed' : 'in-progress'">
                {{ objective.status === 1 ? 'completed' : 'in progress' }}
              </span>
              <div v-if="isDashboard" class="objective-actions">
                <button @click="startEditing(objective)" class="edit-btn">
                  <span class="material-icons">edit</span>
                </button>
                <button @click="deleteObjective(objective.id)" class="delete-btn">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </template>
          </div>
          <span v-if="objective.date" class="objective-date-badge">
            <span class="material-icons">event</span> {{ objective.date }}
          </span>
        </div>
      </div>
      <RouterLink :to="`/objectiveVisualization/${username}`">Visualisation</RouterLink>

    </div>
    
    <p v-else>No objectives listed</p>
  </div>
</template>

<style scoped>
.objectives-section {
  margin-top: 20px;
}

.objective-item {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: var(--border-radius);
}

.objective-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.objective-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.status-icon {
  color: #666;
  font-size: 22px;
}

.objective-item.completed .status-icon {
  color: #4CAF50;
}

h4 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-color);
}

.objective-badge {
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.85em;
  text-transform: capitalize;
  font-weight: 500;
}

.objective-badge.completed {
  background: #e6f4ea;
  color: #1e7e34;
}

.objective-badge.in-progress {
  background: #fff3e0;
  color: #f57c00;
}

.objective-actions {
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

.objective-date-badge {
  background: #f5f5f5;
  color: #666;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.85em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
</style> 