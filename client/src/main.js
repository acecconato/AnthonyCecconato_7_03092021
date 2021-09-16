import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import { BootstrapIconsPlugin } from 'bootstrap-icons-vue'

import App from './App.vue'
import router from './router/index'
import store from './store'
import setupInterceptor from './services/setupInterceptor'

setupInterceptor(store)

createApp(App)
  .use(BootstrapIconsPlugin)
  .use(router)
  .use(store)
  .mount('#app')
