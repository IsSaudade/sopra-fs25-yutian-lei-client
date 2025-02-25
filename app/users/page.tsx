"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, Tag, message } from "antd";
import type { TableProps } from "antd";

// Columns for the antd table of User objects
const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
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

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");

  const handleLogout = async (): Promise<void> => {
    try {
      // TODO: Call logout API if implemented
      // await apiService.post(`/logout/${currentUser.id}`, {});

      // Clear token
      clearToken();
      message.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Logout failed: ${error.message}`);
      } else {
        console.error("An unknown error occurred during logout.");
      }
    }
  };

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          message.error(`Failed to fetch users: ${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
        // Redirect to login if unauthorized
        if (error instanceof Error && error.message.includes("401")) {
          clearToken();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiService, router, token, clearToken]);

  return (
      <div className="card-container">
        <Card
            title="All Users"
            loading={loading}
            className="dashboard-container"
            style={{ width: "80%", maxWidth: "900px" }}
            extra={
              <Button onClick={handleLogout} type="primary" danger>
                Logout
              </Button>
            }
        >
          {users && (
              <Table<User>
                  columns={columns}
                  dataSource={users}
                  rowKey="id"
                  onRow={(row) => ({
                    onClick: () => router.push(`/users/${row.id}`),
                    style: { cursor: "pointer" },
                  })}
              />
          )}
        </Card>
      </div>
  );
};

export default Dashboard;