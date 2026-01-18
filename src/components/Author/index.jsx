import { Link } from "react-router-dom";
import "./Author.scss";
import DefaultProfileAvatar from "../../assets/images/default-profile-avatar.png"
import { ReactComponent as Verified } from "../../assets/svg/verified-icon.svg";

const Author = ( { author_data, class_name } ) => {
    if(!author_data) return<></>

    return (
        <Link className={`author ${class_name ?? ''}`} to={`/users/${author_data.nick_name}`}>
            <div className="author_avatar">
                <img src = {author_data?.avatar ?? DefaultProfileAvatar} alt={"author avatar"}/>
            </div>
            <div className="author_info">
                <p className="author_info_name">
                    {author_data.nick_name}
                </p>
                {author_data?.is_verified ? <Verified key={`verified-${author_data._id}`} className="author_info_verified"/> : <></>}
            </div>
        </Link>
    )
}

export default Author;