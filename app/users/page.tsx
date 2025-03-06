"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Card, Table, Tag, message, Spin, Button } from "antd";
import type { TableProps } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";

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
    dataIndex: "creationDate",
    key: "creationDate",
    render: (date) => (
        date ? new Date(date).toLocaleDateString() : "N/A"
    ),
  },
];

const UsersList = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { value: userId, clear: clearUserId } = useLocalStorage<string | null>("userId", null);
  const { clear: clearToken } = useLocalStorage<string | null>("token", null);

  // Check authentication - with better handling to prevent redirect loops
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);

      if (!userId) {
        console.log("No userId found, redirecting to login");
        await router.push("/login");
        return;
      }

      // Set current user ID for API calls
      apiService.setCurrentUserId(userId);
      setCheckingAuth(false);
    };

    checkAuth();
  }, [userId, router, apiService]);

  // Only fetch users if authenticated
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId || checkingAuth) return;

      try {
        setLoading(true);
        console.log("Fetching users with userId:", userId);
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          message.error(`Failed to fetch users: ${error.message}`);

          // If unauthorized, redirect to login
          if (error.message.includes("401") || error.message.includes("403")) {
            handleLogout();
          }
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiService, userId, checkingAuth]);

  const handleLogout = async () => {
    console.log("Logging out...");

    // Clear localStorage first
    clearUserId();
    clearToken();

    // Clear API service state
    apiService.setCurrentUserId(null);

    // Wait a bit to ensure state is cleared
    setTimeout(() => {
      router.push("/login");
    }, 100);
  };

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
        <div className="card-container">
          <Spin size="large" tip="Checking authentication..." />
        </div>
    );
  }

  // Render the users list
  return (
      <div className="card-container">
        <Card
            title="All Users"
            loading={loading}
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
              <Spin tip="Loading users..." />
          )}
        </Card>
      </div>
  );
};

export default UsersList;