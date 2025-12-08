import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/app/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Kitaspaces",
  description: "Kitaspaces App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
