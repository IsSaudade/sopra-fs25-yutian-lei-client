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
  const { value: userId, clear: clearUserId } = useLocalStorage<string | null>("userId", null);
  const { clear: clearToken } = useLocalStorage<string | null>("token", null);

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

  // Simple auth check
  useEffect(() => {
    if (!userId) {
      console.log("No userId, redirecting to login");
      router.push("/login");
    }
  }, [userId, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        apiService.setCurrentUserId(userId);

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
  }, [userId, apiService]);

  const handleLogout = () => {
    clearUserId();
    clearToken();
    apiService.setCurrentUserId(null);
    router.push("/login");
  };

  if (!userId) {
    return null;
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