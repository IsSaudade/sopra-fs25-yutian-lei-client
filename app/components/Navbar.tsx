"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button, Menu, Layout } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined, HomeOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";

const { Header } = Layout;

const Navbar: React.FC = () => {
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

export default Navbar;