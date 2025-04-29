<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { authStateListener } from '@/composables/authStateListener';

const props = defineProps({
  followers: {
    type: Array,
    default: () => []
  },
  username: {
    type: String,
    required: true
  }
});

const showModal = ref(false);
const currentUser = ref(null);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const removeFollower = async (followerUsername) => {
  try {
    const userRef = doc(db, 'users', props.username);
    const followerRef = doc(db, 'users', followerUsername);
    
    // Remove from user's followers
    await updateDoc(userRef, {
      followers: arrayRemove(followerRef)
    });
    
    // Remove from follower's followings
    await updateDoc(followerRef, {
      followings: arrayRemove(userRef)
    });

    // Update local state immediately
    const index = props.followers.findIndex(follower => follower.id === followerUsername);
    if (index !== -1) {
      props.followers.splice(index, 1);
    }
  } catch (error) {
    console.error('Error removing follower:', error);
  }
};

onMounted(() => {
  authStateListener((user) => {
    currentUser.value = user;
  });
});
</script>

<template>
  <span class="stat followers-stat"  @click="openModal" style="cursor:pointer; color: white;">
    <span class="material-icons">group</span>
    {{ followers?.length || 0 }} Followers
  </span>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Followers</h3>
      <button class="close-btn" @click="closeModal">&times;</button>
      <ul v-if="followers?.length" class="followers-list">
        <li v-for="follower in followers" :key="follower" class="follower-item">
          <RouterLink :to="'/profile/' + follower.id" @click="closeModal">
            <span class="material-icons">person</span>
            {{ follower.id }}
          </RouterLink>
          <button 
            v-if="currentUser?.displayName?.toLowerCase().replace(/\s+/g, '') === props.username"
            class="delete-btn"
            @click="removeFollower(follower.id)"
          >
            Remove
          </button>
        </li>
      </ul>
      <p class="text-black-50" v-else>No followers yet.</p>
    </div>
  </div>
</template>

<style scoped>
.followers-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--secondary-color);
  color: white;
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
  box-shadow: none;
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
  overflow-y: scroll;
  scrollbar-width: none;
}

.follower-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.follower-item a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--primary-color);
  color: var(--accent-color);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  flex-grow: 1;
}

.follower-item a:hover {
  background: rgb(105, 105, 215);
  color: var(--dark-color);
  transform: translateX(5px);
}

.follower-item .material-icons {
  color: #666;
  font-size: 1.2em;
}

.delete-btn {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background: #c82333;
}
</style> 