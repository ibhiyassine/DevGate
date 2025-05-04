<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword, updateProfile, } from "firebase/auth"
import { checkUsername, addUsername } from '@/composables/createNewUser'
import { loginUser } from '@/composables/UserLogin'

const router = useRouter()
const route = useRoute()
const auth = getAuth();

const isLogin = computed(() => route.path === '/login')

const email = ref('')
const FullName = ref('')
const password = ref('')
const username = ref('')
const showPassword = ref(false)
let errorMessage = ref('')

const switchMode = () => {
  if (isLogin.value) {
    router.push('/register')
  } else {
    router.push('/login')
  }
}

async function submitLogReg() {
  if (!username.value || !password.value || (!isLogin.value && !email.value)) {
    errorMessage.value = "Please fill the form correctly"
    return;
  }
  if (isLogin.value) {
    errorMessage.value = await loginUser(username.value, password.value);
    router.replace(`/`);
  }
  else {
    if (await checkUsername(username.value)) {
      createUserWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {
          // Signed up 
          const user = userCredential.user;
          await updateProfile(user, { displayName: username.value });

          await addUsername(username.value, email.value, FullName.value);
          router.replace(`/`);
          // ...
        })
        .catch((error) => {
          errorMessage.value = error.message;

          // ..
        });
    }
    else {
      errorMessage.value = "username already exists";
    }
  }
}
</script>

<template>
  <div class="page-container">
    <div class="navbar">
      <div class="auth-tabs ms-auto">
        <button class="tab-btn" :class="{ active: !isLogin }" @click="router.push('/register')">
          Sign up
        </button>
        <button class="tab-btn" :class="{ active: isLogin }" @click="router.push('/login')">
          Log in
        </button>
      </div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="form-header">
          <h1 class="title">{{ isLogin ? 'Welcome back' : 'Create account' }}</h1>
        </div>

        <form @submit.prevent="submitLogReg" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" type="text" v-model="username" placeholder="Enter your username" required />
          </div>

          <template v-if="!isLogin">
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" v-model="email" placeholder="Enter your email" required />
            </div>
            <div class="form-group">
              <label for="FullName">Full Name</label>
              <input id="FullName" type="FullName" v-model="FullName" placeholder="Enter your full name" required />
            </div>
          </template>

          <div class="form-group">
            <div class="password-header">
              <label for="password">Password</label>
            </div>
            <div class="password-input">
              <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password"
                placeholder="Enter your password" required />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 3 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 3 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="submit-btn">
            {{ isLogin ? 'Log in' : 'Sign up' }}
          </button>

          <div class="terms-text">
            By clicking {{ isLogin ? 'Log in' : 'Sign up' }}, you accept DevGate's
            <a href="#" @click.prevent>Terms of Service</a> and
            <a href="#" @click.prevent>Privacy Policy</a>
          </div>

          <button type="button" class="switch-mode-btn" @click="switchMode">
            {{ isLogin ? ' Create an account' : 'Already have an account? Log in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  background-color: var(--background-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 80px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.auth-tabs {
  display: flex;
  gap: 1.5rem;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem 1rem;
  position: relative;
  opacity: 0.7;
  transition: opacity 0.2s;
  box-shadow: none !important;
}

.tab-btn.active {
  color: var(--primary-color);
  font-weight: 600;
  opacity: 1;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--secondary-color);
}

.tab-btn:hover {
  opacity: 1;
}

.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 2rem;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-size: 1.8rem;
  color: var(--primary-color);
  font-weight: 700;
  margin: 0;
}

.subtitle {
  font-size: 1rem;
  color: var(--primary-color);
  opacity: 0.7;
  margin: 0.5rem 0 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0.5rem;
}

.form-group label {
  display: block;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--primary-color);
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--secondary-color);
  background-color: rgba(255, 255, 255, 0.08);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.forgot-link {
  color: var(--secondary-color);
  text-decoration: none;
  font-size: 0.8rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: black;
  border: none;
  cursor: pointer;
  padding: 0;
  color: white;
  opacity: 0.7;
  box-shadow: none !important;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.toggle-password:hover {
  opacity: 1;
}

.error-message {
  color: #ff5252;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  margin: 0.5rem 0;
  background-color: rgba(255, 82, 82, 0.1);
  border-radius: 4px;
}

.submit-btn {
  width: 100%;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
  box-shadow: none !important;
}

.submit-btn:hover {
  background-color: #0086bd;
}

.terms-text {
  font-size: 0.75rem;
  color: var(--primary-color);
  opacity: 0.7;
  text-align: center;
  margin: 1rem 0;
}

.terms-text a {
  color: var(--secondary-color);
  text-decoration: none;
}

.terms-text a:hover {
  text-decoration: underline;
}

.switch-mode-btn {
  width: 100%;
  background-color: transparent;
  color: var(--primary-color);
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.switch-mode-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
</style>