import { defineStore } from 'pinia';
import {service } from '../services/requestService.js';


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
        },
        getUser: (state) => state.user
    },
    actions: {
        async loadUser() {
            try {

                console.log("loading user into store...");
                const res = await service.get('/api/user/me', false);

                if (!res.success) {
                    this.user = null;
                    return;
                }
                console.log(res);

                this.user = res.data.user;

            } catch (err) {
                console.error("loadUser() error:", err);
                this.user = null;
            }
        },
        logout() {
            this.user = null; 
        }
    }

})