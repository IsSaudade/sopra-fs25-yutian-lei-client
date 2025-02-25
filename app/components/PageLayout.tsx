"use client";

import React, { ReactNode } from "react";
import { Layout, Spin, Button, Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { UserOutlined, LoginOutlined, LogoutOutlined, HomeOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";

const { Content, Footer, Header } = Layout;

interface PageLayoutProps {
    children: ReactNode;
    requireAuth?: boolean;
}

// Inline Navbar component to avoid import issues
const PageNavbar = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <Header style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: "#001529"
        }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <Link href="/" style={{ margin: 0, color: "white", fontSize: "18px", marginRight: "20px" }}>
                    SoPra FS25
                </Link>

                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[pathname || "/"]}
                    style={{ flex: 1, minWidth: "200px", background: "transparent", border: "none" }}
                >
                    <Menu.Item key="/" icon={<HomeOutlined />}>
                        <Link href="/">Home</Link>
                    </Menu.Item>
                    <Menu.Item key="/users" icon={<UsergroupAddOutlined />}>
                        <Link href="/users">Users</Link>
                    </Menu.Item>
                    {user && (
                        <Menu.Item key={`/users/${user.id}`} icon={<UserOutlined />}>
                            <Link href={`/users/${user.id}`}>My Profile</Link>
                        </Menu.Item>
                    )}
                </Menu>
            </div>

            <div>
                {user ? (
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        type="text"
                        style={{ color: "white" }}
                    >
                        Logout
                    </Button>
                ) : (
                    <Button
                        icon={<LoginOutlined />}
                        onClick={() => router.push("/login")}
                        type="text"
                        style={{ color: "white" }}
                    >
                        Login
                    </Button>
                )}
            </div>
        </Header>
    );
};

const PageLayout: React.FC<PageLayoutProps> = ({ children, requireAuth = false }) => {
    const { loading } = useAuth();

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
            <PageNavbar />
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