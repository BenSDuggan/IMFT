
const { TwitterApi } = require('twitter-api-v2');

const {logger} = require('./logger.js')
const config = require('./config.js')


// ToDo:
// Save creds to file
// Authenticate from creds in file
// Get new access token when needed


CALLBACK_URL = "http://127.0.0.1:4000/callback"
SCOPE = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']

let Twitter = class {
    constructor(client_id, client_secret) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.api = new TwitterApi({ clientId: this.client_id, clientSecret: this.client_secret }); // Main API
        this.client = null; // Client used to send tweets

        this.refresh_token = null;
        this.expires_at = null;

        this.code_verifier = null;
        this.state = null;
    }

    // Connect to the twitter API using the refresh token if one exists
    async connect() {
        const { client, accessToken, refreshToken, expiresIn } = await this.api.refreshOAuth2Token(this.refresh_token);
        
        this.client = client;
        this.refresh_token = refreshToken;
        this.expires_at = expiresIn + Math.floor(Date.now()/1000);
        this.update_config();
    }

    // Generate twitter auth link
    async get_twitter_auth_link() {
        const { url, codeVerifier, state } = this.api.generateOAuth2AuthLink(CALLBACK_URL, { scope: SCOPE });

        this.code_verifier = codeVerifier;
        this.state = state;

        logger.verbose("Twitter auth link: " + url);

        return url;
    }

    // Authenticate twitter user given callback information
    twitter_auth_callback(state, code) {
        if (!this.code_verifier || !this.state || !state || !code) {
            logger.warn("You denied the app or your session expired!")
            return {"success":false, "message":"You denied the app or your session expired!"}
        }
        if (this.state !== state) {
            logger.warn('Stored tokens didnt match!');
            return {"success":false, "message":'Stored tokens didnt match!'}
        }

        this.api.loginWithOAuth2({ code, codeVerifier:this.code_verifier, redirectUri: CALLBACK_URL })
        .then(async ({ client, accessToken, refreshToken, expiresIn }) => {
            this.client = client
            this.refresh_token = refreshToken;
            this.expires_at = expiresIn + Math.floor(Date.now()/1000);;

            this.get_username();
            
            this.update_config();
        })
        .catch(() => logger.warn('Invalid verifier or access tokens!'));
    }

    // Get the username of the currently logged in user
    get_username() {
        this.client.v2.me().then((results) => {
            logger.info("Twitter: Current user is @"+results.data.username)        
        })
    }

    // Update the config file with the tokens
    update_config() {
        config.config.twitter.refresh_token = this.refresh_token;
        config.config.twitter.expires_at = this.expires_at;
        config.save_config();
    }
}

const twitter = new Twitter(config.config.twitter.client_id, config.config.twitter.client_secret)

module.exports = { twitter };
