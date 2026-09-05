import { Link } from "react-router-dom";

import { statusLabel } from "../../pages/Support/constants";

const NotificationMessage = ({ item }) => {
    switch (item.type) {
        case "follow":
            return "Подписался(-ась) на ваши обновления";
        case "unfollow":
            return "Отписался(-ась) от вас";
        case "like_post":
            return (
                <>
                    Поставил лайк на ваш{" "}
                    <Link className="modal_window_body_content_notification_message_post_link" to={`/posts/${item.post}`}>
                        пост
                    </Link>
                </>
            );
        case "comment_post":
            return (
                <>
                    Прокомментировал(-а) ваш{" "}
                    <Link className="modal_window_body_content_notification_message_post_link" to={`/posts/${item.post}`}>
                        пост
                    </Link>
                </>
            );
        case "reply_comment":
            return (
                <>
                    Ответил(-а) на{" "}
                    <Link
                        className="modal_window_body_content_notification_message_post_link"
                        to={`/posts/${item.post}`}
                        state={{ comment: item.comment, time: Date.now() }}
                    >
                        ваш комментарий
                    </Link>
                </>
            );
        case "support_reply":
            return (
                <>
                    Новый ответ по вашему{" "}
                    <Link className="modal_window_body_content_notification_message_post_link" to={`/support/${item.support_request}`}>
                        запросу
                    </Link>
                </>
            );
        case "support_status":
            return (
                <>
                    Статус вашего{" "}
                    <Link className="modal_window_body_content_notification_message_post_link" to={`/support/${item.support_request}`}>
                        запроса
                    </Link>
                    : {statusLabel(item.support_status)}
                </>
            );
        default:
            return "";
    }
};

export default NotificationMessage;
