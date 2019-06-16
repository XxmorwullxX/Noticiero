import * as Twitter from "twitter";
import { Config } from "../Config/Config";

interface Tweet {
    id: string;
    url: string;
}

export class TwitterClient {

    static readonly instance: TwitterClient = new TwitterClient();

    private readonly twitter = new Twitter(Config.twitter);

    async readTweets(user: string): Promise<Tweet[]> {
        return new Promise((resolve, reject) => {
            this.twitter.get("statuses/user_timeline", {
                screen_name: user
            }, (error, tweets: Twitter.ResponseData) => {

                if (error) {
                    reject(error);
                    return;
                }

                const ret: Tweet[] = [];

                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < tweets.length; i++) {
                    const tweet = tweets[i];

                    if (tweet.retweeted_status) {
                        const images = (tweet.retweeted_status.entities.media || []).length;
                        const urls = (tweet.retweeted_status.entities.urls || []).length;

                        if (images || urls) {
                            ret.push({
                                id: tweet.retweeted_status.id_str,
                                url: `https://twitter.com/${tweet.retweeted_status.user.screen_name}/status/${tweet.retweeted_status.id_str}`
                            });
                        }
                    }
                }

                resolve(ret);
            });
        });
    }
}
