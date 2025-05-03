<script setup>
import SkillSubcard from "@/components/SkillSubcard.vue";
import ProjectSubcard from "@/components/ProjectSubcard.vue";
import ObjectivesSubcard from "./ObjectivesSubcard.vue";
import { get_date_string } from "@/composables/dateString";
import { Timestamp } from "firebase/firestore";
import { computed, ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { AdvancedImage } from '@cloudinary/vue';
import { getPfp, cld } from '../../cloudinary';
import { CloudinaryImage } from '@cloudinary/url-gen';

const props = defineProps({
    type: {
        type: String,
        required: true,
        default: "objectif",
    },
    user: {
        type: Object,
    },
    skill: {
        type: Object,
    },
    project: {
        type: Object,
    },
    objectif: {
        type: Object,
    }
});

const userPfp = ref(null);
const imageLoaded = ref(false);

let date = computed(() => {
    if (props.type === 'skill')
        return get_date_string(props.skill.modifiedDate);
    else if (props.type === 'objectif')
        return get_date_string(props.objectif.modifiedDate);
    else if (props.type === 'project')
        return get_date_string(props.project.modifiedDate);
    else
        return "no date";
});

onMounted(async () => {
  if (props.user && props.user.username) {
    try {
      // Create a direct CloudinaryImage for the user
      const publicId = 'users/' + props.user.username;
      
      // Check if the image exists first
      const response = await fetch(`https://res.cloudinary.com/devgate/image/upload/${publicId}`);
      
      if (response.ok) {
        // Image exists, create a CloudinaryImage instance
        const myImg = cld.image(publicId);
        myImg.format('png');
        
        // Set the image
        userPfp.value = myImg;
        imageLoaded.value = true;
      } else {
        imageLoaded.value = false;
      }
    } catch (error) {
      imageLoaded.value = false;
    }
  }
});
</script>

<template>
    <div class="rounded cardx">
        <div class="d-flex gap-2 p-1">
            <div class="pfp">
                <div>
                    <template v-if="imageLoaded && userPfp">
                        <AdvancedImage :cldImg="userPfp" 
                            class="rounded-circle avatar" />
                    </template>
                    <template v-else>
                        {{ user.username ? user.username[0].toUpperCase() : '?' }}
                    </template>
                </div>
            </div>
            <div>
                <div class="d-flex gap-1 align-items-center">
                    <router-link :to="`/profile/${user.username}`" class="d-block fw-bold text-black router">
                        {{ user.username }}
                    </router-link>
                    <span class="d-block text-secondary" style="font-size: 0.9rem;">did something</span>
                </div>
                <div class="text-secondary" style="font-size: 0.8rem;">
                    {{ date }}
                </div>
            </div>
        </div>
        <!--Here goes the content-->
        <skill-subcard v-if="type == 'skill'" v-bind="skill" />
        <project-subcard v-else-if="type == 'project'" v-bind="project" />
        <objectives-subcard v-else-if="type == 'objectif'" v-bind="objectif" />
    </div>
</template>

<style scoped>
.router {
    color: black !important;
    font-size: 1.2rem;
}

.router:hover {
    color: var(--accent-color) ! important;
    text-decoration: underline;
}

.cardx {
    width: 50rem;
    background-color: var(--primary-color);
    padding: 0.5rem;
}

.pfp {
    font-weight: bold;
    font-size: 1.5rem;
    width: 3.5rem;
    height: 3.5rem;
    background: linear-gradient(135deg, var(--accent-color), var(--dark-color));
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar {
    object-fit: cover;
    width: 100%;
    height: 100%;
}
</style>