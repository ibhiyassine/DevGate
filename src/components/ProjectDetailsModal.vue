<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const projectTitle = computed(() => props.project?.title || '');
const projectDescription = computed(() => props.project?.description || 'No description available');
const projectGithubLink = computed(() => props.project?.githubLink || '#');
const projectStack = computed(() => props.project?.stack || []);

// Prevent clicks inside the modal from closing it
const preventClose = (event) => {
  event.stopPropagation();
};
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>{{ projectTitle }}</h3>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-content">
          <p class="description">{{ projectDescription }}</p>
          
          <div v-if="projectStack.length" class="stack-section">
            <span class="section-label">Tech stack:</span>
            <div class="stack-chips">
              <span v-for="(tech, idx) in projectStack" :key="idx" class="stack-chip">{{ tech }}</span>
            </div>
          </div>
          
          <a :href="projectGithubLink" target="_blank" class="github-link no-shadow">
            <span class="material-icons">code</span>
            View on GitHub
          </a>
          
          <div class="dates-section">
            <span v-if="project.createdAt" class="date-item">
              <span class="material-icons">calendar_today</span>
              Created: {{ new Date(project.createdAt.seconds * 1000).toLocaleDateString() }}
            </span>
            <span v-if="project.modifiedDate" class="date-item">
              <span class="material-icons">update</span>
              Updated: {{ new Date(project.modifiedDate.seconds * 1000).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  position: relative;
  z-index: 10000;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: none;
}

.close-button:hover {
  color: #333;
}

.modal-content {
  padding: 20px;
}

.description {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 15px;
  line-height: 1.5;
  color: #444;
}

.stack-section {
  margin-bottom: 15px;
}

.section-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  display: block;
}

.stack-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stack-chip {
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.9em;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #24292e;
  color: #fff;
  border-radius: 4px;
  padding: 8px 16px;
  text-decoration: none;
  font-size: 0.95em;
  transition: background 0.2s;
  border: none;
}

.github-link:hover {
  background: #444d56;
}

.dates-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #777;
  font-size: 0.9em;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-item .material-icons {
  font-size: 18px;
}

.no-shadow {
  box-shadow: none !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>