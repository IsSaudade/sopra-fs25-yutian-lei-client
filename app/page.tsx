"use client";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Card, Row, Col, Typography } from "antd";
import { UserOutlined, LoginOutlined, FormOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";

const { Title, Paragraph } = Typography;

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  return (
      <PageLayout>
        <div className={styles.page} style={{ padding: "40px 0" }}>
          <main className={styles.main}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
              <Image
                  className={styles.logo}
                  src="/next.svg"
                  alt="Next.js logo"
                  width={180}
                  height={38}
                  priority
              />
            </div>

            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} md={18} lg={16} xl={14}>
                <Card title={<Title level={2}>Welcome to SoPra FS25</Title>} bordered>
                  <Paragraph style={{ fontSize: "16px", marginBottom: "1.5rem" }}>
                    This is the user management application for Software Praktikum FS25. This application allows you to register
                    an account, log in, view all registered users, and manage your profile information.
                  </Paragraph>

                  <Paragraph style={{ fontSize: "16px" }}>
                    <strong>User Stories Implemented:</strong>
                  </Paragraph>
                  <ul style={{ paddingLeft: "20px", marginBottom: "1.5rem" }}>
                    <li>User registration and login functionality</li>
                    <li>View a list of all registered users</li>
                    <li>Check user profiles with details like creation date and online status</li>
                    <li>Edit your own profile information</li>
                  </ul>

                  <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                    {!user ? (
                        <>
                          <Button
                              type="primary"
                              icon={<FormOutlined />}
                              onClick={() => router.push("/register")}
                              size="large"
                          >
                            Register
                          </Button>

                          <Button
                              type="default"
                              icon={<LoginOutlined />}
                              onClick={() => router.push("/login")}
                              size="large"
                          >
                            Login
                          </Button>
                        </>
                    ) : (
                        <Button
                            type="primary"
                            icon={<UserOutlined />}
                            onClick={() => router.push("/users")}
                            size="large"
                        >
                          View Users
                        </Button>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </main>
        </div>
      </PageLayout>
  );
}