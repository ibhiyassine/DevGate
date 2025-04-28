<script setup>
import { get_date_string } from "@/composables/dateString";
import { Timestamp } from "firebase/firestore";
import { computed } from "vue";

const props = defineProps({
    title: {
        type: String,
        default: "Coding",
    },
    level: {
        type: Number,
        default: 2,
    },
    createdAt: {
        type: Timestamp,
        default: Timestamp.fromDate(new Date()),
    },
    modifedDate: {
        type: Timestamp,
        default: Timestamp.fromDate(new Date()),
    },
});

let date = computed(() => get_date_string(props.modifedDate));
</script>

<template>
    <div class="skill-card p-2 m-2 border rounded bg">
        <div class="skill-icon">
            <span class="material-icons"> psychology</span>
        </div>
        <div class="skill-content w-100">
            <div class="skill-header">
                <h4>{{ title }}</h4>
            </div>
            <div class="skill-level">
                <span class="level-text">{{
                    level === 1 ? 'Beginner' :
                        level === 2 ? 'Intermediate' :
                            level === 3 ? 'Expert' : 'Beginner'
                }}</span>
                <div class="progress-bar">
                    <div class="progress" :style="{ width: `${(level || 1) * 33.33}%` }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bg {
    background-color: #ececec;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 8px #c9c9c9;
}

.skill-card {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.skill-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e3f2fd;
    display: flex;
    align-items: center;
    justify-content: center;
}

skill-content {
    flex: 1;
}

.skill-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.skill-badge {
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 8px;
    padding: 2px 10px;
    font-size: 0.85em;
}

.skill-meta {
    color: #888;
    font-size: 0.92em;
    margin-bottom: 6px;
}

.skill-level {
    display: flex;
    align-items: center;
    gap: 10px;
}

.progress-bar {
    width: 100%;
    height: 10px;
    background-color: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
}

.progress {
    height: 100%;
    background-color: #4CAF50;
}

.level-text {
    font-size: 0.9em;
    font-weight: bold;
}
</style>