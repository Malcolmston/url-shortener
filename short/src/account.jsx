import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faXmark, faCircleUser, faFile, faCircleCheck,
  faCloudArrowUp, faShield, faPen, faCheck, faKey, faEye, faEyeSlash,
  faTrash, faRotateLeft, faDesktop
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useCallback } from "react";
import AppShell from "./components/layout/AppShell";

// Storage key used throughout the app for theme persistence
const THEME_STORAGE_KEY = "snip-theme";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ── Tabs ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile",     label: "Profile",     icon: faCircleUser },
  { id: "security",    label: "Security",    icon: faShield },
  { id: "preferences", label: "Preferences", icon: faKey },
];

// ── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab({ userData, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: "", firstname: "", lastname: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userData) {
      setForm({ username: userData.username || "", firstname: userData.firstname || "", lastname: userData.lastname || "" });
    }
  }, [userData]);

  const handleSave = async () => {
    setLoading(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/change", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setIsEditing(false);
        if (onSaved) onSaved(data.user);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ username: userData?.username || "", firstname: userData?.firstname || "", lastname: userData?.lastname || "" });
    setIsEditing(false); setError(null);
  };

  const fields = [
    { name: "username",  label: "Username",   type: "text" },
    { name: "firstname", label: "First name",  type: "text" },
    { name: "lastname",  label: "Last name",   type: "text" },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon icon={faCircleUser} className="text-violet-500 dark:text-violet-400 text-3xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {userData?.firstname && userData?.lastname
              ? `${userData.firstname} ${userData.lastname}`
              : userData?.username || "User"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">@{userData?.username}</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-auto flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
          >
            <FontAwesomeIcon icon={faPen} className="w-3" />
            Edit
          </button>
        )}
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ name, label, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{label}</label>
            {isEditing ? (
              <input
                type={type}
                value={form[name]}
                onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
              />
            ) : (
              <p className="px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm text-gray-800 dark:text-slate-200 border border-transparent">
                {userData?.[name] || <span className="text-gray-400 dark:text-slate-500 italic">Not set</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-700 dark:text-red-400">
          <FontAwesomeIcon icon={faXmark} /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-sm text-emerald-700 dark:text-emerald-400">
          <FontAwesomeIcon icon={faCheck} /><span>Profile updated successfully</span>
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-60">
            {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Security Tab ───────────────────────────────────────────────────────────

function SecurityTab() {
  const [sessions, setSessions] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyResult, setNewKeyResult] = useState(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);

  useEffect(() => {
    fetch("/api/sessions").then((r) => r.json()).then((d) => setSessions(d.sessions || [])).catch(() => {}).finally(() => setLoadingSessions(false));
    fetch("/api/api-keys").then((r) => r.json()).then((d) => setApiKeys(d.keys || [])).catch(() => {}).finally(() => setLoadingKeys(false));
  }, []);

  const createKey = async () => {
    if (!newKeyLabel.trim()) return;
    setCreatingKey(true);
    try {
      const res = await fetch("/api/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: newKeyLabel }) });
      const data = await res.json();
      if (res.ok) {
        setNewKeyResult(data.key);
        setApiKeys((prev) => [data.key, ...prev]);
        setNewKeyLabel("");
        setShowNewKeyForm(false);
      }
    } catch {}
    finally { setCreatingKey(false); }
  };

  const revokeKey = async (id) => {
    await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const revokeSession = async (id) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const revokeOthers = async () => {
    await fetch("/api/sessions/revoke-others", { method: "POST" });
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  return (
    <div className="space-y-8">
      {/* API Keys */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">API Keys</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Access Snip via the REST API</p>
          </div>
          <button
            onClick={() => setShowNewKeyForm((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faKey} className="w-3" />
            New key
          </button>
        </div>

        {showNewKeyForm && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              placeholder="Key label (e.g. CI/CD)"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              autoFocus
            />
            <button onClick={createKey} disabled={creatingKey || !newKeyLabel.trim()} className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors">
              {creatingKey ? "Creating…" : "Create"}
            </button>
          </div>
        )}

        {newKeyResult && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">⚠ Copy this key — it won't be shown again</p>
            <code className="block text-xs font-mono bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-amber-900 dark:text-amber-200 break-all select-all">
              {newKeyResult.rawKey}
            </code>
            <button onClick={() => setNewKeyResult(null)} className="mt-3 text-xs text-amber-600 dark:text-amber-400 hover:underline">I've copied it, dismiss</button>
          </div>
        )}

        {loadingKeys ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}</div>
        ) : apiKeys.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">No API keys yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <FontAwesomeIcon icon={faKey} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{key.label}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{key.keyPrefix}… · Created {formatDate(key.createdAt)}</p>
                </div>
                <button onClick={() => revokeKey(key.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors" aria-label="Revoke key">
                  <FontAwesomeIcon icon={faTrash} className="w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Active Sessions</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Devices signed into your account</p>
          </div>
          {sessions.filter((s) => !s.isCurrent).length > 0 && (
            <button onClick={revokeOthers} className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 font-medium transition-colors">
              Sign out others
            </button>
          )}
        </div>

        {loadingSessions ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}</div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">No active sessions.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <FontAwesomeIcon icon={faDesktop} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                    {session.isCurrent && <span className="mr-1.5 text-xs bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full">Current</span>}
                    {session.ipAddress || "Unknown IP"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{session.userAgent?.substring(0, 80) || "Unknown browser"}</p>
                </div>
                {!session.isCurrent && (
                  <button onClick={() => revokeSession(session.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors" aria-label="Revoke session">
                    <FontAwesomeIcon icon={faXmark} className="w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Preferences Tab ────────────────────────────────────────────────────────

function PreferencesTab() {
  const [theme, setTheme] = useState(() => {
    // Prefer persisted value; fall back to current DOM attribute
    if (typeof window !== "undefined") {
      return localStorage.getItem(THEME_STORAGE_KEY)
        || document.documentElement.getAttribute("data-theme")
        || "light";
    }
    return "light";
  });
  const [defaultVisibility, setDefaultVisibility] = useState("public");

  const applyTheme = useCallback((t) => {
    setTheme(t);
    // Update the data-theme attribute (used by [data-theme="dark"] CSS rules)
    document.documentElement.setAttribute("data-theme", t);
    // Toggle the `dark` class required by Tailwind's `dark:` variant
    document.documentElement.classList.toggle("dark", t === "dark");
    // Persist with the canonical key
    localStorage.setItem(THEME_STORAGE_KEY, t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-3">Appearance</h3>
        <div className="grid grid-cols-2 gap-3">
          {["light", "dark"].map((t) => (
            <button
              key={t}
              onClick={() => applyTheme(t)}
              className={[
                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                theme === t
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                  : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600",
              ].join(" ")}
            >
              <div className={["w-full h-16 rounded-lg", t === "dark" ? "bg-slate-900 border border-slate-700" : "bg-white border border-gray-200"].join(" ")} />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300 capitalize">{t}</span>
              {theme === t && <FontAwesomeIcon icon={faCheck} className="text-violet-500 w-3 absolute" />}
            </button>
          ))}
        </div>
      </div>

      {/* Default file visibility */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">Default file visibility</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">New uploads will default to this visibility setting</p>
        <div className="flex gap-3">
          {["public", "private"].map((v) => (
            <button
              key={v}
              onClick={() => setDefaultVisibility(v)}
              className={[
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-all capitalize",
                defaultVisibility === v
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400"
                  : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600",
              ].join(" ")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Account Page ──────────────────────────────────────────────────────

export default function Account() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Initialise from ?tab= query param so direct links work (e.g. /account?tab=security)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "profile";
    const tab = new URLSearchParams(window.location.search).get("tab");
    return TABS.some((t) => t.id === tab) ? tab : "profile";
  });

  useEffect(() => {
    fetch("/user")
      .then((r) => r.json())
      .then((data) => setUserData(data))
      .catch(() => setError("Failed to load account data"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500 dark:text-slate-400">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-violet-500" size="lg" />
          <span className="text-sm">Loading account…</span>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-700 dark:text-red-400">
          <FontAwesomeIcon icon={faXmark} />
          <span>{error}</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Account Settings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage your profile, security, and preferences</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: faFile, label: "Files", value: userData?.files?.length ?? 0, color: "violet" },
            { icon: faCircleCheck, label: "Member since", value: formatDate(userData?.createdAt), color: "emerald" },
            { icon: faCloudArrowUp, label: "Last updated", value: formatDate(userData?.updatedAt), color: "blue" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className={`text-center p-4 rounded-xl bg-${color}-50 dark:bg-${color}-950/20`}>
              <FontAwesomeIcon icon={icon} className={`text-${color}-500 dark:text-${color}-400 mb-2`} />
              <p className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Tab card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-slate-800">
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  // Keep URL in sync without triggering a navigation
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", id);
                  window.history.replaceState(null, "", url.toString());
                }}
                className={[
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors",
                  activeTab === id
                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200",
                ].join(" ")}
              >
                <FontAwesomeIcon icon={icon} className="w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "profile" && <ProfileTab userData={userData} onSaved={(u) => setUserData(u)} />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "preferences" && <PreferencesTab />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
