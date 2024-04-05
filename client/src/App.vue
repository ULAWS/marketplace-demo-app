<template>
  <div class="bg-gray-100 min-h-screen">
    <header class="bg-white shadow">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-semibold py-4">Product Marketplace</h1>
      </div>
    </header>
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>
