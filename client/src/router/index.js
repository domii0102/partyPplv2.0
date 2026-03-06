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
import EventDashboardView from '../views/Event/EventDashboardView.vue'
import EventListView from '../views/Event/EventListView.vue'

import LandingPageView from '../views/Home/LandingPageView.vue'

import ProfileView from '../views/Profile/ProfileView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: LandingPageView},

        { path: '/login', component: LoginView, meta: { hideHeader: true } },
        { path: '/register', component: RegisterView, meta: { hideHeader: true }},
        { path: '/forgot-password', component: ForgotPasswordView, meta: { hideHeader: true }},
        { path: '/reset-password', component: ResetPasswordView, meta: { hideHeader: true }},
        { path: '/verify-email', component: VerifyEmailView, meta: { hideHeader: true }},
        { path: '/verify-reset-code', component: VerifyResetCodeView, meta: { hideHeader: true }},

        { path: '/event/create', component: CreateEventView},
        { path: '/event/list', component: EventListView},
        { path: '/event/dashboard', component: EventDashboardView },

        { path: '/profile', component: ProfileView},
        //reszte pododajemy na biezaco bo mi sie nie chce przepisywac aktualnie oki
    ]
})

export default router