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
    dataIndex: "creation_date",
    key: "creation_date",
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
  const { value: userId, clear: clearUserId } = useLocalStorage<string | null>("userId", null);
  const { clear: clearToken } = useLocalStorage<string | null>("token", null);

  // Check authentication
  useEffect(() => {
    if (!userId) {
      router.push("/login");
    } else {
      // Set current user ID for API calls
      apiService.setCurrentUserId(userId);
    }
  }, [userId, router, apiService]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;

      try {
        setLoading(true);
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
  }, [apiService, userId]);// dependency apiService does not re-trigger the useEffect on every render because the hook uses memoization (check useApi.tsx in the hooks).
  // if the dependency array is left empty, the useEffect will trigger exactly once
  // if the dependency array is left away, the useEffect will run on every state change. Since we do a state change to users in the useEffect, this results in an infinite loop.
  // read more here: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies


  const handleLogout = () => {
    clearUserId();
    clearToken();
    apiService.setCurrentUserId(null);
    router.push("/login");
  };

  // Redirect to login if not authenticated
  if (!userId) {
    return null;
  }

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