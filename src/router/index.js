import { createRouter, createWebHistory } from 'vue-router'
import { db, auth } from '@/firebase'
import {doc, getDoc} from 'firebase/firestore'
import HomeView from '../views/HomeView.vue'
import LoginForm from '@/components/LoginForm.vue'
import Profile from '@/components/Profile.vue'
import DashboardView from '../views/DashboardView.vue'




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
    },
    {
      path: '/dashboard',
      name:'dashboard',
      component:DashboardView
    }
  ],
})
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!auth.currentUser;

  if (to.name === "dashboard") {
      auth.onAuthStateChanged(async (user) => {
          if (!user) {
             next({name: "login"});
          } 
      });
  } 
  else if ((to.name === "profile" || to.name === "home") && !isAuthenticated) {  
      // Wait for Firebase to initialize auth state
      auth.onAuthStateChanged((user) => {
          if (user) {
              next(); // Proceed if the user is authenticated
          } else {
              next({ name: "login" }); // Redirect to login if not authenticated
          }
      });
  }
  else if((to.name==="profile" && auth.currentUser.displayName == to.params.username)){

    console.log(auth.currentUser.displayName,to.params.username);
    next({name : "dashboard"});

  }
  else {
      next(); // Proceed for all other routes
  }
});

export default router
