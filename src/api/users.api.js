import { API_URL } from "../config"


const getUsers = async (query = []) => {

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

const read_notifications = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem("token")}`}
    
    const result = await fetch(`${API_URL}/api/profile/notifications`, { method: "PATCH", headers: headers })
    return await result.json();
}

const follow = async ({method="POST", user_id}) => {
    try {
        const headers = {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
        const response = await fetch(`${API_URL}/api/users/${user_id}/follow`, { method: method,  headers: headers })

        const status = response.status;
        const result = await response.json();

        return {
            statusCode: status,
            ...result
        };
    }
    catch(e) {
        console.log(e)
    }
}

export {
    getUsers,
    read_notifications,
    follow
}