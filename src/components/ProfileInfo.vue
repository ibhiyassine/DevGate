<script setup>
import FollowersList from './FollowersList.vue'
import FollowingsList from './FollowingsList.vue'
import Follow from './Follow.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { authStateListener } from '@/composables/authStateListener'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  isDashboard: {
    type: Boolean,
    default: false
  }
})

const isEditingBio = ref(false)
const isEditingHours = ref(false)
const editedBio = ref('')
const editedHours = ref(0)
const currentBio = ref('')
const currentHours = ref(0)
let unsubscribe = null
const currentUser = ref(null)

const startEditingBio = () => {
  editedBio.value = currentBio.value
  isEditingBio.value = true
}

const startEditingHours = () => {
  editedHours.value = currentHours.value
  isEditingHours.value = true
}

const cancelEditingBio = () => {
  isEditingBio.value = false
  editedBio.value = ''
}

const cancelEditingHours = () => {
  isEditingHours.value = false
  editedHours.value = 0
}

const updateBio = async () => {
  try {
    const userRef = doc(db, 'users', props.userData.username)
    await updateDoc(userRef, {
      bio: editedBio.value,
      modifiedDate: new Date()
    })
    isEditingBio.value = false
  } catch (err) {
    console.error('Error updating bio:', err)
  }
}

const updateHours = async () => {
  try {
    const userRef = doc(db, 'users', props.userData.username)
    await updateDoc(userRef, {
      programCounter: parseInt(editedHours.value),
      modifiedDate: new Date()
    })
    currentHours.value = parseInt(editedHours.value)
    isEditingHours.value = false
  } catch (err) {
    console.error('Error updating programming hours:', err)
  }
}

const setupUserListener = () => {
  if (unsubscribe) {
    unsubscribe()
  }

  const userRef = doc(db, 'users', props.userData.username)
  unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      currentBio.value = doc.data().bio || ''
      currentHours.value = doc.data().programCounter || 0
    }
  })
}

const handleFollow = (username) => {
  const followers = Array.isArray(props.userData.followers) ? [...props.userData.followers] : [];
  
  const existingFollower = followers.find(follower => follower.id === username);
  
  if (!existingFollower) {
    followers.push({ id: username });
    
    props.userData.followers = followers;
    
    if (props.userData.followersCount === undefined) {
      props.userData.followersCount = 1;
    } else {
      props.userData.followersCount++;
    }
  }
}

const handleUnfollow = (username) => {
  if (Array.isArray(props.userData.followers)) {
    const followers = props.userData.followers.filter(follower => follower.id !== username);
    
    props.userData.followers = followers;
    
    if (props.userData.followersCount > 0) {
      props.userData.followersCount--;
    }
  }
}
onMounted(() => {
  setupUserListener()
  authStateListener((user) => {
    currentUser.value = user
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <div class="profile-left">
    <div class="profile-header">
      <div class="profile-avatar">
        {{ userData.username ? userData.username[0].toUpperCase() : '?' }}
      </div>
      <div class="profile-details">
        <h1>{{ userData.fullname }}</h1>
        <div class="username-section">
          <span class="username-badge">@{{ userData.username }}</span>
          <Follow 
            v-if="!isDashboard && currentUser" 
            :targetUsername="userData.username" 
            :currentUsername="currentUser.displayName.toLowerCase().replace(/\s+/g, '')"
            @follow="handleFollow(currentUser.displayName.toLowerCase().replace(/\s+/g, ''))"
            @unfollow="handleUnfollow(currentUser.displayName.toLowerCase().replace(/\s+/g, ''))"
          />
        </div>
        <div class="bio-section">
          <template v-if="isEditingBio">
            <input 
              v-model="editedBio" 
              class="bio-edit" 
              placeholder="Enter your bio"
              rows="3"
            >
            <div class="bio-actions">
              <button @click="updateBio" class="save-btn">Save</button>
              <button @click="cancelEditingBio" class="cancel-btn">Cancel</button>
            </div>
          </template>
          <template v-else>
            <p v-if="currentBio" class="bio">{{ currentBio }}</p>
            <p class="bio" v-else>No bio is available</p>
            <div v-if="isDashboard" @click="startEditingBio" class="edit-bio-btn">
              <span class="material-icons ">edit</span>
            </div>
          </template>
        </div>
        <p class="email" v-if="!isDashboard">
          <a  :href="`mailto:${userData.email}`">Contact the person!</a>
        </p>
        <div class="profile-stats">
          <FollowersList 
            :followers="userData.followers || []" 
            :username="userData.username"
          />
          <FollowingsList 
            :followings="userData.followings || []" 
            :username="userData.username"
          />

          <span class="stat">
            <span class="material-icons">code</span>
            <div class="programming-hours">
              <template v-if="isEditingHours">
                <input 
                  type="number" 
                  v-model="editedHours" 
                  class="hours-input"
                  min="0"
                />
                <div class="hours-actions">
                  <button @click="updateHours" class="save-btn">Save</button>
                  <button @click="cancelEditingHours" class="cancel-btn">Cancel</button>
                </div>
              </template>
              <template v-else>
                <span class="hours">{{ currentHours }}</span>
                <span class="label">hours</span>
                <!--
                  <button 
                    v-if="isDashboard" 
                    @click="startEditingHours" 
                    class="edit-hours-btn"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                -->
              </template>
            </div>
          </span>
          <span class="stat">
            <span class="material-icons">calendar_today</span>
            Member since {{ userData.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString() : (userData.createdAt || 'N/A') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-left {
  position: sticky;
  top: 20px;
}

.profile-header {
  background: var(--primary-color);
  padding: 40px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--accent-color), var(--dark-color));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3em;
  font-weight: bold;
  margin: 0 auto 20px;
}

.profile-details {
  text-align: center;
}

.profile-details h1 {
  color: var(--dark-color);
  margin: 0 0 15px 0;
  font-size: 1.8em;
}

.username-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.username-badge {
  color: var(--accent-color);
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.95em;
}

.bio-section {
  position: relative;
  margin: 0 0 15px 0;
}

.bio {
  color: var(--dark-color);
  font-size: 1.1em;
  line-height: 1.6;
  margin: 0;
}

.bio-edit {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background: var(--background-color);
  color: ver(--text-color);
  font-size: 1.1em;
  line-height: 1.6;
  resize: vertical;
  min-height: 100px;
  background-color: #ececec;
}

.bio-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  box-shadow: none !important;
}

.save-btn {
  background: var(--accent-color);
  color: white;
}

.cancel-btn {
  background: var(--secondary-color);
  color: var(--text-color);
}

.edit-bio-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  
  border-radius: 4px;
  color: rgb(125, 120, 120);
  box-shadow: none !important;
}


.edit-bio-btn:hover {
  color: green;

}

.email {
  color: var(--accent-color);
  margin: 0;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.email::before {
  content: "✉";
  font-size: 1.2em;
}

.profile-stats {
  display: flex;
  color: white;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.profile-stats .stat {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--secondary-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.95em;
}

.programming-hours {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
}

.hours-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid var(--secondary-color);
  border-radius: 4px;
  background: var(--background-color);
  color: white;
  text-align: center;
}

.hours-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.hours-actions button {
  padding: 4px 8px;
  font-size: 0.8em;
}

.edit-hours-btn {
  position: absolute;
  top: 0;
  right: -25px;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-hours-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.profile-details .email {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin: 0 0 10px 0;
}

.profile-details .email a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.2s;
}

.profile-details .email a:hover {
  color: var(--dark-color);
  text-decoration: underline;
}

:deep(.follow-button) {
  padding: 6px 16px;
  font-size: 0.9em;
  margin: 0;
}

@media (max-width: 1024px) {
  .profile-left {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-header {
    padding: 30px 20px;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
    font-size: 2.5em;
  }

  .profile-details h1 {
    font-size: 1.5em;
  }
}
</style>