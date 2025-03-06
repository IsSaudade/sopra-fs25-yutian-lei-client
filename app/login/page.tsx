"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card } from "antd";
import { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

interface FormValues {
  username: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const apiService = useApi();
  const { value: userId, set: setUserId } = useLocalStorage<string | null>("userId", null);
  const { set: setToken } = useLocalStorage<string | null>("token", null);

  // Check if user is already logged in
  useEffect(() => {
    if (userId) {
      router.push("/users");
    }
  }, [userId, router]);

  const handleLogin = async (values: FormValues) => {
    setLoading(true);

    try {
      // Login user - POST to /login endpoint
      const response = await apiService.post<User>("/login", values);

      if (response && response.id) {
        message.success("Login successful!");

        // Save user data to localStorage
        setUserId(response.id);
        if (response.token) {
          setToken(response.token);
        }

        // Set current user ID for future API calls
        apiService.setCurrentUserId(response.id);

        // Redirect to users list page
        router.push("/users");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Login failed: ${error.message}`);
      } else {
        message.error("Login failed due to an unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-container">
        <Card title="Login" style={{ width: 400, borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
          <Form
              form={form}
              name="login"
              size="large"
              variant="outlined"
              onFinish={handleLogin}
              layout="vertical"
          >
            <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input placeholder="Enter username" />
            </Form.Item>

            <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-button" block loading={loading}>
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#75bd9d" }}>
              Register here
            </Link>
          </div>
        </Card>
      </div>
  );
};

export default Login;