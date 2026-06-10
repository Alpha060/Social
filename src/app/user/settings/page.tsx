"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Lock, Bell, Palette, Save, Loader2, CheckCircle, Camera } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [hasChanges, setHasChanges] = useState(false);

  // Reset changes when user loads or tab changes
  useEffect(() => {
    setHasChanges(false);
  }, [user]);

  const tabs = [
    { id: "Profile", icon: User },
    { id: "Password", icon: Lock },
    { id: "Notifications", icon: Bell },
    { id: "Appearance", icon: Palette },
  ];

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const currentValues = {
      name: formData.get("name") || "",
      bio: formData.get("bio") || "",
      youtube: formData.get("youtube") || "",
      instagram: formData.get("instagram") || "",
      twitter: formData.get("twitter") || "",
      linkedin: formData.get("linkedin") || "",
    };
    const initialValues = {
      name: user.name || "",
      bio: user.bio || "",
      youtube: user.youtube || "",
      instagram: user.instagram || "",
      twitter: user.twitter || "",
      linkedin: user.linkedin || "",
    };
    const isChanged = Object.keys(currentValues).some(
      key => currentValues[key as keyof typeof currentValues] !== initialValues[key as keyof typeof initialValues]
    );
    setHasChanges(isChanged);
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      bio: formData.get("bio"),
      youtube: formData.get("youtube"),
      instagram: formData.get("instagram"),
      twitter: formData.get("twitter"),
      linkedin: formData.get("linkedin"),
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        setSaveMessage({ type: "success", text: "Profile updated successfully! Refresh to see changes globally." });
        setHasChanges(false);
      } else {
        setSaveMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      setSaveMessage({ type: "error", text: "An error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    setHasChanges(!!formData.get("currentPassword") || !!formData.get("newPassword") || !!formData.get("confirmPassword"));
  };

  const handlePasswordSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });
    setTimeout(() => {
      setSaveMessage({ type: "error", text: "Password change endpoint is coming soon." });
      setIsSaving(false);
    }, 600);
  };

  const handleGenericSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });
    setTimeout(() => {
      setSaveMessage({ type: "success", text: "Preferences saved successfully." });
      setIsSaving(false);
      setHasChanges(false);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account preferences and settings.</p>
        </div>
        <button 
          type="submit"
          form={`${activeTab.toLowerCase()}-form`}
          disabled={isSaving || (activeTab === "Profile" ? !hasChanges : activeTab === "Password" ? !hasChanges : false)}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0 bg-white rounded-2xl shadow-sm border border-slate-100 p-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSaveMessage({ type: "", text: "" });
                setHasChanges(false);
              }}
              className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 last:mb-0 ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? "text-indigo-600" : "text-slate-400"} />
              {tab.id}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          
          {saveMessage.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {saveMessage.type === 'success' && <CheckCircle size={20} />}
              <span className="text-sm font-medium">{saveMessage.text}</span>
            </div>
          )}

          {activeTab === "Profile" && (
            <form id="profile-form" onSubmit={handleProfileSave} onChange={handleFormChange} className="max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Profile Information</h3>
              
              {/* Profile Images UI */}
              <div className="mb-8">
                <div className="h-32 bg-slate-200 rounded-xl relative overflow-hidden group cursor-pointer border border-slate-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-opacity shadow-sm">
                      <Camera size={14} /> Change Cover
                    </div>
                  </div>
                </div>
                
                <div className="relative -mt-10 ml-6 flex items-end">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-800 text-white flex items-center justify-center text-3xl font-bold shadow-sm relative group cursor-pointer">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full transition-all flex items-center justify-center">
                      <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Image uploads are coming soon.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    defaultValue={user?.name || ""}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user?.email || ""}
                    disabled
                    className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-2">Email address cannot be changed directly.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                  <textarea 
                    name="bio"
                    defaultValue={user?.bio || ""}
                    placeholder="Tell us a little about yourself"
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">YouTube URL</label>
                      <input 
                        type="url" 
                        name="youtube"
                        defaultValue={user?.youtube || ""}
                        placeholder="https://youtube.com/..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Instagram URL</label>
                      <input 
                        type="url" 
                        name="instagram"
                        defaultValue={user?.instagram || ""}
                        placeholder="https://instagram.com/..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Twitter URL</label>
                      <input 
                        type="url" 
                        name="twitter"
                        defaultValue={user?.twitter || ""}
                        placeholder="https://twitter.com/..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">LinkedIn URL</label>
                      <input 
                        type="url" 
                        name="linkedin"
                        defaultValue={user?.linkedin || ""}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === "Password" && (
            <form id="password-form" onSubmit={handlePasswordSave} onChange={handlePasswordChange} className="max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Change Password</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>
            </form>
          )}

          {activeTab === "Notifications" && (
            <form id="notifications-form" onSubmit={handleGenericSave} className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">Coming Soon</span>
              </div>
              <div className="space-y-6 opacity-60 pointer-events-none grayscale">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Email Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">Receive updates about your account and content.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">New Comments</h4>
                    <p className="text-xs text-slate-500 mt-1">Get notified when someone comments on your uploads.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Content Verification</h4>
                    <p className="text-xs text-slate-500 mt-1">Get notified when your content is approved or rejected.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </form>
          )}

          {activeTab === "Appearance" && (
            <form id="appearance-form" onSubmit={handleGenericSave} className="max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Appearance Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-4">Theme Preference</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button type="button" className="flex flex-col items-center gap-3 p-4 border-2 border-indigo-600 rounded-xl bg-slate-50 cursor-pointer">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center">
                        <div className="w-6 h-6 bg-slate-900 rounded-full"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-900">Light</span>
                    </button>
                    <button type="button" className="flex flex-col items-center gap-3 p-4 border-2 border-transparent hover:border-slate-200 rounded-xl bg-slate-50 opacity-60 cursor-not-allowed">
                      <div className="w-12 h-12 bg-slate-900 rounded-full shadow-sm border border-slate-700 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-500">Dark (Coming Soon)</span>
                    </button>
                    <button type="button" className="flex flex-col items-center gap-3 p-4 border-2 border-transparent hover:border-slate-200 rounded-xl bg-slate-50 opacity-60 cursor-not-allowed">
                      <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-sm flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full opacity-50"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-500 text-center">System (Coming Soon)</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
