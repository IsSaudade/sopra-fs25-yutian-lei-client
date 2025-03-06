"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, message, Card, Alert } from "antd";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";

interface FormFieldProps {
    username: string;
    name: string;
    password: string;
    birthday?: Date;
}

const Register: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const { register, user, loading } = useAuth();
    const [error, setError] = useState<string | null>(null);

    // If user is already logged in, redirect to users page
    useEffect(() => {
        if (user && !loading) {
            router.push("/users");
        }
    }, [user, loading, router]);

    const handleRegister = async (values: FormFieldProps) => {
        try {
            setError(null); // Clear any previous errors
            await register(values);
            message.success("Registration successful!");
            // Navigation is handled in the auth context
        } catch (error) {
            if (error instanceof Error) {
                // Display error message
                const errorMsg = error.message;
                message.error(`Registration failed: ${errorMsg}`);

                // Completely redirect to a new register page
                // Adding a timestamp to force a fresh page load
                router.push(`/register?refresh=${Date.now()}`);
            } else {
                console.error("An unknown error occurred during registration.");
                message.error("Registration failed due to an unknown error.");

                // Redirect to a new register page
                router.push(`/register?refresh=${Date.now()}`);
            }
        }
    };

    return (
        <PageLayout>
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
                            rules={[{ required: true, message: "Please input your username!" }]}
                        >
                            <Input placeholder="Enter username" />
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: "Please input your name!" }]}
                        >
                            <Input placeholder="Enter name" />
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
        </PageLayout>
    );
};

export default Register;