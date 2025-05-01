<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import NavbarItem from './NavbarItem.vue';
import Chart from 'chart.js/auto';
import { useRoute } from 'vue-router';
import { nextTick } from 'vue';

// Chart DOM refs
const statusDistributionChart = ref(null);
const monthlyObjectivesChart = ref(null);
const objectivesTimelineChart = ref(null);

// Chart instances
let statusDistributionChartInstance = null;
let monthlyObjectivesChartInstance = null;
let objectivesTimelineChartInstance = null;

// State
const route = useRoute();
const user = ref(route.params.username);
const objectives = ref([]);
const loading = ref(true);

// Computed Stats
const totalObjectives = computed(() => objectives.value.length);

const objectivesAddedThisMonth = computed(() => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return objectives.value.filter(objective => {
    const createdAt = objective.createdAt?.toDate ? objective.createdAt.toDate() : new Date(objective.createdAt);
    return createdAt >= firstDay;
  }).length;
});

const recentlyModifiedObjectives = computed(() => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return objectives.value.filter(objective => {
    const modifiedDate = objective.modifiedDate?.toDate ? objective.modifiedDate.toDate() : new Date(objective.modifiedDate);
    return modifiedDate >= thirtyDaysAgo;
  }).length;
});

const objectivesByStatus = computed(() => {
  const statusCount = {
    'Completed': 0,
    'In Progress': 1,
  };
  
  objectives.value.forEach(objective => {
    let statusText;
    switch (objective.status) {
  case 0:
    statusText = 'In Progress';
    break;
  case 1:
    statusText = 'Completed';
    break;
  default:
    return;
}
    
    if (!statusCount[statusText]) statusCount[statusText] = 0;
    statusCount[statusText]++;
  });
  
  return statusCount;
});

const completedObjectives = computed(() => 
  objectives.value.filter(objective => objective.status === 1).length
);

// Handle auth + fetch data
onMounted(async () => {
   
      await fetchObjectives();
      await nextTick(); // ensure canvas refs are rendered
  initCharts();
    
 
});

const fetchObjectives = async () => {
  try {
    loading.value = true;
    const objectivesRef = collection(db, 'users', user.value, 'objectifs');
    const snapshot = await getDocs(objectivesRef);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    objectives.value = list.filter(objective => objective.id !== 'init');
    initCharts();
  } catch (error) {
    console.error('Error fetching objectives:', error);
  } finally {
    loading.value = false;
  }
};

// Chart Setup
function initCharts() {
  initStatusDistributionChart();
  initMonthlyObjectivesChart();
  initObjectivesTimelineChart();
}

function initStatusDistributionChart() {
  if (statusDistributionChartInstance) statusDistributionChartInstance.destroy();
  
  // Get status data
  const statusData = objectivesByStatus.value;
  
  const labels = Object.keys(statusData);
  const data = Object.values(statusData);
  
  const ctx = statusDistributionChart.value.getContext('2d');
  
  const backgroundColors = [
    'rgba(75, 192, 192, 0.7)',
    'rgba(54, 162, 235, 0.7)', 
    
    
  ];
  
  const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

  statusDistributionChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
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

function initMonthlyObjectivesChart() {
  if (monthlyObjectivesChartInstance) monthlyObjectivesChartInstance.destroy();
  const { labels, data } = getMonthlyObjectivesData();
  const ctx = monthlyObjectivesChart.value.getContext('2d');

  monthlyObjectivesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Objectives Created',
        data,
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
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

function initObjectivesTimelineChart() {
  if (objectivesTimelineChartInstance) objectivesTimelineChartInstance.destroy();
  
  // Sort objectives by creation date
  const sortedObjectives = [...objectives.value].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateA - dateB;
  });
  
  // Get the most recent 10 objectives (or all if less than 10)
  const recentObjectives = sortedObjectives.slice(-10);
  
  const labels = recentObjectives.map(objective => {
    const date = objective.createdAt?.toDate ? objective.createdAt.toDate() : new Date(objective.createdAt);
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  });
  
  // Cumulative count
  const data = [];
  for (let i = 0; i < recentObjectives.length; i++) {
    data.push(i + 1);
  }
  
  const ctx = objectivesTimelineChart.value.getContext('2d');

  objectivesTimelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cumulative Objectives',
        data,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        stepped: false,
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

// Utils
function getMonthlyObjectivesData() {
  const now = new Date();
  const labels = [];
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = month.toLocaleDateString('en', { month: 'short' });
    labels.push(monthLabel);

    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const count = objectives.value.filter(objective => {
      const createdAt = objective.createdAt?.toDate ? objective.createdAt.toDate() : new Date(objective.createdAt);
      return createdAt >= start && createdAt <= end;
    }).length;

    data.push(count);
  }
  
  return { labels, data };
}
</script>

<template>
  <div class="wrapper">
    <NavbarItem />

    <div class="all objectives">
      <div class="objectives-layout">
        <!-- Status Distribution -->
        <div class="section-card">
          <h3 class="text-lg font-medium mb-4">Status Distribution</h3>
          <div class="h-64">
            <canvas ref="statusDistributionChart" ></canvas>
          </div>
        </div>

        <!-- Monthly Objectives Evolution -->
        <div class="section-card mt-5">
          <h3 class="text-lg font-medium mb-4">Monthly Objectives Added</h3>
          <div class="h-64">
            <canvas ref="monthlyObjectivesChart"></canvas>
          </div>
        </div>

        <!-- Objectives Timeline -->
        <div class="section-card">
          <h3 class="text-lg font-medium mb-4">Objectives Growth Timeline</h3>
          <div class="h-64">
            <canvas ref="objectivesTimelineChart"></canvas>
          </div>
        </div>

        <!-- Global Statistics -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title h5 mb-4">Objective Statistics</h3>
            <div class="row g-3 text-center">
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-primary">{{ totalObjectives }}</div>
                  <div class="small text-muted mt-1">Total Objectives</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-success">{{ completedObjectives }}</div>
                  <div class="small text-muted mt-1">Completed</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-warning">{{ objectivesAddedThisMonth }}</div>
                  <div class="small text-muted mt-1">Added This Month</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-purple">{{ recentlyModifiedObjectives }}</div>
                  <div class="small text-muted mt-1">Recently Modified</div>
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

.objectives-layout {
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

@media (max-width: 1024px) {
  .objectives-layout {
    grid-template-columns: 1fr;
  }
}

.all {
  width: 90%;
  margin: 0 auto;
  padding-top: 60px; /* Added space for navbar */
}

.objectives {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 40px 20px;
}
</style>