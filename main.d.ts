export declare class twitch_xs {
    private client_id:string;
    private client_secret:string;
    constructor(config:{ client_id:string, client_secret:string });
    generateToken: () => Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:{
        created_at:number,
        access_token:string,
        expires_in:number,
        token_type:string,
        }
    }>;
    isExpiredToken(): boolean;
    refreshToken: () => Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:{
        created_at:number,
        access_token:string,
        expires_in:number,
        token_type:string,
       }
    }>;
    getUsers: (usernames:Array<string>) => Promise<{
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
        }>;
    getLives: (usernames:Array<string>) => Promise<{
        ok:boolean,
        status:number,
        statusText:string,
        data?:Array<{
        user_name:string,
        user_id:string,
        on_live:boolean,
        user_login?:string,
        id?:string,
        game_id?:string,
        game_name?:string,
        type?:string,
        title?:string,
        viewer_count?:number,
        started_at?:string,
        language?:string,
        thumbnail_url?:string,
        tag_ids?:[],
        tags?:Array<string>,
        is_mature?:boolean
        }>
        }>
}