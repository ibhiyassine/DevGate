<script setup>
import SearchBar from './SearchBar.vue';
import { onMounted, ref } from 'vue';
import { authStateListener } from '@/composables/authStateListener';
import { useRouter } from 'vue-router';
import { logout } from '@/composables/userLogout';

let username = ref('');
const see = ref(false);
const router = useRouter();

function defineUsername(u) {
  if (u && u.displayName) {
    username.value = u.displayName;
  }
}

onMounted(async () => {
  await authStateListener(defineUsername);
});

function logoutUser() {
  logout();
  router.push('/login');
}

function toggleUserInfo() {
  see.value = !see.value;
}
</script>

<template>
  <div class="navbar-wrapper  sticky-top">
    <div class="navbar navbar-expand d-flex justify-content-between align-items-center">


      <div class="d-flex gap-2 align-items-center w-100 p-2">
        <router-link to="/">
          <img src="../assets/logo3.png" width="140px" height="70px" alt="Logo" />
        </router-link>
        <search-bar />
      </div>


      <div class="d-flex align-items-center me-4 position-relative">
        <span class="material-icons hvr" style="font-size: 60px; cursor: pointer; color:var(--primary-color)"
          @click="router.push('/dashboard')">
          account_circle
        </span>
        <button class="bg-danger shadow-none rounded-circle logout d-flex align-items-center justify-content-center">
          <span class="material-icons" style="cursor: pointer; font-size: 30px; transform: translateX(2px);"
            @click="logoutUser()">
            logout
          </span>
        </button>

        <div v-if="see" class="user-info-popup position-absolute ">
          <user-info :username="username" />
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--text-color);
  height: 80px;
  padding: 0 20px;
}

.hvr {
  transition: color 0.3s ease;
}

.hvr:hover {
  color: var(--secondary-color) !important;
}

.border-blue {
  border-color: var(--secondary-color) !important;
}

.user-info-popup {
  top: 100%;
  right: 0;
  background-color: white;
  border: 2px solid #1d3c45;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  height: 300px;
  z-index: 1001;
  width: 300px;
}

.logout {
  height: 50px;
  width: 50px;
}
</style>