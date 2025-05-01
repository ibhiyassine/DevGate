<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import SkillsDashboard from '../components/SkillsDashboard.vue'
import ProjectsDashboard from '../components/ProjectsDashboard.vue'
import ObjectivesDashboard from '../components/ObjectivesDashboard.vue'
import ProfileInfo from '../components/ProfileInfo.vue'
import NavbarItem from '../components/NavbarItem.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import VisualizationItem from '../components/VisualizationItem.vue'



const route = useRoute()
const userData = ref(null)
const loading = ref(true)
const error = ref(null)


const auth = getAuth()
const currentUser = ref(null)

onMounted(async () => {
  await new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser.value = user.displayName
      } else {
        currentUser.value = null
      }
      resolve()
    })
  })

  await fetchUserData() 
})
const fetchUserData = async () => {
    
    try {
        loading.value = true
        error.value = null
        if (!currentUser.value) {
            error.value = 'No user is currently logged in'
            userData.value = null
            return
        }
        const userDoc = await getDoc(doc(db, 'users', currentUser.value))
        
        if (!userDoc.exists()) {
            error.value = 'User not found'
            userData.value = null
            return
        }
        
        userData.value = userDoc.data()
    } catch (err) {
        console.error('Error fetching user data:', err)
        error.value = 'Error loading user data'
    } finally {
        loading.value = false
    }
}

watch(() => currentUser.value, fetchUserData)

</script>

<template>
  <NavbarItem />
  <div class="profile ">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>    
    
    <div v-else-if="error" class="error">
      <div class="error-container">
        <div class="error-icon">!</div>
        <p>{{ error }}</p>
        <RouterLink to="/" class="back-link">Back to Home</RouterLink>
      </div>
    </div>
    
    <div v-else-if="userData" class="user-info">
      <div class="profile-layout">
        <ProfileInfo :userData="userData" :isDashboard="true"/>
        
        <!-- Right Column - Sections -->
        <div class="profile-right">
          <div class="section-card">
            <SkillsDashboard :username="currentUser" />
          </div>
          <div class="section-card">
            <ProjectsDashboard :username="currentUser" />
          </div>
          <div class="section-card">
            <ObjectivesDashboard :username="currentUser" />
          </div>
        </div>
      </div>
     

    </div>
  </div>
  
</template>

<style scoped>

.profile {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 40px 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--secondary-color);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  max-width: 400px;
  margin: 100px auto;
  text-align: center;
  padding: 40px;
  background: var(--primary-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #dc3545;
  color: #fff;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  margin: 0 auto 20px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: var(--accent-color);
  text-decoration: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  background-color: var(--secondary-color);
  transition: var(--transition);
}

.back-link:hover {
  background-color: var(--accent-color);
  color: #fff;
  transform: translateY(-2px);
}

.user-info {
  max-width: 1400px;
  margin: 0 auto;
}

.profile-layout {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 30px;
  align-items: start;
}

.profile-right {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-card {
  background: var(--primary-color);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 119, 192, 0.1);
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile {
    padding: 20px;
  }

  .section-card {
    padding: 20px;
  }
}

</style>
