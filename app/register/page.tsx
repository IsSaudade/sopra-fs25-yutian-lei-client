"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, DatePicker, message } from "antd";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

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

    // If user is already logged in, redirect to users page
    useEffect(() => {
        if (user && !loading) {
            router.push("/users");
        }
    }, [user, loading, router]);

    const handleRegister = async (values: FormFieldProps) => {
        try {
            await register(values);
            message.success("Registration successful!");
            // Navigation is handled in the auth context
        } catch (error) {
            if (error instanceof Error) {
                message.error(`Registration failed: ${error.message}`);
            } else {
                console.error("An unknown error occurred during registration.");
                message.error("Registration failed due to an unknown error.");
            }
        }
    };

    return (
        <div className="login-container">
            <div style={{ maxWidth: "400px", width: "100%", padding: "20px" }}>
                <h1 style={{ color: "white", textAlign: "center", marginBottom: "24px" }}>Register</h1>

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

                    <Form.Item
                        name="birthday"
                        label="Birthday (Optional)"
                    >
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-button">
                            Register
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: "center", marginTop: "20px", color: "white" }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "#75bd9d" }}>
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;