<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStateListener } from '@/composables/authStateListener';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import NavbarItem from '@/components/NavbarItem.vue';
import Skills from '@/components/Skills.vue';
import Projects from '@/components/Projects.vue';
import Objectives from '@/components/Objectives.vue';
import ProfileInfo from '@/components/ProfileInfo.vue';
import { useSkills } from '@/composables/useSkills';
import { useProjects } from '@/composables/useProjects';
import { useObjectives } from '@/composables/useObjectives';

const currentUser = ref(null);
const userData = ref(null);
const loading = ref(true);
const error = ref(null);

// Get username for composables
const username = computed(() => currentUser.value?.displayName?.toLowerCase().replace(/\s+/g, ''));

// Initialize composables
const { showSkillForm, newSkill, addSkill } = useSkills(() => username.value);
const { showProjectForm, newProject, addProject } = useProjects(() => username.value);
const { showObjectiveForm, newObjective, addObjective } = useObjectives(() => username.value);

const fetchUserData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const userDoc = await getDoc(doc(db, 'users', username.value));
    
    if (!userDoc.exists()) {
      error.value = 'User not found';
      userData.value = null;
      return;
    }
    
    userData.value = userDoc.data();
  } catch (err) {
    console.error('Error fetching user data:', err);
    error.value = 'Error loading user data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  authStateListener((user) => {
    currentUser.value = user;
    if (user) {
      fetchUserData();
    }
  });
});
</script>

<template>
  <NavbarItem />
  <div class="dashboard">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>    
    
    <div v-else-if="error" class="error">
      <div class="error-container">
        <div class="error-icon">!</div>
        <p>{{ error }}</p>
      </div>
    </div>
    
    <div v-else-if="userData" class="user-info">
      <div class="profile-layout">
        <ProfileInfo :userData="userData" :isDashboard="true" />
        
        <!-- Right Column - Sections -->
        <div class="profile-right">
          <!-- Skills Section -->
          <div class="section-card">
            <div class="section-header">
              <h3>Skills</h3>
              <button class="add-button" @click="showSkillForm = !showSkillForm">
                {{ showSkillForm ? 'Cancel' : 'Add Skill' }}
              </button>
            </div>
            <div v-if="showSkillForm" class="add-form">
              <input v-model="newSkill.title" placeholder="Skill Title" />
              <select v-model="newSkill.level">
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Expert</option>
              </select>
              <button @click="addSkill">Save Skill</button>
            </div>
            <Skills 
              :username="currentUser?.displayName?.toLowerCase().replace(/\s+/g, '')" 
              :isDashboard="true" 
            />
          </div>

          <!-- Projects Section -->
          <div class="section-card">
            <div class="section-header">
              <h3>Projects</h3>
              <button class="add-button" @click="showProjectForm = !showProjectForm">
                {{ showProjectForm ? 'Cancel' : 'Add Project' }}
              </button>
            </div>
            <div v-if="showProjectForm" class="add-form">
              <input v-model="newProject.title" placeholder="Project Title" />
              <textarea v-model="newProject.description" placeholder="Description"></textarea>
              <input v-model="newProject.stack" placeholder="Technologies (comma separated)" />
              <input v-model="newProject.githubLink" placeholder="GitHub Link" />
              <button @click="addProject">Save Project</button>
            </div>
            <Projects 
              :username="currentUser?.displayName?.toLowerCase().replace(/\s+/g, '')" 
              :isDashboard="true" 
            />
          </div>

          <!-- Objectives Section -->
          <div class="section-card">
            <div class="section-header">
              <h3>Objectives</h3>
              <button class="add-button" @click="showObjectiveForm = !showObjectiveForm">
                {{ showObjectiveForm ? 'Cancel' : 'Add Objective' }}
              </button>
            </div>
            <div v-if="showObjectiveForm" class="add-form">
              <input v-model="newObjective.title" placeholder="Objective Title" />
              <select v-model="newObjective.status">
                <option value="0">In Progress</option>
                <option value="1">Completed</option>
              </select>
              <button @click="addObjective">Save Objective</button>
            </div>
            <Objectives 
              :username="currentUser?.displayName?.toLowerCase().replace(/\s+/g, '')" 
              :isDashboard="true" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 40px 20px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 30px;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
}

.profile-right {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-card {
  background: var(--primary-color);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.add-button:hover {
  background: var(--accent-color-dark);
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: var(--secondary-color);
  border-radius: var(--border-radius);
}

.add-form input,
.add-form textarea,
.add-form select {
  padding: 10px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background: var(--background-color);
  color: white;
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
  transition: var(--transition);
}

.add-form button:hover {
  background: var(--accent-color-dark);
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 20px;
  }

  .section-card {
    padding: 20px;
  }
}
</style>