import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import s from "./index.module.scss";

import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import { menuBar, MenuItem, icons } from "prosemirror-menu";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { wrapInList } from "prosemirror-schema-list";

export type Attachment = { file: File; url: string };

export interface ReplyBoxProps {
    defaultPrivate?: boolean;
    onSend?: (payload: {
        text: string;
        html: string;
        isPrivate: boolean;
        attachments: Attachment[];
    }) => void;
    sendText?: string;
    disabled?: boolean;
    minRows?: number;
    placeholder?: string;
}

/** HTML -> 纯文本（保留换行） */
const htmlToPlainText = (html: string) => {
    const holder = document.createElement("div");
    holder.innerHTML = html;
    holder.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    return holder.innerText.replace(/\u00A0/g, " ").trim();
};

/** 占位提示插件：空文档时显示 data-placeholder（样式交给 CSS） */
function placeholderPlugin(placeholder: string) {
    return new Plugin({
        props: {
            attributes: () => ({ "data-placeholder": placeholder }),
        },
    });
}

export default function ReplyBox({
    defaultPrivate = false,
    onSend,
    sendText = "发送 (⌘ + ↵)",
    disabled = false,
    minRows = 4,
    placeholder = "输入消息…",
}: ReplyBoxProps) {
    const [isPrivate, setIsPrivate] = useState(defaultPrivate);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    // —— 动态滑块测量 —— //
    const chipBtnRef = useRef<HTMLButtonElement>(null);
    const replyRef = useRef<HTMLDivElement>(null);
    const noteRef = useRef<HTMLDivElement>(null);
    const [chipVars, setChipVars] = useState({ w: 0, x: 0 });

    const calcChip = useCallback(() => {
        const activeEl = isPrivate ? noteRef.current : replyRef.current;
        const btn = chipBtnRef.current;
        if (!activeEl || !btn) return;

        // 用 offset 系列，相对于父容器 padding 边框对齐，避免 1~4px 视觉偏差
        const x = activeEl.offsetLeft;
        const w = activeEl.offsetWidth;
        setChipVars({ w, x });
    }, [isPrivate]);

    useEffect(() => {
        calcChip();
        const ro = new ResizeObserver(() => calcChip());
        if (chipBtnRef.current) ro.observe(chipBtnRef.current);
        if (replyRef.current) ro.observe(replyRef.current);
        if (noteRef.current) ro.observe(noteRef.current);
        window.addEventListener("resize", calcChip);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", calcChip);
        };
    }, [calcChip]);

    // —— ProseMirror —— //
    const wrapperRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /** 从编辑器读取 HTML */
    const getHtml = useCallback(() => {
        const view = viewRef.current;
        if (!view) return "";
        return (view.dom as HTMLElement).innerHTML.trim();
    }, []);

    /** 发送 */
    const doSend = useCallback(() => {
        const html = getHtml();
        const text = htmlToPlainText(html);
        if (!text && attachments.length === 0) return;

        onSend?.({ text, html, isPrivate, attachments });

        // 清空文档
        const view = viewRef.current;
        if (view) {
            const { state } = view;
            const tr = state.tr.delete(0, state.doc.content.size);
            view.dispatch(tr);
            view.focus();
        }
        // 清空附件
        setAttachments((prev) => {
            prev.forEach((a) => URL.revokeObjectURL(a.url));
            return [];
        });
    }, [getHtml, attachments, isPrivate, onSend]);

    // 初始化编辑器（注意：不要把 doSend 放依赖里以免重复初始化）
    useEffect(() => {
        if (!wrapperRef.current) return;

        const schema: Schema = basicSchema;

        // Cmd/Ctrl + Enter 发送
        const sendCommand = () => {
            doSend();
            return true;
        };
        const sendKeymap: Record<string, any> = {
            "Mod-Enter": sendCommand,
            "Ctrl-Enter": sendCommand,
        };

        // —— 自定义一排图标（与截图顺序一致） —— //
        const boldItem = new MenuItem({
            title: "Toggle strong style",
            run: toggleMark(schema.marks.strong),
            enable: (st) => !!schema.marks.strong && toggleMark(schema.marks.strong)(st),
            icon: icons.strong,
        });

        const italicItem = new MenuItem({
            title: "Toggle emphasis",
            run: toggleMark(schema.marks.em),
            enable: (st) => !!schema.marks.em && toggleMark(schema.marks.em)(st),
            icon: icons.em,
        });

        // 链接：保持显示但禁用（basicSchema 无 link）
        const linkItem = new MenuItem({
            title: "Add or remove link",
            run: () => false,
            enable: () => false,
            select: () => true,
            icon: icons.link,
        });

        const undoItem = new MenuItem({
            title: "Undo last change",
            run: undo,
            enable: (st) => undo(st) as unknown as boolean,
            icon: icons.undo,
        });

        const redoItem = new MenuItem({
            title: "Redo last undone change",
            run: redo,
            enable: (st) => redo(st) as unknown as boolean,
            icon: icons.redo,
        });

        // 注意：basicSchema 没有列表节点，这里运行时需要保护性调用
        const bulletListItem = new MenuItem({
            title: "Wrap in bullet list",
            run: (st, d, v) =>
                schema.nodes.bullet_list ? wrapInList(schema.nodes.bullet_list)(st, d, v) : false,
            enable: (st) =>
                !!schema.nodes.bullet_list && !!wrapInList(schema.nodes.bullet_list)(st),
            icon: icons.bulletList,
        });

        const orderedListItem = new MenuItem({
            title: "Wrap in ordered list",
            run: (st, d, v) =>
                schema.nodes.ordered_list ? wrapInList(schema.nodes.ordered_list)(st, d, v) : false,
            enable: (st) =>
                !!schema.nodes.ordered_list && !!wrapInList(schema.nodes.ordered_list)(st),
            icon: icons.orderedList,
        });

        const codeItem = new MenuItem({
            title: "Toggle code font",
            run: toggleMark(schema.marks.code),
            enable: (st) => !!schema.marks.code && toggleMark(schema.marks.code)(st),
            icon: icons.code,
        });

        const simpleBar = [
            boldItem,
            italicItem,
            linkItem,
            undoItem,
            redoItem,
            bulletListItem,
            orderedListItem,
            codeItem,
        ];

        const state = EditorState.create({
            schema,
            plugins: [
                history(),
                keymap(baseKeymap),
                keymap(sendKeymap),
                dropCursor(),
                gapCursor(),
                menuBar({
                    content: [simpleBar], // 一排菜单
                    floating: true,       // 生成 .ProseMirror-menubar-wrapper
                }),
                placeholderPlugin(placeholder),
            ],
        });

        const view = new EditorView(wrapperRef.current, {
            state,
            attributes: {
                class: `ProseMirror-woot-style`,
                style: `--min-rows:${minRows};`,
            },
        });
        viewRef.current = view;

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
            setAttachments((prev) => {
                prev.forEach((a) => URL.revokeObjectURL(a.url));
                return [];
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeholder, minRows]);

    /** 是否可发送 */
    const canSend = useMemo(() => {
        if (disabled) return false;
        const html = getHtml();
        const text = htmlToPlainText(html);
        return (text && text.length > 0) || attachments.length > 0;
    }, [disabled, attachments.length, getHtml]);

    const openFile = () => fileInputRef.current?.click();
    const onFilesSelected = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const list: Attachment[] = [];
        Array.from(files).forEach((file) => list.push({ file, url: URL.createObjectURL(file) }));
        setAttachments((prev) => prev.concat(list));
    };
    const removeAttachment = (idx: number) => {
        setAttachments((prev) => {
            const next = prev.slice();
            const [removed] = next.splice(idx, 1);
            if (removed) URL.revokeObjectURL(removed.url);
            return next;
        });
    };

    return (
        <div className={s.replyBoxWrapper} data-disabled={disabled ? "true" : "false"}>
            {/* 顶部：回复/私人便笺 + 最大化（占位） */}
            <div className={s.topRow}>
                <button
                    ref={chipBtnRef}
                    type="button"
                    className={s.toggleChip}
                    style={
                        {
                            ["--chip-width" as any]: `${chipVars.w}px`,
                            ["--translate-x" as any]: `${chipVars.x}px`,
                        } as React.CSSProperties
                    }
                    onClick={() => setIsPrivate((v) => !v)}
                    disabled={disabled}
                    aria-label="切换回复/私人便笺"
                >
                    <div ref={replyRef} className={s.toggleChipItem}>回复</div>
                    <div ref={noteRef} className={s.toggleChipItem}>私人便笺</div>
                    <div className={s.toggleKnob} aria-hidden />
                </button>

                <div className={s.actionsLeft} />

                <button type="button" className={s.iconBtn} title="最大化（占位）" disabled={disabled}>
                    <span className={s.iconBox}>⤢</span>
                </button>
            </div>

            {/* 编辑器（menubar-wrapper + menubar + contentEditable 会注入这里） */}
            <div className={s.editorCard}>
                <div className={s.pmWrapper} ref={wrapperRef} />
                {/* 附件预览 */}
                {attachments.length > 0 && (
                    <div className={s.attachPreview}>
                        {attachments.map((att, i) => {
                            const isImage = att.file.type.startsWith("image/");
                            return (
                                <div key={i} className={s.attachItem}>
                                    {isImage ? (
                                        <img src={att.url} className={s.thumb} alt={att.file.name} />
                                    ) : (
                                        <div className={s.fileBadge}>{att.file.name}</div>
                                    )}
                                    <button
                                        className={s.removeAttachBtn}
                                        onClick={() => removeAttachment(i)}
                                        title="移除附件"
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 底部操作区 */}
            <div className={s.bottomRow}>
                <div className={s.leftWrap}>
                    <button type="button" className={s.circleBtn} title="表情（示意）" disabled={disabled}>🙂</button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,audio/*,video/*,text/csv,text/plain,text/rtf,text/xml,application/json,application/pdf,application/xml,application/zip,application/x-7z-compressed,application/vnd.rar,application/x-tar,application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/vnd.oasis.opendocument.text,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.3gpp"
                        hidden
                        onChange={(e) => onFilesSelected(e.target.files)}
                    />
                    <button type="button" className={s.circleBtn} title="添加附件" onClick={openFile} disabled={disabled}>📎</button>
                    <button type="button" className={s.circleBtn} title="语音（示意）" disabled={disabled}>🎙</button>
                    <button type="button" className={s.circleBtn} title="签名（示意）" disabled={disabled}>✒️</button>
                </div>

                <div className={s.rightWrap}>
                    <button type="button" className={s.sendBtn} disabled={!canSend} onClick={doSend} title="⌘/Ctrl + Enter 发送">
                        {sendText}
                    </button>
                </div>
            </div>
        </div>
    );
}
