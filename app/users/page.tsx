"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Card, Table, Tag, message, Spin, Button } from "antd";
import type { TableProps } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";

const UsersList = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { value: userId, clear: clearUserId } = useLocalStorage<string | null>("userId", null);
  const { clear: clearToken } = useLocalStorage<string | null>("token", null);

  // Columns for the antd table of User objects
  const columns: TableProps<User>["columns"] = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
          <Tag color={status === "ONLINE" ? "green" : "red"}>
            {status}
          </Tag>
      ),
    },
    {
      title: "Creation Date",
      dataIndex: "creation_date", // Using the server's property name
      key: "creation_date",
      render: (date) => (
          date ? new Date(date).toLocaleDateString() : "N/A"
      ),
    },
  ];

  // Check authentication first
  useEffect(() => {
    console.log("Authentication check - userId:", userId);

    if (!userId) {
      router.push("/login");
      return;
    }

    // Set current user ID for API calls
    apiService.setCurrentUserId(userId);
  }, [userId, router, apiService]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        console.log("Fetching users with userId:", userId);

        const users = await apiService.get<User[]>("/users");
        console.log("Fetched users:", users);

        if (Array.isArray(users)) {
          setUsers(users);
        } else {
          console.error("Unexpected response format:", users);
          message.error("Received invalid user data format");
        }
      } catch (error) {
        console.error("Error fetching users:", error);

        if (error instanceof Error) {
          message.error(`Failed to fetch users: ${error.message}`);

          // If unauthorized, redirect to login
          if (error.message.includes("401") || error.message.includes("403")) {
            handleLogout();
          }
        } else {
          message.error("Failed to fetch users: Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiService, userId]);

  const handleLogout = () => {
    console.log("Logging out and clearing state");

    // Clear localStorage
    clearUserId();
    clearToken();

    // Clear API service state
    apiService.setCurrentUserId(null);

    // Navigate to login
    router.push("/login");
  };

  // Show loading state while fetching data
  if (loading && !users) {
    return (
        <div className="card-container">
          <Spin size="large" tip="Loading users..." />
        </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userId) {
    return null;
  }

  return (
      <div className="card-container">
        <Card
            title="All Users"
            className="dashboard-container"
            style={{ width: "80%", maxWidth: "900px", margin: "40px auto" }}
            extra={
              <Button onClick={handleLogout} type="primary" danger>
                Logout
              </Button>
            }
        >
          {users ? (
              <Table<User>
                  columns={columns}
                  dataSource={users}
                  rowKey="id"
                  onRow={(row) => ({
                    onClick: () => router.push(`/users/${row.id}`),
                    style: { cursor: "pointer" },
                  })}
              />
          ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                No users found or error loading users
              </div>
          )}
        </Card>
      </div>
  );
};

export default UsersList;