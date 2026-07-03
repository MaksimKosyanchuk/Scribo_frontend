import { useContext, memo } from "react";
import { useNavigate } from 'react-router-dom';

import { AppContext } from "../../App";

import "./PostHeader.scss";

import { deletePost } from "../../api/posts.api";

import { ReactComponent as ThreeDotsIcon} from "../../assets/svg/three-dots.svg";
import { ReactComponent as EditIcon} from "../../assets/svg/edit.svg";
import { ReactComponent as DeleteIcon} from "../../assets/svg/delete.svg";
import { format_back, format_date_time } from "../../utils/format";

import UserBadge from "../UserBadge";
import Popup from "../Ui/Popup";
import ActionButton from "../Ui/ActionButton";
import DangerButton from "../Ui/DangerButton";
import Tooltip from "../Ui/Tooltip/index";
import Catregory from "../Category";

const getDeleteModalContent = (post, requestCloseModal, deletePost, onDeletePost, categoryIcon) => (
    <div className="modal_delete_post_content">
        <div className="modal_delete_post_content_post">
            <div className="modal_delete_post_content_post_header">
                <PostHeader post={post} categoryIcon={categoryIcon} />
                <Catregory name={post.category} icon={categoryIcon} is_active={true}/>
            </div>
            <h2 className="modal_delete_post_content_post_title">{post.title}</h2>
            {post.featured_image && (
                <img className="modal_delete_post_content_post_image" src={post.featured_image} alt="post_image" />
            )}
        </div>
        <div className="modal_delete_post_content_bottom">
            <ActionButton onClick={requestCloseModal} className="modal_delete_post_content_button">Отмена</ActionButton>
            <DangerButton 
                onClick={async () => { await deletePost(post._id).then(() => onDeletePost(post._id)); requestCloseModal() }} 
                className="modal_delete_post_content_button" 
                is_active={true}
            >
                Удалить
            </DangerButton>
        </div>
    </div>
);

const PostHeader = memo(({ post, categoryIcon, onDeletePost, className }) => {
    const { profile, showModalWindow, requestCloseModal } = useContext(AppContext);
    const navigate = useNavigate();
    
    const delete_post = async (id) => {
        showModalWindow({
            title: `Вы уверены что хотите удалить пост?`,
            content: getDeleteModalContent(post, requestCloseModal, deletePost, onDeletePost, categoryIcon),
            show_close_button: false,
            close_func: () => {}
        });
    };

    const popupBody = [];

    if (profile?.is_admin) {
        popupBody.push(
            { title: "Редактировать", icon: <EditIcon />, onclick: () => navigate(`/posts/${post._id}/edit`) },
            { title: "Удалить", icon: <DeleteIcon />, type: "danger", onclick: () => delete_post(post._id) }
        );
    }

    return (
        <div className={`post_header ${className ?? ""}`}>
            <div className="post_header_left">
                <UserBadge data={post.author} />
                    <Tooltip text={format_date_time(post.created_date)}>
                        <p className="post_header_left_date">{format_back(post.created_date)}</p>
                    </Tooltip>
            </div>
            {
                profile?.is_admin ? 
                    <div className="post_header_right app-transition">
                        <Popup body={popupBody}>
                            <ThreeDotsIcon className="article_topic_three_dots"/>
                        </Popup>
                    </div>
                :
                    <></>
            }
        </div>
    );
});

export default PostHeader;