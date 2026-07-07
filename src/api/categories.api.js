import { API_URL } from "../config";

const getCategories = async () => {
    try {
        const res = await fetch(`${API_URL}/api/posts/categories?expand=category`);
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

const editCategory = async (id, data) => {
    try {
        const res = await fetch(`${API_URL}/api/posts/categories/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
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
}

export { getCategories, editCategory };