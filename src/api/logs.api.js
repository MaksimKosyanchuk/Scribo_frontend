import { apiFetch } from "./http"

const getAllLogs = async (query = {}) => {
    const params = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, value)
        }
    })

    const search = params.toString()
    const response = await apiFetch(`${import.meta.env.VITE_APP_API_URL}/api/logs${search ? `?${search}` : ""}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    return await response.json()
}


export {
    getAllLogs
}
