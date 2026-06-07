import "./PostComments.scss";
import { useEffect, useState, useContext } from "react";
import Author from "../Author";
import { AppContext } from "../../App.js";
import { format_date } from "../../utils/format";
import InputField from "../Ui/InputField/index";
import PrimaryButton from "../../components/Ui/PrimaryButton/index";
import { commentPost, getComments } from "../../api/posts.api";
import ActionButton from "../../components/Ui/ActionButton/index";
import DangerButton from "../../components/Ui/DangerButton/index";

const Comment = ({ comment, level = 0, replyCommentText, setReplyCommentText, profile }) => {
    return (
        <div
            className={`comment app-transition ${level === 0 ? `comment_root` : ''}`}
        >
            <div className="comment_top_side">
                <Author
                    author_data={comment.author}
                    class_name="comment_author"
                />
                <p className="comment_top_side_date">
                    {format_date(comment.created_date)}
                </p>
            </div>

            <div className="comment_middle_side">
                <p className="comment_middle_side_text" id={`comment_${comment._id}`}>
                    {comment.comment_text}
                </p>
            </div>
            {
                profile ?
                    <div className="comment_bottom_side">
                        <ActionButton onClick={() => { 
                            setReplyCommentText({ comment_id: comment._id, comment_text: comment.comment_text })
                            document.getElementById("post_comments_submit")?.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });
                        }}>
                            Ответить
                        </ActionButton>
                    </div>
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
    const { profile } = useContext(AppContext);

    const doComment = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const data = {
            comment_text: commentText
        }

        if(replyCommentText) {
            data.parent_comment_id = replyCommentText.comment_id;
        }

        await commentPost(postId, data).then((result) => {
            if(result.status === true) {
                setCommentText('');
                getComments(postId).then((result) => {
                    if(result.status === true) {
                        setComments(result.data);
                        setReplyCommentText(null);
                        setCommentText('');
                    }
                });
            }
            setIsLoading(false);
        });
    }

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
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
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
                profile ? 
                <form className="post_comments_form app-transition" onSubmit={doComment}>
                    {
                        replyCommentText ? 
                        <div className="post_comments_form_top">
                           <p className="post_comments_form_top_left">
                                Ответ на комментарий:{" "}
                                <span
                                    className="post_comments_form_top_left_comment_text"
                                    onClick={() => {
                                        const element = document.getElementById(`comment_${replyCommentText.comment_id}`)
                                        if (element) {
                                            element.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center"
                                            });

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
                            <DangerButton onClick={() => setReplyCommentText(null)}>Отмена</DangerButton>
                        </div>
                        :
                        <></>
                    }
                    <div className="post_comments_form_bottom">
                        <InputField class_name="post_comments_input"
                            value={commentText} placeholder="Напишите комментарий..."
                            onChange={(e) => {
                                setCommentText(e.target.value);
                            }
                        }/>
                        <PrimaryButton type="submit" id={"post_comments_submit"} text="Отправить" class_name="post_comments_submit" disabled={isDisabled} is_loading={isLoading}>
                            Отправить
                        </PrimaryButton>
                    </div>
                </form>
                :
                <></>
            }
            <div className="post_comments_list">
                {comments?.map((comment) => (
                    <Comment
                        key={comment._id}
                        comment={comment}
                        replyCommentText={replyCommentText}
                        setReplyCommentText={setReplyCommentText}
                        profile={profile}
                    />
                ))}
            </div>
        </div>
    );
}


export default PostComments;