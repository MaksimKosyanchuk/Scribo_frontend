import { API_URL } from "../config";

const fetchSvg = async (url) => {
    try {
        const res = await fetch(url);
        return await res.text();
    } catch (e) {
        console.log("SVG load error:", e);
        return null;
    }
};

const transformCategories = async (categories) => {
    return Promise.all(
        categories.map(async (cat) => {
            if (!cat.icon) return cat;

            const svg = await fetchSvg(cat.icon);

            return {
                ...cat,
                icon: svg
            };
        })
    );
};

const getCategories = async () => {
    try {
        const res = await fetch(`${API_URL}/api/posts/categories`);
        const result = await res.json();

        if (!result.status) {
            return result;
        }

        const transformed = await transformCategories(result.data);

        return {
            ...result,
            data: transformed
        };
    } catch (err) {
        console.log(err);
        return {
            status: "error",
            message: err,
            data: null
        };
    }
};

export { getCategories };