"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Card, Table, Tag, message, Spin, Button } from "antd";
import type { TableProps } from "antd";

const UsersList = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 从localStorage获取用户ID
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    if (!storedUserId) {
      router.push("/login");
      return;
    }

    // 设置API服务的用户ID
    apiService.setCurrentUserId(storedUserId);

    // 获取用户列表
    fetchUsers(storedUserId);
  }, [apiService, router]);

  const fetchUsers = async (currentUserId: string) => {
    try {
      const users = await apiService.get<User[]>("/users");
      setUsers(users);
    } catch (error) {
      console.error("获取用户列表失败:", error);
      message.error("获取用户列表失败");

      // 如果是授权错误，重定向到登录页
      if (error instanceof Error && (error.message.includes("401") || error.message.includes("403"))) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    router.push("/login");
  };

  // 表格列定义
  const columns: TableProps<User>["columns"] = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => (
          <Tag color={status === "ONLINE" ? "green" : "red"}>
            {status}
          </Tag>
      ),
    },
    {
      title: "创建日期",
      dataIndex: "creation_date",
      key: "creation_date",
      render: (date) => (
          date ? new Date(date).toLocaleDateString() : "无"
      ),
    },
  ];

  if (!userId) {
    return null;
  }

  return (
      <div className="card-container">
        <Card
            title="用户列表"
            loading={loading}
            style={{ width: "80%", maxWidth: "900px", margin: "40px auto" }}
            extra={
              <Button onClick={handleLogout} type="primary" danger>
                退出登录
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
              <Spin tip="正在加载用户数据..." />
          )}
        </Card>
      </div>
  );
};

export default UsersList;