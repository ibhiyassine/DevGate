<!-- eslint-disable no-unused-vars -->
<script setup>
const props = defineProps({
    value: {
        type: String,
        required: true,
        default: "aya",
    },
    username: {
        type: String,
        default: "aya"
    }
})
</script>

<template>

    <div class="w-100 p-2 d-flex gap-lg-1 border-bottom  ">
        <router-link  :to="`/profile/${username}`"
            class="d-flex gap-4 text-decoration-none align-items-center"><img src="../assets/user.png" width="30"
                class="rounded-circle d-block"> <span class="d-block link"> u/{{ value }} </span></router-link>
    </div>

</template>

<style scoped>
.link {
    font-weight: bold;
    color: black;
    text-decoration: none;
}

.link:hover {
    color: var(--secondary-color);
}
</style>