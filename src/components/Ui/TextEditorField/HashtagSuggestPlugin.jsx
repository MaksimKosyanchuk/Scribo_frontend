import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
} from "lexical";

import Flyout from "../Flyout";
import { searchHashtags } from "../../../api/search.api";
import { $isHashtagNode } from "./HashtagNode";

function readActiveHashtag() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const node = selection.anchor.getNode();
  if (!$isTextNode(node)) {
    return null;
  }

  const offset = selection.anchor.offset;
  const text = node.getTextContent();
  const before = text.slice(0, offset);
  const at = $isHashtagNode(node) ? 0 : before.lastIndexOf("#");
  if (at < 0) {
    return null;
  }

  const token = before.slice(at);
  if (!token.startsWith("#") || /\s/.test(token) || token.length < 2) {
    return null;
  }

  return { token, node, at, offset };
}

function caretAnchor() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0).cloneRange();
  range.collapse(true);
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0)) {
    return null;
  }
  return {
    getBoundingClientRect: () => rect,
    contextElement: selection.anchorNode?.parentElement || undefined,
  };
}

const HashtagSuggestPlugin = ({ enabled }) => {
  const [editor] = useLexicalComposerContext();
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [anchor, setAnchor] = useState(null);
  const tokenRef = useRef("");
  const itemsRef = useRef([]);
  const activeIndexRef = useRef(0);
  const requestId = useRef(0);

  itemsRef.current = items;
  activeIndexRef.current = activeIndex;

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setAnchor(null);
      return;
    }

    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        const active = readActiveHashtag();
        const nextAnchor = active ? caretAnchor() : null;
        tokenRef.current = active?.token || "";
        setAnchor(nextAnchor);

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
        }, 120);
      });
    });
  }, [editor, enabled]);

  const applyTag = useCallback((tag) => {
    editor.update(() => {
      const active = readActiveHashtag();
      if (!active) {
        return;
      }
      const { node, at, offset } = active;
      const text = node.getTextContent();
      const next = `${text.slice(0, at)}${tag} ${text.slice(offset)}`;
      if ($isHashtagNode(node) && at === 0 && offset === text.length) {
        node.setTextContent(tag);
        const space = $createTextNode(" ");
        node.insertAfter(space);
        space.selectEnd();
      } else {
        node.setTextContent(next);
        const cursor = at + tag.length + 1;
        node.select(cursor, cursor);
      }
    });
    setItems([]);
    setAnchor(null);
  }, [editor]);

  useEffect(() => {
    if (!enabled || items.length === 0) {
      return;
    }

    const intercept = (event, handler) => {
      event.preventDefault();
      handler();
      return true;
    };

    const removeDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) =>
        intercept(event, () => {
          setActiveIndex((index) => (index + 1) % itemsRef.current.length);
        }),
      COMMAND_PRIORITY_LOW,
    );
    const removeUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) =>
        intercept(event, () => {
          setActiveIndex((index) =>
            (index - 1 + itemsRef.current.length) % itemsRef.current.length,
          );
        }),
      COMMAND_PRIORITY_LOW,
    );
    const removeEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const tag = itemsRef.current[activeIndexRef.current];
        if (!tag) {
          return false;
        }
        return intercept(event, () => applyTag(tag));
      },
      COMMAND_PRIORITY_LOW,
    );
    const removeEscape = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event) =>
        intercept(event, () => {
          setItems([]);
          setAnchor(null);
        }),
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeDown();
      removeUp();
      removeEnter();
      removeEscape();
    };
  }, [applyTag, editor, enabled, items.length]);

  if (!enabled || !anchor || items.length === 0) {
    return null;
  }

  return (
    <Flyout
      open
      placement="top-start"
      virtualAnchor={anchor}
      content={
        <>
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
        </>
      }
    />
  );
};

export default HashtagSuggestPlugin;
