// const BASE_URL = "http://localhost:8000";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const APP_LIST = `${BASE_URL}/fetch-apps`;
export const CREATE_APP = `${BASE_URL}/create-app`;
export const DELETE_APP = (appId: string) => `${BASE_URL}/app/${appId}/delete`;
// export const APP_DETAILS = (appId: string) => `${BASE_URL}/app/${appId}`;
// export const APP_POST = (appId: string) => `${BASE_URL}/app/${appId}/posts`;
// export const CREATE_POSTS = (appId: string) => `${BASE_URL}/app/${appId}/generate-posts`; 
// export const SCHEDULE_POST = (postId: string) => `${BASE_URL}/post/${postId}/schedule`; 
// export const DELETE_POST = (postId: string) => `${BASE_URL}/post/${postId}`; 
// export const EDIT_POST = (postId: string) => `${BASE_URL}/post/${postId}/edit`; 
// export const PUBLISH_POST = (postId: string) => `${BASE_URL}/post/${postId}/publish`; 
export const SAVE_SETTINGS = (appId: string) => `${BASE_URL}/app/${appId}/save-settings`; 
export const ACTIVATE_DEACTIVATE_APP = (appId: string) => `${BASE_URL}/app/${appId}/activate-deactivate`; 



export const API = {
    APP_DETAILS: (appId: string) => `${BASE_URL}/app/${appId}`,
    APP_POSTS: (appId: string) => `${BASE_URL}/app/${appId}/posts`,
    APP_GENERATE: (appId: string) => `${BASE_URL}/app/${appId}/generate-post`,
    DELETE_POST: (postId: string) => `${BASE_URL}/post/${postId}`,
    PUBLISH_POST: (postId: string) => `${BASE_URL}/post/${postId}/publish`,
    SCHEDULE_POST: (postId: string) => `${BASE_URL}/post/${postId}/schedule`,
    EDIT_POST: (postId: string) => `${BASE_URL}/post/${postId}/edit`,
    EDIT_SCHEDULE: (postId: string) => `${BASE_URL}/post/${postId}/schedule`,
} as const;
