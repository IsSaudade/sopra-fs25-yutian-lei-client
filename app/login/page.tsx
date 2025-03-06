"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card, Spin } from "antd";
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const apiService = useApi();
  const { value: userId, set: setUserId } = useLocalStorage<string | null>("userId", null);
  const { set: setToken } = useLocalStorage<string | null>("token", null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        if (userId) {
          console.log("User already logged in, redirecting to users page");
          await router.push("/users");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [userId, router]);

  const handleLogin = async (values: FormValues) => {
    setLoading(true);

    try {
      console.log("Sending login data:", values);

      // Login user - POST to /login endpoint
      const response = await apiService.post<User>("/login", values);
      console.log("Login response:", response);

      if (response && response.id) {
        message.success("Login successful!");

        // Important: Set these values and wait for them to be stored
        await Promise.all([
          new Promise<void>(resolve => {
            setUserId(response.id);
            resolve();
          }),
          new Promise<void>(resolve => {
            if (response.token) {
              setToken(response.token);
            }
            resolve();
          })
        ]);

        // Set current user ID for future API calls
        apiService.setCurrentUserId(response.id);

        // Add a small delay to ensure localStorage is updated
        setTimeout(() => {
          console.log("Redirecting to users page with userId:", response.id);
          router.push("/users");
        }, 500);
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

  if (checkingAuth) {
    return (
        <div className="login-container">
          <Spin size="large" tip="Checking authentication..." />
        </div>
    );
  }

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