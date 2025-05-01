<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useObjectives } from '@/composables/useObjectives'
import { db } from '@/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const objectives = ref([]);
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;
const editingObjective = ref(null);
const editedTitle = ref('');
const editedStatus = ref('0');
const { showObjectiveForm, newObjective, addObjective } = useObjectives(() => props.username)

function add_objective(){
  if(newObjective.value.title.trim()){
    objectives.value.push({
        ...newObjective.value,
        status: Number(newObjective.value.status),
        createdAt: Timestamp.fromDate(new Date()),
        modifiedDate: Timestamp.fromDate(new Date()),
      });
    addObjective();
  }

}

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
    const objectiveRef = doc(db, 'users', props.username, 'objectifs', objectiveId);
    await deleteDoc(objectiveRef);
  } catch (err) {
    console.error('Error deleting objective:', err);
    error.value = 'Failed to delete objective';
  }
};

const update = async (objective) => {
  objective.status = !objective.status;
  editedStatus.value = objective.status;
  editedTitle.value = objective.title;
  updateObjective(objective.id);
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
    objectives.value = objectives.value.filter((objective) => objective.id !== 'init' && objective.title && objective.title.trim() !== '')
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
    <div class="d-flex justify-content-between align-items-center">
      <h3>Objectives</h3>
      <span class="material-icons fs-2 add-btn" @click="showObjectiveForm = !showObjectiveForm">
        {{ showObjectiveForm ? 'cancel' : 'add_circle' }}
      </span>
    </div>
    <div v-if="showObjectiveForm" class="add-form">
      <input v-model="newObjective.title" placeholder="Objective Title" />
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="switchCheckChecked"
          v-model="newObjective.status"
          checked
        />
        <label class="form-check-label" for="switchCheckChecked"
          >Completed</label
        >
      </div>
      <button @click="add_objective">Save Objective</button>
    </div>

    <div v-if="loading">Loading objectives...</div>

    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="setupObjectivesListener">Try Again</button>
    </div>

    <div v-else-if="objectives.length > 0">
      <div
        v-for="objective in objectives"
        :key="objective.id"
        class="objective-item"
        :class="{ completed: objective.status === 1 }"
      >
        <div class="objective-header">
          <div class="objective-left">
            <span class="material-icons status-icon" @click="update(objective)">
              {{ objective.status === 1 ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <h4>{{ objective.title }}</h4>
            <span
              class="objective-badge"
              :class="objective.status === 1 ? 'completed' : 'in-progress'"
            >
              {{ objective.status === 1 ? 'completed' : 'in progress' }}
            </span>
          </div>
          <span class="material-icons style" @click.stop="deleteObjective(objective.id)"> delete </span>
        </div>
      </div>
      <RouterLink :to="`/objectiveVisualization/${username}`">Visualisation</RouterLink>
    </div>

    <p v-else>No objectives listed</p>
  </div>
</template>

<style scoped>
.add-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: #ececec;
  border-radius: var(--border-radius);
}

.add-form input,
.add-form textarea,
.add-form select {
  padding: 10px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
}

.add-form input::placeholder,
.add-form textarea::placeholder {
  color: #a0a0a0;
}

.add-form button {
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  box-shadow: none;
  cursor: pointer;
  transition: var(--transition);
}

.add-form button:hover {
  background: var(--text-color);
}

.add-btn:hover {
  cursor: pointer;
  color: gray;
}

.objectives-section {
  margin-top: 20px;
}

.objective-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
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
}

.status-icon {
  color: #666;
  font-size: 22px;
}

.status-icon:hover{
  cursor: pointer;
}

.objective-item.completed .status-icon {
  color: #4caf50;
}

h4 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.3px;
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

.objective-badge:hover{
  cursor: pointer;
}

.objective-badge.completed {
  background: #e6f4ea;
  color: #1e7e34;
}

.objective-badge.in-progress {
  background: #fff3e0;
  color: #f57c00;
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
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.style {
  color: rgb(230, 108, 108);
  margin-left: auto;
  cursor: pointer;
}
.style:hover {
  color: red;
  cursor: pointer;
}
</style> 