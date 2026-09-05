import { apiFetch } from "./http"

const API = `${import.meta.env.VITE_APP_API_URL}/api/support`

const withQuery = (query = {}) => {
    const params = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, value)
        }
    })

    const search = params.toString()
    return search ? `?${search}` : ""
}

const jsonHeaders = {
    "Content-Type": "application/json"
}

const createSupportRequest = async (body) => {
    const response = await apiFetch(API, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(body)
    })

    return await response.json()
}

const getMySupportRequests = async (query = {}) => {
    const response = await apiFetch(`${API}/mine${withQuery(query)}`, {
        method: "GET",
        headers: jsonHeaders
    })

    return await response.json()
}

const getSupportRequests = async (query = {}) => {
    const response = await apiFetch(`${API}${withQuery(query)}`, {
        method: "GET",
        headers: jsonHeaders
    })

    return await response.json()
}

const getSupportRequest = async (id) => {
    const response = await apiFetch(`${API}/${id}`, {
        method: "GET",
        headers: jsonHeaders
    })

    return await response.json()
}

const getPublicSupportRequest = async (key) => {
    const response = await apiFetch(`${API}/public/${key}`, {
        method: "GET",
        headers: jsonHeaders
    })

    return await response.json()
}

const replySupportRequest = async (id, text) => {
    const response = await apiFetch(`${API}/${id}/replies`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ replyText: text })
    })

    return await response.json()
}

const replyPublicSupportRequest = async (key, text) => {
    const response = await apiFetch(`${API}/public/${key}/replies`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ replyText: text })
    })

    return await response.json()
}

const updateSupportRequestStatus = async (id, status) => {
    const response = await apiFetch(`${API}/${id}/status`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ supportStatus: status })
    })

    return await response.json()
}

export {
    createSupportRequest,
    getSupportRequests,
    getMySupportRequests,
    getSupportRequest,
    getPublicSupportRequest,
    replySupportRequest,
    replyPublicSupportRequest,
    updateSupportRequestStatus
}
