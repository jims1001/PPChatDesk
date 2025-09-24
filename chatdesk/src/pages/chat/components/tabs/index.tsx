import React, { useState } from "react";
import styles from "./index.module.scss";

export interface TabItem {
    key: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: TabItem[];
    defaultActiveKey?: string;
    onChange?: (key: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultActiveKey, onChange }) => {
    const [activeKey, setActiveKey] = useState(defaultActiveKey || tabs[0].key);

    const handleClick = (key: string) => {
        setActiveKey(key);
        onChange?.(key);
    };

    return (
        <div className={styles.tabs}>
            {tabs.map((tab) => {
                const active = activeKey === tab.key;
                return (
                    <button
                        key={tab.key}
                        className={`${styles.tab} ${active ? styles.active : ""}`}
                        onClick={() => handleClick(tab.key)}
                    >
                        <span>{tab.label}</span>
                        {typeof tab.count === "number" && (
                            <span className={styles.count}>{tab.count}</span>
                        )}
                        {active && <span className={styles.underline} />}
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;
