import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career-Ops Dashboard",
  description: "Job application tracker with personal insights",
};

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/pipeline', label: 'Pipeline' },
  { href: '/add', label: 'Add Company' },
  { href: '/guide', label: 'Guide' },
];

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
          <div className="bg-[#0f1117] min-h-screen md:flex md:h-screen">
            {/* Sidebar — desktop only */}
            <div className="hidden md:flex w-64 shrink-0 border-r border-gray-800 bg-[#161b22] shadow-sm p-6 flex-col h-screen sticky top-0">
              <h1 className="text-2xl font-bold text-white mb-8">Career-Ops</h1>
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-gray-800 text-xs text-gray-600">
                <p>Syncing with GitHub</p>
                <p className="mt-1">Refresh rate: 60s</p>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 md:overflow-auto">
              <MobileNav />
              {children}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
