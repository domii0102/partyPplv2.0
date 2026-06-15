import { SERVER_BASE_URL } from '../config/env';


export class requestService {
    async request(url, options = {}) {
        const response = await fetch(`${SERVER_BASE_URL}${url}`, {
            credentials: 'include',
            ...options
        });

        let data = null;

        const contentType = response.headers.get('content-type'); // Przy braku body mogloby sie wykrzaczyc chyba

        if (contentType?.includes('application/json')) { data = await response.json(); }

        if (!response.ok) {
        const error = new Error(data?.error || 'Request failed');
        error.status = response.status;
        throw error;
        }

        return data;
    }

    async get(url, cache = true) {
        let headers = {};

        if (!cache) {
            headers["Cache-Control"] = "no-store";
        }

        return this.request(url, {
            method: 'GET',
            headers
        });
    }

    async post(url, body) {
        return this.request(url, {
            method: 'POST',
            headers: this.getHeaders(body),
            body: this.prepareBody(body)
        });
    }

    async put(url, body) {
        return this.request(url, {
            method: 'PUT',
            headers: this.getHeaders(body),
            body: this.prepareBody(body)
        });
    }

    async patch(url, body) {
        return this.request(url, {
            method: 'PATCH',
            headers: this.getHeaders(body),
            body: this.prepareBody(body)
        });
    }

    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    getHeaders(body) {
        if (body instanceof FormData) {
            return {};
        }

        return {
            "Content-Type": "application/json"
        };
    }

    prepareBody(body) {
        if (body instanceof FormData) {
            return body;
        }

        return JSON.stringify(body);
    }
}

export const service = new requestService();