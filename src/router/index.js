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
    path: '/parking-records',
    name: 'ParkingRecords',
    component: () => import('@/views/VehicleRecords.vue')
  },
  {
    path: '/parking-records/:id',
    name: 'ParkingRecordDetail',
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
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
