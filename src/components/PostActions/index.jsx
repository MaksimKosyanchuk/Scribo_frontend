import { useContext, useEffect, useState } from "react";
import { Link } from 'react-router-dom';

import { API_URL } from "../../config";

import { AppContext } from "../../App";

import { likePost } from "../../api/posts.api";

import "./PostActions.scss";

import { ReactComponent as BookMarkBorder} from "../../assets/svg/bookmark-outline.svg";
import { ReactComponent as BookMarkFilled} from "../../assets/svg/bookmark-filled.svg";
import { ReactComponent as ShareIcon} from "../../assets/svg/share.svg";
import { ReactComponent as CommentIcon} from "../../assets/svg/comment.svg";
import { ReactComponent as LikeIcon} from "../../assets/svg/like-outline.svg";
import { ReactComponent as FilledLikeIcon} from "../../assets/svg/like-filled.svg";

import Category from "../Category/index";

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

const PostActions = ({ className, article, setArticle, categoryIcon }) => {
    const { profile, setProfile, showToast } = useContext(AppContext)
    const [isSaved, setIsSaved] = useState(!!(profile?.saved_posts?.includes(article?._id)));
    const [isSavingProcess, setSavingProcess] = useState(false)

    useEffect(() => {
        setIsSaved(!!(profile?.saved_posts?.includes(article?._id)));
    }, [profile, article?._id])

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

    const getCommentsCount = (comments) => {
        if (!Array.isArray(comments)) return 0;

        return comments.reduce((count, comment) => {
            return count + 1 + getCommentsCount(comment.replies);
        }, 0);
    };


    async function doLike(nethod) {
        const result = await likePost(article._id, nethod)
        if (result.status === true) {
            setArticle({ ...article, likes: result.data.likes });
        }   
    }

    return (
        <div className={`post_actions ${className ?? ""}`}>
                <button className="post_actions_button app-transition" onClick={() => { doLike(article.likes?.includes(profile?._id) ? "DELETE" : "POST") }}>
                    {
                        article.likes?.includes(profile?._id) ?
                            <FilledLikeIcon />
                        :
                            <LikeIcon />
                    }
                    <p>{article.likes?.length > 0 ? article.likes.length : ""}</p>
                </button>
                <Link className="post_actions_button post_actions_comment app-transition" to={`/posts/${article._id}?comment=${article.comments?.length > 0 ? article.comments[0]._id : ""}`}>
                    <CommentIcon/>
                    {
                        article.comments?.length > 0 ?
                            <p>
                                {getCommentsCount(article.comments)}
                            </p>
                        :
                            <></>
                    }
                </Link>
                <button type="button" className="post_actions_button app-transition" onClick={save_post} disabled={isSavingProcess}>
                    {isSaved ? <BookMarkFilled /> : <BookMarkBorder />}
                </button>
                <button className="post_actions_button app-transition" onClick={() => { share(article._id, showToast) }}>
                    <ShareIcon />
                </button>
            <div className="post_actions_right_side">
                <Link className="post_actions_category app-transition" to={`/posts?filter=${article.category}`}>
                    <Category name={article.category} icon={categoryIcon} is_active={true} />
                </Link>
            </div>     
        </div>
    )
};

export default PostActions;