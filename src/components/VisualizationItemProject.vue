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
const technologyDistributionChart = ref(null);
const monthlyProjectsChart = ref(null);
const projectsTimelineChart = ref(null);

// Chart instances
let technologyDistributionChartInstance = null;
let monthlyProjectsChartInstance = null;
let projectsTimelineChartInstance = null;

// State
const route = useRoute();
const user = ref(route.params.username);
const projects = ref([]);
const loading = ref(true);

// Computed Stats
const totalProjects = computed(() => projects.value.length);

const projectsAddedThisMonth = computed(() => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return projects.value.filter(project => {
    const createdAt = project.createdAt?.toDate ? project.createdAt.toDate() : new Date(project.createdAt);
    return createdAt >= firstDay;
  }).length;
});

const recentlyModifiedProjects = computed(() => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  return projects.value.filter(project => {
    const modifiedDate = project.modifiedDate?.toDate ? project.modifiedDate.toDate() : new Date(project.modifiedDate);
    return modifiedDate >= thirtyDaysAgo;
  }).length;
});

const projectsByTech = computed(() => {
  const techCount = {};

  projects.value.forEach(project => {
    const stack = Array.isArray(project.stack) ? project.stack : [];
    stack.forEach(tech => {
      if (typeof tech === 'string') {
        if (!techCount[tech]) techCount[tech] = 0;
        techCount[tech]++;
      } else if (tech && typeof tech === 'object') {
        // For cases where stack items might be objects
        const techValue = tech.toString();
        if (!techCount[techValue]) techCount[techValue] = 0;
        techCount[techValue]++;
      }
    });
  });

  return techCount;
});

const projectsWithGithub = computed(() =>
  projects.value.filter(project => project.githubLink && project.githubLink.trim() !== '').length
);

// Handle auth + fetch data
onMounted(async () => {

  await fetchProjects();
  await nextTick(); // ensure canvas refs are rendered
  initCharts();


});

const fetchProjects = async () => {
  try {
    loading.value = true;
    const projectsRef = collection(db, 'users', user.value, 'projects');
    const snapshot = await getDocs(projectsRef);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    projects.value = list.filter(project => project.id !== 'init');
    initCharts();
  } catch (error) {

  } finally {
    loading.value = false;
  }
};

// Chart Setup
function initCharts() {
  initTechnologyDistributionChart();
  initMonthlyProjectsChart();
  initProjectsTimelineChart();
}

function initTechnologyDistributionChart() {
  if (technologyDistributionChartInstance) technologyDistributionChartInstance.destroy();

  // Get top technologies
  const techData = projectsByTech.value;
  const sortedTech = Object.entries(techData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const labels = sortedTech.map(item => item[0]);
  const data = sortedTech.map(item => item[1]);

  const ctx = technologyDistributionChart.value.getContext('2d');

  const backgroundColors = [
    'rgba(75, 192, 192, 0.7)', // Teal
    'rgba(54, 162, 235, 0.7)', // Blue
    'rgba(255, 159, 64, 0.7)', // Orange
    'rgba(153, 102, 255, 0.7)', // Purple
    'rgba(255, 99, 132, 0.7)', // Red
    'rgba(255, 205, 86, 0.7)', // Yellow
    'rgba(201, 203, 207, 0.7)', // Gray
    'rgba(0, 204, 150, 0.7)', // Green
  ];

  const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

  technologyDistributionChartInstance = new Chart(ctx, {
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

function initMonthlyProjectsChart() {
  if (monthlyProjectsChartInstance) monthlyProjectsChartInstance.destroy();
  const { labels, data } = getMonthlyProjectsData();
  const ctx = monthlyProjectsChart.value.getContext('2d');

  monthlyProjectsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Projects Created',
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

function initProjectsTimelineChart() {
  if (projectsTimelineChartInstance) projectsTimelineChartInstance.destroy();

  // Sort projects by creation date
  const sortedProjects = [...projects.value].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateA - dateB;
  });

  // Get the most recent 10 projects 
  const recentProjects = sortedProjects.slice(-10);

  const labels = recentProjects.map(project => {
    const date = project.createdAt?.toDate ? project.createdAt.toDate() : new Date(project.createdAt);
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  });

  // Cumulative count
  const data = [];
  for (let i = 0; i < recentProjects.length; i++) {
    data.push(i + 1);
  }

  const ctx = projectsTimelineChart.value.getContext('2d');

  projectsTimelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cumulative Projects',
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
function getMonthlyProjectsData() {
  const now = new Date();
  const labels = [];
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = month.toLocaleDateString('en', { month: 'short' });
    labels.push(monthLabel);

    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const count = projects.value.filter(project => {
      const createdAt = project.createdAt?.toDate ? project.createdAt.toDate() : new Date(project.createdAt);
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

    <div class="all projects">
      <div class="projects-layout">
        <!-- Technology Distribution -->
        <div class="section-card">
          <h3 class="text-lg font-medium mb-4">Technology Distribution</h3>
          <div class="h-64">
            <canvas ref="technologyDistributionChart"></canvas>
          </div>
        </div>

        <!-- Monthly Projects Evolution -->
        <div class="section-card mt-5">
          <h3 class="text-lg font-medium mb-4">Monthly Projects Added</h3>
          <div class="h-64">
            <canvas ref="monthlyProjectsChart"></canvas>
          </div>
        </div>

        <!-- Projects Timeline -->
        <div class="section-card">
          <h3 class="text-lg font-medium mb-4">Projects Growth Timeline</h3>
          <div class="h-64">
            <canvas ref="projectsTimelineChart"></canvas>
          </div>
        </div>

        <!-- Global Statistics -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title h5 mb-4">Project Statistics</h3>
            <div class="row g-3 text-center">
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-primary">{{ totalProjects }}</div>
                  <div class="small text-muted mt-1">Total Projects</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-success">{{ projectsWithGithub }}</div>
                  <div class="small text-muted mt-1">With GitHub Links</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-warning">{{ projectsAddedThisMonth }}</div>
                  <div class="small text-muted mt-1">Added This Month</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="bg-opacity-10 p-3 rounded">
                  <div class="display-6 fw-bold text-purple">{{ recentlyModifiedProjects }}</div>
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

.projects-layout {
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
  .projects-layout {
    grid-template-columns: 1fr;
  }
}

.all {
  width: 90%;
  margin: 0 auto;
  padding-top: 60px;
  /* Added space for navbar */
}

.projects {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 40px 20px;
}
</style>