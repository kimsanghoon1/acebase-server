import { DropboxAuthProvider } from './dropbox';
import { FacebookAuthProvider } from './facebook';
import { GoogleAuthProvider } from './google';
import { InstagramAuthProvider } from './instagram';
import { OAuth2Provider } from './oauth-provider';
import { SpotifyAuthProvider } from './spotify';
import { GitlabAuthProvider } from './gitlab';
import { GithubAuthProvider } from './github';

export { DropboxAuthProvider, IDropboxAuthSettings } from './dropbox';
export { FacebookAuthProvider, IFacebookAuthSettings } from './facebook';
export { GoogleAuthProvider, IGoogleAuthSettings } from './google';
export { InstagramAuthProvider, IInstagramAuthSettings } from './instagram';
export { SpotifyAuthProvider, ISpotifyAuthSettings } from './spotify';
export { GitlabAuthProvider, IGitlabAuthSettings } from './gitlab';
export { GithubAuthProvider, IGithubAuthSettings } from './github';

const oAuth2Providers: { [key: string]: typeof OAuth2Provider } = {
    dropbox: DropboxAuthProvider,
    facebook: FacebookAuthProvider,
    google: GoogleAuthProvider,
    instagram: InstagramAuthProvider,
    spotify: SpotifyAuthProvider,
    gitlab: GitlabAuthProvider,
    github: GithubAuthProvider
};
export default oAuth2Providers;
