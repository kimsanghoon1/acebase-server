import { IOAuth2ProviderSettings, IOpenIDToken, IOpenIDConfiguration, IOAuth2AuthCodeParams, IOAuth2RefreshTokenParams, OAuth2ProviderInitInfo, OAuth2Provider } from './oauth-provider';
import { fetch } from '../shared/simple-fetch';

export interface IGithubAuthSettings extends IOAuth2ProviderSettings {
    /** 'openid', 'email', 'profile' and additional scopes you want to access. */
    scopes?: string[],
    state: string
}

interface IGithubAuthToken { access_token: string, scope: string, token_type: string }
interface IGithubError { error: string, error_description: string }
interface IGithubUser {
    // See https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
    "login": string,
    "id": string,
    "node_id": string,
    "avatar_url": string,
    "gravatar_id": string,
    "url": string,
    "html_url": string,
    "followers_url": string,
    "following_url": string,
    "gists_url": string,
    "starred_url": string,
    "subscriptions_url": string,
    "organizations_url": string,
    "repos_url": string,
    "events_url": string,
    "received_events_url": string,
    "type": string,
    "site_admin": boolean,
    "name": string,
    "company": string,
    "blog": string,
    "location": string,
    "email": string,
    "hireable": boolean,
    "bio": string,
    "twitter_username": string,
    "public_repos": number,
    "public_gists": number,
    "followers": number,
    "following": number,
    "created_at": string,
    "updated_at": string,
    "private_gists": number,
    "total_private_repos": number,
    "owned_private_repos": number,
    "disk_usage": number,
    "collaborators": number,
    "two_factor_authentication": Boolean,
    "plan": {
        "name": string,
        "space": number,
        "private_repos": number,
        "collaborators": number
    }
}

export class GithubAuthProvider extends OAuth2Provider {

    _config: IOpenIDConfiguration;

    constructor(settings: IGithubAuthSettings) {
        super(settings);
        if (!settings.scopes) { settings.scopes = []; }
        if (!settings.scopes.includes('email')) { settings.scopes.push('email'); }
        if (!settings.scopes.includes('profile')) { settings.scopes.push('profile'); }
        if (!settings.scopes.includes('openid')) { settings.scopes.push('openid'); }
    }

    // async getOpenIDConfig() {
    //     // Get Open ID config ("The Discovery document")
    //     if (this._config) { return this._config; }
    //     this._config = await fetch(`https://${this.settings.host}/.well-known/openid-configuration`).then(res => res.json());
    //     return this._config;
    // }

    /**
     * Starts auth flow by getting the url the user should be redirected to
     * @param info.redirectUrl Url spotify will redirect to after authorizing, should be the url
     * @param info.state Optional state that will be passed to redirectUri by spotify
     */
    async init(info: OAuth2ProviderInitInfo) {

        const authUrl = `https://github.com/login/oauth/authorize?scope=${encodeURIComponent(this.settings.scopes.join(' '))}&client_id=${this.settings.client_id}&state=${encodeURIComponent(info.state)}&redirect_uri=${encodeURIComponent(info.redirect_url)}`;
        return authUrl;
    }

    async getAccessToken(params: IOAuth2AuthCodeParams|IOAuth2RefreshTokenParams) : Promise<IGithubAuthToken> {
        // Request access & refresh tokens with authorization code, or refresh token
        // const config = await this.getOpenIDConfig();
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', "Accept": "application/json" },
            body: `client_id=${this.settings.client_id}&client_secret=${this.settings.client_secret}&code=`
            + (params.type === 'refresh'
                ? `${params.refresh_token}&grant_type=refresh_token`
                : `${params.auth_code}&redirect_uri=${encodeURIComponent(params.redirect_url)}`),
        });
        const result = await response.json() as IGithubAuthToken;
        if ((result as any).error) {
            throw new Error((result as any).error);
        }
        return result;
    }

    async getUserInfo(access_token: string) {
        // const config = await this.getOpenIDConfig();
        const response = await fetch('https://api.github.com/user', {
            method: 'GET' ,
            headers: { 'Authorization': `Bearer ${access_token}`, "Accept": "application/vnd.github+json", 'user-agent': 'node.js' },
        });
        const tmp = await response.text();
        let result = JSON.parse(tmp)
        if (response.status !== 200) {
            const error = result as IGithubError;
            throw new Error(`${error.error}: ${error.error_description}`);
        }

        const user = result as IGithubUser;
        return {
            id: user.id,
            name: user.name,
            display_name: user.name,
            picture: user.avatar_url ? [{ url: user.avatar_url }] : [],
            email: user.email,
            email_verified: true,
            other: Object.keys(user)
                .filter(key => !['sub','name','picture','email_verified'].includes(key))
                .reduce((obj, key) => { obj[key] = user[key]; return obj; }, {}),
        };
    }
}

export const AuthProvider = GithubAuthProvider;
