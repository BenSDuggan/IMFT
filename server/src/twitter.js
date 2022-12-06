
const { TwitterApi } = require('twitter-api-v2');

const {logger} = require('./logger.js')
const { config } = require('./config.js')


// ToDo:
// Save creds to file
// Authenticate from creds in file
// Get new access token when needed


CALLBACK_URL = "http://127.0.0.1:4000/callback"
SCOPE = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']

let Twitter = class {
    constructor(client_id, client_secret) {
        this.client = null; // Client used to send tweets
        this.client_id = client_id;
        this.client_secret = client_secret;

        this.code_verifier = null;
        this.state = null;
    }

    // Generate twitter auth link
    async get_twitter_auth_link() {
        const client = new TwitterApi({ clientId: this.client_id, clientSecret: this.client_secret });
        const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, { scope: SCOPE });

        this.code_verifier = codeVerifier;
        this.state = state;

        logger.verbose("Twitter auth link: " + url);

        return url;
    }

    // Authenticate twitter user given callback information
    twitter_auth_callback(state, code) {
        if (!this.code_verifier || !this.state || !state || !code) {
            logger.warn("You denied the app or your session expired!")
            return
        }
        if (this.state !== state) {
            logger.warn('Stored tokens didnt match!');
            return
        }
    
        const client = new TwitterApi({ clientId: this.client_id, clientSecret: this.client_secret });

        client.loginWithOAuth2({ code, codeVerifier:this.code_verifier, redirectUri: CALLBACK_URL })
        .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
            // {loggedClient} is an authenticated client in behalf of some user
            // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
            // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

            // Example request
            loggedClient.v2.me().then((results) => {
                console.log(results);
            })
        })
        .catch(() => logger.warn('Invalid verifier or access tokens!'));
    }
}

const twitter = new Twitter(config.twitter.client_id, config.twitter.client_secret)
//twitter.get_twitter_auth_link()

module.exports = { twitter };
