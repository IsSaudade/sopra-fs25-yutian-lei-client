"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, DatePicker, Form, Input, Tag, message, Descriptions, Spin, Alert } from "antd";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function UserProfile() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const apiService = useApi();
  const { value: currentUserId } = useLocalStorage<string | null>("userId", null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Check authentication
  useEffect(() => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    // Set current user ID for API calls
    apiService.setCurrentUserId(currentUserId);
  }, [currentUserId, router, apiService]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUserId) return;

      try {
        setLoading(true);
        setError(null);
        const data: User = await apiService.get<User>(`/users/${userId}`);
        console.log("Fetched user data:", data);
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

          // If unauthorized, redirect to login
          if (error.message.includes("401") || error.message.includes("403")) {
            router.push("/login");
            return;
          }
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
  }, [userId, apiService, router, currentUserId, form]);

  // Function to determine if current user can edit this profile
  const canEdit = currentUserId === userId;

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
      if (!canEdit) {
        message.error("Permission denied: You can only edit your own profile");
        setIsEditing(false);
        return;
      }

      const values = await form.validateFields();
      console.log("Submitting form values:", values);

      // Make PUT request to update user
      await apiService.put(`/users/${userId}`, {
        username: values.username,
        birthday: values.birthday ? values.birthday.toDate() : null,
      });

      message.success("Profile updated successfully");

      // Fetch updated user data
      const updatedUser = await apiService.get<User>(`/users/${userId}`);
      setUser(updatedUser);

      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to update profile: ${error.message}`);
        console.error("Update profile error:", error);
      } else {
        console.error("An unknown error occurred while updating profile.");
        message.error("Failed to update profile.");
      }
    }
  };

  const navigateBack = () => {
    router.push("/users");
  };

  // Custom styles for descriptions to ensure text is visible on dark backgrounds
  const descriptionsStyle = {
    background: "#2e4b99",
    borderRadius: "8px",
    ".ant-descriptions-item-label": {
      color: "white !important",
      background: "#1e3a8a !important",
      fontWeight: "bold",
      padding: "12px 16px !important"
    },
    ".ant-descriptions-item-content": {
      color: "white !important",
      background: "#2e4b99 !important",
      padding: "12px 16px !important"
    }
  };

  // Redirect to login if not authenticated
  if (!currentUserId) {
    return null;
  }

  return (
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
                    ) : null
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
              >
                <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={user.status === "ONLINE" ? "green" : "red"}>
                    {user.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Creation Date">
                  {user.creation_date ? new Date(user.creation_date).toLocaleDateString() : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Birthday">
                  {user.birthday ? new Date(user.birthday).toLocaleDateString() : "Not set"}
                </Descriptions.Item>
                <Descriptions.Item label="User ID">
                  {user.id}
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
                  <DatePicker
                      style={{ width: "100%", color: "white" }}
                      popupClassName="calendar-popup"
                  />
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
  );
}