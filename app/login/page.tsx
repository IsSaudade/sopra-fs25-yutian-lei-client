"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");

  const handleLogin = async (values: FormFieldProps) => {
    try {
      // Call the API service to login
      const response = await apiService.post<User>("/login", values);

      // Store the token
      if (response.token) {
        setToken(response.token);
        message.success("Login successful!");
      }

      // Navigate to the user overview
      router.push("/users");
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
      <div className="login-container">
        <div style={{ maxWidth: "400px", width: "100%", padding: "20px" }}>
          <h1 style={{ color: "white", textAlign: "center", marginBottom: "24px" }}>Login</h1>

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
              <Button type="primary" htmlType="submit" className="login-button">
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: "20px", color: "white" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#75bd9d" }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Login;