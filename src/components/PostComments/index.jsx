import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../App.js";
import { useNavigate } from "react-router-dom";

import "./PostComments.scss";

import { commentPost, getComments } from "../../api/posts.api";
import { deleteComment, editComment, likeComment } from "../../api/comments.api";

import { format_back, format_date_time } from "../../utils/format";
import { scrollTo } from "../../utils/navigation";

import { ReactComponent as ReplyIcon } from "../../assets/svg/reply.svg";
import { ReactComponent as DeleteIcon } from "../../assets/svg/delete.svg";
import { ReactComponent as EditIcon } from "../../assets/svg/edit.svg";
import { ReactComponent as LikeFilledIcon } from "../../assets/svg/like-filled.svg";
import { ReactComponent as LikeOutlineIcon } from "../../assets/svg/like-outline.svg";
import { ReactComponent as ThreeDotsVeritcalIcon } from "../../assets/svg/three-dots-vertical.svg";
import { ReactComponent as RedirectIcon } from "../../assets/svg/redirect.svg";

import CurrentUserBadge from "../CurrentUserBadge/index.jsx";
import UserBadge from "../UserBadge/index.jsx";
import InputField from "../Ui/InputField/index";
import PrimaryButton from "../../components/Ui/PrimaryButton/index";
import CancelButton from "../../components/Ui/CancelButton/index";
import Tooltip from "../Ui/Tooltip/index";
import Popup from "../Ui/Popup/index.jsx";

const CommentForm = ({
    value,
    onChange,
    onSubmit,
    onCancel,
    showModalWindow,
    navigate,
    profile,
    title,
    placeholder = "Напишите комментарий...",
    isLoading = false
}) => {

    const handleInputMouseDown = (e) => {
        if (!profile) {
            e.preventDefault();
            showModalWindow({
                title: `Войдите в аккаунт, чтобы оставить комментарий`,
                content: (
                    <PrimaryButton onClick={() => { navigate("/auth/login") }} className="modal_login_link">
                        <RedirectIcon/>
                        Войти
                    </PrimaryButton>
                )
            });
        }
    };

    return (
        <form className="comment_form" onSubmit={onSubmit}>
            {title}

            <div className="comment_form_content">
                <CurrentUserBadge as_link={false} />

                <InputField
                    is_multiline
                    multiline_rows={3}
                    length={500}
                    value={value}
                    onMouseDown={handleInputMouseDown}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />

                <div className="comment_form_actions">
                    {onCancel && (
                        <CancelButton
                            type="button"
                            onClick={onCancel}
                        >
                            Отмена
                        </CancelButton>
                    )}

                    <PrimaryButton
                        type="submit"
                        disabled={!value.trim()}
                        is_loading={isLoading}
                    >
                        Отправить
                    </PrimaryButton>
                </div>
            </div>
        </form>
    );
};

const Comment = ({ comment, level = 0, replyCommentText, setReplyCommentText, profile, fetchComments, showToast, post_id }) => {
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState(comment.comment_text);
    const { showModalWindow } = useContext(AppContext);
    const navigate = useNavigate();

    const doReply = async (e) => {
        setIsLoading(true);
        e.preventDefault();

        const data = {
            comment_text: replyText,
            parent_comment_id: comment._id
        }

        const result = await commentPost(post_id, data)

        if(result.status) {
            await fetchComments({ onSuccessFetch: (data) => {
                setReplyText('');
                setShowForm(false);
                showToast({
                    type: "success",
                    message: "Ответ опубликован"
                });
            }});
        }
        setIsLoading(false);
    }

    const doEditComment = async (e) => {
        setIsLoading(true);
        e.preventDefault();

        const result = await editComment(comment._id, editText);

        if(result.status) {
            setEditMode(false);
            await fetchComments({ onSuccessFetch: (data) => {
                setReplyText('');
                setShowForm(false);
                showToast({
                    type: "success",
                    message: "Изменения сохранены"
                });
            }});
        }
        else {
            showToast({
                type: "error",
                message: result.message
            });
        }
        setIsLoading(false);
    }

    const doLike = async () => {
        if(!profile) {
            showToast({
                type: "error",
                message: "Войдите в аккаунт, чтобы поставить лайк"
            });
            return;
        }
        const result = await likeComment(comment._id, comment.likes.includes(profile?._id) ? "DELETE" : "POST");

        if(result.status) {
            await fetchComments({ onSuccessFetch: (data) => {
                showToast({
                    type: "success",
                    message: comment.likes.includes(profile?._id) ? "Лайк снят" : "Лайк поставлен"
                });
            }});
        }
        else {
            showToast({
                type: "error",
                message: result.message
            });
        }
    }

    const actions_body = []

    if(profile && profile._id.toString() === comment.author._id.toString()) {
        actions_body.push({
            "title": "Редактировать",
            "onClick": () => {
                setEditMode(true);
            },
            icon: <EditIcon/>
        });
    }

    if((profile && profile._id.toString() === comment.author._id.toString()) || (profile && profile.permissions.includes("delete_any_comment"))) {
        actions_body.push({
           "title": "Удалить",
            "onClick": () => {
                deleteComment(comment._id).then((result) => {
                    if(result.status === true) {
                        fetchComments({ onSuccessFetch: (data) => {
                            showToast({
                                type: "success",
                                message: "Комментарий удален"
                            });
                        }});
                    }
                });
            },
            icon: <DeleteIcon/>,
            type: "danger"
        });
    }

    return (
        <div
            className={`comment app-transition ${level === 0 ? `comment_root` : ''}`}
        >
            <div className="comment_body section app-transition">
                {
                    editMode ?
                        <CommentForm
                            value={editText}
                            onChange={setEditText}
                            showModalWindow={showModalWindow}
                            navigate={navigate}
                            profile={profile}
                            onSubmit={doEditComment}
                            isLoading={isLoading}
                            onCancel={() => setEditMode(false)}
                        />
                    :
                        <>
                            <div className="comment_body_top_side">
                                <UserBadge
                                    data={comment.author}
                                    class_name="comment_author"
                                />
                                <Tooltip text={format_date_time(comment.created_date)}>
                                    <p className="comment_body_top_side_date">
                                            {format_back(comment.created_date)}
                                    </p>
                                </Tooltip>
                                {
                                    actions_body.length > 0 ?

                                        <div className="comment_body_top_side_more">
                                            <Popup
                                                body={actions_body}   
                                            >
                                                <ThreeDotsVeritcalIcon className="app-transition"/>
                                            </Popup>
                                        </div>
                                    :
                                        <></>
                                }
                            </div>
                            <div className="comment_body_middle_side">
                                <p className="comment_body_middle_side_text" id={`comment_${comment._id}`}>
                                    {comment.comment_text}
                                </p>
                            </div>
                            <div className="comment_body_bottom_side">
                                <Tooltip text="Поставить лайк">
                                    <button
                                        className="comment_body_bottom_side_button app-transition"
                                        onClick={doLike}
                                    >
                                        {
                                            comment.likes.includes(profile?._id) ?
                                                <LikeFilledIcon className="comment_like_icon app-transition"/>
                                            :
                                                <LikeOutlineIcon className="comment_like_icon app-transition"/>
                                        }
                                        <p>{comment.likes.length ?? 0}</p>
                                    </button>
                                </Tooltip>
                                <Tooltip text="Ответить">
                                    <div
                                        className="comment_body_bottom_side_button app-transition"
                                        onClick={() => { setShowForm(true) }}>
                                        <ReplyIcon className="app-transition"/>
                                        <p>{comment.replies.length ?? 0}</p>
                                    </div>
                                </Tooltip>
                            </div>
                        </>
                }
            </div>
            {
                showForm ?
                    <CommentForm
                        value={replyText}
                        onChange={setReplyText}
                        onSubmit={doReply}
                        onCancel={() => setShowForm(false)}
                        isLoading={isLoading}
                        showModalWindow={showModalWindow}
                        navigate={navigate}
                        profile={profile}
                        title={
                            <div className="comment_form_reply_info">
                                <p>
                                    Ответ пользователю
                                </p>
                                    <UserBadge data={comment.author} />
                            </div>
                        }
                    />
                :
                    <></>
            }
            {comment.replies?.length > 0 && (
                <div className="comment_replies">
                    <div className="comment_replies_list">
                        {comment.replies.map((reply) => (
                            <Comment
                                key={reply._id}
                                comment={reply}
                                level={level + 1}
                                replyCommentText={replyCommentText}
                                setReplyCommentText={setReplyCommentText}
                                fetchComments={fetchComments}
                                showToast={showToast}
                                profile={profile}
                                post_id={post_id}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PostComments = ({ postId, navigateTo }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { profile, showModalWindow, showToast } = useContext(AppContext);
    const navigate = useNavigate();

    const fetchComments = async ({ onSuccessFetch }) => {
        const result = await getComments(postId)
        if(result.status === true) {

            onSuccessFetch && onSuccessFetch(result.data);

            setComments(result.data);
        }
    };

    const doComment = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const data = {
            comment_text: commentText
        }


        const result = await commentPost(postId, data)

        if(result.status === true) {
            await fetchComments({ onSuccessFetch: (data) => {
                setCommentText('');
                showToast({
                    type: "success",
                    message: "Ответ опубликован"
                });
            }});
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if(postId) {
            getComments(postId).then((result) => {
                if(result.status === true) {
                    setComments(result.data);
                }
            });
        }
    }, [postId])

    useEffect(() => {
        if(comments.length > 0 && navigateTo) {
            const element = document.getElementById(`comment_${navigateTo}`);
            if(element) {
                scrollTo(`comment_${navigateTo}`);
                element.classList.add("comment_highlight");
                setTimeout(() => {
                    element.classList.remove("comment_highlight");
                }, 2000);
            }
        }
    }, [comments, navigateTo])

    return (
        <div className="post_comments">
            {
                <CommentForm
                    value={commentText}
                    onChange={setCommentText}
                    onSubmit={doComment}
                    isLoading={isLoading}
                    showModalWindow={showModalWindow}
                    navigate={navigate}
                    profile={profile}
                /> 
            }
            <div className="post_comments_list">
                {comments?.map((comment) => (
                    <Comment
                        key={comment._id}
                        comment={comment}
                        fetchComments={fetchComments}
                        showToast={showToast}
                        profile={profile}
                        post_id={postId}
                    />
                ))}
            </div>
        </div>
    );
}


export default PostComments;