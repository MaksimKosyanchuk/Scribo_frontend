import { API_URL } from "../config"

const getPosts = async (query) => {
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
    
    const result = await fetch(`${API_URL}/api/posts?${queryString}&expand=author`)
    .then(res => res.json())
    .then(res => {
        res?.data?.sort((prev, next) => new Date(next.created_date) - new Date(prev.created_date));
        return res
    })
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

const deletePost = async (id) => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const result = await fetch(`${API_URL}/api/posts/${id}`, { method: "DELETE", credentials: "include", headers })
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

const getPostById = async (id) => {
    const result = await fetch(`${API_URL}/api/posts/${id}?expand=author`)
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
    const token = localStorage.getItem('token')
    const headers = {
        "Content-Type": "application/json",
        ...(token && {
            Authorization: `Bearer ${token}`
        })
    };
    const result = await fetch(`${API_URL}/api/posts/${id}/comments?expand=author`, { method: "POST", credentials: "include", headers, body: JSON.stringify(data) })
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

export { getPosts, deletePost, getPostById, commentPost, getComments }
