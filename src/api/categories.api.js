import { API_URL } from "../config";
import { apiFetch } from "./http";

const getCategories = async () => {
    try {
        const res = await fetch(`${API_URL}/api/categories?expand=category`);
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
        const res = await apiFetch(`${API_URL}/api/categories/${id}`, {
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

const createCategory = async (data) => {
    try {
        const res = await apiFetch(`${API_URL}/api/categories`, {
            method: 'POST',
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

const deleteCategory = async (id) => {
    try {
        const res = await apiFetch(`${API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
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

export { getCategories, editCategory, createCategory, deleteCategory };
