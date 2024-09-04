import type { AuthProvider } from 'ra-core';
import { REACT_APP_API_ENDPOINT_URL } from '../../common/constants';

const apiUrl = REACT_APP_API_ENDPOINT_URL;

const authProvider: AuthProvider = {
    login: () => {
        // Make a request to your auth endpoint
        return fetch(`${apiUrl}/fortnox/auth/authenticated`, {
            method: 'GET',
            headers: new Headers({ 'Content-Type': 'application/json' }),
        }).then((response) => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
            return response.json();
        });
    },
    logout: () => {
        /* TODO: Invalidate JWT Token in Backend on logout, also clear local token storage
        // Make a request to your logout endpoint
        return fetch(`${apiUrl}/fortnox/auth/logout`, {
            method: 'POST',
        }).then((response) => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
        });
        */
        return Promise.reject();
    },
    checkAuth: () => {
        // Check if the user is authenticated by making a request to your authentication endpoint
        return fetch(`${apiUrl}/fortnox/auth/authenticated`, {
            method: 'GET',
        }).then((response) => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }
            return response.json();
        });
    },
    checkError: ({ status }) => {
        // You can customize how you handle authentication errors here
        if (status === 401 || status === 403) {
            return Promise.reject();
        }
        return Promise.resolve();
    },
    getPermissions: () => {
        return Promise.resolve();
    },
};

export default authProvider;
