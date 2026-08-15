const getAllLogs = async () => {
    const response = await fetch(`${process.env.VITE_APP_API_URL}/api/logs`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })

    return await response.json()
}


export {
    getAllLogs
}