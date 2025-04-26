<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header>
      <h1>DevGate App</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink> |
      </nav>
    </header>
    
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

nav {
  margin-top: 10px;
}

nav a {
  margin-right: 10px;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}

main {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
