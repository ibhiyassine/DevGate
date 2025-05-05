<script setup>
import { get_date_string } from "@/composables/dateString";
import { computed, ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { AdvancedImage } from '@cloudinary/vue';
import { cld } from '../../cloudinary';
import ProjectDetailsModal from './ProjectDetailsModal.vue';

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
const showDetailsModal = ref(false);

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

const cardTitle = computed(() => {
    if (props.type === 'skill')
        return props.skill.title;
    else if (props.type === 'objectif')
        return props.objectif.title;
    else if (props.type === 'project')
        return props.project.title;
    else
        return "";
});

const cardIcon = computed(() => {
    if (props.type === 'skill')
        return "psychology";
    else if (props.type === 'objectif')
        return props.objectif.status === 1 ? "check_circle" : "radio_button_unchecked";
    else if (props.type === 'project')
        return "folder";
    else
        return "help";
});

const cardBadge = computed(() => {
    if (props.type === 'skill') {
        const level = props.skill.level;
        return level === 1 ? 'Beginner' :
               level === 2 ? 'Intermediate' :
               level === 3 ? 'Expert' : 'Beginner';
    }
    else if (props.type === 'objectif') {
        return props.objectif.status === 1 ? 'completed' : 'in progress';
    }
    else if (props.type === 'project') {
        return props.project.stack ? props.project.stack[0] : '';
    }
    else
        return "";
});

const toggleDetails = (event) => {
  if (props.type === 'project') {
    event.stopPropagation();
    event.preventDefault();
    showDetailsModal.value = true;
  }
};

const closeModal = () => {
  showDetailsModal.value = false;
};

onMounted(async () => {
  if (props.user && props.user.username) {
    try {
      const publicId = 'users/' + props.user.username;
      const response = await fetch(`https://res.cloudinary.com/devgate/image/upload/${publicId}`);
      
      if (response.ok) {
        const myImg = cld.image(publicId);
        myImg.format('png');
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
    <div class="grid-card" @click.stop="toggleDetails">
        <div class="card-header">
            <div class="user-info">
                <div class="pfp">
                    <template v-if="imageLoaded && userPfp">
                        <AdvancedImage :cldImg="userPfp" 
                            class="rounded-circle avatar" />
                    </template>
                    <template v-else>
                        {{ user.username ? user.username[0].toUpperCase() : '?' }}
                    </template>
                </div>
                <router-link :to="`/profile/${user.username}`" class="username router">
                    {{ user.username }}
                </router-link>
            </div>
            <span class="date">{{ date }}</span>
        </div>
        
        <div class="card-content">
            <div class="card-icon">
                <span class="material-icons">{{ cardIcon }}</span>
            </div>
            <h4 class="card-title">{{ cardTitle }}</h4>
            <div class="card-badge" :class="{'skill-badge': type === 'skill', 
                                             'objective-badge': type === 'objectif',
                                             'project-badge': type === 'project',
                                             'completed': type === 'objectif' && objectif.status === 1,
                                             'in-progress': type === 'objectif' && objectif.status !== 1}">
                {{ cardBadge }}
            </div>
        </div>
        
        <div class="card-footer" :class="{
            'skill-footer': type === 'skill',
            'project-footer': type === 'project',
            'objective-footer': type === 'objectif',
            'objective-completed-footer': type === 'objectif' && objectif.status === 1
        }">
            <span class="activity-type">{{ type }}</span>
        </div>

        <ProjectDetailsModal 
            v-if="type === 'project'" 
            :show="showDetailsModal" 
            :project="project" 
            @close="closeModal"
        />
    </div>
</template>

<style scoped>
.grid-card {
    position: relative;
    width: 280px;
    height: 300px;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
    transition: transform 0.2s;
    cursor: pointer;
    z-index: 1;
}

.grid-card:hover {
    transform: translateY(-5px);
}

.card-header {
    padding: 10px;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #eee;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
}

.pfp {
    font-weight: bold;
    font-size: 1rem;
    width: 2.5rem;
    height: 2.5rem;
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

.username {
    font-weight: bold;
    font-size: 0.9rem;
    color: black;
    text-decoration: none;
}

.router:hover {
    color: var(--accent-color) !important;
    text-decoration: underline;
}

.date {
    font-size: 0.75rem;
    color: #888;
}

.card-content {
    flex: 1;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.card-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #e3f2fd;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
}

.material-icons {
    font-size: 24px;
    color: #1976d2;
}

.card-title {
    margin: 0 0 10px 0;
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-badge {
    border-radius: 12px;
    padding: 4px 12px;
    font-size: 0.75rem;
    font-weight: 500;
}

.skill-badge {
    background: #e3f2fd;
    color: #1976d2;
}

.objective-badge {
    background: #fff3e0;
    color: #f57c00;
}

.objective-badge.completed {
    background: #e6f4ea;
    color: #1e7e34;
}

.project-badge {
    background: #e8eaf6;
    color: #3f51b5;
}

.card-footer {
    padding: 10px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: center;
}

.activity-type {
    font-size: 0.75rem;
    text-transform: capitalize;
    font-weight: 500;
    color: white;
}

.skill-footer {
    background-color: #1976d2;
}

.project-footer {
    background-color: #3f51b5;
}

.objective-footer {
    background-color: #f57c00;
}

.objective-completed-footer {
    background-color: #1e7e34;
}
</style>