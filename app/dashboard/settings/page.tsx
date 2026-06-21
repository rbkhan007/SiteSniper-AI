"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UpgradeModal from "@/components/UpgradeModal";
import type { Profile } from "@/lib/types";
import { TIER_LABELS } from "@/lib/types";

interface ExternalApiKey {
  id: string;
  service: string;
  keyPreview: string;
  createdAt: string;
}

const EXTERNAL_SERVICES = [
  {
    id: "openrouter",
    name: "OpenRouter API Key",
    description: "Used for AI-powered website analysis and email generation. Get a free key at openrouter.ai",
    placeholder: "sk-or-v1-...",
    docsUrl: "https://openrouter.ai/keys",
  },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string | null; isActive: boolean; lastUsedAt: string | null; expiresAt: string | null; createdAt: string }>>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);

  const [externalKeys, setExternalKeys] = useState<Record<string, string>>({});
  const [externalKeyInputs, setExternalKeyInputs] = useState<Record<string, string>>({});
  const [savingExternal, setSavingExternal] = useState<string | null>(null);
  const [deletingExternal, setDeletingExternal] = useState<string | null>(null);
  const [externalLoaded, setExternalLoaded] = useState(false);

  const router = useRouter();

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (!data.profile) { router.push("/login"); return; }
      setProfile(data.profile);
      setName(data.profile.name ?? "");
    } catch { router.push("/login"); }
  }, [router]);

  const loadApiKeys = useCallback(async () => {
    try { const res = await fetch("/api/api-keys"); const data = await res.json(); setApiKeys(data.keys || []); } catch {}
  }, []);

  const loadExternalKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/user-settings");
      const data = await res.json();
      if (data.settings) {
        const keys: Record<string, string> = {};
        for (const s of data.settings) {
          keys[s.service] = s.keyPreview || "";
        }
        setExternalKeys(keys);
      }
    } catch {} finally {
      setExternalLoaded(true);
    }
  }, []);

  useEffect(() => { loadProfile(); loadApiKeys(); loadExternalKeys(); }, [loadProfile, loadApiKeys, loadExternalKeys]);

  const handleSave = async () => {
    setSaving(true);
    try { await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name || null }) }); setProfile((p) => (p ? { ...p, name: name || null } : p)); } finally { setSaving(false); }
  };

  const handleCreateKey = async () => {
    setCreatingKey(true);
    try { const res = await fetch("/api/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newKeyName || undefined }) }); const data = await res.json(); if (data.key) { setNewKeyValue(data.key.plaintext); setNewKeyName(""); loadApiKeys(); } } finally { setCreatingKey(false); }
  };

  const handleDeleteKey = async (keyId: string) => {
    setDeletingKeyId(keyId);
    try { await fetch("/api/api-keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyId }) }); setApiKeys((prev) => prev.filter((k) => k.id !== keyId)); } finally { setDeletingKeyId(null); }
  };

  const handleSaveExternalKey = async (service: string) => {
    const key = externalKeyInputs[service]?.trim();
    if (!key) return;
    setSavingExternal(service);
    try {
      const res = await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, apiKey: key }),
      });
      if (res.ok) {
        setExternalKeys((prev) => ({ ...prev, [service]: key.slice(0, 8) + "..." + key.slice(-4) }));
        setExternalKeyInputs((prev) => ({ ...prev, [service]: "" }));
      }
    } finally {
      setSavingExternal(null);
    }
  };

  const handleDeleteExternalKey = async (service: string) => {
    setDeletingExternal(service);
    try {
      await fetch("/api/user-settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      setExternalKeys((prev) => { const n = { ...prev }; delete n[service]; return n; });
    } finally {
      setDeletingExternal(null);
    }
  };

  if (!profile) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm";

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Settings</h1>
        </motion.div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="p-5 sm:p-6 rounded-2xl mb-5 bg-card border border-card-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
          <div className="space-y-4">
            <div><label className="block text-sm text-muted-foreground mb-1">Email</label><p className="text-foreground">{profile.email}</p></div>
            <div><label className="block text-sm text-muted-foreground mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} bg-input-bg border border-input-border`} /></div>
            <div><label className="block text-sm text-muted-foreground mb-1">Role</label><p className="text-foreground capitalize">{profile.role}</p></div>
            <div><label className="block text-sm text-muted-foreground mb-1">Plan</label><p className="text-foreground">{TIER_LABELS[profile.tier] || profile.tier}</p></div>
            {profile.createdAt && <div><label className="block text-sm text-muted-foreground mb-1">Member Since</label><p className="text-foreground">{new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></div>}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 disabled:opacity-50 transition-all text-sm font-medium">
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="p-5 sm:p-6 rounded-2xl mb-5 bg-card border border-card-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Subscription</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-foreground">Current Plan: <span className="font-semibold text-orange-500">{TIER_LABELS[profile.tier] || profile.tier}</span></p>
              <p className="text-sm text-muted-foreground mt-1">{profile.creditsRemaining} credits remaining</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUpgrade(true)} className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm">
              {profile.tier !== "free" ? "Change Plan" : "Upgrade Now"}
            </motion.button>
          </div>
        </motion.div>

        {/* External API Keys */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="p-5 sm:p-6 rounded-2xl mb-5 bg-card border border-card-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">External API Keys</h2>
          <p className="text-sm text-muted-foreground mb-5">Bring your own free API keys. Your keys are stored securely and only used for your requests.</p>

          <div className="space-y-4">
            {EXTERNAL_SERVICES.map((service) => {
              const saved = externalKeys[service.id];
              const inputVal = externalKeyInputs[service.id] || "";
              return (
                <div key={service.id} className="p-4 rounded-xl bg-input-bg border border-input-border">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                    </div>
                    {saved && (
                      <span className="px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded-full font-medium shrink-0">Active</span>
                    )}
                  </div>

                  {saved ? (
                    <div className="flex items-center gap-2 mt-3">
                      <code className="flex-1 px-3 py-2 text-xs font-mono text-muted-foreground rounded-lg bg-card">
                        {saved}
                      </code>
                      <a href={service.docsUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-xs text-muted-foreground hover:text-orange-500 transition-colors">
                        Docs
                      </a>
                      <button
                        onClick={() => handleDeleteExternalKey(service.id)}
                        disabled={deletingExternal === service.id}
                        className="px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deletingExternal === service.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="password"
                        value={inputVal}
                        onChange={(e) => setExternalKeyInputs((prev) => ({ ...prev, [service.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveExternalKey(service.id)}
                        placeholder={service.placeholder}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-card border border-card-border"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveExternalKey(service.id)}
                        disabled={savingExternal === service.id || !inputVal.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-all whitespace-nowrap"
                      >
                        {savingExternal === service.id ? "Saving..." : "Save Key"}
                      </motion.button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!externalLoaded && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </motion.div>

        {/* SiteSniper API Keys */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }} className="p-5 sm:p-6 rounded-2xl bg-card border border-card-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">SiteSniper API Keys</h2>
          <p className="text-sm text-muted-foreground mb-4">{profile.tier === "scale" ? "Manage API keys for programmatic access. Keys are shown once upon creation." : "API access is available on the Scale plan. Upgrade to get programmatic access to the SiteSniper API."}</p>
          {profile.tier === "scale" ? (
            <>
              <div className="flex gap-3 mb-4">
                <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name (optional)" className={`${inputCls} bg-input-bg border border-input-border`} />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateKey} disabled={creatingKey} className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all whitespace-nowrap">
                  {creatingKey ? "Creating..." : "Create Key"}
                </motion.button>
              </div>
              {newKeyValue && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-4">
                  <p className="text-sm text-green-500 font-medium mb-2">Key created! Copy this — it won&apos;t be shown again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-xs text-green-500 font-mono break-all">{newKeyValue}</code>
                    <button onClick={() => navigator.clipboard.writeText(newKeyValue)} className="px-3 py-2 bg-muted text-foreground text-xs rounded-lg hover:bg-muted/80 transition-all">Copy</button>
                  </div>
                  <button onClick={() => setNewKeyValue(null)} className="mt-2 text-xs text-muted-foreground hover:text-muted-foreground">Dismiss</button>
                </div>
              )}
              {apiKeys.length === 0 ? <p className="text-sm text-muted-foreground">No API keys yet.</p> : (
                <div className="space-y-2">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="p-3 rounded-xl flex items-center justify-between bg-input-bg border border-input-border">
                      <div>
                        <p className="text-sm text-foreground font-medium">{key.name || "Unnamed Key"}</p>
                        <p className="text-xs text-muted-foreground">Created {new Date(key.createdAt).toLocaleDateString()}{key.lastUsedAt && <> · Last used {new Date(key.lastUsedAt).toLocaleDateString()}</>}</p>
                      </div>
                      <button onClick={() => handleDeleteKey(key.id)} disabled={deletingKeyId === key.id} className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50">{deletingKeyId === key.id ? "Deleting..." : "Revoke"}</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-input-bg border border-input-border">
                <p className="text-xs text-muted-foreground mb-2">Example API usage:</p>
                <code className="text-sm font-mono text-muted-foreground break-all">POST /api/pipeline{"\n"}{`{ "domain": "example.com", "campaignId": "...", "senderName": "You" }`}</code>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setShowUpgrade(true)} className="w-full px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm">
                Upgrade to Scale for API Access
              </motion.button>
            </div>
          )}
        </motion.div>
        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    </main>
  );
}