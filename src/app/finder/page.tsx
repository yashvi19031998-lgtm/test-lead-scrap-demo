"use client";

import { useState } from "react";
import { Search, Link as LinkIcon, Play, Loader2 } from "lucide-react";

export default function LeadFinder() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsProcessing(true);
    setLogs([]);
    setResults(null);
    addLog(`Searching Google for: ${query}...`);
    
    // (Search implementation comes in the next phase, currently we'll just mock this part or tell the user)
    addLog(`Search functionality will loop through results and call the URL processor.`);
    setIsProcessing(false);
  };

  const handleProcessUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsProcessing(true);
    setLogs([]);
    setResults(null);
    
    try {
      addLog(`Initializing processing for URL: ${url}`);
      addLog(`Connecting to AI extraction engine...`);
      
      const res = await fetch("/api/process-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        addLog(`❌ Error: ${data.error || "Failed to process"}`);
        setIsProcessing(false);
        return;
      }
      
      if (!data.isLead) {
        addLog(`ℹ️ Not a lead. Reason: ${data.reason}`);
        setIsProcessing(false);
        return;
      }
      
      addLog(`✅ Successfully extracted data using ${data.scrapingMethod}!`);
      addLog(`Saving to Supabase database...`);
      
      setResults({ lead: data.lead });
      addLog(`🎉 Lead Extracted & Saved!`);
      
    } catch (err: any) {
      addLog(`❌ Fatal Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lead Finder</h1>
        <p className="mt-1 text-sm text-gray-500">Search for leads or process a specific URL manually.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Panel */}
        <div className="bg-white shadow rounded-lg border border-gray-100 p-6 opacity-60">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-indigo-500" />
            Run Search (Coming Next)
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">Search Query</label>
              <div className="mt-1">
                <textarea
                  id="searchQuery"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                  placeholder='site:instagram.com "developer required" "freelance"'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
            <button type="submit" disabled className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 opacity-50 cursor-not-allowed">
              <Play className="w-4 h-4 mr-2 self-center" /> Run Search
            </button>
          </form>
        </div>

        {/* Process URL Panel */}
        <div className="bg-white shadow rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Process Single URL (Live)
          </h2>
          <form onSubmit={handleProcessUrl} className="space-y-4">
            <div>
              <label htmlFor="urlInput" className="block text-sm font-medium text-gray-700">Test a Webpage URL</label>
              <div className="mt-1">
                <input
                  type="url"
                  id="urlInput"
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                  placeholder="https://example.com/project-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Try a URL of a job posting, reddit thread, or freelance request.</p>
            </div>
            <button
              type="submit"
              disabled={isProcessing || !url}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process URL Live"}
            </button>
          </form>
        </div>
      </div>

      {/* Processing Terminal */}
      {(logs.length > 0 || isProcessing) && (
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="bg-gray-800 px-4 py-2 flex items-center border-b border-gray-700">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-4 text-xs text-gray-400 font-mono">live-extraction-engine</span>
          </div>
          <div className="p-4 font-mono text-sm text-green-400 max-h-96 overflow-y-auto space-y-2">
            {logs.map((log, idx) => (
              <div key={idx}>{">"} {log}</div>
            ))}
            {isProcessing && <div className="animate-pulse">{">"} _</div>}
            
            {results && results.lead && (
              <div className="mt-4 p-4 border border-green-700 rounded bg-green-900 bg-opacity-20 text-green-300">
                <p className="font-bold text-white mb-2">Lead Extracted!</p>
                <p><strong>Title:</strong> {results.lead.project_title || "N/A"}</p>
                <p><strong>Type:</strong> {results.lead.lead_type}</p>
                <p><strong>Quality:</strong> <span className="text-yellow-400">{results.lead.lead_quality}</span> (AI Score: {results.lead.lead_score}/100)</p>
                
                {results.lead.company_match_score !== undefined && (
                  <p><strong>🔥 Match Score:</strong> {results.lead.company_match_score}/100 (Matches your agency profile)</p>
                )}

                <p><strong>Email:</strong> {results.lead.email || "Not found"}</p>
                
                {results.lead.generated_email_draft && (
                  <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded text-gray-300 text-xs whitespace-pre-wrap">
                    <p className="font-bold text-gray-400 mb-2 border-b border-gray-700 pb-1">AI Generated Cold Email Draft:</p>
                    {results.lead.generated_email_draft}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
