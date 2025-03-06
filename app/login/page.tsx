"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card } from "antd";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

const Login = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const apiService = useApi();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);

    try {
      // 登录用户 - POST到/login端点
      const response = await apiService.post<User>("/login", values);

      if (response && response.id) {
        // 存储用户信息到localStorage
        localStorage.setItem("userId", response.id);
        if (response.token) {
          localStorage.setItem("token", response.token);
        }

        message.success("登录成功！");
        router.push("/users");
      } else {
        throw new Error("服务器响应无效");
      }
    } catch (error) {
      console.error("登录失败:", error);
      message.error("登录失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-container">
        <Card title="登录" style={{ width: 400, borderRadius: "10px" }}>
          <Form
              form={form}
              name="login"
              size="large"
              onFinish={handleLogin}
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
                name="password"
                label="密码"
                rules={[{ required: true, message: "请输入密码!" }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-button" block loading={loading}>
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            没有账号？{" "}
            <Link href="/register" style={{ color: "#75bd9d" }}>
              点击注册
            </Link>
          </div>
        </Card>
      </div>
  );
};

export default Login;