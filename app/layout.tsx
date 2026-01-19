import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import UserHeader from "@/components/UserHeader";

export const metadata: Metadata = {
  title: "Heisig Kanji Learning - RTK Study App",
  description: "Learn kanji using the Heisig method with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthGuard>
          <UserHeader />
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
