import React from "react";
import styles from "./index.module.scss";

interface TabPaneProps {
    activeKey: string;
    tabKey: string;
    children: React.ReactNode;
}

const TabPane: React.FC<TabPaneProps> = ({ activeKey, tabKey, children }) => {
    if (activeKey !== tabKey) return null;
    return <div className={styles.tabPane}>{children}</div>;
};

export default TabPane;
