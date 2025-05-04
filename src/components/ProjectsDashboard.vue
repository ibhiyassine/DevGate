<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { fetchUserSubcollection } from '../composables/fetchData.js'
import { useProjects } from '@/composables/useProjects'
import { db } from '@/firebase'
import { Timestamp, collection, onSnapshot, doc, updateDoc, deleteDoc, } from 'firebase/firestore'
import VisualizationItemProject from './VisualizationItemProject.vue'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})
const { showProjectForm, newProject, addProject } = useProjects(() => props.username)

function add_project() {
  if (
    !newProject.value.title ||
    !newProject.value.description ||
    !newProject.value.stack ||
    !newProject.value.githubLink
  ) {
    return
  } else {
    projects.value.push({
      ...newProject.value,
      stack: newProject.value.stack.split(',').map((tech) => tech.trim()),
      createdAt: Timestamp.fromDate(new Date()),
      modifiedDate: Timestamp.fromDate(new Date()),
    })
    addProject()
  }
}

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
  const originalProject = projects.value.find(p => p.id === projectId);

  const isTitleChanged = editedTitle.value !== originalProject.title;
  const isDescriptionChanged = editedDescription.value !== (originalProject.description || '');
  const isStackChanged =
    editedStack.value.split(',').map(tech => tech.trim()).join(',') !==
    (originalProject.stack || []).join(',');
  const isGithubLinkChanged = editedGithubLink.value !== (originalProject.githubLink || '');

  if (!isTitleChanged && !isDescriptionChanged && !isStackChanged && !isGithubLinkChanged) {
    cancelEditing();
    return;
  }

  try {
    const projectRef = doc(db, 'users', props.username, 'projects', projectId);
    await updateDoc(projectRef, {
      title: editedTitle.value,
      description: editedDescription.value,
      stack: editedStack.value.split(',').map(tech => tech.trim()),
      githubLink: editedGithubLink.value,
      modifiedDate: new Date(),
    });
    editingProject.value = null;
  } catch (err) {
    error.value = 'Failed to update project';
  }
};


const deleteProject = async (projectId) => {
  try {
    const projectRef = doc(db, 'users', props.username, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (err) {

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
    projects.value = projects.value.filter((project) => project.id !== 'init' && project.title && project.title.trim() !== '')
    loading.value = false;
  }, (err) => {

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
    <div class="d-flex justify-content-between align-items-center">
      <h3>Projects</h3>
      <span class="material-icons fs-2 add-btn" @click="showProjectForm = !showProjectForm">
        {{ showProjectForm ? 'cancel' : 'add_circle' }}
      </span>
    </div>
    <div v-if="showProjectForm" class="add-form">
      <input v-model="newProject.title" placeholder="Project Title" />
      <textarea v-model="newProject.description" placeholder="Description"></textarea>
      <input v-model="newProject.stack" placeholder="Technologies (comma separated)" />
      <input v-model="newProject.githubLink" placeholder="GitHub Link" />
      <button @click="add_project">Save Project</button>
    </div>
    <div v-if="loading">Loading projects...</div>

    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchProjects">Try Again</button>
    </div>

    <div v-else-if="projects.length > 0">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <template v-if="editingProject === project.id">
          <div class="p-2">
            <input v-model="editedTitle" class="edit-input" placeholder="Project Title" />
            <textarea v-model="editedDescription" class="edit-textarea" placeholder="Description"></textarea>
            <input v-model="editedStack" class="edit-input" placeholder="Technologies (comma separated)" />
            <input v-model="editedGithubLink" class="edit-input" placeholder="GitHub Link" />
            <div class="edit-actions">
              <button @click="updateProject(project.id)" class="save-btn">Save</button>
              <button @click="cancelEditing" class="cancel-btn">Cancel</button>
            </div>
          </div>

        </template>
        <template v-else>
          <div class="project-header" @click="toggleProject(project.id)">
            <div class="project-icon">
              <span class="material-icons">{{ project.icon || 'folder' }}</span>
            </div>
            <h4 class="project-title">{{ project.title }}</h4>
            <span class="material-icons expand-icon">
              {{ expandedProjects.has(project.id) ? 'expand_less' : 'expand_more' }}
            </span>
          </div>

        </template>

        <div v-if="expandedProjects.has(project.id) && editingProject != project.id" class="project-content">
          <p class="project-description">{{ project.description || 'No description available' }}</p>
          <div class="project-stack">
            <span v-for="(tech, idx) in project.stack || []" :key="idx" class="stack-chip">{{
              tech
            }}</span>
          </div>
          <div class="project-links">
            <a v-if="project.githubLink" :href="project.githubLink" target="_blank" class="github-btn">
              <span class="material-icons">code</span> GitHub
            </a>
          </div>
          <div class="project-dates">
            <span v-if="project.createdAt" class="date-info">
              <span class="material-icons">calendar_today</span>
              {{
                project.createdAt.toDate
                  ? project.createdAt.toDate().toLocaleDateString()
                  : project.createdAt
              }}
            </span>
            <span v-if="project.modifiedDate" class="date-info">
              <span class="material-icons">update</span>
              {{
                project.modifiedDate.toDate
                  ? project.modifiedDate.toDate().toLocaleDateString()
                  : project.modifiedDate
              }}
            </span>
            <div class="style d-flex gap-2">
              <span class="material-icons style2" @click.stop="startEditing(project)">edit</span>
              <span class="material-icons style" @click.stop="deleteProject(project.id)"> delete </span>
            </div>
          </div>
        </div>

      </div>
      <RouterLink :to="`/projectVisualization/${username}`">Visualization</RouterLink>

    </div>

    <p v-else>No projects listed</p>
  </div>
</template>

<style scoped>
.edit-input,
.edit-textarea {
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

.save-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius);
  box-shadow: none;
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
  cursor: pointer;
  box-shadow: none;
  transition: var(--transition);
}

.add-form button:hover {
  background: var(--text-color);
}

.add-btn:hover {
  cursor: pointer;
  color: gray;
}

.projects-section {
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

.style {
  color: rgb(230, 108, 108);
  margin-left: auto;
  cursor: pointer;
}

.style:hover {
  color: red;
  cursor: pointer;
}

.style2 {
  color: rgb(132, 222, 132);
  margin-left: auto;
  cursor: pointer;
}

.style2:hover {
  color: green;
}
</style>