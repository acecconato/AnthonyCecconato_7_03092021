import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import { BootstrapIconsPlugin } from 'bootstrap-icons-vue'

import App from './App.vue'
import router from './router/index'

createApp(App).use(BootstrapIconsPlugin).use(router).mount('#app')
