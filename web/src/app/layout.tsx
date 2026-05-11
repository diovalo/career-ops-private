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
        <div className="flex h-screen bg-[#0f1117]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-800 bg-[#161b22] shadow-sm p-6 flex flex-col">
            <h1 className="text-2xl font-bold text-white mb-8">Career-Ops</h1>
            <nav className="space-y-1">
              <a
                href="/dashboard"
                className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                Dashboard
              </a>
              <a
                href="/insights"
                className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                All Insights
              </a>
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-800 text-xs text-gray-600">
              <p>Syncing with GitHub</p>
              <p className="mt-1">Refresh rate: 60s</p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto bg-[#0f1117]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
