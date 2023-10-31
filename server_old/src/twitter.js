
const { TwitterApi } = require('twitter-api-v2');

const {logger} = require('./logger.js')
const utils = require('./utils.js')
const {epoch_s} = require('./utils.js')


const CALLBACK_URL = "http://127.0.0.1:4000/callback"
const SCOPE = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
const TWEET_LOCKOUT_INTERVAL = 300;

let Twitter = class {
    constructor(options) {
        this.client_id = options.client_id ?? null;
        this.client_id = options.config.twitter.client_id ?? this.client_id;
        this.client_secret = options.client_secret ?? null;
        this.client_secret = options.config.twitter.client_secret ?? this.client_secret;

        this.api = new TwitterApi({ clientId: this.client_id, clientSecret: this.client_secret }); // Main API
        this.client = null; // Client used to send tweets
        this.tweet_time_lockout = 0;
        this.read_only = false;

        this.refresh_token = options.config.twitter.refresh_token ?? null;
        this.expires_at = 0;

        this.code_verifier = null;
        this.state = null;

        //this.connect();
        this.print_username();
    }

    // Connect to the twitter API using the refresh token if one exists
    async connect() {
        if( epoch_s() >= this.expires_at || true) {
            if(this.refresh_token !== null) {
                logger.info("Twitter: Credentials expired. Attempting to refresh with OAuth refresh token...");
                
                return this.api.refreshOAuth2Token(this.refresh_token)
                .then( ({ client, accessToken, refreshToken, expiresIn }) => {
                    this.client = client;
                    this.refresh_token = refreshToken;
                    this.expires_at = expiresIn + epoch_s();
                    this.update_config();
                })
                .catch((reason) => {
                    logger.warn("Twitter: Could not refresh Twitter credentials")
                })
            }
            else {
                logger.info("Twitter: No user connected. Log in using the server page.")
            }
        }
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
    async twitter_auth_callback(state, code) {
        if (!this.code_verifier || !this.state || !state || !code) {
            logger.warn("You denied the app or your session expired!")
            return {"success":false, "message":"You denied the app or your session expired!"}
        }
        if (this.state !== state) {
            logger.warn('Stored tokens didnt match!');
            return {"success":false, "message":'Stored tokens didnt match!'}
        }

        return this.api.loginWithOAuth2({ code, codeVerifier:this.code_verifier, redirectUri: CALLBACK_URL })
        .then(async ({ client, accessToken, refreshToken, expiresIn }) => {
            this.client = client
            this.refresh_token = refreshToken;
            this.expires_at = expiresIn + epoch_s();

            this.print_username();
            
            this.update_config();
            return {"success":true, "message":'Logged in!'};
        })
        .catch(() => {
            logger.warn('Invalid verifier or access tokens!')
            return {"success":false, "message":'Invalid verifier or access tokens!'};
        });
    }

    // Get the username of the currently logged in user
    async print_username() {
        this.connect()
        .then((results) => {
            return this.client.v2.me()
        })
        .then((results) => {
            logger.info("Twitter: Current user is @"+results.data.username)        
        })
        .catch((reason) => {
            logger.warn("Twitter: Could not get current username. Creds not working")
        })
    }

    // Send a tweet
    async tweet(message) {
        if(this.read_only) {
            logger.info('Twitter: Read only. Would have tweeted: "' + results.data.text + '"');
            return;
        }

        if(epoch_s() < this.tweet_time_lockout) {
            logger.warn('Twitter: Tweet: Attempted to tweet "' + message + '" but lockout dose not expire for ' + (this.tweet_time_lockout-epoch_s()).toString());
            return;
        }
        
        this.connect().then((results) => {
            return this.client.v2.tweet(message);
        })
        .then((results) => {
            logger.info('Twitter: Tweeted: "' + results.data.text + '"');
            this.tweet_time_lockout = epoch_s() + TWEET_LOCKOUT_INTERVAL;
        })
        .catch((reason) => {
            logger.warn('Twitter: Tweet: Attempted to tweet "' + message + '" but got error: ' + reason)
        })
    }

    // Update the config file with the tokens
    update_config() {
        utils.config.twitter.refresh_token = this.refresh_token;
        utils.config.twitter.expires_at = this.expires_at;
        utils.save_config();
    }
}

let twitter = null;

if(process.env.IMFT_ENV == "production") {
    twitter = new Twitter({config:utils.config})
}

module.exports = { twitter };
