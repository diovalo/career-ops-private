import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career-Ops Dashboard",
  description: "Job application tracker with personal insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-white shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Career-Ops</h1>
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                Dashboard
              </a>
              <a
                href="/insights"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                All Insights
              </a>
            </nav>
            <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500">
              <p>Syncing with GitHub</p>
              <p className="mt-2">Refresh rate: 60s</p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
