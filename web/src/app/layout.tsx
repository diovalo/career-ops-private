import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career-Ops Dashboard",
  description: "Job application tracker with personal insights",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body className={inter.className}>
        {isLoginPage ? (
          <div className="min-h-screen bg-[#0f1117]">{children}</div>
        ) : (
          <AppShell>{children}</AppShell>
        )}
      </body>
    </html>
  );
}
