import { API_URL } from "../config";

const getCategories = async () => {
    try {
        const res = await fetch(`${API_URL}/api/posts/categories`);
        const result = await res.json();

        return result;
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