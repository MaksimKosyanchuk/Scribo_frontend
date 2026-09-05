import { useEffect, useRef, useState, useContext } from "react";
import { AppContext } from "../../App.jsx";
import { useNavigate } from "react-router-dom";

import "./PostComments.scss";

import { commentPost, getComments } from "../../api/posts.api";
import { FIELD_LIMITS } from "../../constants/fieldLimits";
import { deleteComment, editComment, likeComment } from "../../api/comments.api";
import { hasId, sameId, setIdPresent } from "../../utils/ids";

import { format_back, format_date_time } from "../../utils/format";
import { scrollTo } from "../../utils/navigation";

import ReplyIcon from "../../assets/svg/reply.svg?react";
import DeleteIcon from "../../assets/svg/delete.svg?react";
import EditIcon from "../../assets/svg/edit.svg?react";
import LikeFilledIcon from "../../assets/svg/like-filled.svg?react";
import LikeOutlineIcon from "../../assets/svg/like-outline.svg?react";
import ThreeDotsVeritcalIcon from "../../assets/svg/three-dots-vertical.svg?react";
import RedirectIcon from "../../assets/svg/redirect.svg?react";

import CurrentUserBadge from "../CurrentUserBadge/index.jsx";
import UserBadge from "../UserBadge/index.jsx";
import InputField from "../Ui/InputField/index";
import PrimaryButton from "../Ui/PrimaryButton/index";
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
                <CurrentUserBadge asLink={false} />

                <InputField
                    isMultiline
                    multilineRows={3}
                    length={FIELD_LIMITS.comment.max}
                    value={value}
                    onMouseDown={handleInputMouseDown}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />

                <div className="comment_form_actions">
                    {onCancel && (
                        <CancelButton
                            type="button"
                            disabled={isLoading}
                            onClick={onCancel}
                        >
                            Отмена
                        </CancelButton>
                    )}

                    <PrimaryButton
                        type="submit"
                        disabled={!value.trim()}
                        isLoading={isLoading}
                    >
                        Отправить
                    </PrimaryButton>
                </div>
            </div>
        </form>
    );
};

const mapCommentTree = (comments, commentId, updater) =>
    (comments || []).map((item) => {
        if (sameId(item._id, commentId)) {
            return updater(item)
        }
        if (item.replies?.length) {
            return {
                ...item,
                replies: mapCommentTree(item.replies, commentId, updater)
            }
        }
        return item
    })

const Comment = ({ comment, level = 0, replyCommentText, setReplyCommentText, profile, fetchComments, patchComment, showToast, postId }) => {
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState(comment.comment_text);
    const { showModalWindow } = useContext(AppContext);
    const navigate = useNavigate();
    const likeBusy = useRef(false);
    const likeWanted = useRef(null);

    const doReply = async (e) => {
        setIsLoading(true);
        e.preventDefault();

        const data = {
            commentText: replyText,
            parentCommentId: comment._id
        }

        const result = await commentPost(postId, data)

        if(result.status) {
            await fetchComments({ onSuccessFetch: () => {
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
            await fetchComments({ onSuccessFetch: () => {
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

    const flushLike = async () => {
        if (likeBusy.current || !comment?._id || !profile?._id) {
            return;
        }

        likeBusy.current = true;

        try {
            while (likeWanted.current !== null) {
                const wantLiked = likeWanted.current;
                likeWanted.current = null;
                const result = await likeComment(comment._id, wantLiked ? "POST" : "DELETE");

                if (likeWanted.current !== null) {
                    continue;
                }

                if (result.status === true && result.data?.likes) {
                    patchComment(comment._id, (item) => ({ ...item, likes: result.data.likes }));
                    showToast({
                        type: "success",
                        message: wantLiked ? "Лайк поставлен" : "Лайк снят"
                    });
                } else if (result.statusCode === 409) {
                    patchComment(comment._id, (item) => ({
                        ...item,
                        likes: setIdPresent(item.likes, profile._id, wantLiked)
                    }));
                } else {
                    patchComment(comment._id, (item) => ({
                        ...item,
                        likes: setIdPresent(item.likes, profile._id, !wantLiked)
                    }));
                    if (result.message) {
                        showToast({
                            type: "error",
                            message: result.message
                        });
                    }
                }
            }
        } finally {
            likeBusy.current = false;
            if (likeWanted.current !== null) {
                flushLike();
            }
        }
    };

    const doLike = () => {
        if (!profile) {
            showToast({
                type: "error",
                message: "Войдите в аккаунт, чтобы поставить лайк"
            });
            return;
        }

        const nextLiked = !hasId(comment.likes, profile._id);
        likeWanted.current = nextLiked;
        patchComment(comment._id, (item) => ({
            ...item,
            likes: setIdPresent(item.likes, profile._id, nextLiked)
        }));
        flushLike();
    }

    const actionsBody = []

    if (profile && profile._id.toString() === comment.author?._id?.toString()) {
        actionsBody.push([
            {
                title: "Редактировать",
                onClick: () => {
                    setEditMode(true);
                },
                icon: <EditIcon/>
            }
        ]);
    }

    if ((profile && profile._id.toString() === comment.author?._id?.toString()) || (profile && profile.permissions.includes("delete_any_comment"))) {
        actionsBody.push([
            {
                title: "Удалить",
                onClick: () => {
                    deleteComment(comment._id).then((result) => {
                        if(result.status === true) {
                            fetchComments({ onSuccessFetch: () => {
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
            }
        ]);
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
                                    className="comment_author"
                                />
                                <Tooltip text={format_date_time(comment.created_date)}>
                                    <p className="comment_body_top_side_date">
                                            {format_back(comment.created_date)}
                                    </p>
                                </Tooltip>
                                {
                                    actionsBody.length > 0 ?

                                        <div className="comment_body_top_side_more">
                                            <Popup
                                                body={actionsBody}   
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
                                <Tooltip text={hasId(comment.likes, profile?._id) ? "Убрать лайк" : "Поставить лайк"}>
                                    <button
                                        type="button"
                                        className="comment_body_bottom_side_button app-transition"
                                        onClick={doLike}
                                    >
                                        {
                                            hasId(comment.likes, profile?._id) ?
                                                <LikeFilledIcon className="comment_like_icon app-transition"/>
                                            :
                                                <LikeOutlineIcon className="comment_like_icon app-transition"/>
                                        }
                                        <p>{comment.likes?.length > 0 ? comment.likes.length : ""}</p>
                                    </button>
                                </Tooltip>
                                <Tooltip text="Ответить">
                                    <div
                                        className="comment_body_bottom_side_button app-transition"
                                        onClick={() => { setShowForm(true) }}>
                                        <ReplyIcon className="app-transition"/>
                                        <p>{comment.replies?.length > 0 ? comment.replies.length : ""}</p>
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
                                patchComment={patchComment}
                                showToast={showToast}
                                profile={profile}
                                postId={postId}
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

    const patchComment = (commentId, updater) => {
        setComments((prev) => mapCommentTree(prev, commentId, updater));
    };

    const doComment = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = {
            commentText: commentText
        }

        const result = await commentPost(postId, data)

        if(result.status === true) {
            await fetchComments({ onSuccessFetch: () => {
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
                        patchComment={patchComment}
                        showToast={showToast}
                        profile={profile}
                        postId={postId}
                    />
                ))}
            </div>
        </div>
    );
}


export default PostComments;