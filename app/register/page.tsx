"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card, Alert } from "antd";
import { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

interface FormValues {
    username: string;
    password: string;
}

const Register = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiService = useApi();
    const { value: userId, set: setUserId } = useLocalStorage<string | null>("userId", null);
    const { set: setToken } = useLocalStorage<string | null>("token", null);

    // Check if user is already logged in
    useEffect(() => {
        if (userId) {
            router.push("/users");
        }
    }, [userId, router]);

    const handleRegister = async (values: FormValues) => {
        setLoading(true);
        setError(null);

        try {
            // Register user - POST to /users endpoint
            const response = await apiService.post<User>("/users", values);

            if (response && response.id) {
                message.success("Registration successful!");

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