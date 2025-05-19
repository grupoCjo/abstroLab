// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import style from './style.css'
import Index from './index.vue'
import Cadastro from './cadastro.vue'

const routes = [
  { path: '/', component: Index },
  { path: '/cadastro', component: Cadastro },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
