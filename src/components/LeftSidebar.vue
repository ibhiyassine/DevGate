<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { getusers } from '@/composables/getUsers';
import { getFollowings } from '@/composables/getUserFriend';
import { getAuth } from 'firebase/auth';
import Follow from '@/components/Follow.vue';

const allUsers = ref([]);
const followings = ref([]);
const loading = ref(false);
const currentPage = ref(0);
const usersPerPage = 5;
const auth = getAuth();

const currentUser = computed(() => {
  return auth.currentUser ? auth.currentUser.displayName : null;
});

// Get paginated displayed users
const displayedUsers = computed(() => {
  const startIndex = currentPage.value * usersPerPage;
  return allUsers.value.slice(startIndex, startIndex + usersPerPage);
});

// Toggle between different pages of users
const showNextPage = () => {
  const totalPages = Math.ceil(allUsers.value.length / usersPerPage);
  currentPage.value = (currentPage.value + 1) % totalPages;
};

onMounted(async () => {
  loading.value = true;
  try {
    // Get current user's followings
    followings.value = await getFollowings() || [];
    
    // Get users from the composable
    const { users, fetchUsers } = getusers();
    await fetchUsers();
    
    // Filter out the current user and users that are already followed
    allUsers.value = users.value
      .filter(user => 
        // Filter out current user
        user.username !== currentUser.value && 
        // Filter out users already being followed
        !followings.value.includes(user.username)
      )
      .map(user => ({
        username: user.username,
        id: user.id,
      }));
      
    console.log('Filtered users (not following):', allUsers.value.length);
    
  } catch (error) {
    console.error('Error fetching suggested users:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="sidebar-container">
    <div class="sidebar-card">
      <h5 class="sidebar-title">People to Follow</h5>
      
      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border text-primary spinner-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else class="suggestions-list">
        <div v-for="user in displayedUsers" :key="user.id" class="suggestion-item">
          <div class="suggestion-avatar">
            <div class="pfp">
              {{ user.username ? user.username[0].toUpperCase() : '?' }}
            </div>
          </div>
          <div class="suggestion-info">
            <router-link :to="`/profile/${user.username}`" class="suggestion-name" style="overflow: hidden; text-overflow: ellipsis;">
              {{ user.username.length > 8 ? user.username.slice(0, 8) + '...' : user.username }}
            </router-link>
          </div>
          <Follow 
            v-if="currentUser"
            :target-username="user.username" 
            :current-username="currentUser" 
          />
        </div>
      </div>
      
      <button @click="showNextPage" class="see-more-btn no-shadow">
        Show different users
      </button>
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
  width: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  text-align: center;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 240px; /* Set a consistent minimum height */
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.suggestion-avatar {
  margin-right: 12px;
}

.pfp {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--dark-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  display: block;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.suggestion-name:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

.suggestion-skills {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.follow-btn {
  background-color: var(--color-text);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: none !important;
}

.follow-btn:hover {
  opacity: 0.9;
}

.see-more-btn {
  display: block;
  text-align: center;
  margin: 16px auto 0 auto;
  color: white;
  background-color: var(--color-text);
  font-size: 13px;
  text-decoration: none;
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: none !important;
}

.see-more-btn:hover {
  opacity: 0.9;
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

.follow-container {
  display: flex;
  align-items: center;
}

/* Custom styles to make the Follow button smaller in the sidebar */
:deep(.follow-button) {
  padding: 4px 12px !important;
  font-size: 0.75em !important;
  border-radius: 12px !important;
}
</style>