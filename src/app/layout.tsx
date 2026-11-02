
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/app/components/Sidebar";

export const metadata: Metadata = {
  title: "Life Manager",
  description: "O teu espaço pessoal de organização",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="app-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
