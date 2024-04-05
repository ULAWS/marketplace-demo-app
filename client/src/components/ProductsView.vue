<template>
  <div>
    <div class="flex justify-between w-full items-center">
      <h2 class="text-2xl font-semibold mb-4">Products</h2>
      <nav>
        <router-link to="/sell" class="px-4 py-2 bg-blue-500 text-white rounded-md mr-4">Sell</router-link>
        <button @click="logout" class="px-4 py-2 bg-red-500 text-white rounded-md">Logout</button>
      </nav>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
        @click="navigateToProductDetails(product.id)"
      >
        <img :src="product.image" alt="Product Image" class="w-full h-64 object-cover" />
        <div class="p-4">
          <h3 class="text-lg font-semibold">{{ product.name }}</h3>
          <p class="text-gray-600">{{ product.description }}</p>
          <p class="text-gray-800 mt-2">{{ product.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { requestWithToken } from "../api";
export default {
  data() {
    return {
      products: [],
    };
  },
  mounted() {
    // Fetch products from backend API
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await requestWithToken(process.env.VUE_APP_SERVER_BASE_URL + "/api/products");
        const res = response.map((it) => {
          it.image = process.env.VUE_APP_SERVER_BASE_URL + "/api/images/" + it.images[0];
          return it;
        });
        this.products = res;
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    },
    logout() {
      // Clear authentication token from localStorage
      localStorage.removeItem("token");
      // Redirect to login page
      this.$router.push("/login");
    },
    navigateToProductDetails(id) {
      this.$router.push(`/products/${id}`);
    },
  },
};
</script>
