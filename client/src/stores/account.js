import { defineStore } from 'pinia';
import { SERVER_BASE_URL } from '../config/env.js';

export const useAccountStore = defineStore('account', {
    state: () => ({
        email: ''
    }),
    getters: { 
        getEmail: (state) => state.email
     },
    actions: {
        setEmail (email) {
            this.email = email;
        },
        clearEmail (email) {
            this.email = '';
        },
        async loadAccount() {
            try {
               const res = await fetch(`${SERVER_BASE_URL}/api/account/me`, {
                    credentials: 'include'
                });

                const data = await res.json();

                this.email = data.data.email;
            } catch (err) {
                console.error("loadAccount() error:", err);
                this.email = null;
            }
        }
    }
});