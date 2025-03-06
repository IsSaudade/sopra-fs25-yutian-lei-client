"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card, Alert } from "antd";
import { useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const apiService = useApi();
  const { set: setUserId } = useLocalStorage<string | null>("userId", null);
  const { set: setToken } = useLocalStorage<string | null>("token", null);

  const handleLogin = async (values: FormValues) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Sending login data:", values);

      // Login user - POST to /login endpoint
      const response = await apiService.post<User>("/login", values);
      console.log("Login response:", response);

      if (response && response.id) {
        message.success("Login successful!");

        // Store user data in localStorage - this is critical!
        console.log("Storing user ID:", response.id);
        setUserId(response.id);

        if (response.token) {
          console.log("Storing token:", response.token);
          setToken(response.token);
        } else {
          console.warn("No token received from login");
        }

        // Set current user ID for future API calls
        apiService.setCurrentUserId(response.id);

        // Intentional delay to ensure localStorage is updated
        setTimeout(() => {
          console.log("Navigating to users page...");
          router.push("/users");
        }, 300);
      } else {
        throw new Error("Invalid response from server - missing user ID");
      }
    } catch (error) {
      console.error("Login error details:", error);
      if (error instanceof Error) {
        setError(error.message);
        message.error(`Login failed: ${error.message}`);
      } else {
        setError("An unknown error occurred");
        message.error("Login failed due to an unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-container">
        <Card title="Login" style={{ width: 400, borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
          {error && (
              <Alert
                  message="Login Error"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginBottom: "16px" }}
              />
          )}

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