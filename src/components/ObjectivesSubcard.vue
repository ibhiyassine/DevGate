<script setup>
import { get_date_string } from '@/composables/dateString';
import { Timestamp } from 'firebase/firestore';
import { computed } from 'vue';
const props = defineProps({
    createdAt: {
        type: Timestamp,
        default: Timestamp.fromDate(new Date()),
    },
    modifiedDate: {
        type: Timestamp,
        default: Timestamp.fromDate(new Date()),
    },
    status: {
        type: Number,
        default: 1,
    },
    title: {
        type: String,
        default: "Some objectives"
    }
});
const date = computed(() => {
    return get_date_string(props.modifiedDate);
});
</script>

<template>
    <div class="objective-item bg" :class="{ 'completed': status === 1 }">
        <div class="objective-header">
            <div class="objective-left">
                <span class="material-icons status-icon">
                    {{ status === 1 ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                <h4>{{ title }}</h4>
                <span class="objective-badge" :class="status === 1 ? 'completed' : 'in-progress'">
                    {{ status === 1 ? 'completed' : 'in progress' }}
                </span>
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

.objectives-section {
    margin-top: 20px;
}

.objective-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
}

.objective-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.objective-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.status-icon {
    color: #666;
    font-size: 22px;
}

.objective-item.completed .status-icon {
    color: #4CAF50;
}

h4 {
    margin: 0;
    font-size: 1.1em;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: 0.3px;
}

.objective-badge {
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 12px;
    padding: 4px 12px;
    font-size: 0.85em;
    text-transform: capitalize;
    font-weight: 500;
}

.objective-badge.completed {
    background: #e6f4ea;
    color: #1e7e34;
}

.objective-badge.in-progress {
    background: #fff3e0;
    color: #f57c00;
}

.objective-date-badge {
    background: #f5f5f5;
    color: #666;
    border-radius: 12px;
    padding: 4px 12px;
    font-size: 0.85em;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
}

button {
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
}
</style>