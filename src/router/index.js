import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginForm from '@/components/LoginForm.vue'
import Profile from '@/components/Profile.vue'

console.log('Router configuration loaded');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path:'/login',
      name:'login',
      component:LoginForm,
    },
    {
      path: '/register',
      name: 'register',
      component: LoginForm
    },
    {
      path: '/profile/:username',
      name: 'profile',
      component: Profile,
      props: true
    }
  ],
})

export default router
