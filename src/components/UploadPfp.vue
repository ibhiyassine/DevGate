<script setup>
import { auth } from '@/firebase';
import { onMounted } from 'vue';


const username = auth.currentUser ? auth.currentUser.displayName : 'default_username';

const widget = window.cloudinary.createUploadWidget(
    {
        cloudName: 'devgate',
        uploadPreset: 'users_pfp',
        multiple: false,
        maxImageFileSize: 2000000,
        folder: 'users',
        cropping: true,
        croppingAspectRatio: 1,
        public_id: username,
    },
    (error, result) => {
        if (error) {

            return;
        }

    }
);

function openWidget() {
    widget.open();
}

onMounted(() => {
    openWidget();
})

</script>

<template>

</template>

<style scoped></style>