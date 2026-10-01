import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Step 0: Fetch Agency Profile to inject into the AI prompt
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let agencyProfile = null;
    
    try {
      const agencyRes = await fetch(`${supabaseUrl}/rest/v1/agency_profiles?select=*&limit=1`, {
        headers: {
          "apikey": supabaseServiceKey as string,
          "Authorization": `Bearer ${supabaseServiceKey}`
        }
      });
      if (agencyRes.ok) {
        const agencyData = await agencyRes.json();
        if (agencyData.length > 0) agencyProfile = agencyData[0];
      }
    } catch (e) {
      console.error("Could not fetch agency profile", e);
    }

    // Step 1: Try AI / Direct URL Fetch
    let pageContent = "";
    let scrapingMethod = "FAILED";

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (response.ok) {
        pageContent = await response.text();
        scrapingMethod = "AI_DIRECT";
      }
    } catch (e) {
      console.error("Direct fetch failed", e);
    }

    // Step 2: Fallback to Decodo if direct fetch failed
    if (scrapingMethod === "FAILED" || pageContent.length < 500) {
      try {
        console.log("Using Decodo fallback...");
        const decodoApiKey = process.env.DECODO_API_KEY;
        const decodoUrl = `https://api.decodo.io/scrape?url=${encodeURIComponent(url)}&api_key=${decodoApiKey}`;
        const decodoResponse = await fetch(decodoUrl);
        if (decodoResponse.ok) {
          const decodoData = await decodoResponse.json();
          pageContent = decodoData.html || decodoData.content || "";
          scrapingMethod = "DECODO_FALLBACK";
        }
      } catch (e) {
        console.error("Decodo fetch failed", e);
      }
    }

    if (!pageContent || pageContent.length < 100) {
      return NextResponse.json({ error: "Could not retrieve sufficient page content." }, { status: 422 });
    }

    pageContent = pageContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    pageContent = pageContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    const cleanContent = pageContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 25000);

    // Step 3: Send to Gemini for Extraction + Email Generation
    const geminiKey = process.env.GEMINI_API_KEY;
    
    // Inject agency profile if it exists
    const agencyContext = agencyProfile ? `
      You are writing on behalf of this Agency:
      Name: ${agencyProfile.company_name}
      Services: ${JSON.stringify(agencyProfile.core_services)}
      Technologies: ${JSON.stringify(agencyProfile.technologies)}
      Bio: ${agencyProfile.company_bio || ""}
      Tone: ${agencyProfile.preferred_email_tone || "Professional"}
      Links: ${JSON.stringify(agencyProfile.portfolio_links)}
    ` : "No agency profile provided. Write a generic polite email from an IT agency.";

    const prompt = `
      You are an AI Lead Extraction and Cold Email tool. 
      Analyze the following webpage text and extract details about IT/Freelancing projects or requirements. 
      
      ${agencyContext}
      
      Return ONLY a valid JSON object using exactly this structure, with no markdown formatting around it:
      {
        "is_it_lead": boolean,
        "lead_status": "ACTIVE" | "INACTIVE",
        "lead_quality": "HIGH" | "MEDIUM" | "LOW",
        "lead_type": "FREELANCE_PROJECT" | "FULL_TIME" | "UNKNOWN",
        "lead_score": number (0-100),
        "company_match_score": number (0-100 based on how well the lead needs match the Agency Services and Tech),
        "generated_email_draft": "Write a highly personalized, dynamic cold email to the lead pitching the Agency's services based on their specific needs. Use the Agency Tone.",
        "full_name": "string or null",
        "company_name": "string or null",
        "email": "string or null",
        "phone": "string or null",
        "whatsapp": "string or null",
        "website": "string or null",
        "location": "string or null",
        "project_title": "string or null",
        "project_description": "string or null",
        "technologies": ["array of strings"],
        "services_required": ["array of strings"],
        "budget": "string or null",
        "currency": "string or null",
        "timeline": "string or null",
        "reason": "Brief explanation of why this is or isn't a good lead"
      }

      Text to analyze:
      ${cleanContent}
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const geminiData = await geminiResponse.json();
    let extractedLead;
    try {
      const textResponse = geminiData.candidates[0].content.parts[0].text;
      extractedLead = JSON.parse(textResponse);
    } catch (e) {
      console.error("Gemini parse error", e, geminiData);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    if (!extractedLead.is_it_lead) {
      return NextResponse.json({ 
        success: true, 
        isLead: false, 
        message: "Page analyzed, but no IT lead found.",
        reason: extractedLead.reason
      });
    }

    // Step 4: Save to Supabase
    const saveResponse = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey as string,
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        full_name: extractedLead.full_name,
        company_name: extractedLead.company_name,
        email: extractedLead.email,
        phone: extractedLead.phone,
        whatsapp: extractedLead.whatsapp,
        website: extractedLead.website,
        location: extractedLead.location,
        project_title: extractedLead.project_title,
        project_description: extractedLead.project_description,
        technologies: extractedLead.technologies,
        services_required: extractedLead.services_required,
        budget: extractedLead.budget,
        currency: extractedLead.currency,
        timeline: extractedLead.timeline,
        lead_type: extractedLead.lead_type,
        lead_status: extractedLead.lead_status,
        lead_quality: extractedLead.lead_quality,
        lead_score: extractedLead.lead_score,
        company_match_score: extractedLead.company_match_score,
        generated_email_draft: extractedLead.generated_email_draft,
        source_url: url,
        scraping_method: scrapingMethod,
        ai_reason: extractedLead.reason
      })
    });

    if (!saveResponse.ok) {
      console.error("Supabase save error", await saveResponse.text());
    }

    return NextResponse.json({
      success: true,
      isLead: true,
      scrapingMethod,
      lead: extractedLead
    });

  } catch (error: any) {
    console.error("Process URL error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
