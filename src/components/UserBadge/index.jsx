import { Link } from "react-router-dom";

import "./UserBadge.scss";

import DefaultProfileAvatar from "../../assets/images/default-profile-avatar.png"

import Verified from "../../assets/svg/verified.svg?react";
import Tooltip from "../Ui/Tooltip/index";

const UserBadge = ( { data, className, asLink = true, avatarOnly = false } ) => {
    if(!data) return<></>

    const content = (
        <>
            <div className="user_badge_avatar">
                <img src = {data?.avatar ?? DefaultProfileAvatar} alt={"user_badge_avatar"}/>
            </div>
            {
                avatarOnly ?
                    null
                :
                    <div className="user_badge_info">
                        <p className="user_badge_info_name">
                            {data.nick_name}
                        </p>
                        {
                            data?.is_verified ?
                                <Tooltip text="Подтвержденный пользователь" position="bottom">
                                    <Verified key={`verified-${data._id}`} className="user_badge_info_verified verified-icon"/>
                                </Tooltip>
                            :
                                <></>
                        }
                    </div>
            }
        </>
    )

    if (!asLink) {
        return (
            <div className={`user_badge app-transition ${avatarOnly ? "user_badge_avatar_only" : ""} ${className ?? ''}`}>
                {content}
            </div>
        )
    }

    return (
        <Link className={`user_badge app-transition ${avatarOnly ? "user_badge_avatar_only" : ""} ${className ?? ''}`} to={`/users/${data.nick_name}`}>
            {content}
        </Link>
    )
}

export default UserBadge;
