<script setup>
import SkillSubcard from "@/components/SkillSubcard.vue";
import ProjectSubcard from "@/components/ProjectSubcard.vue";
import ObjectivesSubcard from "./ObjectivesSubcard.vue";
import { get_date_string } from "@/composables/dateString";
import { Timestamp } from "firebase/firestore";
import { computed } from "vue";
import { RouterLink } from "vue-router";
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

let date = computed(() => {
    if(props.type === 'skill')
        return get_date_string(props.skill.modifiedDate);
    else if(props.type === 'objectif')
        return get_date_string(props.objectif.modifiedDate);
    else if(props.type === 'project')
        return get_date_string(props.project.modifiedDate);
    else
        return "no date";
    });
</script>

<template>
    <div class="rounded cardx">
        <div class="d-flex gap-2 p-1">
            <div class="pfp">
                A
            </div>
            <div>
                <div class="d-flex gap-1 align-items-center">
                    <router-link :to="`/profile/${user.username}`" class="d-block fw-bold text-black router">
                        {{ user.username }}
                    </router-link>
                    <span class="d-block text-secondary" style="font-size: 0.9rem;">modified something</span>
                </div>
                <div class="text-secondary" style="font-size: 0.8rem;">
                    {{ date }}
                </div>
            </div>
        </div>
        <!--Here goes the content-->
        <skill-subcard v-if="type=='skill'" v-bind="skill" />
        <project-subcard v-else-if="type=='project'" v-bind="project"/>
        <objectives-subcard v-else-if="type=='objectif'" v-bind="objectif"/>
    </div>
</template>

<style scoped>
.router {
    color: black !important;
    font-size: 1.2rem;
}
.router:hover{
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
}
</style>