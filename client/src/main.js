import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'mdb-ui-kit/css/mdb.min.css'
import striptags from 'striptags'

import { BootstrapIconsPlugin } from 'bootstrap-icons-vue'

import App from './App.vue'
import router from './router/index'
import store from './store'
import setupInterceptor from './services/setupInterceptor'

setupInterceptor(store)

const app = createApp(App)

app
  .use(BootstrapIconsPlugin)
  .use(router)
  .use(store)

app.config.globalProperties.$filters = {
  striptags (value) {
    return striptags(value)
  }
}

app.mount('#app')
