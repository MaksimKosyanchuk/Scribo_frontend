import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from "../../App";
import { API_URL } from "../../config";
import "./ArticleTopic.scss";
import Author from "../Author";
import ModalWindow from "../ModalWindow";
import { ReactComponent as BookMarkBorder} from "../../assets/svg/bookmark-outline-icon.svg";
import { ReactComponent as BookMarkFilled} from "../../assets/svg/bookmark-filled-icon.svg";
import { ReactComponent as ShareIcon} from "../../assets/svg/share-icon.svg";
import { ReactComponent as ThreeDotsIcon} from "../../assets/svg/three-dots-icon.svg";
import { deletePost } from "../../api/posts.api";
import ChipButton from "../Ui/ChipButton";
import Popup from "../Ui/Popup";
import DangerButton from "../Ui/DangerButton";
import ActionButton from "../Ui/ActionButton";

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
    }
    else{
        try {
            await navigator.clipboard.writeText(`https://${process.env.REACT_APP_VERCEL_PROJECT_PRODUCTION_URL}/posts/${id}`)
            showToast({message: "Скопировано!", type: "success" })
        } catch (err) {
            console.error(`Failed to copy: /posts/${id}`, err)
        }
    }
}

function format_date(date) {
    date = new Date(date);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}.${month}.${year}`;
}

const ArticleTopic = ({ article, onDeletePost }) => {
    const { profile, setProfile, showToast, showModalWindow, requestCloseModal } = useContext(AppContext)
    const [isSaved, setIsSaved] = useState(profile && profile.saved_posts && article && article._id && profile.saved_posts.includes(article._id))
    const [ isSavingProcess, setSavingProcess ] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        setIsSaved(profile && profile.saved_posts && article && article._id && profile.saved_posts.includes(article._id))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile])

    const save_post = async () => {
        setSavingProcess(true)
        const requestOptions = {
            method: profile?.saved_posts?.some( (post) => { return post.toString() === article._id } ) ? 'DELETE' : 'POST',
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
            }
            else {
                showToast({ message: "Чтобы сохранить пост, войдите в аккаунт!", type: "warning" })
            }
        } catch (error) {
            console.log(error)
        }
        finally{
            setSavingProcess(false)
        }
    };

    const get_delete_post_modal_content = (id) => {
        return (
            <div className="modal_delete_post_content">
                <div className="modal_delete_post_content_post">
                    <div className="modal_delete_post_content_post_topic">
                        <Author author_data={article.author} />
                        <Link className="modal_delete_post_content_post_topic_category" to={`/posts?filter=${article.category}`}>
                            <ChipButton>{article.category}</ChipButton>
                        </Link>
                        <p className="modal_delete_post_content_post_topic_date">{format_date(article.created_date)}</p>
                    </div>
                    <h2 className="modal_delete_post_content_post_title">{article.title}</h2>
                    {
                        article.featured_image ?
                            <img className="modal_delete_post_content_post_image" src={article.featured_image} alt="post_image" />                        
                        :
                            <></>
                    }
                </div>
                <div className="modal_delete_post_content_bottom">
                    <ActionButton onClick={requestCloseModal} className="modal_delete_post_content_button">Отмена</ActionButton>
                    <DangerButton onClick={async () => { await deletePost(id).then(() => onDeletePost(id)); requestCloseModal() }} className="modal_delete_post_content_button" is_active={true}>Удалить</DangerButton>
                </div>
            </div>
        )
    }

    const delete_post = async (id) => {
        showModalWindow({
            title: `Вы уверены что хотите удалить пост?`,
            content: get_delete_post_modal_content(id),
            show_close_button: false,
            close_func: () => { 

            }
        });
    }

    return (
        <div className="article_topic">

            <Author author_data={article.author} />
            <Link className="article_topic_category" to={`/posts?filter=${article.category}`}>
                <ChipButton >{article.category}</ChipButton>
            </Link>
            <div className="article_topic_right_side">

            <p className="article_topic_date">{format_date(article.created_date)}</p>
            <button type="button" className="article_topic_button article_topic_save" onClick={save_post} disabled={isSavingProcess}>
                {
                    (isSaved ? <BookMarkFilled /> : <BookMarkBorder />)
                }
            </button>
            {
                (() => {
                    const popupBody = []

                    popupBody.push({
                        title: "Поделиться",
                        onclick: () => { share(article._id, showToast) }
                    })

                    if (profile?.is_admin) {
                        popupBody.push({
                            title: "Редактировать",
                            onclick: () => { navigate(`/posts/${article._id}/edit`) }
                        })

                        popupBody.push({
                            title: "Удалить",
                            type: "danger",
                            onclick: () => { delete_post(article._id) }
                        })
                    }

                    return (
                        <Popup body={popupBody}>
                            <ThreeDotsIcon className="article_topic_three_dots app-transition"/>
                        </Popup>
                    )
                })()
            }
            </div>
        </div>
    )
}

export  { ArticleTopic }