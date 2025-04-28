<script setup>
import { ref } from 'vue';

const props = defineProps({
  followings: {
    type: Array,
    default: () => []
  }
});

const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<template>
  <span class="stat following-stat" @click="openModal" style="cursor:pointer;">
    <span class="material-icons">people</span>
    {{ followings?.length || 0 }} Following
  </span>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Following</h3>
      <button class="close-btn" @click="closeModal">&times;</button>
      <ul v-if="followings?.length" class="followers-list">
        <li v-for="following in followings" :key="following" class="follower-item">
          <RouterLink :to="'/profile/' + following.id" @click="closeModal">
            <span class="material-icons">person</span>
            {{ following.id }}
          </RouterLink>
        </li>
      </ul>
      <p v-else>Not following anyone yet.</p>
    </div>
  </div>
</template>

<style scoped>
.following-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--secondary-color);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.95em;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--primary-color);
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  min-width: 300px;
  max-width: 90vw;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2em;
  color: #888;
  cursor: pointer;
}

.close-btn:hover {
  color: #dc3545;
}

.followers-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  max-height: 300px;
  overflow-y: auto;
}

.follower-item {
  margin-bottom: 10px;
}

.follower-item a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--secondary-color);
  border-radius: 8px;
  text-decoration: none;
  color: var(--dark-color);
  transition: all 0.2s ease;
}

.follower-item a:hover {
  background: var(--primary-color);
  color: var(--accent-color);
  transform: translateX(5px);
}

.follower-item .material-icons {
  color: #666;
  font-size: 1.2em;
}
</style> 