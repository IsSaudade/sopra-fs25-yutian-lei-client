//
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/user";
import { Button, Card, Table, Tag, message, Spin } from "antd";
import type { TableProps } from "antd";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  const { user: currentUser, logout } = useAuth();

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiService]);

  return (
      <ProtectedRoute>
        <PageLayout requireAuth>
          <div className="card-container">
            <Card
                title="All Users"
                loading={loading}
                className="dashboard-container"
                style={{ width: "80%", maxWidth: "900px", margin: "40px auto" }}
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
        </PageLayout>
      </ProtectedRoute>
  );
};

export default Dashboard;