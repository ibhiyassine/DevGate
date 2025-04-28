<script setup>
import { ref, onMounted } from 'vue';
import { fetchUserSubcollection } from '../composables/fetchData.js';

const props = defineProps({
  username: {
    type: String,
    required: true
  }
});

const objectives = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchObjectives = async () => {
  try {
    loading.value = true;
    objectives.value = await fetchUserSubcollection(props.username, 'objectifs');
    objectives.value=objectives.value    
    .filter(objective => objective.id !== "init")
  } catch (err) {
    console.error('Error fetching objectives:', err);
    error.value = err.message || 'Failed to load objectives';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchObjectives);
</script>

<template>
  <div class="objectives-section">
    <h3>Objectives</h3>
    
    <div v-if="loading">Loading objectives...</div>
    
    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchObjectives">Try Again</button>
    </div>
    
    <div v-else-if="objectives.length > 0">
      <div v-for="objective in objectives" 
           :key="objective.id" 
           class="objective-item"
           :class="{ 'completed': objective.status === 1 }">
        <div class="objective-header">
          <div class="objective-left">
            <span class="material-icons status-icon">
              {{ objective.status === 1 ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <h4>{{ objective.title }}</h4>
            <span class="objective-badge" :class="objective.status === 1 ? 'completed' : 'in-progress'">
              {{ objective.status === 1 ? 'completed' : 'in progress' }}
            </span>
          </div>
          <span v-if="objective.date" class="objective-date-badge">
            <span class="material-icons">event</span> {{ objective.date }}
          </span>
        </div>
      </div>
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

.objective-item.completed .status-icon {
  color: #4CAF50;
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
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
</style> 