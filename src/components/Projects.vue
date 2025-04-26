<script setup>
import { ref, onMounted } from 'vue';
import { fetchUserSubcollection } from '../composables/fetchData.js';

const props = defineProps({
  username: {
    type: String,
    required: true
  }
});

const projects = ref([]);
const loading = ref(true);
const error = ref(null);
const expandedProjects = ref(new Set());

const toggleProject = (projectId) => {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId);
  } else {
    expandedProjects.value.add(projectId);
  }
};

const fetchProjects = async () => {
  try {
    loading.value = true;
    projects.value = await fetchUserSubcollection(props.username, 'projects');
  } catch (err) {
    console.error('Error fetching projects:', err);
    error.value = err.message || 'Failed to load projects';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProjects);
</script>

<template>
  <div class="projects-section">
    <h3>Projects</h3>
    
    <div v-if="loading">Loading projects...</div>
    
    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchProjects">Try Again</button>
    </div>
    
    <div v-else-if="projects.length > 0">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-header" @click="toggleProject(project.id)">
          <div class="project-icon">
            <span class="material-icons">{{ project.icon || 'folder' }}</span>
          </div>
          <h4 class="project-title">{{ project.title }}</h4>
          <span class="material-icons expand-icon">
            {{ expandedProjects.has(project.id) ? 'expand_less' : 'expand_more' }}
          </span>
        </div>
        
        <div v-if="expandedProjects.has(project.id)" class="project-content">
          <p class="project-description">{{ project.description || 'No description available' }}</p>
          <div class="project-stack">
            <span v-for="(tech, idx) in (project.stack || [])" :key="idx" class="stack-chip">{{ tech }}</span>
          </div>
          <div class="project-links">
            <a v-if="project.githubLink" :href="project.githubLink" target="_blank" class="github-btn">
              <span class="material-icons">code</span> GitHub
            </a>
          </div>
          <div class="project-dates">
            <span v-if="project.createdAt" class="date-info">
              <span class="material-icons">calendar_today</span>
              {{ project.createdAt.toDate ? project.createdAt.toDate().toLocaleDateString() : project.createdAt }}
            </span>
            <span v-if="project.modifiedDate" class="date-info">
              <span class="material-icons">update</span>
              {{ project.modifiedDate.toDate ? project.modifiedDate.toDate().toLocaleDateString() : project.modifiedDate }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <p v-else>No projects listed</p>
  </div>
</template>

<style scoped>
.projects-section {
  margin-top: 20px;
}

ul {
  padding-left: 20px;
}

button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.project-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.stack-chip {
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.85em;
}
.project-links {
  margin: 10px 0;
}
.github-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #24292e;
  color: #fff;
  border-radius: 6px;
  padding: 6px 14px;
  text-decoration: none;
  font-size: 0.95em;
  transition: background 0.2s;
}
.github-btn:hover {
  background: #444d56;
}
.project-dates {
  display: flex;
  gap: 15px;
  color: #888;
  font-size: 0.92em;
  margin-top: 8px;
}
.date-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.project-header:hover {
  background-color: #f5f5f5;
}

.project-title {
  flex: 1;
  margin: 0;
  font-size: 1.1em;
}

.expand-icon {
  color: #666;
  transition: transform 0.2s;
}

.project-content {
  padding: 0 15px 15px 15px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.project-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
</style> 