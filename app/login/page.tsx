"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card } from "antd";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { login, user, loading } = useAuth();

  // If user is already logged in, redirect to users page
  useEffect(() => {
    if (user && !loading) {
      router.push("/users");
    }
  }, [user, loading, router]);

  const handleLogin = async (values: FormFieldProps) => {
    try {
      await login(values.username, values.password);
      message.success("Login successful!");
      // Navigation is handled in the auth context
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Login failed: ${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
        message.error("Login failed due to an unknown error.");
      }
    }
  };

  return (
      <PageLayout>
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
      </PageLayout>
  );
};

export default Login;