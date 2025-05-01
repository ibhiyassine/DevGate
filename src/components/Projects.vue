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

const projects = ref([]);
const loading = ref(true);
const error = ref(null);
const expandedProjects = ref(new Set());
let unsubscribe = null;
const editingProject = ref(null);
const editedTitle = ref('');
const editedDescription = ref('');
const editedStack = ref('');
const editedGithubLink = ref('');

const validProjects = computed(() => {
  return projects.value.filter(project => project.title && project.title.trim() !== '');
});

const toggleProject = (projectId) => {
  if (editingProject.value === projectId) return;
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId);
  } else {
    expandedProjects.value.add(projectId);
  }
};

const startEditing = (project) => {
  editingProject.value = project.id;
  editedTitle.value = project.title;
  editedDescription.value = project.description || '';
  editedStack.value = project.stack ? project.stack.join(', ') : '';
  editedGithubLink.value = project.githubLink || '';
  expandedProjects.value.add(project.id);
};

const cancelEditing = () => {
  editingProject.value = null;
  editedTitle.value = '';
  editedDescription.value = '';
  editedStack.value = '';
  editedGithubLink.value = '';
};

const updateProject = async (projectId) => {
  try {
    loading.value = true;
    projects.value = await fetchUserSubcollection(props.username, 'projects');
    projects.value=projects.value    
    .filter(project => project.id !== "init")
  } catch (err) {
    console.error('Error updating project:', err);
    error.value = 'Failed to update project';
  }
};

const deleteProject = async (projectId) => {
  try {
    const projectRef = doc(db, 'users', props.username, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (err) {
    console.error('Error deleting project:', err);
    error.value = 'Failed to delete project';
  }
};

const setupProjectsListener = () => {
  if (unsubscribe) {
    unsubscribe();
  }

  const projectsRef = collection(db, 'users', props.username, 'projects');
  unsubscribe = onSnapshot(projectsRef, (snapshot) => {
    projects.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  }, (err) => {
    console.error('Error listening to projects:', err);
    error.value = err.message || 'Failed to load projects';
    loading.value = false;
  });
};

onMounted(() => {
  setupProjectsListener();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

watch(() => props.username, () => {
  loading.value = true;
  setupProjectsListener();
});
</script>

<template>
  <div class="projects-section">
    <h3>Projects</h3>
    
    <div v-if="loading">Loading projects...</div>
    
    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="setupProjectsListener">Try Again</button>
    </div>
    
    <div v-else-if="validProjects.length > 0">
      <div v-for="project in validProjects" :key="project.id" class="project-card">
        <div class="project-header" @click="toggleProject(project.id)">
          <div class="project-icon">
            <span class="material-icons">folder</span>
          </div>
          <h4 class="project-title">{{ project.title }}</h4>
          <div v-if="isDashboard" class="project-actions">
            <button @click.stop="startEditing(project)" class="edit-btn">
              <span class="material-icons">edit</span>
            </button>
            <button @click.stop="deleteProject(project.id)" class="delete-btn">
              <span class="material-icons">delete</span>
            </button>
            <span class="material-icons expand-icon">
              {{ expandedProjects.has(project.id) ? 'expand_less' : 'expand_more' }}
            </span>
          </div>
          <div v-else class="project-actions">
            <span class="material-icons expand-icon">
              {{ expandedProjects.has(project.id) ? 'expand_less' : 'expand_more' }}
            </span>
          </div>
        </div>
        
        <div v-if="expandedProjects.has(project.id)" class="project-content">
          <template v-if="isDashboard && editingProject === project.id">
            <input v-model="editedTitle" class="edit-input" placeholder="Project Title" />
            <textarea v-model="editedDescription" class="edit-textarea" placeholder="Description"></textarea>
            <input v-model="editedStack" class="edit-input" placeholder="Technologies (comma separated)" />
            <input v-model="editedGithubLink" class="edit-input" placeholder="GitHub Link" />
            <div class="edit-actions">
              <button @click="updateProject(project.id)" class="save-btn">Save</button>
              <button @click="cancelEditing" class="cancel-btn">Cancel</button>
            </div>
          </template>
          <template v-else>
            <p class="project-description">{{ project.description || 'No description available' }}</p>
            <div class="project-stack">
              <span v-for="(tech, idx) in (project.stack || [])" :key="idx" class="stack-chip">{{ tech }}</span>
            </div>
            <div class="project-links">
              <a v-if="project.githubLink" :href="project.githubLink" target="_blank" class="github-btn">
                <span class="material-icons">code</span> GitHub
              </a>
            </div>
          </template>
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
      <RouterLink :to="`/projectVisualization/${username}`">Visualization</RouterLink>

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
  box-shadow: none !important;
  background-color: var(--primary-color);
}


.project-title {
  flex: 1;
  margin: 0;
  font-size: 1.1em;
  color: var(--text-color);
}

.project-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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

.expand-icon {
  color: var(--text-color);
  transition: transform 0.2s;
}

.project-content {
  padding: 0 15px 15px 15px;
  border-top: 1px solid var(--secondary-color);
  margin-top: 10px;
}

.project-description {
  color: var(--text-color);
  margin: 10px 0;
}

.edit-input, .edit-textarea {
  padding: 8px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background: var(--background-color);
  color: white;
  width: 100%;
  margin-bottom: 10px;
}

.edit-textarea {
  min-height: 100px;
  resize: vertical;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

.project-card {
  border-radius: var(--border-radius);
  margin-bottom: 10px;
  overflow: hidden;
}
</style> 