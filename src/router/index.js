import { createRouter, createWebHistory } from 'vue-router'
import { db, auth } from '@/firebase'
import {doc, getDoc} from 'firebase/firestore'
import HomeView from '../views/HomeView.vue'
import LoginForm from '@/components/LoginForm.vue'
import Profile from '@/components/Profile.vue'
import DashboardView from '../views/DashboardView.vue'
import { authStateListener } from '@/composables/authStateListener'
import VisualizationItem from '@/components/VisualizationItem.vue'
import VisualizationItemProject from '@/components/VisualizationItemProject.vue'
import VisualizationItemObjectives from '@/components/VisualizationItemObjectives.vue'




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
    },
    {
      path: '/skillVisualization/:username',
      name:'skillVisualization',
      component:VisualizationItem
    },
    {
      path: '/projectVisualization/:username',
      name:'projectVisualization',
      component:VisualizationItemProject
    },
    {
      path: '/objectiveVisualization/:username',
      name:'objectiveVisualization',
      component:VisualizationItemObjectives
    }
  ],
})
router.beforeEach((to, from, next) => {
  if (to.name === "dashboard") {
    authStateListener((user) => {
      if(!user){
        next({name: "login"});
      }
      else{
        next();
      }
    })
  } 
  else if ((to.name === "home")) {  
      // Wait for Firebase to initialize auth state
      auth.onAuthStateChanged((user) => {
          if (user) {
              next(); // Proceed if the user is authenticated
          } else {
              next({ name: "login" }); // Redirect to login if not authenticated
          }
      });
  }
  else if((to.name==="profile")){
    authStateListener((user) => {
      if(user && auth.currentUser.displayName === to.params.username){
        next({name : "dashboard"});
      }
      else{
        next();
      }
    });
  }
  else {
      next(); // Proceed for all other routes
  }
});

export default router
