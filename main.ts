import token from "./token.json";
import { writeFileSync } from "node:fs";

class twitch_xs {

    private client_id:string;
    private client_secret:string;
    private token:{
        created_at:number,
        access_token:string,
        expires_in:number,
        token_type:string,
    };
	/**
	 * Instance client
	 * @param {{
	 * client_id:string,
	 * client_secret:string,
	 * }} config
	 * @example
	 * const client = new twitch_xs({ client_id:"your_client_id", client_secret:"your_client_secret" });
	 */
	constructor(config:{
        client_id:string;
        client_secret:string;
    }) {
		this.client_id = config.client_id;
		this.client_secret = config.client_secret;
		this.token = token[0];
	}
	/**
     * Generate new token
     * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:{
	 * created_at:number,
	 * access_token:string,
	 * expires_in:number,
	 * token_type:string,
	 * }
	 * }>}
	 * @example
	 * client.generateToken().then(console.log);
	 */
	generateToken = async ():Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:{
        created_at:number,
        access_token:string,
        expires_in:number,
        token_type:string,
        }
    }> => {

		const link = `https://id.twitch.tv/oauth2/token?client_id=${this.client_id}&client_secret=${this.client_secret}&grant_type=client_credentials`;

		const response = await fetch(link, {
			method:"POST",
		});

		if (response.ok) {
			const data = await response.json();
			data.token_type = "Bearer";
			data.created_at = new Date().getTime();
			this.token = data;
			token[0] = data;
			writeFileSync("./token.json", JSON.stringify(token, null, 4));
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data };
		}
		else {
			throw new Error(`Cannot generate Token => ${response.statusText}`);
		}

	}
    /**
     * Check token availability
     * @returns {boolean}
     */
	isExpiredToken = ():boolean => {

		const now = Math.floor(Date.now() / 1000);
		const createdAt = this.token.created_at;
		const expiresIn = this.token.expires_in;
		const expirationTime = createdAt + expiresIn;

		return now >= expirationTime;

	}
    /**
     * Refresh the token
     * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:{
	 * created_at:number,
	 * access_token:string,
	 * expires_in:number,
	 * token_type:string,
	 * }
	 * }>}
	 * @example
	 * client.refreshToken().then(console.log);
	 */
	refreshToken = async ():Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:{
        created_at:number,
        access_token:string,
        expires_in:number,
        token_type:string,
        }
    }> => {

		const new_token = await this.generateToken();

		if (!new_token.ok || !new_token.data) {
			throw new Error(`Cannot refresh Token => ${new_token.statusText}`);
		}
        else {
            this.token = new_token.data;
			token[0] = new_token.data;
			writeFileSync("./token.json", JSON.stringify(token, null, 4));
            return { ok:new_token.ok, status:new_token.status, statusText:new_token.statusText, data:new_token.data };
        }

	}
	/**
     * **Gets a list of all streams**
	 * @description The list is in descending order by the number of viewers watching the stream. Because viewers come and go during a stream, it’s possible to find duplicate or missing streams in the list as you page through the results.
     * @param {{
	 * users_names?:Array<string>,
	 * games_names?:Array<string>,
	 * type?:"all"|"live",
	 * languages?:Array<string>,
	 * first?:number,
	 * before?:string,
	 * after?:string,
	 * }} [params]
	 * > • `users_ids` The users IDs used to filter the list of streams. Returns only the streams of those users that are broadcasting. You may specify a maximum of 100 IDs.  
	 * > • `users_logins` The users login names used to filter the list of streams. Returns only the streams of those users that are broadcasting. You may specify a maximum of 100 login names.  
	 * > • `games_ids` The games (categories) IDs used to filter the list of streams. Returns only the streams that are broadcasting the games (categories). You may specify a maximum of 100 IDs.  
	 * > • `type` The type of stream to filter the list of streams by. Default is all.  
	 * > • `languages` A language code used to filter the list of streams. Returns only streams that broadcast in the specified language. Specify the language using an ISO 639-1 two-letter language code or other if the broadcast uses a language not in the list of [supported stream languages](https://help.twitch.tv/s/article/languages-on-twitch?language=en_US#streamlang). You may specify a maximum of 100 language codes.  
	 * > • `first` The maximum number of items to return per page in the response. The minimum page size is 1 item per page and the maximum is 100 items per page. The default is 20.  
	 * > • `before` The cursor used to get the previous page of results. The Pagination object in the response contains the cursor’s value. [Read more](https://dev.twitch.tv/docs/api/guide/#pagination)  
	 * > • `after` The cursor used to get the next page of results. The Pagination object in the response contains the cursor’s value. [Read more](https://dev.twitch.tv/docs/api/guide/#pagination)  
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * id:string,
	 * user_id:string,
	 * user_login:string,
	 * user_name:string,
	 * game_id:string,
	 * game_name:string,
	 * type:"live"|"",
	 * title:string|"",
	 * tags:Array<string>,
	 * viewer_count:number,
	 * started_at:string,
	 * language:string,
	 * thumbnail_url:string,
	 * tag_ids:[],
	 * is_mature:boolean
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of streams.  
	 * > > • `id` An ID that identifies the stream. You can use this ID later to look up the video on demand (VOD).  
	 * > > • `user_id` The ID of the user that’s broadcasting the stream.  
	 * > > • `user_login` The user’s login name.  
	 * > > • `user_name` The user’s display name.  
	 * > > • `game_id` The ID of the category or game being played.  
	 * > > • `game_name` The name of the category or game being played.  
	 * > > • `type` The type of stream. If an error occurs, this field is set to an empty string.  
	 * > > • `title` The stream’s title. Is an empty string if not set.  
	 * > > • `tags` The tags applied to the stream.  
	 * > > • `viewer_count` The number of users watching the stream.  
	 * > > • `started_at` The UTC date and time (in RFC3339 format) of when the broadcast began.  
	 * > > • `language` The language that the stream uses. This is an ISO 639-1 two-letter language code or other if the stream uses a language not in the list of [supported stream languages](https://help.twitch.tv/s/article/languages-on-twitch?language=en_US#streamlang).  
	 * > > • `thumbnail_url` A URL to an image of a frame from the last 5 minutes of the stream. Replace the width and height placeholders in the URL (**{width}x{height}**) with the size of the image you want, in pixels.  
	 * > > • `tag_ids` **IMPORTANT** As of February 28, 2023, this field is deprecated and returns only an empty array.  
	 * > > • `is_mature` A Boolean value that indicates whether the stream is meant for mature audiences.  
	 * @example
    // Gets information about the 20 most active streams.
    client.getStreams().then(console.log);
    // Gets streams for the specified logins. If the user is not live, the response doesn’t include them.
    client.getStreams({
	   users_logins:["twitchdev"]
    }).then(console.log);
	 */
	getStreams = async (params?:{
        users_names?:Array<string>,
        games_names?:Array<string>,
        type?:"all"|"live",
        languages?:Array<string>,
        first?:number,
        before?:string,
        after?:string,
    }):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        id:string,
        user_id:string,
        user_login:string,
        user_name:string,
        game_id:string,
        game_name:string,
        type:"live"|"",
        title:string|"",
        tags:Array<string>,
        viewer_count:number,
        started_at:string,
        language:string,
        thumbnail_url:string,
        tag_ids:[],
        is_mature:boolean
        }>
    }> => {

		let link = `https://api.twitch.tv/helix/streams`;

		if (params) {

			if (params.after) {
				if (typeof params.after !== "string") {
					throw new TypeError(`\`after\` parameter must be a string => Received ${typeof params.after}`);
				}
				link = link.endsWith("?") ? `${link}after=${params.after}` : link.endsWith("&") ? `${link}after=${params.after}` : `${link}?after=${params.after}`;
			}

			if (params.before) {
				if (typeof params.before !== "string") {
					throw new TypeError(`\`before\` parameter must be a string => Received ${typeof params.before}`);
				}
				link = link.endsWith("?") ? `${link}before=${params.before}` : link.endsWith("&") ? `${link}before=${params.before}` : `${link}?before=${params.before}`;
			}

			if (params.first) {
				if (typeof params.first !== "number") {
					throw new TypeError(`\`first\` parameter must be a number => Received ${typeof params.first}`);
				}
				link = link.endsWith("?") ? `${link}first=${params.first}` : link.endsWith("&") ? `${link}first=${params.first}` : `${link}?first=${params.first}`;
			}

			if (params.games_names) {
				if (!Array.isArray(params.games_names)) {
					throw new TypeError(`\`games_names\` parameter must be an array of string => Received ${typeof params.games_names}`);
				}
				for (let i = 0; i < params.games_names.length; i++) {
					if (typeof params.games_names[i] !== "string") {
						throw new TypeError(`\`games_names\` parameter must be an array of string => Received ${typeof params.games_names[i]} in the array`);
					}
				}
				const games = await this.getGames(params.games_names);
				if (!games.ok || !games.data) {
					throw new Error(`Cannot get games => ${games.statusText}`);
				}
				const ids = games.data.map(game => game.id);
				const map = ids.slice(0, 100).join('&game_id=');
				link = link.endsWith("?") ? `${link}game_id=${map}` : link.endsWith("&") ? `${link}game_id=${map}` : `${link}?game_id=${map}`;
			}

			if (params.languages) {
				if (!Array.isArray(params.languages)) {
					throw new TypeError(`\`languages\` parameter must be an array of string => Received ${typeof params.languages}`);
				}
				for (let i = 0; i < params.languages.length; i++) {
					if (typeof params.languages[i] !== "string") {
						throw new TypeError(`\`languages\` parameter must be an array of string => Received ${typeof params.languages[i]} in the array`);
					}
				}
				const map = params.languages.slice(0, 100).join('&language=');
				link = link.endsWith("?") ? `${link}language=${map}` : link.endsWith("&") ? `${link}language=${map}` : `${link}?language=${map}`;
			}
			if (params.type) {
				if (params.type !== "all" && params.type !== "live") {
					throw new Error(`\`type\` parameter must be "all" or "live"`);
				}
				link = link.endsWith("?") ? `${link}type=${params.type}` : link.endsWith("&") ? `${link}type=${params.type}` : `${link}?type=${params.type}`;
			}
			if (params.users_names) {
				if (!Array.isArray(params.users_names)) {
					throw new TypeError(`\`users_names\` parameter must be an array of string => Received ${typeof params.users_names}`);
				}
				for (let i = 0; i < params.users_names.length; i++) {
					if (typeof params.users_names[i] !== "string") {
						throw new TypeError(`\`users_names\` parameter must be an array of string => Received ${typeof params.users_names[i]} in the array`);
					}
				}
				const users = await this.getUsers(params.users_names);
				if (!users.ok || !users.data) {
					throw new Error(`Cannot get users => ${users.statusText}`);
				}
				const ids = users.data.map(user => user.id);
				const map = ids.slice(0, 100).join('&user_id=');
				link = link.endsWith("?") ? `${link}user_id=${map}` : link.endsWith("&") ? `${link}user_id=${map}` : `${link}?user_id=${map}`;
			}

		}

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});

		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
     * **Gets information about one or more users**
	 * @description You may look up users using their username.
     * @param {Array<string>} usernames The usernames of the users to get. The maximum number of usernames you may specify is 100.
     * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * id:string,
	 * display_name:string,
	 * broadcaster_type:""|"affiliate"|"partner",
	 * description:string,
	 * profile_image_url:string,
	 * offline_image_url:string,
	 * view_count:number,
	 * created_at:string
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of users.  
	 * > > • `id` An ID that identifies the user.  
	 * > > • `login` The user’s display name.  
	 * > > • `type` The type of user.  
	 * > > • `broadcaster_type` The type of broadcaster.  
	 * > > • `description` The user’s description of their channel.  
	 * > > • `profile_image_url` A URL to the user’s profile image.  
	 * > > • `offline_image_url` A URL to the user’s offline image.  
	 * > > • `view_count` **NOTE**: This field has been deprecated (see [Get Users API endpoint – “view_count” deprecation](https://discuss.dev.twitch.tv/t/get-users-api-endpoint-view-count-deprecation/37777)). Any data in this field is not valid and should not be used.  
	 * > > • `created_at` The UTC date and time that the user’s account was created. The timestamp is in RFC3339 format.  
	 * @example
	client.getUsers(["twitchdev"]).then(console.log);
	 */
	getUsers = async (usernames:Array<string>):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        id:string,
        display_name:string,
        broadcaster_type:""|"affiliate"|"partner",
        description:string,
        profile_image_url:string,
        offline_image_url:string,
        view_count:number,
        created_at:string
        }>
    }> => {

		if (!usernames) {
			throw new Error(`usernames are required`);
		}
		if (!Array.isArray(usernames)) {
			throw new TypeError(`\`usernames\` parameter must be an array of string => Received ${typeof usernames}`);
		}
		if (usernames.length === 0) {
			throw new Error(`usernames are required => Received an empty array`);
		}
		for (let i = 0; i < usernames.length; i++) {
			if (typeof usernames[i] !== "string") {
				throw new TypeError(`\`usernames\` parameter must be an array of string => Received ${typeof usernames[i]} in the array`);
			}
		}

		const map = usernames.splice(0, 100).join('&login=');
		const link = `https://api.twitch.tv/helix/users?login=${map}`;

        if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});

		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets a list of Cheermotes that users can use to cheer Bits in any Bits-enabled channel’s chat room**
	 * @description Cheermotes are animated emotes that viewers can assign Bits to.
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * prefix:string,
	 * tiers:Array<{
	 * min_bits:number,
	 * id:"1"|"100"|"500"|"1000"|"5000"|"10000"|"100000",
	 * color:string,
	 * images:{
	 * dark:{
	 * animated:{
	 * "1":string,
	 * "1.5":string,
	 * "2":string,
	 * "3":string,
	 * "4":string,
	 * },
	 * static:{
	 * "1":string,
	 * "1.5":string,
	 * "2":string,
	 * "3":string,
	 * "4":string,
	 * },
	 * },
	 * light:{
	 * animated:{
	 * "1":string,
	 * "1.5":string,
	 * "2":string,
	 * "3":string,
	 * "4":string,
	 * },
	 * static:{
	 * "1":string,
	 * "1.5":string,
	 * "2":string,
	 * "3":string,
	 * "4":string,
	 * },
	 * },
	 * },
	 * can_cheer:boolean,
	 * show_in_bits_card:boolean,
	 * }>,
	 * type:"global_first_party"|"global_third_party"|"channel_custom"|"display_only"|"sponsored",
	 * order:number,
	 * last_updated:string,
	 * is_charitable:boolean,
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of Cheermotes. The list is in ascending order by the order field’s value.  
	 * > > • `prefix` The name portion of the Cheermote string that you use in chat to cheer Bits. The full Cheermote string is the concatenation of {prefix} + {number of Bits}. For example, if the prefix is “Cheer” and you want to cheer 100 Bits, the full Cheermote string is Cheer100. When the Cheermote string is entered in chat, Twitch converts it to the image associated with the Bits tier that was cheered.  
	 * > > • `tiers`  
	 * > > > • `min_bits` The minimum number of Bits that you must cheer at this tier level. The maximum number of Bits that you can cheer at this level is determined by the required minimum Bits of the next tier level minus 1. For example, if min_bits is 1 and min_bits for the next tier is 100, the Bits range for this tier level is 1 through 99. The minimum Bits value of the last tier is the maximum number of Bits you can cheer using this Cheermote. For example, 10000.  
	 * > > > • `id` The tier level.  
	 * > > > • `color` The hex code of the color associated with this tier level (for example, #979797).  
	 * > > > • `images` The animated and static image sets for the Cheermote. The dictionary of images is organized by theme, format, and size. The theme keys are dark and light. Each theme is a dictionary of formats: animated and static. Each format is a dictionary of sizes: 1, 1.5, 2, 3, and 4. The value of each size contains the URL to the image.  
	 * > > > • `can_cheer` A Boolean value that determines whether users can cheer at this tier level.  
	 * > > > • `show_in_bits_card` A Boolean value that determines whether this tier level is shown in the Bits card. Is true if this tier level is shown in the Bits card.  
	 * 
	 * > > • `type` The type of Cheermote.  
	 * > > • `order` The order that the Cheermotes are shown in the Bits card. The numbers may not be consecutive. For example, the numbers may jump from 1 to 7 to 13. The order numbers are unique within a Cheermote type (for example, global_first_party) but may not be unique amongst all Cheermotes in the response.  
	 * > > • `last_updated` The date and time, in RFC3339 format, when this Cheermote was last updated.  
	 * > > • `is_charitable` A Boolean value that indicates whether this Cheermote provides a charitable contribution match during charity campaigns.
	 * @example
    client.getCheermotes().then(console.log);
     */
	getCheermotes = async ():Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        prefix:string,
        tiers:Array<{
        min_bits:number,
        id:"1"|"100"|"500"|"1000"|"5000"|"10000"|"100000",
        color:string,
        images:{
        dark:{
        animated:{
        "1":string,
        "1.5":string,
        "2":string,
        "3":string,
        "4":string,
        },
        static:{
        "1":string,
        "1.5":string,
        "2":string,
        "3":string,
        "4":string,
        },
        },
        light:{
        animated:{
        "1":string,
        "1.5":string,
        "2":string,
        "3":string,
        "4":string,
        },
        static:{
        "1":string,
        "1.5":string,
        "2":string,
        "3":string,
        "4":string,
        },
        },
        },
        can_cheer:boolean,
        show_in_bits_card:boolean,
        }>,
        type:"global_first_party"|"global_third_party"|"channel_custom"|"display_only"|"sponsored",
        order:number,
        last_updated:string,
        is_charitable:boolean,
        }>
    }> => {

		const link = "https://api.twitch.tv/helix/bits/cheermotes";

        if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets the list of [global emotes](https://www.twitch.tv/creatorcamp/fr-fr/paths/getting-started-on-twitch/emotes/) or broadcaster’s list of custom emotes.**
	 * @description Global emotes are Twitch-created emotes that users can use in any Twitch chat.  
	 * Broadcasters create these custom emotes for users who subscribe to or follow the channel or cheer Bits in the channel’s chat window. [Learn More](https://dev.twitch.tv/docs/irc/emotes/).  
	 * 
	 * **NOTE**: With the exception of custom follower emotes, users may use custom emotes in any Twitch chat.
	 * @param {string} [username] The username that identifies the broadcaster whose emotes you want to get.
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * id:string,
	 * name:string,
	 * images:{
	 * url_1x:string,
	 * url_2x:string,
	 * url_4x:string,
	 * },
	 * tier?:string,
	 * emote_type?:"bitstier"|"follower"|"subscriptions",
	 * emote_set_id?:string,
	 * format:Array<"static"|"animated">,
	 * scale:Array<"1.0"|"2.0"|"3.0">,
	 * theme_mode:Array<"dark"|"light">,
	 * template:string,
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of global emotes. or the list of emotes that the specified broadcaster created. If the broadcaster hasn’t created custom emotes, the list is empty.  
	 * > > • `id` An ID that identifies this emote.  
	 * > > • `name` The name of the emote. This is the name that viewers type in the chat window to get the emote to appear.  
	 * > > • `images` The image URLs for the emote. These image URLs always provide a static, non-animated emote image with a light background. **NOTE**: You should use the templated URL in the template field to fetch the image instead of using these URLs.  
	 * > > > • `url_1x` A URL to the small version (28px x 28px) of the emote.  
	 * > > > • `url_2x` A URL to the medium version (56px x 56px) of the emote.  
	 * > > > • `url_4x` A URL to the large version (112px x 112px) of the emote.  
	 * 
	 * > > • `tier?` The subscriber tier at which the emote is unlocked. This field contains the tier information only if emote_type is set to subscriptions, otherwise, it’s an empty string.  
	 * > > • `emote_type?` The type of emote.  
	 * > > • `emote_set_id?` An ID that identifies the emote set that the emote belongs to.  
	 * > > • `format` The formats that the emote is available in. For example, if the emote is available only as a static PNG, the array contains only static. But if the emote is available as a static PNG and an animated GIF, the array contains static and animated.  
	 * > > • `scale` The sizes that the emote is available in. For example, if the emote is available in small and medium sizes, the array contains 1.0 and 2.0.  
	 * > > • `theme_mode` The background themes that the emote is available in.  
	 * > > • `template` A templated URL. Use the values from the id, format, scale, and theme_mode fields to replace the like-named placeholder strings in the templated URL to create a CDN (content delivery network) URL that you use to fetch the emote. For information about what the template looks like and how to use it to fetch emotes, see [Emote CDN URL format](https://dev.twitch.tv/docs/irc/emotes/#cdn-template). You should use this template instead of using the URLs in the images object.
	 * @example
    // Gets all global emotes.
    client.getChatEmotes().then(console.log);
    // Gets custom emotes that the TwitchDev channel created.
    client.getChatEmotes("twitchdev").then(console.log);
	 */
	getChatEmotes = async (username?:string):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        id:string,
        name:string,
        images:{
        url_1x:string,
        url_2x:string,
        url_4x:string,
        },
        tier?:string,
        emote_type?:"bitstier"|"follower"|"subscriptions",
        emote_set_id?:string,
        format:Array<"static"|"animated">,
        scale:Array<"1.0"|"2.0"|"3.0">,
        theme_mode:Array<"dark"|"light">,
        template:string,
        }>
    }> => {

		let link = `https://api.twitch.tv/helix/chat/emotes/global`;

		if (username) {

			if (typeof username !== "string") {
				throw new TypeError(`\`username\` parameter must be a string => Received ${typeof username}`);
			}

			const user = await this.getUsers([username]);

			if (!user.ok || !user.data) {
				throw new Error(`Cannot get this user : ${username} => ${user.statusText}`);
			}
	
			if (user.data.length === 0) {
				throw new Error(`Cannot find this user : ${username}`);
			}
	
			const broadcaster_id = user.data[0].id;

			link = `https://api.twitch.tv/helix/chat/emotes/?broadcaster_id=${broadcaster_id}`;

		}

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets Twitch’s list of chat badges, which users may use in any channel’s chat room or the broadcaster’s list of custom chat badges.**
	 * @description For information about chat badges, see [Twitch Chat Badges Guide](https://help.twitch.tv/s/article/twitch-chat-badges-guide?language=en_US).  
	 * The list is empty if the broadcaster hasn’t created custom chat badges. For information about custom badges, see [subscriber badges](https://help.twitch.tv/s/article/subscriber-badge-guide?language=en_US) and [Bits badges](https://help.twitch.tv/s/article/custom-bit-badges-guide?language=en_US).
	 * @param {string} [username] 
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * set_id:string,
	 * versions:Array<{
	 * id:string,
	 * image_url_1x:string,
	 * image_url_2x:string,
	 * image_url_4x:string,
	 * title:string,
	 * description:string,
	 * click_action:string|null,
	 * click_url:string|null,
	 * }>
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of chat badges. The list is sorted in ascending order by set_id, and within a set, the list is sorted in ascending order by id.  
	 * > > • `set_id` An ID that identifies this set of chat badges. For example, Bits or Subscriber.  
	 * > > • `versions` The list of chat badges in this set.  
	 * > > > • `id` An ID that identifies this version of the badge. The ID can be any value. For example, for Bits, the ID is the Bits tier level, but for World of Warcraft, it could be Alliance or Horde.  
	 * > > > • `image_url_1x` A URL to the small version (18px x 18px) of the badge.  
	 * > > > • `image_url_2x` A URL to the medium version (36px x 36px) of the badge.  
	 * > > > • `image_url_4x` A URL to the large version (72px x 72px) of the badge.  
	 * > > > • `title` The title of the badge.  
	 * > > > • `description` The description of the badge.  
	 * > > > • `click_action` The action to take when clicking on the badge. Set to null if no action is specified.  
	 * > > > • `click_url` The URL to navigate to when clicking on the badge. Set to null if no URL is specified.
	 * @example
    // Gets the list of global chat badges.
    client.getChatBadges().then(console.log);
    // Get the list of custom chat badges that the TwitchDev Twitch channel created.
    client.getChatBadges("twitchdev").then(console.log);
	 */
	getChatBadges = async (username?:string):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        set_id:string,
        versions:Array<{
        id:string,
        image_url_1x:string,
        image_url_2x:string,
        image_url_4x:string,
        title:string,
        description:string,
        click_action:string|null,
        click_url:string|null,
        }>
        }>
    }> => {

		let link = `https://api.twitch.tv/helix/chat/badges/global`;

		if (username) {

			if (typeof username !== "string") {
				throw new TypeError(`\`username\` parameter must be a string => Received ${typeof username}`);
			}

			const user = await this.getUsers([username]);

			if (!user.ok || !user.data) {
				throw new Error(`Cannot get this user : ${username} => ${user.statusText}`);
			}
	
			if (user.data.length === 0) {
				throw new Error(`Cannot find this user : ${username}`);
			}
	
			const broadcaster_id = user.data[0].id;

			link = `https://api.twitch.tv/helix/chat/badges/?broadcaster_id=${broadcaster_id}`;

		}

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets the broadcaster’s chat settings**
	 * @param {string} username The username of the broadcaster whose chat settings you want to get.
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * broadcaster_id:string,
	 * emote_mode:boolean,
	 * follower_mode:boolean,
	 * follower_mode_duration:number|null,
	 * slow_mode:boolean,
	 * slow_mode_wait_time:number|null,
	 * subscriber_mode:boolean,
	 * unique_chat_mode:boolean,
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of chat settings. The list contains a single object with all the settings.  
	 * > > • `broadcaster_id` The ID of the broadcaster specified in the request.  
	 * > > • `emote_mode` A Boolean value that determines whether chat messages must contain only emotes. Is true if chat messages may contain only emotes; otherwise, false.  
	 * > > • `follower_mode` A Boolean value that determines whether the broadcaster restricts the chat room to followers only. Is true if the broadcaster restricts the chat room to followers only; otherwise, false. See the follower_mode_duration field for how long users must follow the broadcaster before being able to participate in the chat room.  
	 * > > • `follower_mode_duration` The length of time, in minutes, that users must follow the broadcaster before being able to participate in the chat room. Is null if follower_mode is false.  
	 * > > • `slow_mode` A Boolean value that determines whether the broadcaster limits how often users in the chat room are allowed to send messages. Is true if the broadcaster applies a delay; otherwise, false. See the slow_mode_wait_time field for the delay.  
	 * > > • `slow_mode_wait_time` The amount of time, in seconds, that users must wait between sending messages. Is null if slow_mode is false.  
	 * > > • `subscriber_mode` A Boolean value that determines whether only users that subscribe to the broadcaster’s channel may talk in the chat room. Is true if the broadcaster restricts the chat room to subscribers only; otherwise, false.  
	 * > > • `unique_chat_mode` A Boolean value that determines whether the broadcaster requires users to post only unique messages in the chat room. Is true if the broadcaster requires unique messages only; otherwise, false.  
	 * @example
    client.getChatSettings("twitchdev").then(console.log);
	 */
	getChatSettings = async (username:string):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        broadcaster_id:string,
        emote_mode:boolean,
        follower_mode:boolean,
        follower_mode_duration:number|null,
        slow_mode:boolean,
        slow_mode_wait_time:number|null,
        subscriber_mode:boolean,
        unique_chat_mode:boolean,
        }>
    }> => {

		if (!username) {
			throw new Error(`\`username\` parameter is required`);
		}
		if (typeof username !== "string") {
			throw new TypeError(`\`username\` parameter must be a string => Received ${typeof username}`);
		}

		const user = await this.getUsers([username]);

		if (!user.ok || !user.data) {
			throw new Error(`Cannot get this user : ${username} => ${user.statusText}`);
		}
	
		if (user.data.length === 0) {
			throw new Error(`Cannot find this user : ${username}`);
		}
	
		const broadcaster_id = user.data[0].id;

		const link = `https://api.twitch.tv/helix/chat/settings/?broadcaster_id=${broadcaster_id}`;

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets the color used for the user’s name in chat.**
	 * @param {Array<string>} usernames The ID of the user whose username color you want to get. The API ignores duplicate names and names that weren’t found.
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * user_id:string,
	 * user_name:string,
	 * user_login:string,
	 * color:string,
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of users and the color code they use for their name.  
	 * > > • `user_id` An ID that uniquely identifies the user.  
	 * > > • `user_login` The user’s login name.  
	 * > > • `user_name` The user’s display name.  
	 * > > • `color` The Hex color code that the user uses in chat for their name. If the user hasn’t specified a color in their settings, the string is empty.  
	 * @example
    client.getUsersChatColor(["twitchdev"]).then(console.log);
	 */
	getUsersChatColor = async (usernames:Array<string>):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        user_id:string,
        user_name:string,
        user_login:string,
        color:string,
        }>
    }> => {

		if (!usernames) {
			throw new Error(`usernames are required`);
		}
		if (!Array.isArray(usernames)) {
			throw new TypeError(`\`usernames\` parameter must be an array of string => Received ${typeof usernames}`);
		}
		if (usernames.length === 0) {
			throw new Error(`usernames are required => Received an empty array`);
		}
		for (let i = 0; i < usernames.length; i++) {
			if (typeof usernames[i] !== "string") {
				throw new TypeError(`\`usernames\` parameter must be an array of string => Received ${typeof usernames[i]} in the array`);
			}
		}

		const users = await this.getUsers(usernames);

		if (!users.ok || !users.data) {
			throw new Error(`Error on trying get users : ${usernames} => ${users.statusText}`);
		}
		if (users.data.length === 0) {
			throw new Error(`Error on trying get users : ${usernames}`);
		}

		const ids = users.data.map(user => user.id);

		const map = ids.join('&user_id=');
		const link = `https://api.twitch.tv/helix/chat/color?user_id=${map}`;

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});

		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets one or more video clips that were captured from streams**
	 * @description For information about clips, see [How to use clips](https://help.twitch.tv/s/article/how-to-use-clips?language=en_US).
	 * @param {string} username A username that identifies the broadcaster whose video clips you want to get. Use this parameter to get clips that were captured from the broadcaster’s streams.
	 * @param {{
	 * started_at?:string,
	 * ended_at?:string,
	 * first?:number,
	 * before:string,
	 * after:string
	 * }} [params]
	 * > • `started_at?` The start date used to filter clips. The API returns only clips within the start and end date window. Specify the date and time in RFC3339 format.  
	 * > • `ended_at?` The end date used to filter clips. If not specified, the time window is the start date plus one week. Specify the date and time in RFC3339 format.  
	 * > • `first?` The maximum number of clips to return per page in the response. The minimum page size is 1 clip per page and the maximum is 100. The default is 20.  
	 * > • `before?` The cursor used to get the previous page of results. The Pagination object in the response contains the cursor’s value. [Read More](https://dev.twitch.tv/docs/api/guide/#pagination)  
	 * > • `after` The cursor used to get the next page of results. The Pagination object in the response contains the cursor’s value. [Read More](https://dev.twitch.tv/docs/api/guide/#pagination)  
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * id:string,
	 * url:string,
	 * embed_url:string,
	 * broadcaster_id:string,
	 * broadcaster_name:string,
	 * creator_id:string,
	 * creator_name:string,
	 * video_id:string,
	 * game_id:string,
	 * language:string,
	 * title:string,
	 * view_count:number,
	 * created_at:string,
	 * thumbnail_url:string,
	 * duration:number,
	 * vod_offset:number|null,
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of video clips. For clips returned by game_id or broadcaster_id, the list is in descending order by view count. For lists returned by id, the list is in the same order as the input IDs.  
	 * > > • `id` An ID that uniquely identifies the clip.  
	 * > > • `url` A URL to the clip.  
	 * > > • `embed_url` A URL that you can use in an iframe to embed the clip (see [Embedding Video and Clips](https://dev.twitch.tv/docs/embed/video-and-clips/)).  
	 * > > • `broadcaster_id` An ID that identifies the broadcaster that the video was clipped from.  
	 * > > • `broadcaster_name` The broadcaster’s display name.  
	 * > > • `creator_id` An ID that identifies the user that created the clip.  
	 * > > • `creator_name` The user’s display name.  
	 * > > • `video_id` An ID that identifies the video that the clip came from. This field contains an empty string if the video is not available.  
	 * > > • `game_id` The ID of the game that was being played when the clip was created.  
	 * > > • `language` The ISO 639-1 two-letter language code that the broadcaster broadcasts in. For example, en for English. The value is other if the broadcaster uses a language that Twitch doesn’t support.  
	 * > > • `title` The title of the clip.  
	 * > > • `view_count` The number of times the clip has been viewed.  
	 * > > • `created_at` The date and time of when the clip was created. The date and time is in RFC3339 format.  
	 * > > • `thumbnail_url` A URL to a thumbnail image of the clip.  
	 * > > • `duration` The length of the clip, in seconds. Precision is 0.1.  
	 * > > • `vod_offset` The zero-based offset, in seconds, to where the clip starts in the video (VOD). Is null if the video is not available or hasn’t been created yet from the live stream (see video_id). Note that there’s a delay between when a clip is created during a broadcast and when the offset is set. During the delay period, vod_offset is null. The delay is indeterminant but is typically minutes long.  
	 * @example
    client.getClips("twitchdev").then(console.log);
	 */
	getClips = async (username:string, params?:{
        started_at?:string,
        ended_at?:string,
        first?:number,
        before:string,
        after:string
    }):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        id:string,
        url:string,
        embed_url:string,
        broadcaster_id:string,
        broadcaster_name:string,
        creator_id:string,
        creator_name:string,
        video_id:string,
        game_id:string,
        language:string,
        title:string,
        view_count:number,
        created_at:string,
        thumbnail_url:string,
        duration:number,
        vod_offset:number|null,
        }>
    }> => {

		if (!username) {
			throw new Error(`username is required`);
		}
		if (typeof username !== "string") {
			throw new TypeError(`\`username\` parameter must be a string => Received ${typeof username}`);
		}

		const user = await this.getUsers([username]);

		if (!user.ok || !user.data) {
			throw new Error(`Cannot get this user : ${username} => ${user.statusText}`);
		}
	
		if (user.data.length === 0) {
			throw new Error(`Cannot find this user : ${username}`);
		}
	
		const broadcaster_id = user.data[0].id;

		let link = `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcaster_id}`;

		if (params) {

			if (params.started_at) {
				if (typeof params.started_at !== "string") {
					throw new TypeError(`\`started_at\` parameter must be a string => Received ${typeof params.started_at}`);
				}
				link = link.endsWith("?") ? `${link}started_at=${params.started_at}` : link.endsWith("&") ? `${link}started_at=${params.started_at}` : `${link}?started_at=${params.started_at}`;
			}
			if (params.ended_at) {
				if (typeof params.ended_at !== "string") {
					throw new TypeError(`\`ended_at\` parameter must be a string => Received ${typeof params.ended_at}`);
				}
				link = link.endsWith("?") ? `${link}ended_at=${params.ended_at}` : link.endsWith("&") ? `${link}ended_at=${params.ended_at}` : `${link}?ended_at=${params.ended_at}`;
			}
			if (params.after) {
				if (typeof params.after !== "string") {
					throw new TypeError(`\`after\` parameter must be a string => Received ${typeof params.after}`);
				}
				link = link.endsWith("?") ? `${link}after=${params.after}` : link.endsWith("&") ? `${link}after=${params.after}` : `${link}?after=${params.after}`;
			}
			if (params.before) {
				if (typeof params.before !== "string") {
					throw new TypeError(`\`before\` parameter must be a string => Received ${typeof params.before}`);
				}
				link = link.endsWith("?") ? `${link}before=${params.before}` : link.endsWith("&") ? `${link}before=${params.before}` : `${link}?before=${params.before}`;
			}
			if (params.first) {
				if (typeof params.first !== "number") {
					throw new TypeError(`\`first\` parameter must be a string => Received ${typeof params.first}`);
				}
				link = link.endsWith("?") ? `${link}first=${params.first}` : link.endsWith("&") ? `${link}first=${params.first}` : `${link}?first=${params.first}`;
			}

		}

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets information about all broadcasts on Twitch**
	 * @param {{
	 * first?:number,
	 * after?:string,
	 * before?:string,
	 * }} [params]
	 * > • `first?` The maximum number of items to return per page in the response. The minimum page size is 1 item per page and the maximum is 100 items per page. The default is 20.  
	 * > • `after?` The cursor used to get the next page of results. The Pagination object in the response contains the cursor’s value. [Read More](https://dev.twitch.tv/docs/api/guide/#pagination)
	 * > • `before?` The cursor used to get the previous page of results. The Pagination object in the response contains the cursor’s value. [Read More](https://dev.twitch.tv/docs/api/guide/#pagination)
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?Array<{
	 * id:string,
	 * name:string,
	 * box_art_url:string,
	 * igdb_id:string
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of broadcasts. The broadcasts are sorted by the number of viewers, with the most popular first.  
	 * > > • `id` An ID that identifies the category or game.  
	 * > > • `name` The category’s or game’s name.  
	 * > > • `box_art_url` 	A URL to the category’s or game’s box art. You must replace the {width}x{height} placeholder with the size of image you want.  
	 * > > `igdb_id` The ID that [IGDB](https://www.igdb.com) uses to identify this game. If the IGDB ID is not available to Twitch, this field is set to an empty string.  
	 * @example
    client.getTopGames().then(console.log);
	 */
	getTopGames = async (params?:{
        first?:number,
        after?:string,
        before?:string,
    }):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        id:string,
        name:string,
        box_art_url:string,
        igdb_id:string
        }>
    }> => {

		let link = `https://api.twitch.tv/helix/games/top`;

		if (params) {

			if (params.after) {
				if (typeof params.after !== "string") {
					throw new TypeError(`\`after\` parameter must be a string => Received ${typeof params.after}`);
				}
				link = link.endsWith("?") ? `${link}after=${params.after}` : link.endsWith("&") ? `${link}after=${params.after}` : `${link}?after=${params.after}`;
			}
			if (params.before) {
				if (typeof params.before !== "string") {
					throw new TypeError(`\`before\` parameter must be a string => Received ${typeof params.before}`);
				}
				link = link.endsWith("?") ? `${link}before=${params.before}` : link.endsWith("&") ? `${link}before=${params.before}` : `${link}?before=${params.before}`;
			}
			if (params.first) {
				if (typeof params.first !== "number") {
					throw new TypeError(`\`first\` parameter must be a string => Received ${typeof params.first}`);
				}
				link = link.endsWith("?") ? `${link}first=${params.first}` : link.endsWith("&") ? `${link}first=${params.first}` : `${link}?first=${params.first}`;
			}

		}

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
	 * **Gets information about specified categories or games.**
	 * @description You may get up to 100 categories or games by specifying their ID or name. You may specify all IDs, all names, or a combination of IDs and names. If you specify a combination of IDs and names, the total number of IDs and names must not exceed 100.
	 * @param {Array<string>} gameNames The name of the category or game to get. The name must exactly match the category’s or game’s title. Include this parameter for each category or game you want to get. You may specify a maximum of 100 names. The endpoint ignores duplicate names and names that weren’t found.
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * id:string,
	 * name:string,
	 * box_art_url:string,
	 * igdb_id:string
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)  
	 * > • `status` The request status code (200 if ok)  
	 * > • `statusText` The request status text ("OK" if ok)  
	 * > • `data?` The list of categories and games. The list is empty if the specified categories and games weren’t found.  
	 * > > • `id` An ID that identifies the category or game.  
	 * > > • `name` The category’s or game’s name.  
	 * > > • `box_art_url` A URL to the category’s or game’s box art. You must replace the {width}x{height} placeholder with the size of image you want.  
	 * > > • `igdb_id` The ID that [IGDB](https://www.igdb.com) uses to identify this game. If the IGDB ID is not available to Twitch, this field is set to an empty string.  
	 * @example
    client.getGames(["Fortnite"]).then(console.log);
	 */
	getGames = async (gameNames:Array<string>):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        id:string,
        name:string,
        box_art_url:string,
        igdb_id:string
        }>
    }> => {

		if (!gameNames) {
			throw new Error(`gameNames are required`);
		}
		if (!Array.isArray(gameNames)) {
			throw new TypeError(`\`gameNames\` parameter must be an array of string => Received ${typeof gameNames}`);
		}
		if (gameNames.length === 0) {
			throw new Error(`gameNames are required => Received an empty array`);
		}
		for (let i = 0; i < gameNames.length; i++) {
			if (typeof gameNames[i] !== "string") {
				throw new TypeError(`\`gameNames\` parameter must be an array of string => Received ${typeof gameNames[i]} in the array`);
			}
		}

		const map = gameNames.join('&name=');
		const link = `https://api.twitch.tv/helix/games?name=${map}`;

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});

		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
     * **Gets the Soundtrack track that the broadcaster is playing.**
     * @param {string} username The username of the broadcaster that’s playing a Soundtrack track.
     * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * track:{
	 * album:{
	 * id:string,
	 * image_url:string,
	 * name:string,
	 * },
	 * artists:Array<{
	 * id:string,
	 * name:string,
	 * creator_channel_id:string,
	 * }>,
	 * duration:number,
	 * id:string,
	 * isrc:string,
	 * title:string,
	 * },
	 * source:{
	 * content_type:"PLAYLIST"|"STATION",
	 * id:string,
	 * image_url:string,
	 * soundtrack_url:string,
	 * spotify_url:string,
	 * title:string,
	 * }
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)
	 * > • `status` The request status code (200 if ok)
	 * > • `statusText` The request status text ("OK" if ok)
	 * > • `data?` A list that contains the single Soundtrack track that the broadcaster is playing.
	 * > > • `track` Describes a track.
	 * > > > • `album` Describes the album that the track is found on.
	 * > > > > • `id` The album’s ASIN (Amazon Standard Identification Number).
	 * > > > > • `image_url` A URL to the album’s cover art.
	 * > > > > • `name` The album’s name. If the album contains explicit content, the name will contain [Explicit] in the string. For example, Let It Die [Explicit].
	 *
	 * > > > • `artists` The artists included on the track.
	 * > > > > • `creator_channel_id` The ID of the Twitch user that created the track. The string is empty if a Twitch user didn’t create the track.
	 * > > > > • `id` The artist’s ASIN (Amazon Standard Identification Number).
	 * > > > > • `name` The artist’s name. This can be the band’s name or the solo artist’s name.
	 *
	 * > > > • `duration` The duration of the track, in seconds.
	 * > > > • `id` The track’s ASIN (Amazon Standard Identification Number).
	 * > > > • `isrc` The track’s ISRC (International Standard Recording Code).
	 * > > > • `title` The track’s title. If the track contains explicit content, the title will contain [Explicit] in the string. For example, Let It Die [Explicit].
	 *
	 * > > • `source` The source of the track that’s currently playing. For example, a playlist or station.
	 * > > > • `content_type` The type of content that id maps to.
	 * > > > • `id` The playlist’s or station’s ASIN (Amazon Standard Identification Number).
	 * > > > • `image_url` 	A URL to the playlist’s or station’s image art.
	 * > > > • `soundtrack_url` A URL to the playlist on Soundtrack. The string is empty if content-type is STATION.
	 * > > > • `spotify_url` A URL to the playlist on Spotify. The string is empty if content-type is STATION.
	 * > > > • `title` The playlist’s or station’s title.
	 * @example
    client.getCurrentSoundTrack("twitchdev").then(console.log);
	 */
	getCurrentSoundTrack = async (username:string):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        track:{
        album:{
        id:string,
        image_url:string,
        name:string,
        },
        artists:Array<{
        id:string,
        name:string,
        creator_channel_id:string,
        }>,
        duration:number,
        id:string,
        isrc:string,
        title:string,
        },
        source:{
        content_type:"PLAYLIST"|"STATION",
        id:string,
        image_url:string,
        soundtrack_url:string,
        spotify_url:string,
        title:string,
        }
        }>
    }> => {

		if (!username) {
			throw new Error(`\`username\` parameter is required`);
		}
		if (typeof username !== "string") {
			throw new TypeError(`\`username\` parameter must be a string => Received ${typeof username}`);
		}

		const user = await this.getUsers([username]);

		if (!user.ok || !user.data) {
			throw new Error(`Cannot get this user : ${username} => ${user.statusText}`);
		}
	
		if (user.data.length === 0) {
			throw new Error(`Cannot find this user : ${username}`);
		}
	
		const broadcaster_id = user.data[0].id;

		const link = `https://api.twitch.tv/helix/soundtrack/current_track/?broadcaster_id=${broadcaster_id}`;

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}
	/**
     * **Gets information about one or more published videos. You may get videos by ID, by user, or by game/category.**
     * @description You may apply several filters to get a subset of the videos. The filters are applied as an AND operation to each video. For example, if language is set to ‘de’ and game_id is set to 21779, the response includes only videos that show playing League of Legends by users that stream in German. The filters apply only if you get videos by user ID or game ID.
     * @param {string} username The username of the user whose list of videos you want to get.
     * @param {{
	 * game_name?:string,
	 * language?:string,
	 * period?:"all"|"day"|"month"|"week",
	 * sort?:"time"|"trending"|"views",
	 * type?:"all"|"archive"|"highlight"|"upload",
	 * first?:string,
	 * after?:string,
	 * before?:string,
	 * }} [params]
	 * > • `game_name?` A category or game name. The response contains a maximum of 500 videos that show this content. To get category/game names, use the Search Categories endpoint.
	 * > • `language?` A filter used to filter the list of videos by the language that the video owner broadcasts in. For example, to get videos that were broadcast in German, set this parameter to the ISO 639-1 two-letter code for German (i.e., DE). For a list of supported languages, see [Supported Stream Language](https://help.twitch.tv/s/article/languages-on-twitch?language=en_US#streamlang). If the language is not supported, use “other.” Specify this parameter only if you specify the game_name query parameter.
	 * > • `period?` A filter used to filter the list of videos by when they were published. For example, videos published in the last week. The default is “all,” which returns videos published in all periods.
	 * > • `sort?` The order to sort the returned videos in. The default is “time.”
	 * > • `type?` 	A filter used to filter the list of videos by the video’s type. The default is “all,” which returns all video types.
	 * > • `first?` The maximum number of items to return per page in the response. The minimum page size is 1 item per page and the maximum is 100. The default is 20.
	 * > • `after?` The cursor used to get the next page of results. The Pagination object in the response contains the cursor’s value. [Read More](https://dev.twitch.tv/docs/api/guide/#pagination)
	 * > • `before?` The cursor used to get the previous page of results. The Pagination object in the response contains the cursor’s value. [Read More](https://dev.twitch.tv/docs/api/guide/#pagination)
	 * @returns {Promise<{
	 * ok:boolean,
	 * status:number,
	 * statusText:string,
	 * data?:Array<{
	 * id:string,
	 * stream_id:string,
	 * user_id:string,
	 * user_login:string,
	 * user_name:string,
	 * title:string,
	 * description:string,
	 * created_at:string,
	 * published_at:string,
	 * utl:string,
	 * thumbnail_url:string,
	 * viewable:string,
	 * view_count:number,
	 * language:string,
	 * type:"archive"|"highlight"|"upload",
	 * duration:string,
	 * muted_segments:Array<{
	 * duration:number,
	 * offset:number,
	 * }>|null,
	 * }>
	 * }>}
	 * > • `ok` The request success (true or false)
	 * > • `status` The request status code (200 if ok)
	 * > • `statusText` The request status text ("OK" if ok)
	 * > • `data?` The list of published videos that match the filter criteria.
	 * > > • `id` An ID that identifies the video.
	 * > > • `stream_id` The ID of the stream that the video originated from if the video’s type is “archive;” otherwise, null.
	 * > > • `user_id` The ID of the broadcaster that owns the video.
	 * > > • `user_login` The broadcaster’s login name.
	 * > > • `user_name` The broadcaster’s display name.
	 * > > • `title` The video’s title.
	 * > > • `description` The video’s description.
	 * > > • `created_at` The date and time, in UTC, of when the video was created. The timestamp is in RFC3339 format.
	 * > > • `published_at` The date and time, in UTC, of when the video was published. The timestamp is in RFC3339 format.
	 * > > • `url` The video’s URL.
	 * > > • `thumbnail_url` A URL to a thumbnail image of the video. Before using the URL, you must replace the %{width} and %{height} placeholders with the width and height of the thumbnail you want returned. Specify the width and height in pixels. Because the CDN preserves the thumbnail’s ratio, the thumbnail may not be the exact size you requested.
	 * > > • `viewable` The video’s viewable state. Always set to public.
	 * > > • `view_count` The number of times that users have watched the video.
	 * > > • `language` The ISO 639-1 two-letter language code that the video was broadcast in. For example, the language code is DE if the video was broadcast in German. For a list of supported languages, see [Supported Stream Language](https://help.twitch.tv/s/article/languages-on-twitch?language=en_US#streamlang). The language value is “other” if the video was broadcast in a language not in the list of supported languages.
	 * > > • `type` The video’s type.
	 * > > • `duration` The video’s length in ISO 8601 duration format. For example, 3m21s represents 3 minutes, 21 seconds.
	 * > > • `muted_segments` The segments that Twitch Audio Recognition muted; otherwise, null.
	 * > > > • `duration` The duration of the muted segment, in seconds.
	 * > > > • `offset` The offset, in seconds, from the beginning of the video to where the muted segment begins.
	 * @example
	client.getVideos("twitchdev").then(console.log);
	 */
	getVideos = async(username:string, params?:{
        game_name?:string,
        language?:string,
        period?:"all"|"day"|"month"|"week",
        sort?:"time"|"trending"|"views",
        type?:"all"|"archive"|"highlight"|"upload",
        first?:number,
        after?:string,
        before?:string,
    }):Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        id:string,
        stream_id:string,
        user_id:string,
        user_login:string,
        user_name:string,
        title:string,
        description:string,
        created_at:string,
        published_at:string,
        utl:string,
        thumbnail_url:string,
        viewable:string,
        view_count:number,
        language:string,
        type:"archive"|"highlight"|"upload",
        duration:string,
        muted_segments:Array<{
        duration:number,
        offset:number,
        }>|null,
        }>
    }> => {

		if (!username) {
			throw new Error(`\`username\` parameter is required`);
		}
		if (typeof username !== "string") {
			throw new TypeError(`\`username\` parameter must be a string => Received ${typeof username}`);
		}

		const user = await this.getUsers([username]);

		if (!user.ok || !user.data) {
			throw new Error(`Cannot get this user : ${username} => ${user.statusText}`);
		}
	
		if (user.data.length === 0) {
			throw new Error(`Cannot find this user : ${username}`);
		}
	
		const user_id = user.data[0].id;

		let link = `https://api.twitch.tv/helix/videos?user_id=${user_id}`;

		if (params) {

			if (params.after) {
				if (typeof params.after !== "string") {
					throw new TypeError(`\`after\` parameter must be a string => Received ${typeof params.after}`);
				}
				link = link.endsWith("?") ? `${link}after=${params.after}` : link.endsWith("&") ? `${link}after=${params.after}` : `${link}?after=${params.after}`;
			}
			if (params.before) {
				if (typeof params.before !== "string") {
					throw new TypeError(`\`before\` parameter must be a string => Received ${typeof params.before}`);
				}
				link = link.endsWith("?") ? `${link}before=${params.before}` : link.endsWith("&") ? `${link}before=${params.before}` : `${link}?before=${params.before}`;
			}
			if (params.first) {
				if (typeof params.first !== "number") {
					throw new TypeError(`\`first\` parameter must be a number => Received ${typeof params.first}`);
				}
				link = link.endsWith("?") ? `${link}first=${params.first.toString()}` : link.endsWith("&") ? `${link}first=${params.first.toString()}` : `${link}?first=${params.first.toString()}`;
			}
			if (params.game_name) {
				if (typeof params.game_name !== "string") {
					throw new TypeError(`\`game_name\` parameter must be a string => Received ${typeof params.game_name}`);
				}
				const game = await this.getGames([params.game_name]);
				if (!game.ok || !game.data) {
					throw new Error(`Cannot get this game : ${params.game_name} => ${game.statusText}`);
				}
				const id = game.data[0].id;
				link = link.endsWith("?") ? `${link}game_id=${id}` : link.endsWith("&") ? `${link}game_id=${id}` : `${link}?game_id=${id}`;
			}
			if (params.language) {
				if (typeof params.language !== "string") {
					throw new TypeError(`\`language\` parameter must be a string => Received ${typeof params.language}`);
				}
				link = link.endsWith("?") ? `${link}language=${params.language}` : link.endsWith("&") ? `${link}language=${params.language}` : `${link}?language=${params.language}`;
			}
			if (params.period) {
				if (params.period !== "all" && params.period !== "day" && params.period !== "month" && params.period !== "week") {
					throw new Error(`\`period\` parameter must be "all" or "day" or "month" or "week" => Received ${params.period}`);
				}
				link = link.endsWith("?") ? `${link}period=${params.period}` : link.endsWith("&") ? `${link}period=${params.period}` : `${link}?period=${params.period}`;
			}
			if (params.sort) {
				if (params.sort !== "time" && params.sort !== "trending" && params.sort !== "views") {
					throw new Error(`\`sort\` parameter must be "time" or "trending" or "views" => Received ${params.sort}`);
				}
				link = link.endsWith("?") ? `${link}sort=${params.sort}` : link.endsWith("&") ? `${link}sort=${params.sort}` : `${link}?sort=${params.sort}`;
			}
			if (params.type) {
				if (params.type !== "all" && params.type !== "archive" && params.type !== "highlight" && params.type !== "upload") {
					throw new Error(`\`type\` parameter must be "all" or "archive" or "highlight" or "upload" => Received ${params.type}`);
				}
				link = link.endsWith("?") ? `${link}type=${params.type}` : link.endsWith("&") ? `${link}type=${params.type}` : `${link}?type=${params.type}`;
			}

		}

		if (this.isExpiredToken()) {
            await this.refreshToken();
        }

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${this.token.token_type} ${this.token.access_token}`,
				"Client-Id":this.client_id,
			},
		});
	
		if (response.ok) {
			const data = await response.json();
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}

}

export { twitch_xs };