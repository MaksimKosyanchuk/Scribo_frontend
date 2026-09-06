import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useNavigate } from "react-router-dom";

import { registerHashtagTransform } from "./HashtagNode";
import { hashtagSearchPath } from "../../../utils/hashtags";

const HashtagPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const navigate = useNavigate();

  useEffect(() => {
    return registerHashtagTransform(editor);
  }, [editor]);

  useEffect(() => {
    const onClick = (event) => {
      if (editor.isEditable()) {
        return;
      }
      const target = event.target.closest(".hashtag");
      if (!target) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      navigate(hashtagSearchPath(target.textContent));
    };

    return editor.registerRootListener((root, prevRoot) => {
      prevRoot?.removeEventListener("click", onClick);
      root?.addEventListener("click", onClick);
    });
  }, [editor, navigate]);

  return null;
};

export default HashtagPlugin;
