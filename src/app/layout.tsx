import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Search, Users, Database, Activity, Settings, Network } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT Lead Finder DEMO",
  description: "Discover IT project and freelancing leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 flex h-screen overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Network className="w-6 h-6 text-indigo-600 mr-2" />
            <span className="text-lg font-bold text-gray-800">IT Lead Finder</span>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-700 hover:text-indigo-600">
                <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400" />
                Dashboard
              </Link>
              <Link href="/finder" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-700 hover:text-indigo-600">
                <Search className="w-5 h-5 mr-3 text-gray-400" />
                Lead Finder
              </Link>
              <Link href="/leads" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-700 hover:text-indigo-600">
                <Users className="w-5 h-5 mr-3 text-gray-400" />
                Leads
              </Link>
              <Link href="/queries" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-700 hover:text-indigo-600">
                <Database className="w-5 h-5 mr-3 text-gray-400" />
                Search Queries
              </Link>
              <Link href="/runs" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-700 hover:text-indigo-600">
                <Activity className="w-5 h-5 mr-3 text-gray-400" />
                Search Runs
              </Link>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</p>
              </div>
              <Link href="/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-700 hover:text-indigo-600">
                <Settings className="w-5 h-5 mr-3 text-gray-400" />
                Settings
              </Link>
            </nav>
          </div>
          
          {/* Demo Mode Badge */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">DEMO MODE</h3>
                  <div className="mt-1 text-xs text-amber-700">
                    <p>Using sample data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
