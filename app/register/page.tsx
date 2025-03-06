"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card } from "antd";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

const Register = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const apiService = useApi();

    const handleRegister = async (values: { username: string; name: string; password: string }) => {
        setLoading(true);

        try {
            // 注册用户 - POST到/users端点
            const response = await apiService.post<User>("/users", values);

            if (response && response.id) {
                // 存储用户信息到localStorage
                localStorage.setItem("userId", response.id);
                if (response.token) {
                    localStorage.setItem("token", response.token);
                }

                message.success("注册成功！");
                router.push("/users");
            } else {
                throw new Error("服务器响应无效");
            }
        } catch (error) {
            console.error("注册失败:", error);
            message.error("注册失败: " + (error instanceof Error ? error.message : "未知错误"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card title="注册" style={{ width: 400, borderRadius: "10px" }}>
                <Form
                    form={form}
                    name="register"
                    size="large"
                    onFinish={handleRegister}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: "请输入用户名!" }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="姓名"
                        rules={[{ required: true, message: "请输入姓名!" }]}
                    >
                        <Input placeholder="请输入姓名" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: "请输入密码!" }]}
                    >
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-button" block loading={loading}>
                            注册
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    已有账号？{" "}
                    <Link href="/login" style={{ color: "#75bd9d" }}>
                        点击登录
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Register;