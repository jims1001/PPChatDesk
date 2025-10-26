import { useCallback, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./index.module.scss";

interface Props {
    onSend: (html: string, plainText: string) => void;
    onPickFile?: (file: File) => void;
}

export default function Composer({ onSend, onPickFile }: Props) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
        editorProps: {
            attributes: { class: styles.editor },
            handleKeyDown(view, event) {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    const html = view.dom.innerHTML;
                    const plain = view.state.doc.textBetween(0, view.state.doc.content.size, "\n");
                    onSend(html, plain);
                    view.dispatch(view.state.tr.delete(0, view.state.doc.content.size));
                    return true;
                }
                return false;
            },
        },
    });

    const fileRef = useRef<HTMLInputElement>(null);
    const sendClick = useCallback(() => {
        if (!editor) return;
        const html = editor.getHTML();
        const plain = editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n");
        onSend(html, plain);
        editor.commands.clearContent(true);
    }, [editor, onSend]);

    return (
        <div className={styles.wrap}>
            <div className={styles.toolbar}>
                <button className={styles.tbtn} onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
                <button className={styles.tbtn} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
                <button className={styles.tbtn} onClick={() => editor?.chain().focus().toggleBulletList().run()}>•</button>
                <button className={styles.tbtn} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>{'</>'}</button>
                <div className={styles.sep} />
                <button className={styles.tbtn} onClick={() => fileRef.current?.click()}>📎</button>
                <input ref={fileRef} type="file" hidden
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && onPickFile) onPickFile(f);
                        if (fileRef.current) fileRef.current.value = "";
                    }} />
            </div>

            <div className={styles.editorBox}><EditorContent editor={editor} /></div>

            <div className={styles.action}>
                <button className={styles.send} onClick={sendClick}>发送（按 ⏎）</button>
            </div>
        </div>
    );
}