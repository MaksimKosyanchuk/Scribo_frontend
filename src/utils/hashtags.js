export const HASHTAG_PATTERN = /#[^\s#]+/g;

const SKIP_TAGS = new Set(["A", "SCRIPT", "STYLE", "TEXTAREA", "CODE"]);

function stripMarkup(html) {
    return String(html || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-zA-Z0-9#]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function hashtagSearchPath(tag) {
    const value = String(tag || "").trim();
    if (!value) {
        return "/search";
    }
    const query = value.startsWith("#") ? value : `#${value}`;
    return `/search?q=${encodeURIComponent(query)}`;
}

export function extractHashtags(text) {
    HASHTAG_PATTERN.lastIndex = 0;
    const matches = String(text || "").match(HASHTAG_PATTERN) || [];
    const seen = new Set();
    const tags = [];
    for (const tag of matches) {
        const key = tag.toLowerCase();
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        tags.push(tag);
    }
    return tags;
}

export function extractHashtagsFromPost(post) {
    if (!post) {
        return [];
    }
    return extractHashtags(`${post.title || ""} ${stripMarkup(post.content_text || "")}`);
}

export function splitHashtags(text) {
    const src = String(text || "");
    const parts = [];
    HASHTAG_PATTERN.lastIndex = 0;
    let lastIndex = 0;
    let match = HASHTAG_PATTERN.exec(src);
    while (match) {
        if (match.index > lastIndex) {
            parts.push({ type: "text", value: src.slice(lastIndex, match.index) });
        }
        parts.push({ type: "tag", value: match[0] });
        lastIndex = match.index + match[0].length;
        match = HASHTAG_PATTERN.exec(src);
    }
    if (lastIndex < src.length) {
        parts.push({ type: "text", value: src.slice(lastIndex) });
    }
    return parts;
}

export function highlightHashtagsHtml(text) {
    return splitHashtags(text)
        .map((part) =>
            part.type === "tag"
                ? `<span class="hashtag">${escapeHtml(part.value)}</span>`
                : escapeHtml(part.value),
        )
        .join("")
        .replace(/\n/g, "<br>");
}

export function getActiveHashtag(text, offset) {
    const before = String(text || "").slice(0, offset);
    const at = before.lastIndexOf("#");
    if (at < 0) {
        return null;
    }
    const token = before.slice(at);
    if (!token.startsWith("#") || /\s/.test(token) || token.length < 2) {
        return null;
    }
    return { token, at, offset };
}

export function applyHashtagAtCursor(text, offset, tag) {
    const active = getActiveHashtag(text, offset);
    if (!active) {
        return { text, cursor: offset };
    }
    const next = `${text.slice(0, active.at)}${tag} ${text.slice(offset)}`;
    return { text: next, cursor: active.at + tag.length + 1 };
}

export function textareaCaretAnchor(textarea) {
    if (!textarea || typeof window === "undefined") {
        return null;
    }
    const position = textarea.selectionStart ?? 0;
    const clone = document.createElement("div");
    const style = window.getComputedStyle(textarea);
    for (const prop of style) {
        clone.style.setProperty(prop, style.getPropertyValue(prop));
    }
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.visibility = "hidden";
    clone.style.pointerEvents = "none";
    clone.style.height = "auto";
    clone.style.width = `${textarea.clientWidth}px`;
    clone.style.whiteSpace = "pre-wrap";
    clone.style.overflow = "hidden";
    clone.textContent = textarea.value.slice(0, position);
    const marker = document.createElement("span");
    marker.textContent = "|";
    clone.appendChild(marker);
    document.body.appendChild(clone);
    const markerRect = marker.getBoundingClientRect();
    const cloneRect = clone.getBoundingClientRect();
    document.body.removeChild(clone);
    const fieldRect = textarea.getBoundingClientRect();
    const top = fieldRect.top + (markerRect.top - cloneRect.top) - textarea.scrollTop;
    const left = fieldRect.left + (markerRect.left - cloneRect.left) - textarea.scrollLeft;
    const height = markerRect.height || 16;
    return {
        getBoundingClientRect: () => ({
            x: left,
            y: top,
            top,
            left,
            bottom: top + height,
            right: left + 1,
            width: 1,
            height,
            toJSON() {},
        }),
        contextElement: textarea,
    };
}

export function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function linkifyHashtagsInHtml(html) {
    if (!html) {
        return "";
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("span.hashtag").forEach((node) => {
        const tag = node.textContent || "";
        if (!tag.startsWith("#")) {
            return;
        }
        const link = doc.createElement("a");
        link.className = "hashtag";
        link.href = hashtagSearchPath(tag);
        link.textContent = tag;
        node.replaceWith(link);
    });

    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    for (const node of nodes) {
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName) || parent.closest("a")) {
            continue;
        }

        const text = node.nodeValue || "";
        HASHTAG_PATTERN.lastIndex = 0;
        if (!HASHTAG_PATTERN.test(text)) {
            continue;
        }

        HASHTAG_PATTERN.lastIndex = 0;
        const fragment = doc.createDocumentFragment();
        let lastIndex = 0;
        let match = HASHTAG_PATTERN.exec(text);
        while (match) {
            if (match.index > lastIndex) {
                fragment.appendChild(doc.createTextNode(text.slice(lastIndex, match.index)));
            }
            const link = doc.createElement("a");
            link.className = "hashtag";
            link.href = hashtagSearchPath(match[0]);
            link.textContent = match[0];
            fragment.appendChild(link);
            lastIndex = match.index + match[0].length;
            match = HASHTAG_PATTERN.exec(text);
        }
        if (lastIndex < text.length) {
            fragment.appendChild(doc.createTextNode(text.slice(lastIndex)));
        }
        parent.replaceChild(fragment, node);
    }

    return doc.body.innerHTML;
}
