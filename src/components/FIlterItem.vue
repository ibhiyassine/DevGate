<script setup>
import { getActivities } from '../composables/getActivities'
import { onMounted } from 'vue'

onMounted(async () => {
  const activities = await getActivities()
  console.log(activities)
})
</script>

<template>
  <div class="dropdown ">
    <a
      class="btn btn-secondary dropdown-toggle filter"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      Filter
    </a>

    <ul class="dropdown-menu">
      <li>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="check1" checked />
          <label class="form-check-label position-relative w-100" for="check1">
    By Skills
    <span class="material-icons position-absolute end-0">psychology</span>
</label>
        </div>
      </li>
      <li>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="check2" checked />
          <label class="form-check-label position-relative w-100" for="check2"> By Objectifs </label>
          <span class="material-icons position-absolute end-0"> calendar_month </span>
        </div>
      </li>
      <li>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="check3" checked />
          <label class="form-check-label position-relative w-100" for="check3"> By projects </label>
          <span class="material-icons position-absolute end-0"> work </span>
        </div>
      </li>
      <li>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="check3" checked />
          <label class="form-check-label position-relative w-100" for="check3"> By Friends </label>
          <span class="material-icons position-absolute end-0"> diversity_3 </span>
        </div>
      </li>
    </ul>
  </div>
</template>
<style  scoped>
.filter {
  width: 150px;
  background-color: var(--secondary-color);
  box-shadow: none !important;
  text-decoration: none !important;
}
.form-check {
  display: flex;
  min-height: 1.5rem;
  padding-left: 1.5em;
  margin-bottom: 0.125rem;
  gap: 10px;
  margin-left: 6px;
}

.form-check-input {
  box-shadow: none !important;
}

.form-check-input:checked {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.form-check-input:focus {
  box-shadow: none;
  border-color: var(--secondary-color);
}
</style>