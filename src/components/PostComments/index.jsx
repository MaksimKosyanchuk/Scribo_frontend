import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../App.js";
import { useNavigate } from "react-router-dom";

import "./PostComments.scss";

import { commentPost, getComments } from "../../api/posts.api";
import { deleteComment } from "../../api/comments.api";

import { format_back, format_date_time } from "../../utils/format";
import { scrollTo } from "../../utils/navigation";

import { ReactComponent as ReplyIcon } from "../../assets/svg/reply.svg";
import { ReactComponent as DeleteIcon } from "../../assets/svg/delete.svg";
import { ReactComponent as EditIcon } from "../../assets/svg/edit.svg";
import { ReactComponent as LikeFilledIcon } from "../../assets/svg/like-filled.svg";
import { ReactComponent as LikeOutlineIcon } from "../../assets/svg/like-outline.svg";
import { ReactComponent as ThreeDotsVeritcalIcon } from "../../assets/svg/three-dots-vertical.svg";

import CurrentUserBadge from "../CurrentUserBadge/index.jsx";
import UserBadge from "../UserBadge/index.jsx";
import InputField from "../Ui/InputField/index";
import PrimaryButton from "../../components/Ui/PrimaryButton/index";
import CancelButton from "../../components/Ui/CancelButton/index";
import Tooltip from "../Ui/Tooltip/index";
import Popup from "../Ui/Popup/index.jsx";

const checkAccessToActions = ({ profile, comment_author_id }) => {
    const roles = ['admin', 'tech_admin']

    if(profile && profile._id === comment_author_id) {
        return true;
    }

    if(profile && roles.includes(profile.role)) {
        return true;
    }

    return false;
}

const Comment = ({ comment, level = 0, replyCommentText, setReplyCommentText, profile, fetchComments, showToast }) => {
    return (
        <div
            className={`comment app-transition ${level === 0 ? `comment_root` : ''}`}
        >
            <div className="comment_body section app-transition">

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
                        checkAccessToActions({ profile, comment_author_id: comment.author._id }) ?

                            <div className="comment_body_top_side_more">
                                <Popup
                                    body={[
                                        {
                                            "title": "Редактировать",
                                            "onClick": () => {
                                                showToast({
                                                    type: "warning",
                                                    message: "Функция редактирования недоступна"
                                                });
                                            },
                                            icon: <EditIcon/>
                                        },
                                        {
                                            "title": "Удалить",
                                            "onClick": () => {
                                                deleteComment(comment._id).then((result) => {
                                                    if(result.status === true) {
                                                        fetchComments();
                                                    }
                                                });
                                            },
                                            icon: <DeleteIcon/>,
                                            type: "danger"
                                        }
                                    ]}>
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
                        <div className="comment_body_bottom_side_button app-transition">
                            {
                                comment.likes.includes(profile?._id) ?
                                    <LikeFilledIcon className="comment_like_icon app-transition"/>
                                :
                                    <LikeOutlineIcon className="comment_like_icon app-transition"/>
                            }
                            <p>{comment.likes.length ?? 0}</p>
                        </div>
                    </Tooltip>
                    <Tooltip text="Ответить">
                        <div
                            className="comment_body_bottom_side_button app-transition"
                            onClick={() => { 
                            setReplyCommentText({ comment_id: comment._id, comment_text: comment.comment_text })
                            scrollTo("post_comments_submit");
                        }}>
                            <ReplyIcon className="app-transition"/>
                            <p>{comment.replies.length ?? 0}</p>
                        </div>
                    </Tooltip>
                </div>
            </div>
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
    const [replyCommentText, setReplyCommentText] = useState(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { profile, showModalWindow, showToast } = useContext(AppContext);
    const navigate = useNavigate();

    const fetchComments = async () => {
        const result = await getComments(postId)
        if(result.status === true) {
            setComments(result.data);
            setReplyCommentText(null);
            setCommentText('');
        }
    };

    const doComment = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const data = {
            comment_text: commentText
        }

        if(replyCommentText) {
            data.parent_comment_id = replyCommentText.comment_id;
        }

        const result = await commentPost(postId, data)
        if(result.status === true) {
            setCommentText('');
            await fetchComments();
        }
        setIsLoading(false);
    }

    const handleInputMouseDown = (e) => {
        if (!profile) {
            e.preventDefault();
            showModalWindow({
                title: `Войдите в аккаунт, чтобы оставить комментарий`,
                content: (
                    <PrimaryButton onClick={() => { navigate("/auth/login") }} className="modal_login_link">
                        Войти
                    </PrimaryButton>
                )
            });
        }
    };

    useEffect(() => {
        if(commentText.length > 0){
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [commentText])

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
                
                <form className="post_comments_form app-transition" onSubmit={doComment}>
                    {
                        replyCommentText ? 
                        <div className="post_comments_form_top">
                            <p className="post_comments_form_top_left">
                                Ответ на комментарий:{" "}
                                <span
                                    className="post_comments_form_top_left_comment_text app-transition"
                                    onClick={() => {
                                        const element = document.getElementById(`comment_${replyCommentText.comment_id}`)
                                        if (element) {
                                            scrollTo(`comment_${replyCommentText.comment_id}`);

                                            element.classList.add("comment_highlight");
                                            setTimeout(() => {
                                                element.classList.remove("comment_highlight");
                                            }, 2000);
                                        }
                                    }}
                                >
                                    {replyCommentText.comment_text}
                                </span>
                            </p>
                            <CancelButton onClick={() => setReplyCommentText(null)}>Отмена</CancelButton>
                        </div>
                        :
                        <></>
                    }
                    <div className="post_comments_form_content">
                        <CurrentUserBadge as_link={false} />
                        <InputField class_name="post_comments_input"
                            is_multiline={true} multiline_rows={3} length={500} type="text" input_label=""
                            value={commentText} placeholder="Напишите комментарий..."
                            onMouseDown={ (e) => { handleInputMouseDown(e) } }
                            onChange={(e) => {
                                setCommentText(e.target.value);
                            }
                        }/>
                        <PrimaryButton type="submit" id={"post_comments_submit"} text="Отправить" class_name="post_comments_submit" disabled={isDisabled} is_loading={isLoading}>
                            Отправить
                        </PrimaryButton>
                    </div>
                </form>
              
            }
            <div className="post_comments_list">
                {comments?.map((comment) => (
                    <Comment
                        key={comment._id}
                        comment={comment}
                        replyCommentText={replyCommentText}
                        setReplyCommentText={setReplyCommentText}
                        fetchComments={fetchComments}
                        showToast={showToast}
                        profile={profile}
                    />
                ))}
            </div>
        </div>
    );
}


export default PostComments;