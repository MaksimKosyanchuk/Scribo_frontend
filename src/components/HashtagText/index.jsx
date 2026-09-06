import { Fragment } from "react";
import { Link } from "react-router-dom";

import { hashtagSearchPath, splitHashtags } from "../../utils/hashtags";

const HashtagText = ({ text, className, id, as: Tag = "p" }) => {
    const parts = splitHashtags(text);

    return (
        <Tag className={className} id={id}>
            {parts.map((part, index) => {
                if (part.type === "tag") {
                    return (
                        <Link
                            key={`${part.value}-${index}`}
                            className="hashtag"
                            to={hashtagSearchPath(part.value)}
                        >
                            {part.value}
                        </Link>
                    );
                }

                return String(part.value)
                    .split("\n")
                    .map((line, lineIndex, lines) => (
                        <Fragment key={`${index}-${lineIndex}`}>
                            {line}
                            {lineIndex < lines.length - 1 ? <br /> : null}
                        </Fragment>
                    ));
            })}
        </Tag>
    );
};

export default HashtagText;
