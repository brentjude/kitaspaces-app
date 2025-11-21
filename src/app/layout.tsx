import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitaspaces - Sign In",
  description: "Sign in to your Kitaspaces account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}