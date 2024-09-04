import type { AuthProvider } from 'ra-core';
import { JWTTokenDTO } from '../dtos/JWTToken.dto';
import { REACT_APP_API_ENDPOINT_URL } from '../../common/constants';

const apiUrl = REACT_APP_API_ENDPOINT_URL;

class JWTAuthProvider implements AuthProvider {
    async login(params: { username: string; password: string }): Promise<void> {
        const request = new Request(`${apiUrl}/auth`, {
            method: 'POST',
            body: JSON.stringify({
                email: params.username,
                password: params.password,
            }),
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
        });

        return fetch(request)
            .then((response) => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then((jwt) => {
                JWTTokenDTO.saveSessionToken(jwt);
            })
            .catch((reason) => {
                console.log({ reason });
                throw new Error(`Login failed - ${reason}`);
            });
    }

    logout(): Promise<void> {
        JWTTokenDTO.removeSessionToken();
        return Promise.resolve();
    }

    async checkAuth(): Promise<void> {
        return JWTTokenDTO.hasSessionToken()
            ? Promise.resolve()
            : Promise.reject();
    }
    checkError(error?: { status?: number }): Promise<void> {
        if (error && (error.status === 401 || error.status === 403)) {
            JWTTokenDTO.removeSessionToken();
            return Promise.reject();
        }
        // other error code (404, 500, etc): no need to log out
        return Promise.resolve();
    }
    getPermissions(): Promise<string[]> {
        return Promise.resolve(['user']);
    }
}

export default new JWTAuthProvider();
