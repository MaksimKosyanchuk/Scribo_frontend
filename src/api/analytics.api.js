import { API_URL } from "../config"
import { apiFetch } from "./http"

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

const getVisitorGeo = async () => {
    const key = "scribo_visitor_geo"

    try {
        const cached = sessionStorage.getItem(key)

        if (cached) {
            const parsed = JSON.parse(cached)

            if (parsed?.city || parsed?.country) {
                return parsed
            }
        }
    }
    catch {
        // ignore cache errors
    }

    const sources = [
        {
            url: "https://ipwho.is/",
            parse: (data) => data?.success ? {
                city: data.city || "",
                region: data.region || "",
                country: data.country || "",
                ip: data.ip || ""
            } : null
        },
        {
            url: "https://ipapi.co/json/",
            parse: (data) => data?.city || data?.country_name ? {
                city: data.city || "",
                region: data.region || "",
                country: data.country_name || data.country || "",
                ip: data.ip || ""
            } : null
        }
    ]

    for (const source of sources) {
        try {
            const response = await fetch(source.url)
            const data = await response.json()
            const geo = source.parse(data)

            if (geo?.city || geo?.country) {
                try {
                    sessionStorage.setItem(key, JSON.stringify(geo))
                }
                catch {
                    // ignore
                }

                return geo
            }
        }
        catch {
            // try next provider
        }
    }

    return {}
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
