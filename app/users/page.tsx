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
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const { value: userId, clear: clearUserId } = useLocalStorage<string | null>("userId", null);
  const { clear: clearToken } = useLocalStorage<string | null>("token", null);

  // Debug - log userId from localStorage
  useEffect(() => {
    console.log("UsersPage - userId from localStorage:", userId);
  }, [userId]);

  // Columns for the table
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
      dataIndex: "creation_date", // Match the server's field name
      key: "creation_date",
      render: (date) => (
          date ? new Date(date).toLocaleDateString() : "N/A"
      ),
    },
  ];

  // Authentication check - with better handling
  useEffect(() => {
    const checkAuth = () => {
      console.log("Checking authentication...");

      if (!userId) {
        console.log("No userId found, redirecting to login");
        router.push("/login");
      } else {
        console.log("User is authenticated, userId:", userId);
        // Set current user ID for API calls
        apiService.setCurrentUserId(userId);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [userId, router, apiService]);

  // Fetch users only after auth is checked
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId || !authChecked) return;

      console.log("Authenticated, fetching users...");

      try {
        setLoading(true);

        const data = await apiService.get<User[]>("/users");
        console.log("Fetched users:", data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Unexpected response format:", data);
          message.error("Received invalid data format");
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);

        if (error instanceof Error) {
          message.error(error.message);

          if (error.message.includes("401") || error.message.includes("403")) {
            handleLogout();
          }
        } else {
          message.error("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, apiService, authChecked]);

  const handleLogout = () => {
    console.log("Logging out...");
    clearUserId();
    clearToken();
    apiService.setCurrentUserId(null);

    console.log("Redirecting to login...");
    router.push("/login");
  };

  // Show loading state while checking authentication
  if (!authChecked || !userId) {
    return (
        <div className="card-container">
          <Spin size="large" tip="Checking authentication..." />
        </div>
    );
  }

  return (
      <div className="card-container">
        <Card
            title="All Users"
            loading={loading}
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
              <Spin tip="Loading users..." />
          )}
        </Card>
      </div>
  );
};

export default UsersList;