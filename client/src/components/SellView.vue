<!-- Sell.vue -->

<template>
  <div>
    <div class="flex justify-between w-full">
      <h2 class="text-2xl font-semibold mb-4">Sell a Product</h2>
      <button @click="cancel" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4">
        Cancel
      </button>
    </div>
    <form @submit.prevent="sellProduct" class="max-w-lg">
      <div class="mb-4">
        <label for="productName" class="block text-sm font-medium text-gray-700">Product Name</label>
        <input
          type="text"
          id="productName"
          v-model="productName"
          class="mt-1 p-2 block w-full border rounded-md shadow-sm"
        />
      </div>
      <div class="mb-4">
        <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
        <input type="number" id="price" v-model="price" class="mt-1 p-2 block w-full border rounded-md shadow-sm" />
      </div>
      <div class="mb-4">
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          class="mt-1 p-2 block w-full border rounded-md shadow-sm"
        ></textarea>
      </div>
      <div class="mb-4">
        <label for="images" class="block text-sm font-medium text-gray-700">Images</label>
        <input type="file" id="images" ref="fileInput" class="hidden" @change="handleFileInputChange" />
        <button
          type="button"
          @click="$refs.fileInput.click()"
          class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Upload Images
        </button>
      </div>
      <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Submit</button>
    </form>
  </div>
</template>

<script>
import { requestWithToken } from "../api";
export default {
  data() {
    return {
      productName: "",
      price: "",
      description: "",
      images: [], // Array to store uploaded images
    };
  },
  methods: {
    async sellProduct() {
      try {
        const token = localStorage.getItem("token");
        const tokenJson = JSON.parse(token);
        const id = tokenJson.id;
        const formData = new FormData();
        formData.append("productName", this.productName);
        formData.append("price", this.price);
        formData.append("description", this.description);
        formData.append("id", id);
        this.images.forEach((file) => {
          formData.append("images", file);
        });

        const response = await requestWithToken(process.env.VUE_APP_SERVER_BASE_URL + "/api/products", {
          method: "POST",
          body: formData,
        });
        console.log(response);
        if (response) {
          alert("Product added successfully!");
          this.$router.push("/products");
        } else {
          alert("Failed to add product");
        }
      } catch (error) {
        console.error("Error adding product:", error);
        alert("An error occurred while adding product");
      }
    },
    handleFileInputChange(event) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        this.images.push(files[i]);
      }
    },
    cancel() {
      this.$router.push("/products");
    },
  },
};
</script>
