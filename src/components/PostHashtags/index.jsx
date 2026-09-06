import { Link } from "react-router-dom";

import { extractHashtagsFromPost, hashtagSearchPath } from "../../utils/hashtags";

import "./PostHashtags.scss";

const PostHashtags = ({ post, className = "" }) => {
    const tags = extractHashtagsFromPost(post);
    if (!tags.length) {
        return null;
    }

    return (
        <ul className={`post_hashtags ${className}`.trim()}>
            {tags.map((tag) => (
                <li key={tag.toLowerCase()}>
                    <Link className="hashtag post_hashtags_item" to={hashtagSearchPath(tag)}>
                        {tag}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default PostHashtags;
