import { API_URL } from "../config"


export const getUsers = async (query = []) => {
    if (query.length === 0) {
        return [];
    }

    const params = new URLSearchParams();

    query.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value);
            }
        });
    });

    try {
        const response = await fetch(`${API_URL}/api/users/?${params.toString()}`);
        const result = await response.json();

        return result;
    } catch (err) {
        console.error(err);

        return {
            status: false,
            message: err.message
        };
    }
};

export const read_notifications = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem("token")}`}
    
    const result = await fetch(`${API_URL}/api/profile/notifications`, { method: "PATCH", headers: headers })
    return await result.json();
}