<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getusers } from '@/composables/getUsers';
import SearchSuggestionItem from './SearchSuggestionItem.vue';

const search = ref("");
const suggestionsRef = ref(null);
const inputref = ref(null);
const cliick = ref(false);

const { users, fetchUsers } = getusers();

onMounted(async () => {
  await fetchUsers();
  // Add event listener for clicks outside the search component
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const filteredUsers = computed(() => {
  if (!search.value || !users.value) return [];
  return users.value.filter(user =>
    user.username.toLowerCase().includes(search.value.toLowerCase())
  );
});

const handleClickOutside = (event) => {
  if (suggestionsRef.value && !suggestionsRef.value.contains(event.target) &&
    inputref.value && !inputref.value.contains(event.target)) {
    cliick.value = false;
  }
};

const handleBlur = () => {
  setTimeout(() => {
    cliick.value = false;
  }, 200);
};

const setSuggestionsRef = (el) => {
  suggestionsRef.value = el;
};
</script>

<template>
  <div class="mx-3 rounded-1 bg-white z-1 search-bar-container" style="width: 40%;">
    <div class="position-relative">
      <span class="material-icons position-absolute top-50 start-0 translate-middle-y ps-2 text-muted"
        style="color: black;">search</span>
      <input class="form-control ps-5 rounded border-0" type="text" placeholder="Search for people"
        style="height: 50px;" v-model="search" ref="inputref" @focus="cliick = true" @blur="handleBlur"
        @input="cliick = search.trim().length > 0" />
    </div>

    <div v-show="search.trim().length > 0 && cliick" ref="setSuggestionsRef"
      class="shadow-lg rounded mt-2 p-2 suggestion-item overflow-y-scroll" style="max-height: 300px;">
      <div v-if="filteredUsers.length">
        <h6 class="text-muted px-2">Users</h6>
        <SearchSuggestionItem v-for="(user, index) in filteredUsers" :key="index" :value="user.username"
          :username="user.username" />
      </div>
      <div v-else class="text-center py-3 text-muted">
        No users found
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-y-scroll {
  overflow-y: scroll !important;
}

.search-bar-container {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

input[type="text"] {
  background-color: rgb(185, 200, 232);
}

input[type="text"]:focus {
  background-color: white;
  color: black;
  font-weight: 500;
  border: 2px solid var(--secondary-color);
  outline: none;
  box-shadow: 0 0 0 0.25rem var(--secondary-color);
}

.suggestion-item {
  background-color: white;
  position: absolute;
  width: 100%;
  left: 0;
  z-index: 1001;
}
</style>