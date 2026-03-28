import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user';

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

import { getActivePinia, setActivePinia, createPinia } from 'pinia'

const pinia = getActivePinia() || createPinia()
setActivePinia(pinia)

//const store = useUserStore();

const routes = [
  { path: '/', component: LandingPageView },

  // Auth
  { path: '/login', component: LoginView, meta: { hideHeader: true } },
  { path: '/register', component: RegisterView, meta: { hideHeader: true } },
  { path: '/forgot-password', component: ForgotPasswordView, meta: { hideHeader: true } },
  { path: '/reset-password', component: ResetPasswordView, meta: { hideHeader: true } },
  { path: '/enter-email', component: EnterEmailView, meta: { hideHeader: true }},
  { path: '/verify-email', component: VerifyEmailView, meta: { hideHeader: true } },
  { path: '/create', component: FillInProfileInfoView, meta: { hideHeader: true } },

  // Event
  { 
    path: '/event/create', 
    component: CreateEventView, 
    meta: { requiresAuth: true, requiresVerification: true }
  },
  { 
    path: '/event/feed', 
    component: EventFeedView, 
  },
  { 
    path: '/event/dashboard/:id', 
    component: EventDashboardView, 
  },

  // Profile
  { 
    path: '/profile', 
    component: ProfileView, 
    meta: { requiresAuth: true, requiresVerification: true } 
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  const store = useUserStore(); // Gdy jest na poczatku to nie pobiera najnowszego stanu store, wiec nie sprawdza dobrze autentyfikacji i wywali blad (login nie pojdzie dalej)

  if (!store.getUser) {
    await store.loadUser();
  }

  const isAuthenticated = store.user != null;
  const isVerified = localStorage.getItem('user_verified') === 'true';

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  } 
  
  else if (to.meta.requiresVerification && !isVerified) { // Wywala tutaj przy logowaniu, jak jest confirmed ale bez profilu
    if (to.path === '/verify-email') {
      return next();
    } else {
      return next('/verify-email');
    }
  } 
  //else if (to.meta.requiresAuth && !isAuthenticated) {
  //  next('/login');
  //} 
  next();
});

export default router;
