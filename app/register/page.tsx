"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card, Alert, Spin } from "antd";
import { useState, useEffect } from "react";
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

    if (checkingAuth) {
        return (
            <div className="login-container">
                <Spin size="large" tip="Checking authentication..." />
            </div>
        );
    }

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