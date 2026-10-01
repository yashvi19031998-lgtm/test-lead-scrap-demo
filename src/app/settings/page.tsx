"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [profile, setProfile] = useState({
    id: "",
    company_name: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    core_services: "[]",
    technologies: "[]",
    company_bio: "",
    min_project_budget: "",
    preferred_email_tone: "Professional"
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agency_profiles")
        .select("*")
        .limit(1)
        .single();
        
      if (data) {
        setProfile({
          ...data,
          core_services: JSON.stringify(data.core_services || []),
          technologies: JSON.stringify(data.technologies || [])
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    
    try {
      let parsedServices = [];
      let parsedTech = [];
      
      try {
        parsedServices = JSON.parse(profile.core_services);
        parsedTech = JSON.parse(profile.technologies);
      } catch(e) {
        setMessage("❌ Error: Core Services and Technologies must be valid JSON arrays like [\"React\", \"Node\"]");
        setIsSaving(false);
        return;
      }

      const payload = {
        company_name: profile.company_name,
        website_url: profile.website_url,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
        core_services: parsedServices,
        technologies: parsedTech,
        company_bio: profile.company_bio,
        min_project_budget: profile.min_project_budget,
        preferred_email_tone: profile.preferred_email_tone
      };

      let res;
      if (profile.id) {
        res = await supabase.from("agency_profiles").update(payload).eq("id", profile.id);
      } else {
        res = await supabase.from("agency_profiles").insert([payload]);
      }

      if (res.error) throw res.error;
      
      setMessage("✅ Agency Profile saved successfully!");
      if (!profile.id) fetchProfile();
      
    } catch (error: any) {
      setMessage(`❌ Error saving profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings & Agency Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your agency details here. The AI will use this profile to calculate Match Scores and write highly personalized cold emails to your leads.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={profile.company_name}
                  onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                  placeholder="e.g. TechWizards Dev"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Website URL</label>
              <div className="mt-1">
                <input
                  type="url"
                  value={profile.website_url}
                  onChange={(e) => setProfile({...profile, website_url: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  value={profile.contact_email}
                  onChange={(e) => setProfile({...profile, contact_email: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Company Bio / Description</label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  value={profile.company_bio}
                  onChange={(e) => setProfile({...profile, company_bio: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                  placeholder="We build high-performance Next.js and React applications for growing startups..."
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">The AI uses this to pitch your company accurately.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Core Services (JSON Array)</label>
              <div className="mt-1">
                <input
                  type="text"
                  value={profile.core_services}
                  onChange={(e) => setProfile({...profile, core_services: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono text-xs text-gray-900 bg-white"
                  placeholder='["Web Dev", "Mobile Apps"]'
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Technologies (JSON Array)</label>
              <div className="mt-1">
                <input
                  type="text"
                  value={profile.technologies}
                  onChange={(e) => setProfile({...profile, technologies: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono text-xs text-gray-900 bg-white"
                  placeholder='["React", "Node.js", "AWS"]'
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Project Budget</label>
              <div className="mt-1">
                <input
                  type="text"
                  value={profile.min_project_budget}
                  onChange={(e) => setProfile({...profile, min_project_budget: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white"
                  placeholder="$1,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred AI Email Tone</label>
              <div className="mt-1">
                <select
                  value={profile.preferred_email_tone}
                  onChange={(e) => setProfile({...profile, preferred_email_tone: e.target.value})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white"
                >
                  <option>Professional</option>
                  <option>Friendly & Casual</option>
                  <option>Direct & Concise</option>
                  <option>Enthusiastic</option>
                </select>
              </div>
            </div>

          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-200">
            <span className={`text-sm font-medium ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 self-center" />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
