import { API_URL } from "../config";

const getProfile = async () => {
    const token = localStorage.getItem('token');
            
    if (token) {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        };
        
        try {
            const response = await fetch(`${API_URL}/api/profile`, requestOptions);

            const profileData = await response.json();

            return profileData;
        }
        catch (error) {
            console.error('Error fetching profile:', error);

            return {
                status: false,
                message: "Error fetching profile",
                data: null
            }
        }
    }
    return {
        status: false,
        message: "No token found",
        data: null
    }
}

const editProfile = async (data) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return {
            status: false,
            message: "No token found",
            data: null
        };
    }

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_URL}/api/profile/`, { method: "PATCH", body: data, headers: headers });
    
    const code = response.status;
    const result = await response.json();
    
    return {
        statusCode: code,
        ...result
    }
}

export { getProfile, editProfile };