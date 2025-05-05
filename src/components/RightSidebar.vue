<script setup>
import { ref, onMounted, computed } from 'vue';
import { getActivities } from '@/composables/getActivities';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const trendingSkills = ref([
  { name: 'React', count: 142 },
  { name: 'Python', count: 128 },
  { name: 'Machine Learning', count: 98 },
  { name: 'Vue.js', count: 87 },
  { name: 'TypeScript', count: 72 }
]);

const userStats = ref({
  skills: 0,
  projects: 0,
  completedObjectives: 0,
  inProgressObjectives: 0
});

const resources = ref([
  { title: 'Free Web Dev Courses', icon: 'school', url: 'https://freecodecamp.org' },
  { title: 'GitHub Student Pack', icon: 'card_giftcard', url: 'https://education.github.com/pack' },
  { title: 'Developer Roadmaps', icon: 'map', url: 'https://roadmap.sh' },
  { title: 'Coding Challenges', icon: 'code', url: 'https://leetcode.com' }
]);

const loading = ref(false);
const auth = getAuth();
const activities = ref([]);

// Get user statistics based on activities
const calculateUserStats = (activities, username) => {
  // Filter activities for the current user
  const userActivities = activities.filter(activity => 
    activity.user.username === username
  );
  
  // Count skills, projects, and objectives
  const skills = userActivities.filter(activity => 
    activity.type === 'skill' && activity.skill.id !== "init"
  ).length;
  
  const projects = userActivities.filter(activity => 
    activity.type === 'project' && activity.project.id !== "init"
  ).length;
  
  // For completed objectives, check the status property
  const completedObjectives = userActivities.filter(activity => 
    activity.type === 'objectif' && 
    activity.objectif.id !== "init" && 
    Number(activity.objectif.status) === 1
  ).length;
  
  // Count objectives in progress (status !== 1)
  const inProgressObjectives = userActivities.filter(activity => 
    activity.type === 'objectif' && 
    activity.objectif.id !== "init" && 
    Number(activity.objectif.status) !== 1
  ).length;
  
  return { skills, projects, completedObjectives, inProgressObjectives };
};

onMounted(() => {
  loading.value = true;
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get all activities
        const allActivities = await getActivities();
        activities.value = allActivities;
        
        // Calculate user stats based on activities
        userStats.value = calculateUserStats(allActivities, user.displayName);
      } catch (error) {
        console.error('Error fetching user activities:', error);
      } finally {
        loading.value = false;
      }
    } else {
      // User is not logged in
      loading.value = false;
    }
  });
});
</script>

<template>
  <div class="sidebar-container">
    
    <!-- Recent activity summary -->
    <div class="sidebar-card">
      <h5 class="sidebar-title">Your Activity</h5>
      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border text-primary spinner-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else class="activity-summary">
        <div class="summary-item">
          <span class="material-icons skill-icon">psychology</span>
          <div>
            <span class="summary-count">{{ userStats.skills }}</span>
            <span class="summary-label">Skills added</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="material-icons project-icon">folder</span>
          <div>
            <span class="summary-count">{{ userStats.projects }}</span>
            <span class="summary-label">Projects created</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="material-icons objective-icon completed-icon">check_circle</span>
          <div>
            <span class="summary-count">{{ userStats.completedObjectives }}</span>
            <span class="summary-label">Objectives completed</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="material-icons objective-icon in-progress-icon">radio_button_unchecked</span>
          <div>
            <span class="summary-count">{{ userStats.inProgressObjectives }}</span>
            <span class="summary-label">Objectives in progress</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Resources/learning card -->
    <div class="sidebar-card">
      <h5 class="sidebar-title">Developer Resources</h5>
      <div class="resources-list">
        <a :href="resource.url" target="_blank" class="resource-item" v-for="(resource, index) in resources" :key="index">
          <span class="material-icons">{{ resource.icon }}</span>
          <span>{{ resource.title }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-container {
  position: sticky;
  top: 100px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow-y: auto;
}

.sidebar-card {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  margin-bottom: 20px;
  padding: 16px;
  width: 95%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Trending skills styling */
.trending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trending-item {
  display: flex;
  align-items: center;
}

.trending-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

.trending-name {
  font-weight: 600;
  font-size: 14px;
}

.trending-count {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* Activity summary styling */
.activity-summary {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-item .material-icons {
  margin-right: 12px;
  font-size: 20px;
}

.skill-icon {
  color: #1976d2;
}

.project-icon {
  color: #3f51b5;
}

.objective-icon {
  color: #1e7e34;
}

.completed-icon {
  color: #1e7e34;
}

.in-progress-icon {
  color: #f57c00;
}

.summary-count {
  font-weight: 600;
  margin-right: 5px;
  font-size: 14px;
}

.summary-label {
  font-size: 13px;
  color: #666;
}

/* Resources styling */
.resources-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: #333;
  text-decoration: none;
}

.resource-item:hover {
  color: var(--accent-color);
}

.resource-item .material-icons {
  margin-right: 10px;
  font-size: 18px;
  color: var(--accent-color);
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}
</style>