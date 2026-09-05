const GEO_KEY = "scribo_visitor_geo"

const getVisitorGeo = async () => {
    try {
        const cached = sessionStorage.getItem(GEO_KEY)

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
                    sessionStorage.setItem(GEO_KEY, JSON.stringify(geo))
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

export {
    getVisitorGeo
}
