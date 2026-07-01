import { useContext, useEffect, useState, memo } from "react";
import { Link } from 'react-router-dom';
import { AppContext } from "../../App";
import { API_URL } from "../../config";
import "./PostActions.scss";
import { ReactComponent as BookMarkBorder} from "../../assets/svg/bookmark-outline.svg";
import { ReactComponent as BookMarkFilled} from "../../assets/svg/bookmark-filled.svg";
import { ReactComponent as ShareIcon} from "../../assets/svg/share.svg";
import { ReactComponent as CommentIcon} from "../../assets/svg/comment.svg";
import Category from "../Category/index";
import Tooltip from "../Ui/Tooltip/index";

function isMobile() {
    return navigator.maxTouchPoints > 0;
}

async function share(id, showToast) {
    if(isMobile()){
        navigator.share({
            title: 'Заголовок',
            text: 'Текст',
            url: `https://${process.env.REACT_APP_VERCEL_PROJECT_PRODUCTION_URL}/posts/${id}`
        })
    } else {
        try {
            await navigator.clipboard.writeText(`https://${process.env.REACT_APP_VERCEL_PROJECT_PRODUCTION_URL}/posts/${id}`)
            showToast({message: "Скопировано!", type: "success" })
        } catch (err) {
            console.error(`Failed to copy: /posts/${id}`, err)
        }
    }
}

const PostActions = memo(({ article }) => {
    const { profile, setProfile, showToast } = useContext(AppContext)
    const [isSaved, setIsSaved] = useState(!!(profile?.saved_posts?.includes(article?._id)));
    const [isSavingProcess, setSavingProcess] = useState(false)

    useEffect(() => {
        setIsSaved(!!(profile?.saved_posts?.includes(article?._id)));
    }, [profile, article?._id]) // Добавили id в депенденси для точности

    const save_post = async () => {
        setSavingProcess(true)
        const requestOptions = {
            method: profile?.saved_posts?.some((post) => post.toString() === article._id) ? 'DELETE' : 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}`}
        };

        try {
            let result = await fetch(`${API_URL}/api/posts/${article._id}/save`, requestOptions)
            result = await result.json();
            if (result.status === true) {
                let saved_posts = isSaved ? profile.saved_posts.filter(element => element !== article._id ) : [...profile.saved_posts, article._id]
                setProfile({ ...profile, saved_posts: saved_posts })
                showToast({ message: isSaved ? "Убрано из сохранённых!" : "Сохранено!", type: "success" });
                setIsSaved(!isSaved)
            } else {
                showToast({ message: "Чтобы сохранить пост, войдите в аккаунт!", type: "warning" })
            }
        } catch (error) {
            console.log(error)
        } finally {
            setSavingProcess(false)
        }
    };

    return (
        <div className="post_actions">
            <Tooltip className="post_actions_comment" text="Комментарии">
                <Link className="post_actions_button app-transition" to={`/posts/${article._id}?comment=${article.comments?.length > 0 ? article.comments[0]._id : ""}`}>
                    <CommentIcon/>
                    <p>{article.comments?.length > 0 ? article.comments.length : ""}</p>
                </Link>
            </Tooltip>
            <Tooltip text={isSaved ? "Убрать из сохранённых" : "Сохранить"}>
                <button type="button" className="post_actions_button app-transition" onClick={save_post} disabled={isSavingProcess}>
                    {isSaved ? <BookMarkFilled /> : <BookMarkBorder />}
                </button>
            </Tooltip>
            <Tooltip text="Поделиться">
                <button className="post_actions_button app-transition" onClick={() => { share(article._id, showToast) }}>
                    <ShareIcon />
                </button>
            </Tooltip>
            <div className="post_actions_right_side">
                <Link className="post_actions_category app-transition" to={`/posts?filter=${article.category}`}>
                    <Category name={article.category} />
                </Link>
            </div>
        </div>
    )
});

export default PostActions;