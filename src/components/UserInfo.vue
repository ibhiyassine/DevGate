<script setup>
import { getUserInfo } from "@/composables/getUserInfo";
import { ref, onBeforeMount,computed } from "vue";
import { get_date_string } from "../composables/dateString";
import { logout } from "@/composables/userLogout";
import { useRouter } from "vue-router";
const router = useRouter();
const props=defineProps({
  username: {
    type: String,
    required: true,
    default: "aya"
  }
})

async function logout2() {
  const confirmed = confirm("Are you sure you want to log out?");
  if (confirmed) {
    await logout();
    router.replace("/");
    
    console.log("Logged out!");
  }
}

const userInfo = ref(null);
onBeforeMount(async () => {
        userInfo.value = await getUserInfo(props.username);
        console.log("aa",userInfo.value.mail);

});

let date_string = computed(() => {
    return get_date_string(userInfo.value.createdAt);
});
</script>

<template>
      <div class=" p-4 rounded-5">
        <div class="image d-flex flex-column justify-content-center align-items-center">
          <img src="../assets/avatar.png" class="rounded-circle" height="100" width="120" />
          
          <template v-if="userInfo">
            <span class="name mt-2">{{ userInfo.username }}</span>
            <span class="idd">{{ userInfo.mail }}</span>
  
           
  
            <div class="gap-3 mt-3 icons d-flex flex-row justify-content-center align-items-center">
              <span><i class="fa fa-twitter"></i></span>
              <span><i class="fa fa-facebook-f"></i></span>
              <span><i class="fa fa-instagram"></i></span>
              <span><i class="fa fa-linkedin"></i></span>
            </div>
  
            <div>
              <span class="join" v-show="!userInfo.isAdmin">Joined at {{date_string}}</span>
            </div>
            <div class="d-flex mt-2">
                <button type="button" class="logout-btn-outline" @click="logout2">Log out</button>            </div>
          </template>
  
          <template v-else>
            <span class="text-muted" style="color:#1d3c45">Loading...</span>
          </template>
        </div>
      </div>
   
  </template>
  
<style scoped>
* {
    margin: 0;
    padding: 0
}

body {
    background-color: #000
}

.card {
    width: 350px;
    background-color: white;
    cursor: pointer;
    transition: all 0.5s;
    
}

.image img {
    transition: all 0.5s
}

.card:hover .image img {
    transform: scale(1.1)
}

.logout-btn-outline {
  background-color: transparent;
  color: #e63946;
  border: 2px solid #e63946;
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn-outline:hover {
  background-color: #e63946;
  color: white;
}


.name {
    font-size: 22px;
    font-weight: bold;
    color:#1d3c45;

}

.idd {
    font-size: 14px;
    font-weight: 600;
    color:#1d3c45;
}
.idd1 {
    font-size: 12px
}

.number {
    font-size: 22px;
    font-weight: bold
}

.follow {
    font-size: 12px;
    font-weight: 500;
    color: #444444
}

.btn1 {
    height: 40px;
    width: 150px;
    border: none;
    background-color: #d2601a;
    color: #1d3c45;
    font-size: 19px;
    font-weight: bold;
}

.text span {
    font-size: 13px;
    color: #545454;
    font-weight: 500
}

.icons i {
    font-size: 19px
}

hr .new1 {
    border: 1px solid
}

.join {
    font-size: 13px;
    color: #1d3c45;
    font-weight: bold
}


</style>