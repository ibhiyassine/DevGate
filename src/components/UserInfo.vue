<script setup>
import { ref, onMounted } from 'vue';
import { fetchUser } from '@/composables/fetchData';
import { useRouter } from 'vue-router';

const props = defineProps({
  username: {
    type: String,
    required: true
  }
});

const router = useRouter();
const user = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    if (props.username) {
      loading.value = true;
      user.value = await fetchUser(props.username);
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
  } finally {
    loading.value = false;
  }
});

const navigateToProfile = () => {
  router.push(`/profile/${props.username}`);
};
</script>

<template>
  <div class="user-info-container p-3">
    <div v-if="loading" class="text-center">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="user" class="d-flex flex-column">
      <div class="d-flex align-items-center mb-3">
        <div class="user-avatar">
          {{ user.username ? user.username[0].toUpperCase() : '?' }}
        </div>
        <div class="ms-3">
          <h5 class="mb-0">{{ user.username }}</h5>
          <small class="text-muted">{{ user.email || 'No email provided' }}</small>
        </div>
      </div>
      
      <div class="user-stats mb-3">
        <div class="stat-item">
          <span class="material-icons">psychology</span>
          <div>
            <strong>{{ user.skills?.length || 0 }}</strong>
            <span>Skills</span>
          </div>
        </div>
        <div class="stat-item">
          <span class="material-icons">folder</span>
          <div>
            <strong>{{ user.projects?.length || 0 }}</strong>
            <span>Projects</span>
          </div>
        </div>
      </div>
      
      <button @click="navigateToProfile" class="view-profile-btn">
        View Full Profile
      </button>
    </div>
    
    <div v-else class="text-center text-muted">
      User not found
    </div>
  </div>
</template>

<style scoped>
.user-info-container {
  border-radius: 8px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color, #1d3c45), var(--dark-color, #0b232a));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.user-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item .material-icons {
  color: var(--secondary-color, #1d3c45);
  font-size: 20px;
}

.stat-item div {
  display: flex;
  flex-direction: column;
}

.stat-item strong {
  font-size: 14px;
  line-height: 1;
}

.stat-item span {
  font-size: 12px;
  color: #777;
}

.view-profile-btn {
  background-color: var(--secondary-color, #1d3c45);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-profile-btn:hover {
  background-color: var(--accent-color, #0b232a);
}
</style>