<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">{{ product.name }}</h2>
    <p>Status: {{ getStatusText(product.statusId) }}</p>
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="product?.images?.length">
        <h3>Images:</h3>
        <img v-for="image in product.images" :src="getImageUrl(image)" :key="image" alt="Product Image" />
      </div>
      <div class="p-4">
        <p class="text-gray-600">{{ product.description }}</p>
        <p class="text-gray-800 mt-2">{{ product.price }}</p>
        <div class="flex gap-x-8">
          <button
            v-if="isReservedForUser || (product.statusId === 1 && !isSeller && !isInCounterProcess)"
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            @click="purchaseProduct"
          >
            Purchase
          </button>
          <button
            v-if="product.statusId === 1 && isPendingCounterOffer"
            class="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            @click="acceptCounterOffer(offer.price, userId, product.sellerId)"
          >
            Accept
          </button>
          <button
            v-if="product.statusId === 1 && !isSeller && !isCounterOfferMade"
            @click="openCounterOfferPopup(userId, product.sellerId)"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Counter Offer
          </button>
        </div>
      </div>
      <CounterOfferView v-if="showCounterOfferPopup" @submit="submitCounterOffer" @close="closeCounterOfferPopup" />
    </div>
    <div class="mt-8">
      <h3 class="text-lg font-semibold mb-2">Negotiation History</h3>
      <ul v-if="product?.negotiationHistory?.length" class="divide-y divide-gray-200">
        <li v-for="offer in product?.negotiationHistory" :key="offer.timestamp" class="py-2">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ offer.buyerName }}</p>
              <p class="text-sm">{{ offer.timestamp }}</p>
            </div>
            <button
              v-if="product.statusId === 1 && offer.showCounter"
              class="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              @click="acceptCounterOffer(offer.price, userId, offer.buyerId)"
            >
              Accept
            </button>
            <button
              v-if="product.statusId === 1 && offer.showCounter"
              @click="openCounterOfferPopup(userId, isSeller ? offer.buyerId : product.sellerId)"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Counter Offer
            </button>
            <div class="flex flex-col items-end">
              <p>Offer by: {{ offer.offerBy }}</p>
              <p class="text-sm">{{ offer.price }}</p>
            </div>
          </div>
        </li>
      </ul>
      <p v-else class="text-gray-500">No negotiation history available</p>
    </div>
  </div>
</template>

<script>
import { requestWithToken } from "../api";
import CounterOfferView from "./CounterOfferView.vue";

export default {
  components: {
    CounterOfferView,
  },
  data() {
    return {
      product: {},
      userId: 0,
      username: "",
      showCounterOfferPopup: false,
      isSeller: false,
      isReservedForUser: false,
      reservedPrice: 0,
      isInCounterProcess: false,
      isCounterOfferMade: false,
      isPendingCounterOffer: false,
      offerBy: 0,
      offerTo: 0,
    };
  },
  mounted() {
    const token = localStorage.getItem("token");
    const tokenJson = JSON.parse(token);
    this.userId = tokenJson.id;
    this.username = tokenJson.username;
    this.fetchProductDetails();
  },
  methods: {
    openCounterOfferPopup(by, to) {
      this.offerBy = by;
      this.offerTo = to;
      this.showCounterOfferPopup = true;
    },
    closeCounterOfferPopup() {
      this.showCounterOfferPopup = false;
    },
    async acceptCounterOffer(price, by, to) {
      try {
        const madeByUserId = by;
        const madeToUserId = to;
        const response = await requestWithToken(
          `${process.env.VUE_APP_SERVER_BASE_URL}/api/products/${this.product.id}/accept-counter-offer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ price, madeByUserId, madeToUserId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to accept counter offer");
        }

        alert("Counter offer accepted successfully");
        this.closeCounterOfferPopup();
        this.$router.go();
      } catch (error) {
        console.error("Error accepting counter offer:", error);
        alert("Failed to accept counter offer");
      }
    },
    async submitCounterOffer(price) {
      try {
        const madeByUserId = this.offerBy;
        const madeToUserId = this.offerTo;
        const response = await requestWithToken(
          `${process.env.VUE_APP_SERVER_BASE_URL}/api/products/${this.product.id}/counter-offer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ price, madeByUserId, madeToUserId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send counter offer");
        }

        alert("Counter offer sent successfully");
        this.closeCounterOfferPopup();
        this.$router.go();
      } catch (error) {
        console.error("Error sending counter offer:", error);
        alert("Failed to send counter offer");
      }
    },
    getStatusText(statusId) {
      switch (statusId) {
        case 1:
          return "Available";
        case 2:
          return "Reserved";
        case 3:
          return "Sold";
        default:
          return "Unknown";
      }
    },
    getImageUrl(image) {
      return process.env.VUE_APP_SERVER_BASE_URL + "/api/images/" + image;
    },
    async fetchProductDetails() {
      try {
        const productId = this.$route.params.id;
        const response = await requestWithToken(`${process.env.VUE_APP_SERVER_BASE_URL}/api/products/${productId}`);
        if (response.sellerId === this.userId) this.isSeller = true;
        const countersMadeBySeller = [];
        response.negotiationHistory.map((it) => {
          if (this.isSeller) {
            if (it.offerBy === "Seller") countersMadeBySeller.push(it.buyerName);
            else if (!countersMadeBySeller.includes(it.buyerName)) it.showCounter = true;
          }
          if (!response.statusId === 3 && it.status === "accepted" && it.buyerName === this.username)
            this.isReservedForUser = true;
          this.reservedPrice = it.price;
        });
        const coBuyer = response.negotiationHistory.filter(
          (it) => it.buyerName === this.username && it.offerBy === "Buyer"
        );
        const coSeller = response.negotiationHistory.filter(
          (it) => it.buyerName === this.username && it.offerBy === "Seller"
        );
        if (coBuyer.length) {
          this.isInCounterProcess = true;
          if (coBuyer > coSeller) this.isCounterOfferMade = true;
          else if (coSeller.length > 0) this.isPendingCounterOffer = true;
        }
        this.product = response;
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    },
    async purchaseProduct() {
      try {
        const token = localStorage.getItem("token");
        const tokenJson = JSON.parse(token);
        const id = tokenJson.id;
        const productId = this.$route.params.id;
        const finalPrice = this.product.statusId === 1 ? this.product.price : this.reservedPrice;
        const response = await requestWithToken(
          `${process.env.VUE_APP_SERVER_BASE_URL}/api/products/${productId}/purchase`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ buyerId: id, soldPrice: finalPrice }),
          }
        );

        if (response.ok) {
          throw new Error("Failed to purchase");
        }

        alert("Purchased successfully!");
        this.$router.push("/products");
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    },
  },
};
</script>
