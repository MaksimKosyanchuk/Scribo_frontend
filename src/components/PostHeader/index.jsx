import { useContext, memo } from "react";
import { useNavigate } from 'react-router-dom';

import { AppContext } from "../../App";

import "./PostHeader.scss";

import { deletePost } from "../../api/posts.api";

import ThreeDotsIcon from "../../assets/svg/three-dots.svg?react";
import EditIcon from "../../assets/svg/edit.svg?react";
import DeleteIcon from "../../assets/svg/delete.svg?react";

import { format_back, format_date_time } from "../../utils/format";

import UserBadge from "../UserBadge";
import Popup from "../Ui/Popup";
import ActionButton from "../Ui/ActionButton";
import DangerButton from "../Ui/DangerButton";
import Tooltip from "../Ui/Tooltip/index";
import Category from "../Category";

import Sceleton from "../Ui/Sceleton/Sceleton";

const getDeleteModalContent = (post, requestCloseModal, deletePost, onDeletePost, showToast) => (
    <div className="modal_delete_post_content">
        <div className="modal_delete_post_content_post">
            <div className="modal_delete_post_content_post_header">
                <PostHeader post={post} />
                <Category category={post.category} isActive={true}/>
            </div>
            <h2 className="modal_delete_post_content_post_title">{post.title}</h2>
            {post.featured_image && (
                <img className="modal_delete_post_content_post_image" src={post.featured_image} alt="post_image" />
            )}
        </div>
        <div className="modal_delete_post_content_bottom">
            <ActionButton onClick={requestCloseModal} className="modal_delete_post_content_button">Отмена</ActionButton>
            <DangerButton 
                onClick={async () => {
                    await deletePost(post._id).then((result) => {
                        if(result.status){
                            onDeletePost(post._id);
                        }
                        else {
                            showToast({
                                type: "error",
                                message: result.message
                            })
                        }
                        requestCloseModal()
                    })

                }}
                className="modal_delete_post_content_button" 
                isActive={true}
            >
                Удалить
            </DangerButton>
        </div>
    </div>
);

const PostHeader = memo(({ post, onDeletePost, className, isLoading=false }) => {
    const { profile, showModalWindow, requestCloseModal, showToast } = useContext(AppContext);
    const navigate = useNavigate();
    
    const handleDeletePost = async () => {
        showModalWindow({
            title: `Вы уверены что хотите удалить пост?`,
            content: getDeleteModalContent(post, requestCloseModal, deletePost, onDeletePost, showToast),
            showCloseButton: false,
            closeFunc: () => {}
        });
    };

    const popupBody = [
        [
            { title: "Редактировать", icon: <EditIcon />, onClick: () => navigate(`/posts/${post._id}/edit`) },
        ],
        [
            { title: "Удалить", icon: <DeleteIcon />, type: "danger", onClick: () => handleDeletePost(post._id) },
        ],
    ];

    return (
        <div className={`post_header ${className ?? ""}`}>
            <div className="post_header_left">
                <Sceleton isLoading={isLoading} rounded={true} className="user_badge">
                    <UserBadge data={post.author}/>
                </Sceleton>
                <Sceleton isLoading={isLoading} rounded={true} className="post_header_left_date">
                    <Tooltip text={format_date_time(post.created_date)} position="bottom">
                        <p className="post_header_left_date">{format_back(post.created_date)}</p>
                    </Tooltip>
                </Sceleton>
            </div>
            {
                !isLoading &&
                    (
                        (profile?.permissions.includes("delete_any_post") && profile?.permissions.includes("edit_any_post")) || (profile?._id === post?.author?._id)
                    )
                ?
                    <Popup body={popupBody}>
                        <div className="post_header_right app-transition">
                            <ThreeDotsIcon className="article_topic_three_dots"/>
                        </div>
                    </Popup>
                :
                    <></>
        }
        </div>
    );
});

export default PostHeader;