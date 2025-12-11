import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "@/contexts/AdminContext";

export const metadata: Metadata = {
  title: "UPNEXX Studio - AI-Powered Advertising Platform",
  description: "Create professional advertising videos and storyboards with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-brand-black text-white antialiased">
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}
