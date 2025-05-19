// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Index from '../index.vue'
import Cadastro from '../cadastro.vue'

const routes = [
  { path: '/', component: Index },
  { path: '/cadastro', component: Cadastro },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
