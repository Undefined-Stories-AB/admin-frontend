import { JWTTokenDTO } from '../dtos/JWTToken.dto';

async function refreshToken(token: JWTTokenDTO): Promise<void> {
    return fetch('/auth/refresh-token', {
        method: 'POST',
        body: token.getRefreshTokenBody(),
    })
        .then((response) => {
            if (response.status !== 201) {
                throw new Error('Failed to refresh token');
            }
            return response.json();
        })
        .then((jwt: string) => {
            JWTTokenDTO.saveSessionToken(jwt);
        });
}

export const checkAuth = async () => {
    const jwt = JWTTokenDTO.loadSessionToken();
    if (jwt?.isExpired()) {
        return refreshToken(jwt);
    }
    return Promise.reject();
};
