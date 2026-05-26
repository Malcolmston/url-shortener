'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';

interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  isCurrent: boolean;
  lastActivityAt: string;
  createdAt: string;
}

export default function AccountPage() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState({ firstname: '', lastname: '', username: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Load profile
  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.user) {
        setProfile({ firstname: d.user.firstname, lastname: d.user.lastname, username: d.user.username });
        setProfileFetched(true);
      }
    });
  }, []);

  // Load API keys
  useEffect(() => {
    fetch('/api/api-keys').then((r) => r.json()).then((d) => {
      if (d.apiKeys) setApiKeys(d.apiKeys);
    }).finally(() => setKeysLoading(false));
  }, []);

  // Load sessions
  useEffect(() => {
    fetch('/api/sessions').then((r) => r.json()).then((d) => {
      if (d.sessions) setSessions(d.sessions);
    }).finally(() => setSessionsLoading(false));
  }, []);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Profile updated', 'success');
      } else {
        addToast(data.message ?? 'Update failed', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateKey = async (e: FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedKey(data.plainKey);
        setApiKeys((prev) => [data.apiKey, ...prev]);
        setNewKeyName('');
        addToast('API key created', 'success');
      } else {
        addToast(data.message ?? 'Failed to create key', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleDeleteKey = async (id: number) => {
    try {
      await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      addToast('API key revoked', 'success');
    } catch {
      addToast('Failed to revoke key', 'error');
    }
  };

  const handleRevokeOthers = async () => {
    try {
      await fetch('/api/sessions/revoke-others', { method: 'POST' });
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      addToast('Other sessions revoked', 'success');
    } catch {
      addToast('Failed to revoke sessions', 'error');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your profile, API keys, and sessions.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">Profile</h2>
        </CardHeader>
        <CardBody>
          {!profileFetched ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  value={profile.firstname}
                  onChange={(e) => setProfile((p) => ({ ...p, firstname: e.target.value }))}
                />
                <Input
                  label="Last name"
                  value={profile.lastname}
                  onChange={(e) => setProfile((p) => ({ ...p, lastname: e.target.value }))}
                />
              </div>
              <Input
                label="Username"
                value={profile.username}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
              />
              <Button type="submit" loading={profileLoading}>Save changes</Button>
            </form>
          )}
        </CardBody>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">API keys</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {createdKey && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                Copy your key now — it won&apos;t be shown again:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-700 rounded-lg px-3 py-2 font-mono break-all">
                  {createdKey}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(createdKey);
                    addToast('Copied!', 'success');
                  }}
                >
                  Copy
                </Button>
              </div>
              <button onClick={() => setCreatedKey(null)} className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                I&apos;ve saved it
              </button>
            </div>
          )}

          <form onSubmit={handleCreateKey} className="flex gap-2">
            <Input
              placeholder="Key name (e.g. CI/CD)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button type="submit" className="flex-shrink-0">Create</Button>
          </form>

          {keysLoading ? <Spinner /> : apiKeys.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No API keys yet.</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{key.keyPrefix}…</p>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline flex-shrink-0"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Active sessions</h2>
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <button onClick={handleRevokeOthers} className="text-xs text-red-600 dark:text-red-400 hover:underline">
                Revoke all others
              </button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {sessionsLoading ? <Spinner /> : sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No active sessions.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {session.userAgent ? session.userAgent.slice(0, 60) : 'Unknown browser'}
                      </p>
                      {session.isCurrent && <Badge variant="success">Current</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {session.ipAddress ?? 'Unknown IP'} · Last active {new Date(session.lastActivityAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
