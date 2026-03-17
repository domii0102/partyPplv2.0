import { defineStore } from 'pinia';
import { SERVER_BASE_URL } from '../config/env.js';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null
    }),
    getters: {
        age: (state) => {
            // Jeśli nie ma usera lub daty, nie ma wieku
            if (!state.user || !state.user.dateOfBirth) return null;
            // Pobieramy daty
            const birthDate = new Date(state.user.dateOfBirth);
            const today = new Date();
            // Obliczamy różnicę lat
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            return calculatedAge;
        }
    },
    actions: {
        async loadUser() {
            try {
                const res = await fetch(`${SERVER_BASE_URL}/api/user/me`, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                });

                console.log("loadUser() status:", res.status);

                if (!res.ok) {
                    this.user = null;
                    return;
                }
                console.log(res)
                const data = await res.json();
                this.user = data.data.user;

            } catch (err) {
                console.error("loadUser() error:", err);
                this.user = null;
            }
        },
        logout() {
            this.token = null;
        }
    }

})