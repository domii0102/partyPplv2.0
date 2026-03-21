<template>
  <div class="login-page">
    <div class="form-container">
      <h2 class="display-6">Sign in</h2>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="loginData.email" type="email" id="email" placeholder="Enter your Email" />
          <span v-if="errors.email" class="text-danger">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="loginData.password" type="password" id="password" placeholder="Enter your password" />
          <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
        </div>

        <div class="options-row">
          <label class="remember">
            <input v-model="loginData.rememberMe" type="checkbox" />
            Keep me logged in
          </label>
          <router-link to="/forgot-password">Forgot password?</router-link>
        </div>

        <button type="submit" class="gradient-btn" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p class="signup-text">
        You don't have account?
        <router-link to="/register">Sign up!</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { SERVER_BASE_URL } from '../../config/env.js';
import { useUserStore } from '../../stores/user';
import { useAccountStore } from '../../stores/account.js';


const router = useRouter();
const store = useUserStore();
let redirectDone = false;
const accountStore = useAccountStore();

const loginData = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const loading = ref(false);
const errors = reactive({
  email: null,
  password: null,
  backend: null
});

const validate = () => {
  let isValid = true;
  errors.email = null;
  errors.password = null;
  errors.backend = null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!loginData.email) {
    errors.email = "Email is required.";
    isValid = false;
  } else if (!emailRegex.test(loginData.email)) {
    errors.email = "Please enter a valid email.";
    isValid = false;
  }

  if (!loginData.password) {
    errors.password = "Password is required.";
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (!validate()) return;

  if (redirectDone) return;
  loading.value = true;
  errors.backend = null;
  console.log(loginData.email);

  try {

    const res = await fetch(`${SERVER_BASE_URL}/api/account/checkAccount/${loginData.email}`, {
      method: "GET",
      cache: "no-store"
    });

    const serverData = await res.json();
    console.log(serverData)

    if (res.ok) {
      console.log(serverData);

      console.log("Server response: ", serverData.data);

      if (serverData.data.emailConfirmed === false) {
        redirectDone = true;
        console.log("Przekierowanie na verify-email:", serverData.data.emailConfirmed === false);
        accountStore.setEmail(serverData.data.email);
        router.push('/verify-email');
        return;
      }
      else if (!serverData.data.hasProfile) { // Uzytkownik nie ma profilu, 
        redirectDone = true;
        console.log("Przekierowanie na profile/create", serverData.data.hasProfile === false);
        router.push('/create');
        return;
      }
      else {
        try {

          const response = await fetch(`${SERVER_BASE_URL}/api/account/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-type': 'application/json'
            },
            body: JSON.stringify({
              email: loginData.email,
              password: loginData.password
            })
          });

          const data = await response.json();
          if (data && data.error) {
            throw new Error(data.error);
          }
          console.log(data);
          if (response.ok && data.success) {
            await store.loadUser();
            await localStorage.setItem('user_verified', serverData.data.emailConfirmed ? 'true' : 'false');
            redirectDone = true;
            console.log("Przekierowanie na profile:", serverData.data.emailConfirmed === false, serverData.data.hasProfile === false );
            router.push('/profile'); //to tak na razie, bo nie ma dashboardu
            return;
          }

        }
        catch (err) {
          console.log(err);
          errors.backend = 'Server error. Try again later.';
        }


      }

    }

  } catch (err) {
    // Tutaj dodajemy błąd "po nieudanym logowaniu"
    errors.backend = "Email or password is incorrect.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('../../assets/user-form-bg.jpg') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 1.25rem;
}

.form-container {
  width: 100%;
  max-width: 32.5rem;
  padding: 2.8125rem 3.4375rem;
  background: rgba(0, 0, 0, 0.55);
  border: 0.1875rem solid var(--primary-orange, #ff8c00);
  border-radius: 1.5625rem;
  backdrop-filter: blur(1rem);
  box-shadow: 0 0 2.5rem rgba(0, 0, 0, 0.45);
  color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 1.5625rem;
  font-size: 2rem;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 0.875rem;
  margin-bottom: 0.375rem;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.8125rem 0.875rem;
  border-radius: 62.4375rem;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  font-size: 0.9375rem;
  outline: none;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  margin: 1.25rem 0;
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.gradient-btn {
  width: 100%;
  padding: 0.875rem 0;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 62.4375rem;
  background: linear-gradient(45deg, var(--primary-orange), var(--primary-purple), var(--primary-orange));
  color: white;
  background-size: 200% 200%;
  transition: 0.3s;
}

.gradient-btn:hover:not(:disabled) {
  background-position: 100% 100%;
}

.text-danger {
  color: #ff4d4d;
  font-size: 0.75rem;
  margin-top: 0.35rem;
  margin-left: 1rem;
  display: block;
}

.signup-text {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

a,
.router-link {
  color: #d8aaff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem;
  }

  .options-row {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>