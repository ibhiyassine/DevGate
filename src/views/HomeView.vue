<script setup>
import ActivityCard from '@/components/ActivityCard.vue';
import GridCard from '@/components/GridCard.vue';
import FIlterItem from '@/components/FIlterItem.vue';
import NavBarItem from '@/components/NavbarItem.vue';
import LeftSidebar from '@/components/LeftSidebar.vue';
import RightSidebar from '@/components/RightSidebar.vue';
import { getActivities } from '@/composables/getActivities';
import { getFollowings } from '@/composables/getUserFriend';
import { ref, onMounted, computed, watch } from 'vue';

let followings = ref([]);
let activites = ref([]);
let loading = ref(false);
let devtoPosts = ref([]);
let activeView = ref('feed'); // 'feed' or 'devto'
let displayMode = ref('list'); // 'list' or 'grid'

let skill = ref(true);
let project = ref(true);
let objectif = ref(true);
let friend = ref(false);

let filtered = computed(() => {
  return activites.value.filter((activity) => {
    if (friend.value && !followings.value.includes(activity.user.username)) return false;
    if (!skill.value && activity.type == 'skill') {
      return false;
    };
    if (!project.value && activity.type == 'project') return false;
    if (!objectif.value && activity.type == 'objectif') return false;
    return true;
  });
});

function findId(activity) {
  if (activity.hasOwnProperty('skill')) {
    return activity.skill.id;
  }
  else if (activity.hasOwnProperty('objectif')) {
    return activity.objectif.id;
  }
  else if (activity.hasOwnProperty('project')) {
    return activity.project.id;
  }
  return null;
}

async function fetchDevtoPosts() {
  loading.value = true;
  try {
    const response = await fetch('https://dev.to/api/articles?per_page=20');
    if (!response.ok) {
      throw new Error('Failed to fetch Dev.to posts');
    }
    const data = await response.json();
    devtoPosts.value = data;
  } catch (error) {
    console.error('Error fetching Dev.to posts:', error);
  } finally {
    loading.value = false;
  }
}

function switchView(view) {
  activeView.value = view;
  if (view === 'devto' && devtoPosts.value.length === 0) {
    fetchDevtoPosts();
  }
}

function switchDisplayMode(mode) {
  displayMode.value = mode;
}

onMounted(async () => {
  loading.value = true;
  const [follows, acts] = await Promise.all([
    getFollowings(),
    getActivities()
  ]);
  followings.value = follows;
  activites.value = acts;
  loading.value = false;
});

</script>

<template>
  <main class="main-wrapper">
    <NavBarItem />

    <div class="home-container">
      <!-- Left Sidebar -->
      <div class="left-sidebar" v-if="!loading">
        <LeftSidebar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="header-container">
          <div class="header-content d-flex justify-content-between align-items-center bg p-3 w-100">
            <div class="d-flex align-items-center gap-3">
              <div class="btn-group no-shadow" role="group" aria-label="View toggle">
                <button type="button" class="btn no-shadow"
                  :class="activeView === 'feed' ? 'active-btn' : 'btn-outline-primary'" @click="switchView('feed')">
                  Your Feed
                </button>
                <button type="button" class="btn no-shadow"
                  :class="activeView === 'devto' ? 'active-btn' : 'btn-outline-primary'" @click="switchView('devto')">
                  Dev.to
                </button>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <div v-if="activeView === 'feed' && !loading" class="btn-group no-shadow me-2" role="group"
                aria-label="Display toggle">
                <button type="button" class="btn no-shadow"
                  :class="displayMode === 'list' ? 'active-btn' : 'btn-outline-primary'"
                  @click="switchDisplayMode('list')">
                  <span class="material-icons">view_list</span>
                </button>
                <button type="button" class="btn no-shadow"
                  :class="displayMode === 'grid' ? 'active-btn' : 'btn-outline-primary'"
                  @click="switchDisplayMode('grid')">
                  <span class="material-icons">grid_view</span>
                </button>
              </div>
              <FIlterItem v-show="!loading && activeView === 'feed'" @skill="(s) => skill = s"
                @objectif="(o) => objectif = o" @project="(p) => project = p" @friend="(f) => friend = f" />
            </div>
          </div>
        </div>

        <div class="content-scroll-area">
          <div v-if="loading" class="d-flex justify-content-center align-items-center gap-2" style="height: 500px;">
            <div class="spinner-grow text-light" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow text-light" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow text-light" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else>
            <!-- Feed content -->
            <div v-if="activeView === 'feed'">
              <!-- List view -->
              <div v-if="displayMode === 'list'" class="d-flex flex-column gap-3 cards-container">
                <activity-card v-for="(activity, index) of filtered" v-bind="activity" :key="findId(activity)" />
              </div>

              <!-- Grid view -->
              <div v-else class="grid-container mt-4 cards-container">
                <grid-card v-for="(activity, index) of filtered" v-bind="activity" :key="findId(activity)" />
              </div>
            </div>

            <!-- Dev.to content -->
            <div v-else class="d-flex flex-column gap-3 mt-4 cards-container">
              <div v-for="post in devtoPosts" :key="post.id" class="card devto-card w-100">
                <div class="card-body">
                  <div class="d-flex align-items-center mb-3">
                    <img :src="post.user?.profile_image_90 || ''" alt="User profile" class="rounded-circle me-2"
                      style="width: 40px; height: 40px;">
                    <div>
                      <h5 class="card-title mb-0">{{ post.user?.name || 'Anonymous' }}</h5>
                      <small class="text-muted">{{ new Date(post.published_at).toLocaleDateString() }}</small>
                    </div>
                  </div>
                  <h4 class="card-title">{{ post.title }}</h4>
                  <p class="card-text text-secondary">{{ post.description }}</p>
                  <div class="d-flex gap-3">
                    <span v-if="post.tags && Array.isArray(post.tags) && post.tags.length > 0"
                      class="badge bg-secondary">{{
                        post.tags.join(', ') }}</span>
                    <span v-else-if="post.tag_list && Array.isArray(post.tag_list) && post.tag_list.length > 0"
                      class="badge bg-secondary">{{ post.tag_list.join(', ') }}</span>
                    <span class="text-secondary">
                      <i class="bi bi-heart me-1"></i> {{ post.positive_reactions_count || 0 }}
                    </span>
                    <span class="text-secondary">
                      <i class="bi bi-chat me-1"></i> {{ post.comments_count || 0 }}
                    </span>
                  </div>
                  <a :href="post.url" target="_blank" class="btn btn-primary shadow-none mt-3">Read on Dev.to</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="right-sidebar" v-if="!loading">
        <RightSidebar />
      </div>
    </div>
  </main>
</template>

<style lang="css" scoped>
.main-wrapper {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bg {
  background-color: var(--background-color);
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--background-color);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.header-content {
  height: 70px;
}

.content-scroll-area {
  overflow-y: auto;
  height: calc(100vh - 150px);
  padding: 0 0 2rem 0;
}

/* Three-column layout */
.home-container {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 220px;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: calc(100vh - 80px);
  overflow: hidden;
}

.left-sidebar,
.right-sidebar {
  height: 100%;
  overflow-y: auto;
  padding-top: 1rem;
}

.main-content {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Existing styles */
.card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.devto-card {
  background-color: white;
  color: #333;
  margin-bottom: 1rem;
}

.btn {
  box-shadow: none !important;
}

.btn.btn-primary {
  box-shadow: none !important;
}

.btn.btn-outline-primary {
  box-shadow: none !important;
}

.no-shadow,
.no-shadow:hover,
.no-shadow:active,
.no-shadow:focus {
  box-shadow: none !important;
}

.active-btn {
  background-color: var(--color-text) !important;
  color: white !important;
  border-color: var(--color-text) !important;
  box-shadow: none !important;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  margin-top: 20px;
  justify-items: center;
}

/* Activity cards spacing adjustment */
:deep(.cardx) {
  width: 100% !important;
  max-width: 600px;
  margin: 0 auto;
}

.material-icons {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>