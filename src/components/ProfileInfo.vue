<script setup>
import FollowersList from './FollowersList.vue'
import FollowingsList from './FollowingsList.vue'

defineProps({
  userData: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="profile-left">
    <div class="profile-header">
      <div class="profile-avatar">
        {{ userData.fullname ? userData.fullname[0].toUpperCase() : '?' }}
      </div>
      <div class="profile-details">
        <h1>{{ userData.fullname }}</h1>
        <span class="username-badge">@{{ userData.username }}</span>
        <p class="bio">"{{ userData.bio }}"</p>
        <p class="email">
          <a :href="`mailto:${userData.mail}`">Contact the person!</a>
        </p>
        <div class="profile-stats">
          <FollowersList :followers="userData.followers || []" />
          <FollowingsList :followings="userData.followings || []" />

          <span class="stat">
            <span class="material-icons">star</span>
            Level {{ userData.programCounter || 0 }}
          </span>
          <span class="stat">
            <span class="material-icons">calendar_today</span>
            Member since {{ userData.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString() : (userData.createdAt || 'N/A') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-left {
  position: sticky;
  top: 20px;
}

.profile-header {
  background: var(--primary-color);
  padding: 40px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--accent-color), var(--dark-color));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3em;
  font-weight: bold;
  margin: 0 auto 20px;
}

.profile-details {
  text-align: center;
}

.profile-details h1 {
  color: var(--dark-color);
  margin: 0 0 15px 0;
  font-size: 1.8em;
}

.bio {
  color: var(--dark-color);
  font-size: 1.1em;
  margin: 0 0 15px 0;
  line-height: 1.6;
}

.email {
  color: var(--accent-color);
  margin: 0;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.email::before {
  content: "✉";
  font-size: 1.2em;
}

.username-badge {
  color: var(--accent-color);
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.95em;
  margin-left: 8px;
}

.profile-stats {
  display: flex;
  color: white;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.profile-stats .stat {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--secondary-color);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.95em;
}

.profile-details .email {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin: 0 0 10px 0;
}

.profile-details .email a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.2s;
}

.profile-details .email a:hover {
  color: var(--dark-color);
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .profile-left {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-header {
    padding: 30px 20px;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
    font-size: 2.5em;
  }

  .profile-details h1 {
    font-size: 1.5em;
  }
}
</style> 