class twitch_xs {

	/**
     * Instance client
     * @param {{
     * client_id:string,
	 * client_secret:string,
     * }} config
     * @example
     * const client = new twitch_xs({ client_id:"your_client_id" });
     */

	constructor(config) {
		this.client_id = config.client_id;
		this.client_secret = config.client_secret;
		this.token = {};
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

	async generateToken() {

		const link = `https://id.twitch.tv/oauth2/token?client_id=${this.client_id}&client_secret=${this.client_secret}&grant_type=client_credentials`;

		const response = await fetch(link, {
			method:"POST",
		});

		if (response.ok) {
			const data = await response.json();
			data.token_type = "Bearer";
			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}

	/**
     * Check token availability
     * @returns {boolean}
     */

	isExpiredToken() {

		if (!this.token.createdAt) {
			throw new Error(`Token is not set. Use setToken("your_token") to set it.`);
		}

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

	async refreshToken() {

		const new_token = await this.generateToken();

		this.token = {
			created_at:new Date().getTime(),
			access_token:new_token.access_token,
			expires_in:new_token.expires_in,
			token_type:new_token.token_type,
		};

		return this.token;

	}

	/**
     * Gets information about one or more users
     * @param {Array<string>} usernames
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
     * @example
     * client.getUsers(["twitchdev"]).then(console.log);
     */

	async getUsers(usernames) {

		const map = usernames.join('&login=');
		const link = `https://api.twitch.tv/helix/users?login=${map}`;

		const token = this.token.created_at ? this.isExpiredToken() ? (await this.refreshToken()).data : this.token : (await this.generateToken()).data;

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${token.token_type} ${token.access_token}`,
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
     * Gets current lives
     * @param {Array<string>} usernames
     * @returns {Promise<{
     * ok:boolean,
     * status:number,
     * statusText:string,
     * data?:Array<{
	* user_name:string,
	* user_id:string,
     * on_live:boolean,
	 * user_login?:string,
     * id?:string,
     * game_id?:string,
     * game_name?:string,
     * type?:string,
     * title?:string,
     * viewer_count?:number,
     * started_at?:string,
     * language?:string,
     * thumbnail_url?:string,
     * tag_ids?:[],
     * tags?:Array<string>,
     * is_mature?:boolean
     * }>
     * }>}
     * @example
     * client.getLives(["twitchdev"]).then(console.log);
     */

	async getLives(usernames) {

		const map = usernames.join('&user_login=');
		const link = `https://api.twitch.tv/helix/streams?user_login=${map}`;

		const token = this.token.created_at ? this.isExpiredToken() ? (await this.refreshToken()).data : this.token : (await this.generateToken()).data;

		const response = await fetch(link, {
			method:"GET",
			headers:{
				"Authorization":`${token.token_type} ${token.access_token}`,
				"Client-Id":this.client_id,
			},
		});

		if (response.ok) {

			const data = await response.json();

			if (data.data.length === 0) {

				const users = await this.getUsers(usernames);

				if (!users.ok) {
					return { ok:users.ok, status:users.status, statusText:users.statusText };
				}
				else {
					data.data = users.data.map(user => ({ user_id:user.id, user_name:user.display_name, on_live:false }));
				}

			}
			else {
				for (let i = 0; i < data.data.length; i++) {
					data.data[i].on_live = true;
				}
			}

			return { ok:response.ok, status:response.status, statusText:response.statusText, data:data.data };
		}
		else {
			return { ok:response.ok, status:response.status, statusText:response.statusText };
		}

	}

}

module.exports = { twitch_xs };