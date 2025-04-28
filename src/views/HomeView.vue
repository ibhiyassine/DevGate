<script setup>
import ActivityCard from '@/components/ActivityCard.vue';
import NavBarItem from '@/components/NavbarItem.vue';
import { getFollowings } from '@/composables/getUserFriend';
import { ref, onMounted } from 'vue';

let followings = ref([]);

onMounted(async () => {
  followings.value = await getFollowings();
  console.log(followings.value)
})
</script>

<template>
  <main>
    <NavBarItem class="sticky-top"/>
    <div class="d-flex flex-column align-items-center" style="width: 50rem; margin: 3rem auto !important;">
      <div class="fs-1 fw-bold align-self-start text-white sticky bg p-3 w-100">
        Your feed
      </div>
      <div class="d-flex flex-column gap-3">
        <activity-card type="skills"/>
        <activity-card type="objectives"/>
        <activity-card type="projects"/>
        <activity-card type="skills"/>
        <activity-card type="objectives"/>
        <activity-card type="projects"/>
        <activity-card type="skills"/>
        <activity-card type="objectives"/>
        <activity-card type="projects"/>
      </div>
    </div>
  </main>
</template>

<style lang="css" scoped>
.bg{
  background-color: var(--background-color);
}
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 80px;
  z-index: 1020;
}
</style>


