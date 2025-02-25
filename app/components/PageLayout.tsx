"use client";

import React, { ReactNode } from "react";
import { Layout, Spin } from "antd";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthContext";

const { Content, Footer } = Layout;

interface PageLayoutProps {
    children: ReactNode;
    requireAuth?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, requireAuth = false }) => {
    const { loading, user } = useAuth();

    // Show loading state while checking authentication
    if (requireAuth && loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <Content style={{ padding: "0 50px", marginTop: 64 }}>
                {children}
            </Content>
            <Footer style={{ textAlign: "center", background: "#001529", color: "white" }}>
                SoPra FS25 ©{new Date().getFullYear()} Created for Software Praktikum
            </Footer>
        </Layout>
    );
};

export default PageLayout;