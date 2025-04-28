<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore'

const props = defineProps({
  // The username of the profile being viewed
  targetUsername: {
    type: String,
    required: true
  },
  // The currently logged in user's username
  currentUsername: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['follow', 'unfollow'])

const isFollowing = ref(false)
const isLoading = ref(true)

// Check if current user is following the target user
const checkFollowStatus = async () => {
  try {
    const currentUserDoc = await getDoc(doc(db, 'users', props.currentUsername))
    if (currentUserDoc.exists()) {
      const followings = currentUserDoc.data().followings || []
      // Check if the target user's document reference is in the followings array
      const targetUserRef = doc(db, 'users', props.targetUsername)
      isFollowing.value = followings.some(
        (following) => following.path === targetUserRef.path
      )
    }
  } catch (error) {
    console.error('Error checking follow status:', error)
  } finally {
    isLoading.value = false
  }
}

// Toggle follow status
const toggleFollow = async () => {
  if (props.currentUsername === props.targetUsername) {
    return // Can't follow yourself
  }

  isLoading.value = true
  try {
    // Use batch to update both users atomically
    const batch = writeBatch(db)
    const currentUserRef = doc(db, 'users', props.currentUsername)
    const targetUserRef = doc(db, 'users', props.targetUsername)

    if (isFollowing.value) {
      // Unfollow: Remove from followings and followers
      batch.update(currentUserRef, {
        followings: arrayRemove(targetUserRef)
      })
      batch.update(targetUserRef, {
        followers: arrayRemove(currentUserRef)
      })
      emit('unfollow', props.targetUsername)
    } else {
      // Follow: Add to followings and followers
      batch.update(currentUserRef, {
        followings: arrayUnion(targetUserRef)
      })
      batch.update(targetUserRef, {
        followers: arrayUnion(currentUserRef)
      })
      emit('follow', props.currentUsername)
    }

    // Commit the batch
    await batch.commit()
    
    // Update local state
    isFollowing.value = !isFollowing.value
  } catch (error) {
    console.error('Error toggling follow status:', error)
  } finally {
    isLoading.value = false
  }
}

// Check follow status when component mounts
onMounted(checkFollowStatus)
</script>

<template>
  <button 
    v-if="currentUsername !== targetUsername"
    @click="toggleFollow" 
    :disabled="isLoading"
    :class="[
      'follow-button',
      isFollowing ? 'following' : 'not-following',
      isLoading ? 'loading' : ''
    ]"
  >
    <span>
      {{ isLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow') }}
    </span>
  </button>
</template>

<style scoped>
.follow-button {
  padding: 8px 24px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
}

.not-following {
  background-color: #0077C0;
  color: white;
}

.not-following:hover {
  background-color: #005a91;
}

.following {
  background-color: #C7EEFF;
  color: #1D242B;
  border: 1px solid #0077C0;
}

.following:hover {
  background-color: #ffebeb;
  color: #dc3545;
  border-color: #dc3545;
}

.loading {
  opacity: 0.7;
  cursor: wait;
}

.disabled {
  background-color: #e0e0e0;
  color: #666;
  cursor: not-allowed;
}

.disabled:hover {
  background-color: #e0e0e0;
  color: #666;
}
</style> 