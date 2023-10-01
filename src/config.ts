import axios from "axios"

export const POSTS_INFINITE_SCROLL_COUNT = 3

export const COMMENTS_INFINITE_SCROLL_COUNT = 3

export const axiosInstance = axios.create({
    baseURL: "/api",
})
