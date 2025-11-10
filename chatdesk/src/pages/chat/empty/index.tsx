import React from "react";
import s from "./index.module.scss";

const EmptyConversation: React.FC = () => {
    return (
        <div className={s.wrap}>
            <div className={s.box}>
                <div className={s.icon}>
                    {/* 简单占位的圆形图标，你可以换成自己的 svg */}
                    <div className={s.bubble} />
                </div>
                <div className={s.title}>请从左侧侧栏选择一个对话</div>

                <div className={s.shortcuts}>
                    <div className={s.shortcutItem}>
                        <span className={s.kbd}>⌘</span>
                        <span className={s.kbd}>K</span>
                        <span className={s.label}>打开命令菜单</span>
                    </div>
                    <div className={s.shortcutItem}>
                        <span className={s.kbd}>⌘</span>
                        <span className={s.kbd}>/</span>
                        <span className={s.label}>查看键盘快捷键</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyConversation;