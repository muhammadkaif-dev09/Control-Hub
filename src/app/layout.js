"use client";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserProvider";

export default function RootLayout({ children }) {
  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={false}>
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.3}
          crawlSpeed={200}
          height={4}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={400}
        />
        <Toaster />
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
