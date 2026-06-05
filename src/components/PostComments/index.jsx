import "./PostComments.scss";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config";
import Author from "../Author";
import { AppContext } from "../../App.js";
import { format_date } from "../../utils/format";
import InpuField from "../../components/Ui/InputField/index";
import PrimaryButton from "../../components/Ui/PrimaryButton/index";
import { commentPost } from "../../api/posts.api";


const PostComments = ({ postId, comments, setComments }) => {
    const [text, setText] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { profile } = useContext(AppContext);

    const doComment = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await commentPost(postId, {
            content_text: text
        }).then((result) => {
            if(result.status === true) {
                setText('');
                setComments(result.data.comments);
            }
            setIsLoading(false);
        });
    }

    useEffect(() => {
        if(text.length > 0){
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [text])

    return (
        <div className="post_comments">
            {
                profile ? 
                <form className="post_comments_form">
                    <InpuField placeholder="Напишите комментарий..." class_name="post_comments_input" value={text} onChange={(text) => { setText(text.target.value) }} />
                    <PrimaryButton text="Отправить" class_name="post_comments_submit" disabled={isDisabled} is_loading={isLoading} onClick={() => { doComment() }}>
                        Отправить
                    </PrimaryButton>
                </form>
                :
                <></>
            }
            <div className="post_comments_list">
                {   
                    comments?.map((comment) => {
                        return (
                            <div key={comment._id} className="comment">
                                <div className="comment_top_side">
                                    <Link to={`/users/${comment.author.nick_name}`}>
                                        <Author author_data={comment.author} asLink={false} class_name="comment_author" />
                                    </Link>
                                    <p className="comment_top_side_date">{format_date(comment.date_time)}</p>

                                </div>
                                <div className="comment_bottom_side">
                                    <p className="comment_bottom_side_text">{comment.content_text}</p>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}


export default PostComments;