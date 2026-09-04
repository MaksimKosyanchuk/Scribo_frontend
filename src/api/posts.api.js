import { API_URL } from "../config"
import { apiFetch } from "./http"

const getPosts = async (query) => {
    let queryString = ""

    if(query) {
        queryString = Object.entries(query).map(([key, value]) => {
            if (key === "empty" || value === undefined || value === null) {
                return null
            }
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return `${key}=`
                }
                return value.map(id => `${key}=${id}`).join('&')
            }
            return `${key}=${value}`
        }).filter(Boolean).join('&')
    }
    
    const result = await fetch(`${API_URL}/api/posts?${queryString}`)
    .then(res => res.json())
    .catch((err) => { 
        console.log(err)
        return ({
            status: "error",
            message: err,
            data: null
        })
    })

    return result
}

const POSTS_PAGE_LIMIT = 5

function unwrapPostsResponse(response) {
    const payload = response?.data
    const items = Array.isArray(payload) ? payload : (payload?.items || [])
    const pagination = Array.isArray(payload)
        ? { page: 1, pages: items.length ? 1 : 0, total: items.length, limit: POSTS_PAGE_LIMIT }
        : (payload?.pagination || { page: 1, pages: 0, total: 0, limit: POSTS_PAGE_LIMIT })

    return { items, pagination }
}

const deletePost = async (id) => {
    const result = await apiFetch(`${API_URL}/api/posts/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .catch((err) => { 
        console.log(err)
        return ({
            status: "error",
            message: err,
            data: null
        })
    })

    return result
}

const getPostById = async (id, query) => {
    let queryString = ""

    if(query) {
        queryString = Object.entries(query).map(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return `${key}=`
                }
                return value.map(id => `${key}=${id}`).join('&')
            }
            return `${key}=${value}`
        }).join('&')
    }

    const result = await fetch(`${API_URL}/api/posts/${id}?${queryString}`)
        .then(res => res.json())
        .catch((err) => {
            console.log(err)
            return ({
                status: "error",
                message: err,
                data: null
            })
        })

    return result
}

const commentPost = async (id, data) => {
    const result = await apiFetch(`${API_URL}/api/posts/${id}/comments?expand=author`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .catch((err) => { 
        console.log(err)
        return ({
            status: "error",
            message: err,
            data: null
        })
    })

    return result
}

const getComments = async (id) => {
    const result = await fetch(`${API_URL}/api/posts/${id}/comments?expand=author`)
    .then(res => res.json())
    .catch((err) => {
        console.log(err)
        return ({
            status: "error",
            message: err,
            data: null
        })
    })
    return result
}

const likePost = async (id, method="POST") => {
    const result = await apiFetch(`${API_URL}/api/posts/${id}/like`, {
        method,
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .catch((err) => { 
        return ({
            status: false,
            message: err,
            data: null
        })
    })

    return result
}

const savePost = async (id, method="POST") => {
    let response = await apiFetch(`${API_URL}/api/posts/${id}/save`, { method })
    const result = await response.json();
    const code = response.status

    return {
        statusCode: code,
        ...result
    }
}

const createPost = async (data) => {
    try {
        const response = await apiFetch(`${API_URL}/api/posts`, { method: "POST", body: data})
        const result = await response.json()
        const code = response.status

        console.log(result)
        return {
            statusCode: code,
            ...result
        }
    }
    catch (err) {
        console.log(err)
    }
}

const editPost = async (id, data) => {
    try {
        const response = await apiFetch(`${API_URL}/api/posts/${id}`, { method: "PATCH", body: data})
        const result = await response.json()
        const code = response.status
        return {
            statusCode: code,
            ...result
        }
    }
    catch (err) {
        console.log(err)
    }
}

export { getPosts, unwrapPostsResponse, POSTS_PAGE_LIMIT, deletePost, getPostById, commentPost, getComments, likePost, savePost, createPost, editPost }
