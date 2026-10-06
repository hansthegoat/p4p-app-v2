import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  fetchAllOrgsWithStats,
  fetchPlatformStats,
  createOrgWithHR,
  type OrgWithStats,
  type PlatformStats,
} from "@/lib/p4p/admin-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import {
  Building2, Users, Activity, CheckCircle2, ChevronRight,
  Plus, X, Copy, Check,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<OrgWithStats[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [orgList, platformStats] = await Promise.all([
        fetchAllOrgsWithStats(),
        fetchPlatformStats(),
      ]);
      setOrgs(orgList);
      setStats(platformStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All organizations on the P4P platform.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-violet-600 hover:bg-violet-500 text-white"
        >
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBlock
            icon={<Building2 className="h-4 w-4" />}
            label="Total Organizations"
            value={stats.totalOrgs}
            accent="violet"
          />
          <StatBlock
            icon={<Activity className="h-4 w-4" />}
            label="Active Organizations"
            value={stats.totalActiveOrgs}
            accent="emerald"
          />
          <StatBlock
            icon={<Users className="h-4 w-4" />}
            label="Total Employees"
            value={stats.totalEmployees}
            accent="blue"
          />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Organizations
        </h2>
        {orgs.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title="No organizations yet"
              description="Click 'Create Organization' to onboard your first tenant."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => (
              <Card
                key={org.id}
                onClick={() => navigate({ to: `/admin/tenants/${org.id}` })}
                className="hover:border-violet-500/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">
                          {org.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] h-5 font-mono">
                          {org.slug}
                        </Badge>
                        {org.is_active ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {new Date(org.created_at).toLocaleDateString()}
                        {" · "}
                        <span className="font-mono">{org.id.slice(0, 8)}…</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                        Employees
                      </div>
                      <div className="text-lg font-bold text-foreground mt-0.5">
                        {org.employee_count}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateOrgModal
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            await load();
          }}
        />
      )}
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: "violet" | "emerald" | "blue";
}) {
  const colorMap = {
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-600",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-600",
  };
  return (
    <Card className="p-5">
      <div className={`w-9 h-9 rounded-lg ${colorMap[accent]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
    </Card>
  );
}

function CreateOrgModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [hrName, setHrName] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ inviteUrl: string; inviteCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleNameChange = (v: string) => {
    setOrgName(v);
    // Auto-fill slug from name if user hasn't typed a custom one
    if (!slug || slug === orgName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = async () => {
    if (!orgName.trim()) return showToast.error("Missing name", "Organization name is required.");
    if (!slug.trim()) return showToast.error("Missing slug", "URL slug is required.");
    if (!hrName.trim()) return showToast.error("Missing HR name", "First HR's name is required.");
    if (!hrEmail.trim()) return showToast.error("Missing HR email", "First HR's email is required.");

    setSaving(true);
    try {
      const res = await createOrgWithHR({ orgName, slug, hrName, hrEmail });
      setResult({ inviteUrl: res.inviteUrl, inviteCode: res.inviteCode });
      showToast.success("Organization created", "Copy the invite link below.");
    } catch (err: any) {
      showToast.error("Could not create org", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = result.inviteUrl;
    try {
      // Modern API (requires HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for HTTP / network IP — works in all browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      showToast.success("Copied", "Invite link in your clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Copy failed", "Select and copy manually.");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {result ? "Organization created" : "Create organization"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {result
                  ? "Send the invite link below to the HR."
                  : "Set up a new tenant and its first HR."}
              </p>
            </div>
            <button
              onClick={async () => {
                if (result) await onCreated();
                onClose();
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!result ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Organization name</Label>
                <Input
                  value={orgName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Ltd"
                  className="mt-1.5"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs">URL slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="acme"
                  className="mt-1.5 font-mono"
                />
                <p className="text-[10.5px] text-muted-foreground mt-1">
                  Used in URLs and search. Lowercase, dashes only.
                </p>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  First HR (Head of Department)
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Full name</Label>
                    <Input
                      value={hrName}
                      onChange={(e) => setHrName(e.target.value)}
                      placeholder="Jane Doe"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Work email</Label>
                    <Input
                      type="email"
                      value={hrEmail}
                      onChange={(e) => setHrEmail(e.target.value)}
                      placeholder="jane@acme.com"
                      className="mt-1.5"
                    />
                    <p className="text-[10.5px] text-muted-foreground mt-1">
                      They'll sign up with this email using the invite link.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} disabled={saving} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
                >
                  {saving ? "Creating..." : "Create organization"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[12.5px] text-emerald-800 dark:text-emerald-300">
                  Organization and HR row created. Send this link so the HR can
                  complete their signup.
                </div>
              </div>

              <div>
                <Label className="text-xs">Invite link</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={result.inviteUrl}
                    readOnly
                    className="font-mono text-[11.5px]"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="gap-1.5 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-1">
                  Invite code: <span className="font-mono text-foreground">{result.inviteCode}</span>
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    await onCreated();
                    onClose();
                  }}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>,
    document.body
  );
}