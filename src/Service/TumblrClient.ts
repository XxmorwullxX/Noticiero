import * as tumblr from "tumblr.js";
import { Config } from "../Config/Config";

interface TumblrPost {
    avatar: string;
    id: string;
    color: string;
    photos: string[];
    author: string;
    text: string;
    title: string;
    source: string;
    tags: string[];
}

export class TumblrClient {

    static readonly instance: TumblrClient = new TumblrClient();

    private readonly tumblr = tumblr.createClient(Config.tumblr);

    async get(tag: string): Promise<TumblrPost[]> {
        return new Promise((resolve, _reject) => {
            this.tumblr.taggedPosts(tag, {}, (_err, data) => {
                const posts: TumblrPost[] = [];
                for (const d of data) {
                    const color = d.trail[0] ? d.trail[0].blog.theme.background_color : "#ff0000";
                    const avatar = d.trail[0] ? d.trail[0].blog.theme.header_image : "https://cdn.discordapp.com/embed/avatars/0.png";

                    if (d.type === "photo") {
                        posts.push({
                            author: d.blog_name,
                            avatar,
                            color,
                            id: `${d.id}`,
                            // tslint:disable-next-line:no-any
                            photos: d.photos.map((p: any) => p.original_size.url),
                            source: d.post_url,
                            tags: d.tags.map((t: string) => `#${t}`),
                            text: d.summary,
                            title: d.summary
                        });
                    }
                }

                resolve(posts);
            });
        });
    }
}
