import { API_URL } from "../config";

const deleteComment = async (commentId) => {
    try {
        const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
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
};

export {
    deleteComment
};