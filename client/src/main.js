import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

import App from './App.vue'
import router from './router'

import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
    faSun,
    faMoon,
    faChevronRight,
    faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

library.add(faSun, faMoon, faChevronRight, faChevronLeft)

const app = createApp(App);
app.use(createPinia());
app.component('FontAwesomeIcon', FontAwesomeIcon);


app.use(router);

app.mount('#app');
