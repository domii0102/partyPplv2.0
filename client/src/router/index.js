import { createRouter, createWebHistory } from 'vue-router'

// import widoków
import FillInProfileInfoView from '../views/Account/FillInProfileInfoView.vue'
import ForgotPasswordView from '../views/Account/ForgotPasswordView.vue'
import LoginView from '../views/Account/LoginView.vue'
import RegisterView from '../views/Account/RegisterView.vue'
import ResetPasswordView from '../views/Account/ResetPasswordView.vue'
import VerifyEmailView from '../views/Account/VerifyEmailView.vue'
import EnterEmailView from '../views/Account/EnterEmailView.vue'
import CreateEventView from '../views/Event/CreateEventView.vue'
import EventDashboardView from '../views/Event/EventDashboardView.vue'
import EventFeedView from '../views/Event/EventFeedView.vue'

import LandingPageView from '../views/Home/LandingPageView.vue'

import ProfileView from '../views/Profile/ProfileView.vue'

const routes = [
  { path: '/', component: LandingPageView },

  // Auth
  { path: '/login', component: LoginView, meta: { hideHeader: true } },
  { path: '/register', component: RegisterView, meta: { hideHeader: true } },
  { path: '/forgot-password', component: ForgotPasswordView, meta: { hideHeader: true } },
  { path: '/reset-password', component: ResetPasswordView, meta: { hideHeader: true } },
 { path: '/enter-email', component: EnterEmailView, meta: { hideHeader: true }},
  { path: '/verify-email', component: VerifyEmailView, meta: { hideHeader: true } },

  // Event
  { 
    path: '/event/create', 
    component: CreateEventView, 
    meta: { requiresAuth: false, requiresVerification: false } //ZMIENIAM TYMCZASOWO BO LOGOWANIE EJSCZE NIE DZIALA 
  },
  { 
    path: '/event/feed', 
    component: EventFeedView, 
  },
  { 
    path: '/event/dashboard', 
    component: EventDashboardView, 
  },

  // Profile
  { 
    path: '/profile', 
    component: ProfileView, 
    meta: { requiresAuth: true, requiresVerification: true } 
  },
  { 
    path: '/profile/create', 
    component: FillInProfileInfoView, 
    meta: { requiresAuth: true, requiresVerification: true } 
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {

  const isAuthenticated = !!localStorage.getItem('user_token');
  const isVerified = localStorage.getItem('user_verified') === 'true';

  if (to.meta.requiresVerification && !isVerified) {
    if (to.path === '/verify-email') {
      next();
    } else {
      next('/verify-email');
    }
  } 
  else if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } 
  else {
    next();
  }
});

export default router;
