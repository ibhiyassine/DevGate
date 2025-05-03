<script setup>
import ActivityCard from '@/components/ActivityCard.vue';
import FIlterItem from '@/components/FIlterItem.vue';
import NavBarItem from '@/components/NavbarItem.vue';
import { getActivities } from '@/composables/getActivities';
import { getFollowings } from '@/composables/getUserFriend';
import { ref, onMounted, computed, watch } from 'vue';

let followings = ref([]);
let activites = ref([]);
let loading = ref(false);

let skill = ref(true);
let project = ref(true);
let objectif = ref(true);
let friend = ref(false);

let filtered = computed(() => {
  return activites.value.filter((activity) => {
    if(friend.value && !followings.value.includes(activity.user.username)) return false;
    if(!skill.value && activity.type == 'skill') {
      return false;
    };
    if(!project.value && activity.type == 'project') return false;
    if(!objectif.value && activity.type == 'objectif') return false;
    return true;
  });
});

function findId(activity){
  if(activity.hasOwnProperty('skill')){
    return activity.skill.id;
  }
  else if(activity.hasOwnProperty('objectif')){
    return activity.objectif.id;
  }
  else if(activity.hasOwnProperty('project')){
    return activity.project.id;
  }
  return null;
}

onMounted(async () => {
  loading.value = true;
  const [follows, acts] = await Promise.all([
    getFollowings(),
    getActivities()
  ]);
  followings.value = follows;
  activites.value = acts;
  loading.value = false;
});

</script>

<template>
  <main>
    <NavBarItem class="sticky-top" />
    <div class="d-flex flex-column align-items-center" style="width: 50rem; margin: 3rem auto !important;">
      <div class="d-flex justify-content-between align-items-center sticky bg p-3 w-100">
        <span class="fs-1 fw-bold align-self-start text-white">Your feed</span>
        <FIlterItem v-show="!loading" @skill="(s) => skill = s" @objectif="(o) => objectif = o" @project="(p) => project = p" @friend="(f) => friend = f"/>
      </div>
      <div v-if="loading" class="d-flex justify-content-center align-items-center gap-2" style="height: 500px;">
        <div class="spinner-grow text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class="spinner-grow text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class="spinner-grow text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else class="d-flex flex-column gap-3">
        <activity-card v-for="(activity, index) of filtered" v-bind="activity" :key="findId(activity)"/>
      </div>
    </div>
  </main>
</template>

<style lang="css" scoped>
.bg {
  background-color: var(--background-color);
}

.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 80px;
  z-index: 2;
}
</style>