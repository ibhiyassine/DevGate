<script setup>
import { Timestamp } from "firebase/firestore";

const props = defineProps({
    title: {
        type: String,
        default: "Quizzy"
    },
    createdAt: {
        type: Timestamp,
        default: Timestamp.fromDate(new Date()),
    },
    description: {
        type: String,
        default: "This is some description",
    },
    githubLink: {
        type: String,
        default: "https://github.com",
    },
    modifiedDate: {
        type: Timestamp,
        default: Timestamp.fromDate(new Date()),
    },
    stack: {
        type: Array,
        default: ['git', 'vue', 'sql'],
    }
});
</script>

<template>
    <div class="bg">
        <div class="project-header py-2 px-4">
            <span class="project-icon material-icons"> folder </span>
            <a :href="githubLink" class="fs-5 fw-bold">{{ title }}</a>
        </div>
        <div class="project-content">
            <p class="project-description border p-2 rounded bg-white">{{ description || 'No description available' }}</p>
            <div class="project-stack">
                <span v-for="(tech, idx) in (stack || [])" :key="idx" class="stack-chip">{{ tech }}</span>
            </div>
            <div class="project-dates">
                <span v-if="createdAt" class="date-info">
                    <span class="material-icons">calendar_today</span>
                    {{ createdAt.toDate ? createdAt.toDate().toLocaleDateString() : createdAt }}
                </span>
                <span v-if="modifiedDate" class="date-info">
                    <span class="material-icons">update</span>
                    {{ modifiedDate.toDate ? modifiedDate.toDate().toLocaleDateString() :
                        modifiedDate }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bg{
    background-color: #ececec;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 8px #c9c9c9;
}

a {
    color: black !important;
}

.projects-section {
    margin-top: 20px;
}

ul {
    padding-left: 20px;
}

button {
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
}

.project-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
}

.stack-chip {
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 8px;
    padding: 2px 10px;
    font-size: 0.85em;
}

.project-links {
    margin: 10px 0;
}

.github-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #24292e;
    color: #fff;
    border-radius: 6px;
    padding: 6px 14px;
    text-decoration: none;
    font-size: 0.95em;
    transition: background 0.2s;
}

.github-btn:hover {
    background: #444d56;
}

.project-dates {
    display: flex;
    gap: 15px;
    color: #888;
    font-size: 0.92em;
    margin-top: 8px;
}

.date-info {
    display: flex;
    align-items: center;
    gap: 4px;
}

.project-header {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.project-header:hover {
    background-color: #f5f5f5;
}

.project-title {
    flex: 1;
    margin: 0;
    font-size: 1.1em;
}

.expand-icon {
    color: #666;
    transition: transform 0.2s;
}

.project-content {
    padding: 0 15px 15px 15px;
    border-top: 1px solid #eee;
    margin-top: 10px;
}

</style>