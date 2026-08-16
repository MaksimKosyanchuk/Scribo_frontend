import { useContext, useEffect, useState } from "react";
import { Link } from 'react-router-dom';

import { AppContext } from "../../App";

import { likePost, savePost } from "../../api/posts.api";

import "./PostActions.scss";

import BookMarkBorder from "../../assets/svg/bookmark-outline.svg?react";
import BookMarkFilled from "../../assets/svg/bookmark-filled.svg?react";
import ShareIcon from "../../assets/svg/share.svg?react";
import CommentIcon from "../../assets/svg/comment.svg?react";
import LikeIcon from "../../assets/svg/like-outline.svg?react";
import FilledLikeIcon from "../../assets/svg/like-filled.svg?react";

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
            url: `https://${import.meta.env.VITE_APP_VERCEL_PROJECT_PRODUCTION_URL}/posts/${id}`
        })
    } else {
        try {
            await navigator.clipboard.writeText(`https://${import.meta.env.VITE_APP_VERCEL_PROJECT_PRODUCTION_URL}/posts/${id}`)
            showToast({message: "Скопировано!", type: "success" })
        } catch (err) {
            console.error(`Failed to copy: /posts/${id}`, err)
        }
    }
}

const PostActions = ({ className, article, setArticle }) => {
    const { profile, setProfile, showToast } = useContext(AppContext)
    const [isSaved, setIsSaved] = useState(!!(profile?.saved_posts?.includes(article?._id)));
    const [isSavingProcess, setSavingProcess] = useState(false)
    
    useEffect(() => {
        setIsSaved(!!(profile?.saved_posts?.includes(article?._id)));
    }, [profile, article?._id])

    const save_post = async () => {
        setSavingProcess(true)

        const result = await savePost(article._id, profile?.saved_posts?.some((post) => post.toString() === article._id) ? 'DELETE' : 'POST')
        
        if (result.status === true) {
            let saved_posts = isSaved ? profile.saved_posts.filter(element => element !== article._id ) : [...profile.saved_posts, article._id]
            setProfile({ ...profile, saved_posts: saved_posts })
            showToast({ message: isSaved ? "Убрано из сохранённых!" : "Сохранено!", type: "success" });
            setIsSaved(!isSaved)
        } else {
            if(result.statusCode === 401) {
                showToast({ message: "Чтобы сохранить пост, войдите в аккаунт!", type: "warning" })
            }
        }
        setSavingProcess(false)
    };

    const getCommentsCount = (comments) => {
        if (!Array.isArray(comments)) return 0;

        return comments.reduce((count, comment) => {
            return count + 1 + getCommentsCount(comment.replies);
        }, 0);
    };

    async function doLike(method) {
        if(profile) {
            const isLike = method === "POST";

            if(isLike) {
                setArticle({ ...article, likes: [...article.likes, profile?._id] })
                
                const result = await likePost(article._id, method)
                
                if (result.status === true) {
                    setArticle({ ...article, likes: result.data.likes });
                    showToast({ message: "Поставлен лайк!", type: "success" })
                }
                else {
                    setArticle({ ...article, likes: article.likes.filter((like) => like !== profile?._id) });
                }
            }
            else {
                setArticle({ ...article, likes: article.likes.filter((like) => like !== profile?._id) })
                
                const result = await likePost(article._id, method)
                
                if (result.status === true) {
                    setArticle({ ...article, likes: result.data.likes });
                    showToast({ message: "Лайк убран!", type: "success" })
                }
                else {
                    setArticle({ ...article, likes: [...article.likes, profile?._id] });
                }
            }
            
        }

        else {
            showToast({ message: "Чтобы поставить лайк, войдите в аккаунт!", type: "warning" })
        }
    }

    return (
        <div className={`post_actions ${className ?? ""}`}>
            <div className="post_actions_left_side">
                <Tooltip text={article.likes?.includes(profile?._id) ? "Убрать лайк" : "Поставить лайк"} clickable={true}>
                    <button className="post_actions_button app-transition" onClick={() => { doLike(article.likes?.includes(profile?._id) ? "DELETE" : "POST") }}>
                        {
                            article.likes?.includes(profile?._id) ?
                                <FilledLikeIcon />
                            :
                                <LikeIcon />
                        }
                        <p>{article.likes?.length > 0 ? article.likes.length : ""}</p>
                    </button>
                </Tooltip>
                <Tooltip text={"Перейти к комментариям"} clickable={true}>
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
                </Tooltip>
                <Tooltip text={isSaved ? "Убрать из сохранённых" : "Сохранить"} clickable={true}>
                    <button type="button" className="post_actions_button app-transition" onClick={save_post} disabled={isSavingProcess}>
                        {isSaved ? <BookMarkFilled /> : <BookMarkBorder />}
                    </button>
                </Tooltip>
                <Tooltip text={isMobile() ? "Поделиться" : "Скопировать ссылку"} clickable={true}>
                    <button className="post_actions_button app-transition" onClick={() => { share(article._id, showToast) }}>
                        <ShareIcon />
                    </button>
                </Tooltip>
            </div>
            <div className="post_actions_right_side">
                <Category category={article.category} is_active={true}/>
            </div>     
        </div>
    )
};

export default PostActions;