import { AppContext } from "../../App.js";
import { useContext } from "react";

import { follow } from "../../api/users.api.js";

import "./FollowButton.scss";

import ActionButton from "../Ui/ActionButton";

const FollowButton = ({ setNewData, author_id, class_name }) => {
    const { profile, showToast } = useContext(AppContext);

    const do_follow = async () => {
        const result = await follow({ method: "POST", user_id: author_id })
        
        if(result.status === true) {
            await setNewData(result.data)
            showToast({ message: `Вы подписались на ${result.data.followed.nick_name}!`, type: "success" })
        }
        else {
            if(result.statusCode === 401) {
                showToast({ type: "warning", message: "Чтобы подписаться нужно войти в аккаунт!" })
            }
        }
    }

    const do_unfollow = async () => {
        const result = await follow({ method: "DELETE", user_id: author_id })
        
        if(result.status === true) {
            await setNewData(result.data)
            showToast({ message: `Вы отписались от ${result.data.followed.nick_name}!`, type: "success" })
        }
        else {
            if(result.statusCode === 401) {
                showToast({ type: "warning", message: "Чтобы отписаться нужно войти в аккаунт!" })
            }
        }
    }

    return (
        profile?.follows?.some(item => item === author_id) ?
            <ActionButton onClick={() => do_unfollow(author_id)} className={ `follow_button app-transition ${class_name ?? "" } ${ (profile?._id === author_id) ? "non_visible" : "" }` }>Отписаться</ActionButton>
        :
            <ActionButton onClick={() => do_follow(author_id)} className={ `follow_button app-transition ${class_name ?? "" } ${ (profile?._id === author_id) ? "non_visible" : "" }` }>Подписаться</ActionButton>
    )
}

export default FollowButton;