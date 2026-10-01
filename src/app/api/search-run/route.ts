import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { queryId, queryStr } = await req.json();

    if (!queryId || !queryStr) {
      return NextResponse.json({ error: "Query ID and string are required" }, { status: 400 });
    }

    const searchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!searchApiKey || !searchEngineId) {
      return NextResponse.json({ error: "Google Search API keys are missing" }, { status: 500 });
    }

    // 1. Create a search_runs record first
    const runRes = await fetch(`${supabaseUrl}/rest/v1/search_runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey as string,
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        query_id: queryId,
        status: "RUNNING",
        urls_found: 0,
        urls_processed: 0,
        leads_found: 0
      })
    });

    const runData = await runRes.json();
    const runId = runData[0]?.id;

    if (!runId) {
      throw new Error("Failed to create search run record");
    }

    // 2. Fetch from Google Custom Search JSON API
    const googleUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${searchApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(queryStr)}&num=10`;
    
    const searchRes = await fetch(googleUrl);
    const searchData = await searchRes.json();

    if (searchData.error) {
      await updateRunStatus(runId, "FAILED", supabaseUrl, supabaseServiceKey);
      return NextResponse.json({ error: searchData.error.message }, { status: 500 });
    }

    const items = searchData.items || [];
    const urls = items.map((item: any) => ({
      url: item.link,
      title: item.title,
      snippet: item.snippet
    }));

    // 3. Update run with found URLs count
    await fetch(`${supabaseUrl}/rest/v1/search_runs?id=eq.${runId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey as string,
        "Authorization": `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        urls_found: urls.length,
        status: urls.length === 0 ? "COMPLETED" : "RUNNING"
      })
    });

    // 4. In a real production app, we would push these URLs to a queue. 
    // Since this is a serverless MVP, we will kick off background fetches (fire and forget) 
    // or just return the URLs to the client to process one by one to avoid Vercel timeouts.
    // For safety, let's return the URLs to the frontend so the frontend can display progress!

    return NextResponse.json({
      success: true,
      runId,
      urlsFound: urls.length,
      urls
    });

  } catch (error: any) {
    console.error("Search run error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateRunStatus(runId: string, status: string, supabaseUrl: string = "", supabaseServiceKey: string = "") {
  await fetch(`${supabaseUrl}/rest/v1/search_runs?id=eq.${runId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseServiceKey as string,
      "Authorization": `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ status })
  });
}
