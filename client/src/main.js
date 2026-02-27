import { createApp } from 'vue'
import './style.css'

import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
    faSun,
    faMoon
} from '@fortawesome/free-solid-svg-icons'

library.add(faSun, faMoon)

const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.use(router)

app.mount('#app')