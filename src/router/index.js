import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/vehicle-records',
    name: 'VehicleRecords',
    component: () => import('@/views/VehicleRecords.vue')
  },
  {
    path: '/vehicle-records/:id',
    name: 'VehicleRecordDetail',
    component: () => import('@/views/VehicleRecordDetail.vue')
  },
  {
    path: '/square-locations',
    name: 'SquareLocations',
    component: () => import('@/views/SquareLocations.vue')
  },
  {
    path: '/square-devices',
    name: 'SquareDevices',
    component: () => import('@/views/SquareDevices.vue')
  },
  {
    path: '/payment-orders',
    name: 'PaymentOrders',
    component: () => import('@/views/PaymentOrders.vue')
  },
  {
    path: '/payment-orders/:id',
    name: 'PaymentOrderDetail',
    component: () => import('@/views/PaymentOrderDetail.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
