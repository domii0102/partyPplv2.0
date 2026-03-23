<template>
  <div class="background">
    <div class="main-page">
      <div class="form-container">
        <h2 class="display-6">Sign in</h2>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="loginData.email" type="email" id="email" placeholder="Enter your Email" />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input v-model="loginData.password" type="password" id="password" placeholder="Enter your password" />
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
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
            await localStorage.setItem('user_verified', serverData.data.emailConfirmed ? 'true' : 'false');
            redirectDone = true;
            if (!serverData.data.hasProfile) { // Uzytkownik nie ma profilu, 
              console.log("Przekierowanie na profile/create", serverData.data.hasProfile === false);
              router.push('/create');
              return;
            }
            else{
              await store.loadUser();
              console.log("Przekierowanie na profile:", serverData.data.emailConfirmed === false, serverData.data.hasProfile === false );
              router.push('/profile'); //to tak na razie, bo nie ma dashboardu
              return;
            }
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

.form-container {
  width: 100%;
  max-width: 500px;
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