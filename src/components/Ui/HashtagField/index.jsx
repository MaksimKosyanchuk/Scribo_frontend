import { useEffect, useMemo, useRef, useState } from "react";

import { searchHashtags } from "../../../api/search.api";
import {
    applyHashtagAtCursor,
    getActiveHashtag,
    highlightHashtagsHtml,
} from "../../../utils/hashtags";

import "../InputField/InputField.scss";
import "../Flyout/Flyout.scss";
import "./HashtagField.scss";

const HashtagField = ({
    value,
    onChange,
    onMouseDown,
    placeholder,
    length = 2000,
    className = "",
    multilineRows = 3,
}) => {
    const textareaRef = useRef(null);
    const mirrorRef = useRef(null);
    const itemsRef = useRef([]);
    const activeIndexRef = useRef(0);
    const requestId = useRef(0);
    const [items, setItems] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    itemsRef.current = items;
    activeIndexRef.current = activeIndex;

    const mirrorHtml = useMemo(
        () => highlightHashtagsHtml(value || "") + (value?.endsWith("\n") ? "<br>" : ""),
        [value],
    );

    const syncScroll = () => {
        if (mirrorRef.current && textareaRef.current) {
            mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
            mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const caretOffset = (field, text) => {
        const start = field?.selectionStart;
        if (typeof start === "number" && start > 0) {
            return start;
        }
        return String(text || "").length;
    };

    const refreshSuggest = () => {
        const field = textareaRef.current;
        const text = field?.value || value || "";
        const active = getActiveHashtag(text, caretOffset(field, text));
        if (!active) {
            setItems([]);
            return;
        }

        const id = ++requestId.current;
        const token = active.token;
        window.setTimeout(async () => {
            if (id !== requestId.current) {
                return;
            }
            const tags = await searchHashtags(token);
            if (id !== requestId.current) {
                return;
            }
            setActiveIndex(0);
            setItems(tags || []);
        }, 80);
    };

    const applyTag = (tag) => {
        const field = textareaRef.current;
        if (!field) {
            return;
        }
        const next = applyHashtagAtCursor(field.value, field.selectionStart, tag);
        onChange?.({ target: { value: next.text } });
        setItems([]);
        requestAnimationFrame(() => {
            field.focus();
            field.setSelectionRange(next.cursor, next.cursor);
        });
    };

    useEffect(() => {
        refreshSuggest();
    }, [value]);

    return (
        <div className="hashtag_field input_field_wrapper">
            <div
                ref={mirrorRef}
                className="hashtag_field_mirror input_field"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: mirrorHtml || "&nbsp;" }}
            />
            <textarea
                ref={textareaRef}
                className={`input_field hashtag_field_input app-transition ${className}`}
                value={value}
                rows={multilineRows}
                wrap="soft"
                maxLength={length}
                placeholder={placeholder}
                onMouseDown={onMouseDown}
                onScroll={syncScroll}
                onFocus={refreshSuggest}
                onSelect={refreshSuggest}
                onClick={refreshSuggest}
                onKeyUp={refreshSuggest}
                onChange={(event) => {
                    onChange?.(event);
                    syncScroll();
                }}
                onKeyDown={(event) => {
                    if (!items.length) {
                        return;
                    }
                    if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setActiveIndex((index) => (index + 1) % itemsRef.current.length);
                    } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setActiveIndex((index) =>
                            (index - 1 + itemsRef.current.length) % itemsRef.current.length,
                        );
                    } else if (event.key === "Enter" && itemsRef.current[activeIndexRef.current]) {
                        event.preventDefault();
                        applyTag(itemsRef.current[activeIndexRef.current]);
                    } else if (event.key === "Escape") {
                        event.preventDefault();
                        setItems([]);
                    }
                }}
                onBlur={() => {
                    window.setTimeout(() => setItems([]), 160);
                }}
            />
            {items.length ? (
                <div className="hashtag_field_suggest flyout float_section blurred">
                    {items.map((tag, index) => (
                        <button
                            key={tag}
                            type="button"
                            className={`flyout_item app-transition ${index === activeIndex ? "flyout_item_active" : ""}`}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => applyTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default HashtagField;
