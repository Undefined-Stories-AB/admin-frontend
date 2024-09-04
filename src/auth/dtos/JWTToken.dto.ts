import type { JWTToken } from '../interfaces/JWTToken.interface';

export class JWTTokenDTO implements JWTToken {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;

    constructor(
        jwt:
            | {
                  accessToken: string;
                  refreshToken: string;
                  expiresIn?: number;
                  expiresAt?: string;
              }
            | string
    ) {
        const { accessToken, refreshToken, expiresIn, expiresAt } =
            typeof jwt === 'string' ? JSON.parse(jwt) : jwt;

        if (!accessToken) {
            throw new Error(
                "Failed to construct JWTTokenDTO, missing 'accessToken'"
            );
        }
        if (!refreshToken) {
            throw new Error(
                "Failed to construct JWTTokenDTO, missing 'refreshToken'"
            );
        }

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        if (!expiresAt) {
            const now = new Date();
            now.setSeconds(now.getSeconds() + expiresIn);
            this.expiresAt = now.toISOString();
        } else {
            this.expiresAt = expiresAt;
        }
        
        if (this.isExpired()) {
            throw new Error("Token has expired.");
        }
    }

    public json(): string {
        return JSON.stringify({
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expiresAt: this.expiresAt,
        });
    }

    public getAuthorizationHeader(): Record<'Authorization', string> {
        return { Authorization: `Bearer ${this.accessToken}` };
    }

    public getRefreshTokenBody(): BodyInit {
        return JSON.stringify({ refreshToken: this.refreshToken });
    }

    public isExpired(): boolean {
        return new Date(this.expiresAt).getTime() < Date.now();
    }

    public static hasSessionToken(): boolean {
        const jwt = sessionStorage.getItem('JWT-TOKEN');
        if (jwt) {
            try {
                new JWTTokenDTO(jwt);
            } catch (error) {
                console.error((error as Error).message);
                sessionStorage.removeItem('JWT-TOKEN');
            }
            return true;
        }
        return false;
    }

    public static removeSessionToken(): void {
        sessionStorage.removeItem('JWT-TOKEN');
    }

    public static saveSessionToken(jwt: JWTTokenDTO | string): JWTTokenDTO {
        const token = new JWTTokenDTO(jwt);
        sessionStorage.setItem('JWT-TOKEN', token.json());
        return token;
    }

    public static loadSessionToken(): JWTTokenDTO | undefined {
        const jwt = sessionStorage.getItem('JWT-TOKEN');
        if (typeof jwt === 'string') {
            return new JWTTokenDTO(jwt);
        }
    }

    public static getAccessTokenAuthBearer(
        jwt?: JWTTokenDTO | undefined
    ): string {
        const token = jwt ?? JWTTokenDTO.loadSessionToken();
        return `Bearer ${token?.accessToken}`;
    }

    public static addAccessTokenToHeaders(headers: Headers): Headers {
        const token = JWTTokenDTO.loadSessionToken();
        if (token) headers.set('Authorization', `Bearer ${token?.accessToken}`);

        return headers;
    }
}
