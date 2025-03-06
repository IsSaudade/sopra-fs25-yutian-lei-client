"use client";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Card } from "antd";
import { UserOutlined, LoginOutlined, FormOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();

  return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Image
              className={styles.logo}
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
          />

          <Card title="Welcome to SoPra FS25" style={{ width: "100%", maxWidth: "600px", marginBottom: "2rem" }}>
            <p style={{ marginBottom: "1rem" }}>
              This is the user management application for Software Praktikum FS25.
            </p>
            <p>
              You can register for a new account, login to an existing account, and view user profiles.
            </p>
          </Card>

          <div className={styles.ctas}>
            <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => router.push("/register")}
            >
              Register
            </Button>

            <Button
                type="default"
                icon={<LoginOutlined />}
                onClick={() => router.push("/login")}
            >
              Login
            </Button>

            <Button
                type="default"
                icon={<UserOutlined />}
                onClick={() => router.push("/users")}
            >
              View Users
            </Button>
          </div>
        </main>
      </div>
  );
}