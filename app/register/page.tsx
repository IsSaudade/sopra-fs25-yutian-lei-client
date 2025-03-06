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
    name: string;
    password: string;
}

const Register = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiService = useApi();
    const { set: setUserId } = useLocalStorage<string | null>("userId", null);
    const { set: setToken } = useLocalStorage<string | null>("token", null);

    const handleRegister = async (values: FormValues) => {
        setLoading(true);
        setError(null);

        try {
            console.log("Sending registration data:", values);

            // Register user - POST to /users endpoint
            const response = await apiService.post<User>("/users", values);
            console.log("Registration response:", response);

            if (response && response.id) {
                message.success("Registration successful!");

                // Store user data in localStorage - this is critical!
                console.log("Storing user ID:", response.id);
                setUserId(response.id);

                if (response.token) {
                    console.log("Storing token:", response.token);
                    setToken(response.token);
                } else {
                    console.warn("No token received from registration");
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
            console.error("Registration error details:", error);
            if (error instanceof Error) {
                setError(error.message);
                message.error(`Registration failed: ${error.message}`);
            } else {
                setError("An unknown error occurred");
                message.error("Registration failed due to an unknown error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card title="Register" style={{ width: 400, borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                {error && (
                    <Alert
                        message="Registration Error"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: "16px" }}
                    />
                )}

                <Form
                    form={form}
                    name="register"
                    size="large"
                    variant="outlined"
                    onFinish={handleRegister}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            { required: true, message: "Please input your username!" },
                            { min: 1, message: "Username cannot be empty" }
                        ]}
                    >
                        <Input placeholder="Enter username" />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                            { required: true, message: "Please input your name!" }
                        ]}
                    >
                        <Input placeholder="Enter your name" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: "Please input your password!" },
                            { min: 1, message: "Password cannot be empty" }
                        ]}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-button" block loading={loading}>
                            Register
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "#75bd9d" }}>
                        Login here
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Register;