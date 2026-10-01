"use client";

import { useState, useEffect } from "react";
import { Plus, Play, MoreVertical, X, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function QueriesPage() {
  const [queries, setQueries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Run progress state
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runProgress, setRunProgress] = useState<{total: number, current: number, logs: string[]}>({ total: 0, current: 0, logs: [] });

  // New query state
  const [newQuery, setNewQuery] = useState({
    name: "",
    query: "",
    platform: "Instagram"
  });

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("search_queries").select("*").order("created_at", { ascending: false });
    if (data) setQueries(data);
    setIsLoading(false);
  };

  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await supabase.from("search_queries").insert([{
      name: newQuery.name,
      query: newQuery.query,
      platform: newQuery.platform,
      active: true
    }]);

    if (!error) {
      setShowModal(false);
      setNewQuery({ name: "", query: "", platform: "Instagram" });
      fetchQueries();
    } else {
      alert("Error adding query: " + error.message);
    }
    setIsSaving(false);
  };

  const handleRunSearch = async (queryId: string, queryStr: string) => {
    if (runningId) return; // Prevent multiple runs at once
    setRunningId(queryId);
    setRunProgress({ total: 0, current: 0, logs: ["Starting search run..."] });

    try {
      const addLog = (msg: string) => setRunProgress(p => ({ ...p, logs: [...p.logs, msg] }));
      
      addLog(`Querying Google API: ${queryStr}`);
      const searchRes = await fetch("/api/search-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId, queryStr })
      });

      const searchData = await searchRes.json();
      if (!searchRes.ok) throw new Error(searchData.error || "Search API failed");

      const urls = searchData.urls || [];
      if (urls.length === 0) {
        addLog("No URLs found for this query.");
        setRunningId(null);
        return;
      }

      addLog(`Found ${urls.length} URLs. Starting AI processing...`);
      setRunProgress(p => ({ ...p, total: urls.length }));

      let leadsFound = 0;
      
      for (let i = 0; i < urls.length; i++) {
        const urlItem = urls[i];
        setRunProgress(p => ({ ...p, current: i + 1 }));
        addLog(`Processing [${i+1}/${urls.length}]: ${urlItem.url}`);

        try {
          const processRes = await fetch("/api/process-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlItem.url })
          });
          const processData = await processRes.json();

          if (processRes.ok && processData.isLead) {
            leadsFound++;
            addLog(`✅ Lead found! Score: ${processData.lead.company_match_score || processData.lead.lead_score}`);
          } else {
            addLog(`⏭️ Skipped: ${processData.reason || "Not a lead"}`);
          }
        } catch (e: any) {
          addLog(`❌ Failed to process URL: ${e.message}`);
        }
      }

      addLog(`🎉 Run completed! Found ${leadsFound} leads.`);
    } catch (error: any) {
      setRunProgress(p => ({ ...p, logs: [...p.logs, `❌ Fatal Error: ${error.message}`] }));
    } finally {
      setTimeout(() => setRunningId(null), 5000); // clear UI after 5 sec
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Queries</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the queries used to find leads across platforms.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Query
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center p-12 text-gray-400">Loading queries...</div>
        ) : queries.length === 0 ? (
          <div className="text-center p-12 text-gray-500">No search queries added yet. Click "Add Query" to start!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {queries.map((q) => (
              <li key={q.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">{q.name}</p>
                      <p className="text-sm text-gray-500 mt-1 font-mono bg-gray-100 p-1 rounded inline-block text-gray-900">{q.query}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {q.active ? "Active" : "Inactive"}
                      </span>
                      <div className="text-sm text-gray-500">{q.platform}</div>
                      
                      <button 
                        onClick={() => handleRunSearch(q.id, q.query)}
                        disabled={runningId !== null}
                        className={`border rounded p-2 flex items-center justify-center transition-colors ${runningId === q.id ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'} disabled:opacity-50`}
                        title="Run this query now"
                      >
                        {runningId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Progress Bar & Logs */}
                  {runningId === q.id && (
                    <div className="bg-gray-900 rounded-md p-4 mt-4">
                      <div className="flex justify-between text-xs font-mono text-gray-400 mb-2 border-b border-gray-700 pb-2">
                        <span>Background Job Executing...</span>
                        <span>{runProgress.current} / {runProgress.total} URLs</span>
                      </div>
                      <div className="h-32 overflow-y-auto text-xs font-mono text-green-400 space-y-1">
                        {runProgress.logs.map((log, i) => (
                          <div key={i}>{">"} {log}</div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Query Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Add New Search Query</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddQuery} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Instagram Freelance Dev"
                  value={newQuery.name}
                  onChange={(e) => setNewQuery({...newQuery, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Search Query String</label>
                <input 
                  type="text" required
                  placeholder='site:instagram.com "developer required"'
                  value={newQuery.query}
                  onChange={(e) => setNewQuery({...newQuery, query: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border font-mono text-xs text-gray-900 bg-white" 
                />
                <p className="text-xs text-gray-500 mt-1">Use Google Dorks for better results.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform</label>
                <select 
                  value={newQuery.platform}
                  onChange={(e) => setNewQuery({...newQuery, platform: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900 bg-white"
                >
                  <option>Instagram</option>
                  <option>Reddit</option>
                  <option>GitHub</option>
                  <option>Hacker News</option>
                  <option>LinkedIn</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
