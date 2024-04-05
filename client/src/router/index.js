// router/index.js

import { createMemoryHistory, createRouter } from "vue-router";
import Login from "../components/LoginView.vue";
import Products from "../components/ProductsView.vue";
import ProductDetails from "../components/ProductDetailsView.vue";
import Sell from "../components/SellView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/products", component: Products, meta: { requiresAuth: true } },
  { path: "/products/:id", component: ProductDetails, meta: { requiresAuth: true } },
  { path: "/sell", component: Sell, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("token");
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
