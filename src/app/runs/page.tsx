"use client";

import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function RunsPage() {
  const runs = [
    { id: "run_123", queryName: "Instagram Freelance", status: "COMPLETED", urlsFound: 25, urlsProcessed: 25, leadsFound: 8, date: "2023-10-24 10:30 AM" },
    { id: "run_124", queryName: "Reddit Dev Needed", status: "COMPLETED", urlsFound: 40, urlsProcessed: 40, leadsFound: 12, date: "2023-10-24 09:15 AM" },
    { id: "run_125", queryName: "GitHub Issues Hire", status: "FAILED", urlsFound: 0, urlsProcessed: 0, leadsFound: 0, date: "2023-10-23 04:20 PM" },
    { id: "run_126", queryName: "Instagram Freelance", status: "COMPLETED", urlsFound: 30, urlsProcessed: 30, leadsFound: 5, date: "2023-10-23 10:30 AM" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "FAILED": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Runs History</h1>
          <p className="mt-1 text-sm text-gray-500">Log of all background search operations.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URLs Found</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads Found</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{run.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{run.queryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(run.status)}
                      <span className="ml-2 text-sm text-gray-500">{run.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {run.urlsFound} / {run.urlsProcessed} processed
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {run.leadsFound} leads
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{run.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
