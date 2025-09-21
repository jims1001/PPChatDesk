import { forwardRef, useImperativeHandle } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type TiptapComposerHandle = {
    clear: () => void;
    focus: () => void;
    submit: () => void;   // 根据模式触发 onSend / onAddNote
};

type Props = {
    mode: "reply" | "note";
    placeholder?: string;
    onSend: (html: string) => void;
    onAddNote: (html: string) => void;
};

export const TiptapComposer = forwardRef<TiptapComposerHandle, Props>(
    ({ mode, placeholder, onSend, onAddNote }, ref) => {
        const editor = useEditor({
            extensions: [StarterKit],
            editorProps: {
                attributes: {
                    class: "tiptap",
                    // 用 data-placeholder 实现 placeholder（配合 CSS 更优雅，简化：直接设置 title）
                    title: placeholder || "",
                },
                handleKeyDown(_, event) {
                    // Cmd/Ctrl + Enter 提交（根据模式决定行为）
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                        event.preventDefault();
                        submit();
                        return true;
                    }
                    // Shift+Enter 换行（StarterKit 已支持，这里不拦截）
                    return false;
                },
            },
            content: "",
        });

        const submit = () => {
            const html = editor?.getHTML() ?? "";
            if (mode === "reply") onSend(html);
            else onAddNote(html);
        };

        useImperativeHandle(ref, () => ({
            clear: () => editor?.commands.clearContent(true),
            focus: () => editor?.commands.focus("end"),
            submit,
        }), [editor, mode]);

        return <EditorContent editor={editor} />;
    }
);
