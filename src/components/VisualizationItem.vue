<script setup>
import { ref, computed, onMounted,watch } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import NavbarItem from './NavbarItem.vue';
import Chart from 'chart.js/auto';
import { useRoute } from 'vue-router';

// Chart DOM refs
const levelDistributionChart = ref(null);
const skillsEvolutionChart = ref(null);
const skillsRadarChart = ref(null);

// Chart instances
let levelDistributionChartInstance = null;
let skillsEvolutionChartInstance = null;
let skillsRadarChartInstance = null;

// State
const route = useRoute();
const user = ref(route.params.username);
const skills = ref([]);
const loading = ref(true);

// Computed Stats
const totalSkills = computed(() => skills.value.length);

const skillsByLevel = computed(() => ({
  beginner: skills.value.filter(skill => parseInt(skill.level) === 1).length,
  intermediate: skills.value.filter(skill => parseInt(skill.level) === 2).length,
  advanced: skills.value.filter(skill => parseInt(skill.level) === 3).length
}));

const averageSkillLevel = computed(() => {
  if (skills.value.length === 0) return 0;
  const total = skills.value.reduce((sum, skill) => sum + parseInt(skill.level), 0);
  return total / skills.value.length;
});

const skillsAddedThisMonth = computed(() => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return skills.value.filter(skill => {
    const createdAt = skill.createdAt?.toDate ? skill.createdAt.toDate() : new Date(skill.createdAt);
    return createdAt >= firstDay;
  }).length;
});

const fetchSkills = async () => {
  try {
    loading.value = true;
    if (!user.value) {
      console.error('No username available');
      return;
    }
    
    console.log("Fetching skills for user:", user.value);
    const skillsRef = collection(db, 'users', user.value, 'skills');
    const snapshot = await getDocs(skillsRef);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    skills.value = list.filter(skill => skill.id !== 'init');
    console.log("Skills fetched:", skills.value.length);
  } catch (error) {
    console.error('Error fetching skills:', error);
  } finally {
    loading.value = false;
  }
};

// Chart Setup
function initCharts() {
  // Only initialize charts if we have DOM elements and data
  if (!levelDistributionChart.value || !skillsEvolutionChart.value || !skillsRadarChart.value) {
    console.error('Chart DOM elements not ready');
    return;
  }
  
  console.log('Initializing charts');
  initLevelDistributionChart();
  initSkillsEvolutionChart();
  initSkillsRadarChart();
}

function initLevelDistributionChart() {
  if (!levelDistributionChart.value) return;
  if (levelDistributionChartInstance) levelDistributionChartInstance.destroy();
  
  const ctx = levelDistributionChart.value.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context for level distribution chart');
    return;
  }

  levelDistributionChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Beginner', 'Intermediate', 'Advanced'],
      datasets: [{
        data: [
          skillsByLevel.value.beginner,
          skillsByLevel.value.intermediate,
          skillsByLevel.value.advanced
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function initSkillsEvolutionChart() {
  if (!skillsEvolutionChart.value) return;
  if (skillsEvolutionChartInstance) skillsEvolutionChartInstance.destroy();
  
  const { labels, data } = getMonthlySkillsData();
  const ctx = skillsEvolutionChart.value.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context for skills evolution chart');
    return;
  }

  skillsEvolutionChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Skills Added',
        data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

function initSkillsRadarChart() {
  if (!skillsRadarChart.value) return;
  if (skillsRadarChartInstance) skillsRadarChartInstance.destroy();
  
  // Only create chart if we have skills
  if (skills.value.length === 0) {
    console.log('No skills available for radar chart');
    return;
  }
  
  const topSkills = [...skills.value]
    .sort((a, b) => parseInt(b.level) - parseInt(a.level))
    .slice(0, 8);

  const ctx = skillsRadarChart.value.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context for skills radar chart');
    return;
  }

  skillsRadarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: topSkills.map(skill => skill.title),
      datasets: [{
        label: 'Skill Level',
        data: topSkills.map(skill => parseInt(skill.level)),
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 3
        }
      }
    }
  });
}

// Utils
function getMonthlySkillsData() {
  const now = new Date();
  const labels = [];
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = month.toLocaleDateString('en', { month: 'short' });
    labels.push(monthLabel);

    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const count = skills.value.filter(skill => {
      if (!skill.createdAt) return false;
      
      const createdAt = skill.createdAt?.toDate ? skill.createdAt.toDate() : new Date(skill.createdAt);
      return createdAt >= start && createdAt <= end;
    }).length;

    data.push(count);
  }
  
  console.log("Monthly data:", labels, data);
  return { labels, data };
}

// Call fetchSkills when component mounts
onMounted(async () => {
  console.log("Component mounted, username:", user.value);
  await fetchSkills();
  // Wait for next tick to ensure DOM is ready for charts
  setTimeout(() => {
    initCharts();
  }, 100);
});

// Watch for changes in skills data to update charts
watch(
  skills,
  () => {
    if (skills.value.length > 0) {
      console.log("Skills changed, updating charts");
      initCharts();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="wrapper">
    <NavbarItem />

    <div class="all profile">
      <div v-if="loading" class="loading-indicator">
        Loading skills data...
      </div>
      
      <div v-else-if="skills.length === 0" class="no-data-message">
        No skills data available. Add some skills to see your statistics.
      </div>
      
      <div v-else class="profile-layout">
        <!-- Skill Level Distribution -->
        <div class="section-card">
          <h3 class="text-lg font-medium mb-4">Level Distribution</h3>
          <div class="h-64">
            <canvas ref="levelDistributionChart"></canvas>
          </div>
        </div>

        <!-- Monthly Skill Evolution -->
        <div class="section-card mt-5">
          <h3 class="text-lg font-medium mb-4">Monthly Skill Evolution</h3>
          <div class="h-64">
            <canvas ref="skillsEvolutionChart"></canvas>
          </div>
        </div>

        <!-- Skill Radar -->
        <div class="section-card">
          <h3 class="text-lg font-medium mb-4">Skill Radar</h3>
          <div class="h-64">
            <canvas ref="skillsRadarChart"></canvas>
          </div>
        </div>

        <!-- Global Statistics -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title h5 mb-4">Global Statistics</h3>
            <div class="row g-3 text-center">
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-primary">{{ totalSkills }}</div>
                  <div class="small text-muted mt-1">Total Skills</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-success">{{ skillsByLevel.advanced }}</div>
                  <div class="small text-muted mt-1">Advanced Skills</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-warning">{{ skillsAddedThisMonth }}</div>
                  <div class="small text-muted mt-1">Added This Month</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-purple">{{ averageSkillLevel.toFixed(1) }}</div>
                  <div class="small text-muted mt-1">Average Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.profile-layout {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 30px;
  align-items: start;
}

.section-card {
  background: var(--primary-color);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  margin-bottom: 20px;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 119, 192, 0.1);
}

.loading-indicator {
  text-align: center;
  padding: 50px;
  font-size: 18px;
}

.no-data-message {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

.all {
  width: 90%;
  margin: 0 auto;
  padding-top: 60px; /* Added space for navbar */
}

.profile {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 40px 20px;
}
</style>