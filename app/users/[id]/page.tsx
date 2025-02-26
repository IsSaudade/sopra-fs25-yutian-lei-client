"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/user";
import { Button, Card, DatePicker, Form, Input, Tag, message, Descriptions, Spin, Alert } from "antd";
import { EditOutlined, ArrowLeftOutlined, LockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const apiService = useApi();
  const { user: currentUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: User = await apiService.get<User>(`/users/${userId}`);
        setUser(data);
        // Initialize form with user data
        form.setFieldsValue({
          username: data.username,
          birthday: data.birthday ? dayjs(new Date(data.birthday)) : undefined,
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(`Failed to load user: ${error.message}`);
          message.error(`Failed to load user: ${error.message}`);
        } else {
          setError("Failed to load user profile.");
          console.error("An unknown error occurred while fetching user.");
          message.error("Failed to load user profile.");
        }
        // Don't redirect immediately, allow user to see the error
        setTimeout(() => {
          router.push("/users");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, apiService, router, currentUser, form]);

  const handleEdit = () => {
    if (!canEdit) {
      message.error("You can only edit your own profile");
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      await apiService.put(`/users/${userId}`, {
        username: values.username,
        birthday: values.birthday ? values.birthday.toDate() : null,
      });

      message.success("Profile updated successfully");

      // Fetch updated user data
      const updatedUser = await apiService.get<User>(`/users/${userId}`);
      setUser(updatedUser);

      // Refresh current user if this is our own profile
      if (String(currentUser?.id) === String(userId)) {
        await refreshUser();
      }

      // Redirect to the profile page with updated data
      setIsEditing(false);

      // This ensures we see the updated profile view after saving changes
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to update profile: ${error.message}`);

        // Check if username already exists
        if (error.message.includes("username") && error.message.includes("exists")) {
          form.setFields([
            {
              name: 'username',
              errors: ['This username is already taken']
            }
          ]);
        }
      } else {
        console.error("An unknown error occurred while updating profile.");
        message.error("Failed to update profile.");
      }
    }
  };

  const navigateBack = () => {
    router.push("/users");
  };

  // Only allow editing if this is our own profile
  // Compare as strings to ensure consistent comparison regardless of type (string vs number)
  const canEdit = String(currentUser?.id) === String(userId);

  // Custom styles for descriptions to ensure text is visible on dark backgrounds
  const descriptionsStyle = {
    // Style for the entire descriptions component
    background: "#2e4b99", // slightly lighter blue background
    borderRadius: "8px",
    // Override label and content styles to ensure high contrast
    ".ant-descriptions-item-label": {
      color: "white !important", // Force white color for labels
      background: "#1e3a8a !important", // Darker blue for labels
      fontWeight: "bold",
      padding: "12px 16px !important"
    },
    ".ant-descriptions-item-content": {
      color: "white !important", // Force white color for content
      background: "#2e4b99 !important", // Lighter blue for content
      padding: "12px 16px !important"
    }
  };

  return (
      <ProtectedRoute>
        <PageLayout requireAuth>
          <div className="card-container" style={{ padding: "40px 0" }}>
            <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={navigateBack}
                        type="text"
                        style={{ marginRight: "10px" }}
                    />
                    User Profile
                  </div>
                }
                loading={loading}
                style={{ width: "80%", maxWidth: "600px", margin: "0 auto", background: "#2e4b99" }}
                extra={
                    user && (
                        canEdit ? (
                            !isEditing && (
                                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                                  Edit Profile
                                </Button>
                            )
                        ) : (
                            <Button disabled icon={<LockOutlined />} style={{ cursor: "not-allowed" }}>
                              View Only
                            </Button>
                        )
                    )
                }
            >
              {error && (
                  <Alert
                      message="Error"
                      description={error}
                      type="error"
                      showIcon
                      style={{ marginBottom: "16px" }}
                  />
              )}

              {user && !isEditing ? (
                  <Descriptions
                      bordered
                      column={1}
                      style={descriptionsStyle}
                      labelStyle={{ color: "white" }}
                      contentStyle={{ color: "white" }}
                  >
                    <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
                    <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={user.status === "ONLINE" ? "green" : "red"}>
                        {user.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Creation Date">
                      {user.creationDate ? new Date(user.creationDate).toLocaleDateString() : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Birthday">
                      {user.birthday ? new Date(user.birthday).toLocaleDateString() : "Not set"}
                    </Descriptions.Item>
                  </Descriptions>
              ) : user && isEditing ? (
                  <Form
                      form={form}
                      layout="vertical"
                      initialValues={{
                        username: user.username,
                        birthday: user.birthday ? dayjs(user.birthday) : undefined,
                      }}
                      style={{ color: "white" }}
                  >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: "Please enter a username" }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                        name="birthday"
                        label="Birthday (Optional)"
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button type="primary" onClick={handleSave}>Save</Button>
                      </div>
                    </Form.Item>
                  </Form>
              ) : !error && (
                  <Spin tip="Loading user profile..." />
              )}
            </Card>
          </div>
        </PageLayout>
      </ProtectedRoute>
  );
}