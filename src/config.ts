import axios from "axios"

export const POSTS_INFINITE_SCROLL_COUNT = 6

export const COMMENTS_INFINITE_SCROLL_COUNT = 10

export const axiosInstance = axios.create({
    baseURL: "/api",
})
