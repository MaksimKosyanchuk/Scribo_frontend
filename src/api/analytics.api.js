import { API_URL } from "../config"
import { apiFetch } from "./http"
import { getVisitorGeo } from "./geo.client"

const getVisitorId = () => {
    const key = "scribo_visitor_id"

    try {
        const existing = localStorage.getItem(key)

        if (existing && /^[a-zA-Z0-9-]{8,64}$/.test(existing)) {
            return existing
        }

        const created = crypto.randomUUID()
        localStorage.setItem(key, created)
        return created
    }
    catch {
        return `anon-${Date.now().toString(36)}`
    }
}

const trackVisit = async (path) => {
    try {
        const geo = await getVisitorGeo()

        await apiFetch(`${API_URL}/api/analytics/visit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path,
                visitor_id: getVisitorId(),
                referrer: typeof document === "undefined" ? "" : document.referrer,
                ...geo
            })
        })
    }
    catch {
        // tracking must never break the app
    }
}

const getDashboard = async (days = 14) => {
    const params = new URLSearchParams({ days: String(days) })
    const response = await apiFetch(`${API_URL}/api/analytics/dashboard?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })

    return await response.json()
}

export {
    trackVisit,
    getDashboard
}
