import { createRouter, createWebHistory } from 'vue-router'

// import widoków
import FillInProfileInfoView from '../views/Account/FillInProfileInfoView.vue'
import ForgotPasswordView from '../views/Account/ForgotPasswordView.vue'
import LoginView from '../views/Account/LoginView.vue'
import RegisterView from '../views/Account/RegisterView.vue'
import ResetPasswordView from '../views/Account/ResetPasswordView.vue'
import VerifyEmailView from '../views/Account/VerifyEmailView.vue'
import VerifyResetCodeView from '../views/Account/VerifyResetCodeView.vue'

import CreateEventView from '../views/Event/CreateEventView.vue'
import EventDashboard from '../views/Event/EventDashboard.vue'
import EventListView from '../views/Event/EventListView.vue'

import LandingPageView from '../views/Home/LandingPageView.vue'

import ProfileView from '../views/Profile/ProfileView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: LandingPageView},

        { path: '/login', component: LoginView},
        { path: '/register', component: RegisterView},
        //reszte pododajemy na biezaco bo mi sie nie chce przepisywac aktualnie oki
    ]
})

export default router