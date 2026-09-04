import { apiFetch } from "./http"

const getAllLogs = async () => {
    const response = await apiFetch(`${import.meta.env.VITE_APP_API_URL}/api/logs`, {
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
