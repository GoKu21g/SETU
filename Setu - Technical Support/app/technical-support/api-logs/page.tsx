"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Stethoscope,
  RefreshCw,
  Filter,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  Building2,
  Package,
  Layers,
  Globe,
  Flame,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Settings,
  Key,
  Box,
  ShieldAlert,
  Users,
  User,
  Radio,
  Activity,
  Sparkles,
  Terminal,
  FileCode,
  FileText,
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import UserAvatar from "@/components/shared/UserAvatar";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import { MOCK_TECHNICAL_LOGS, TechnicalLogRecord } from "@/lib/mock-data/logs-traces";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function statusPillClass(status: number) {
  if (status >= 500) return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]";
  if (status === 429) return "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]";
  if (status >= 400) return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]";
  return "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)]";
}

function formatLatency(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${ms} ms`;
}

function timeFromTimestamp(absTime: string, fallback: string): string {
  const match = absTime.match(/\d{2}:\d{2}:\d{2}/);
  return match ? match[0] : fallback;
}

function parseSecondsFromTimestamp(abs: string): number {
  const match = abs.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [, h, m, s] = match;
    return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10);
  }
  return 0;
}

type SortOption = "latest" | "oldest" | "latency" | "status";

const SORT_OPTIONS: { id: SortOption; label: string; sub: string }[] = [
  { id: "latest", label: "Latest", sub: "Most recent first" },
  { id: "oldest", label: "Oldest", sub: "Earliest first" },
  { id: "latency", label: "Highest Latency", sub: "Slowest requests first" },
  { id: "status", label: "Status (Errors first)", sub: "5xx & 4xx prioritized" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Data
// ─────────────────────────────────────────────────────────────────────────────
export type AuditEvent = {
  id: string;
  time: string;
  relativeTime: string;
  fullTimestamp: string;
  title: string;
  subtitle: string;
  scopeText: string;
  iconType: "settings" | "key" | "box" | "shield" | "users" | "layers" | "user";
  action: string;
  result: "Success" | "Failed";
  ipAddress: string;
  userAgent: string;
  traceId: string;
  requestId: string;
  actor: {
    name: string;
    email: string;
    initials: string;
  };
  affectedScope: {
    workspaceId: string;
    workspaceName: string;
    organisation: string;
    product: string;
    productSlug: string;
    service: string;
    integration: string;
    integrationSlug: string;
    environment: string;
  };
  relatedObjects: {
    workspace360: string;
    integration360: string;
    subscription360: string;
    user360: string;
  };
  description: string;
};

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt_8f29a7c1b3e4",
    time: "14:26:10",
    relativeTime: "2 mins ago",
    fullTimestamp: "28 Sep 2026, 14:26:10 IST",
    title: "Integration credential revalidated",
    subtitle: "Meta WABA Webhook Token (v2)",
    scopeText: "Sharma Traders · Chat with Sahayogi",
    iconType: "settings",
    action: "INTEGRATION_CREDENTIAL_REVALIDATED",
    result: "Success",
    ipAddress: "103.21.44.91",
    userAgent: "Mozilla/5.0 (Windows 10) ...",
    traceId: "trc_94812_01j8m4k",
    requestId: "req_7fa92k3",
    actor: {
      name: "Dhruv Singla",
      email: "dhruv.singla@setu.co",
      initials: "DS",
    },
    affectedScope: {
      workspaceId: "WS-94812",
      workspaceName: "Sharma Traders",
      organisation: "Sharma Traders Pvt. Ltd.",
      product: "Chat with Sahayogi",
      productSlug: "chat-with-sahayogi",
      service: "WhatsApp Integration",
      integration: "Meta WhatsApp (WABA)",
      integrationSlug: "meta-waba",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-94812",
      integration360: "WABA-001",
      subscription360: "SUB-7721",
      user360: "USR-6621",
    },
    description:
      "Meta WABA webhook token was revalidated successfully. New token is active and test webhook delivery succeeded.",
  },
  {
    id: "evt_9a41b2c8d5e1",
    time: "14:24:03",
    relativeTime: "4 mins ago",
    fullTimestamp: "28 Sep 2026, 14:24:03 IST",
    title: "User role updated",
    subtitle: "Support Engineer → Senior Support Engineer",
    scopeText: "Workspace: Sahayogi Internal",
    iconType: "key",
    action: "IAM_USER_ROLE_PROMOTED",
    result: "Success",
    ipAddress: "103.21.44.91",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36",
    traceId: "trc_10021_04p9x1z",
    requestId: "req_8ba31c4",
    actor: {
      name: "Priyanka Rao",
      email: "priyanka.rao@setu.co",
      initials: "PR",
    },
    affectedScope: {
      workspaceId: "WS-10021",
      workspaceName: "Sahayogi Internal",
      organisation: "Sahayogi Technologies Inc.",
      product: "Office Sahayogi",
      productSlug: "office-sahayogi",
      service: "Identity & Access",
      integration: "Microsoft Graph / 365 API",
      integrationSlug: "microsoft-365",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-10021",
      integration360: "IAM-004",
      subscription360: "SUB-1001",
      user360: "USR-9902",
    },
    description:
      "Role elevation executed under Maker-Checker approval policy. Senior Support Engineer permissions granted for incident triage.",
  },
  {
    id: "evt_7c12d9e4f6a8",
    time: "14:19:45",
    relativeTime: "8 mins ago",
    fullTimestamp: "28 Sep 2026, 14:19:45 IST",
    title: "VM provisioned",
    subtitle: "VPS Instance (srv-7812)",
    scopeText: "Kalyan Logistics · Sahayogi Cloud",
    iconType: "box",
    action: "INFRA_COMPUTE_VM_PROVISIONED",
    result: "Success",
    ipAddress: "157.240.239.35",
    userAgent: "Setu Terraform Provider/v2.4.1 (Linux x86_64)",
    traceId: "trc_55321_02m8k1a",
    requestId: "req_5bc71a9",
    actor: {
      name: "Amit Kumar",
      email: "amit.kumar@setu.co",
      initials: "AK",
    },
    affectedScope: {
      workspaceId: "WS-55321",
      workspaceName: "Kalyan Logistics",
      organisation: "Kalyan Logistics Corp.",
      product: "Sahayogi Cloud",
      productSlug: "sahayogi-cloud",
      service: "Compute Engine",
      integration: "GPU Cluster / Midjourney",
      integrationSlug: "midjourney",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-55321",
      integration360: "VM-7812",
      subscription360: "SUB-4412",
      user360: "USR-3310",
    },
    description:
      "Provisioning completed for isolated virtual compute unit srv-7812. Target network interfaces and disk attachments verified.",
  },
  {
    id: "evt_3b88e1a7c2d9",
    time: "14:17:22",
    relativeTime: "10 mins ago",
    fullTimestamp: "28 Sep 2026, 14:17:22 IST",
    title: "Login failed (invalid MFA)",
    subtitle: "User: rakesh@sharmatraders.in",
    scopeText: "Workspace: Sharma Traders",
    iconType: "shield",
    action: "AUTH_MFA_CHALLENGE_FAILED",
    result: "Failed",
    ipAddress: "49.36.128.14",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6) AppleWebKit/605.1.15",
    traceId: "trc_94812_09m1k2z",
    requestId: "req_2cd94e1",
    actor: {
      name: "Rakesh Sharma",
      email: "rakesh@sharmatraders.in",
      initials: "RS",
    },
    affectedScope: {
      workspaceId: "WS-94812",
      workspaceName: "Sharma Traders",
      organisation: "Sharma Traders Pvt. Ltd.",
      product: "Chat with Sahayogi",
      productSlug: "chat-with-sahayogi",
      service: "Authentication Gateway",
      integration: "Setu Core Ingress",
      integrationSlug: "default",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-94812",
      integration360: "SEC-009",
      subscription360: "SUB-7721",
      user360: "USR-4419",
    },
    description:
      "TOTP verification code mismatch detected. 3 consecutive failed attempts logged. Account temporarily locked for 15 minutes.",
  },
  {
    id: "evt_5d44a9c1e7b2",
    time: "14:14:03",
    relativeTime: "13 mins ago",
    fullTimestamp: "28 Sep 2026, 14:14:03 IST",
    title: "Workspace membership added",
    subtitle: "User: priya.rao@bharatagro.in",
    scopeText: "Workspace: Bharat Agro",
    iconType: "users",
    action: "WORKSPACE_MEMBER_INVITED",
    result: "Success",
    ipAddress: "103.21.44.91",
    userAgent: "Mozilla/5.0 (Windows 10) Chrome/128.0.0.0 Safari/537.36",
    traceId: "trc_76211_03n7j4k",
    requestId: "req_4de82b3",
    actor: {
      name: "Priyanka Rao",
      email: "priyanka.rao@setu.co",
      initials: "PR",
    },
    affectedScope: {
      workspaceId: "WS-76211",
      workspaceName: "Bharat Agro",
      organisation: "Bharat Agro Commodities Ltd.",
      product: "BoSS",
      productSlug: "boss",
      service: "Workspace Administration",
      integration: "GSTN / NIC Portal",
      integrationSlug: "nic-gst",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-76211",
      integration360: "ORG-002",
      subscription360: "SUB-6610",
      user360: "USR-7712",
    },
    description:
      "User priya.rao@bharatagro.in provisioned with Operator role for BoSS compliance workflows.",
  },
  {
    id: "evt_2e77b6d3a8c5",
    time: "14:10:28",
    relativeTime: "17 mins ago",
    fullTimestamp: "28 Sep 2026, 14:10:28 IST",
    title: "Subscription plan changed",
    subtitle: "Pro → Business (Chat with Sahayogi)",
    scopeText: "Workspace: Mehta & Co",
    iconType: "layers",
    action: "BILLING_SUBSCRIPTION_UPGRADED",
    result: "Success",
    ipAddress: "103.21.44.91",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36",
    traceId: "trc_66104_07l2k8x",
    requestId: "req_9fa14d2",
    actor: {
      name: "Riya Patel",
      email: "riya.patel@setu.co",
      initials: "RP",
    },
    affectedScope: {
      workspaceId: "WS-66104",
      workspaceName: "Mehta & Co",
      organisation: "Mehta & Co Enterprises",
      product: "Chat with Sahayogi",
      productSlug: "chat-with-sahayogi",
      service: "Billing & Subscriptions",
      integration: "Razorpay Core Gateway",
      integrationSlug: "razorpay",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-66104",
      integration360: "RZP-001",
      subscription360: "SUB-9941",
      user360: "USR-5521",
    },
    description:
      "Subscription plan upgraded to Business tier with 100,000 monthly WhatsApp conversation quota.",
  },
  {
    id: "evt_6a33c8e2f9d1",
    time: "14:05:11",
    relativeTime: "22 mins ago",
    fullTimestamp: "28 Sep 2026, 14:05:11 IST",
    title: "Webhook endpoint configuration updated",
    subtitle: "/v2/whatsapp/messages/webhook",
    scopeText: "Workspace: Sharma Traders",
    iconType: "settings",
    action: "INTEGRATION_ENDPOINT_UPDATED",
    result: "Success",
    ipAddress: "103.21.44.91",
    userAgent: "Mozilla/5.0 (Windows 10) Chrome/128.0.0.0 Safari/537.36",
    traceId: "trc_94812_05k9j3m",
    requestId: "req_3eb61f7",
    actor: {
      name: "Dhruv Singla",
      email: "dhruv.singla@setu.co",
      initials: "DS",
    },
    affectedScope: {
      workspaceId: "WS-94812",
      workspaceName: "Sharma Traders",
      organisation: "Sharma Traders Pvt. Ltd.",
      product: "Chat with Sahayogi",
      productSlug: "chat-with-sahayogi",
      service: "Webhook Delivery",
      integration: "Meta WhatsApp (WABA)",
      integrationSlug: "meta-waba",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-94812",
      integration360: "WABA-001",
      subscription360: "SUB-7721",
      user360: "USR-6621",
    },
    description:
      "Webhook target URL updated to high-throughput endpoint with HMAC validation filter enabled.",
  },
  {
    id: "evt_1f55d2b7e4a9",
    time: "13:58:42",
    relativeTime: "29 mins ago",
    fullTimestamp: "28 Sep 2026, 13:58:42 IST",
    title: "User login successful",
    subtitle: "User: neha@rajdhani.in",
    scopeText: "Workspace: Rajdhani Fleet",
    iconType: "user",
    action: "AUTH_USER_SESSION_ESTABLISHED",
    result: "Success",
    ipAddress: "14.139.241.82",
    userAgent: "Mozilla/5.0 (Windows 10) Chrome/128.0.0.0 Safari/537.36",
    traceId: "trc_88217_01k4m9p",
    requestId: "req_1ad92c5",
    actor: {
      name: "Neha Sharma",
      email: "neha@rajdhani.in",
      initials: "NS",
    },
    affectedScope: {
      workspaceId: "WS-88217",
      workspaceName: "Rajdhani Fleet",
      organisation: "Rajdhani Transport Corp.",
      product: "Studio Sahayogi",
      productSlug: "studio-sahayogi",
      service: "User Session",
      integration: "Setu Core Ingress",
      integrationSlug: "default",
      environment: "Production",
    },
    relatedObjects: {
      workspace360: "WS-88217",
      integration360: "AUTH-001",
      subscription360: "SUB-3319",
      user360: "USR-1182",
    },
    description:
      "Interactive web console session authenticated successfully via FIDO2 WebAuthn credential.",
  },
];



// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function LogsTracesPage() {
  const router = useRouter();

  // View mode: Technical vs Audit
  const [viewMode, setViewMode] = useState<"technical" | "audit">("technical");

  // Filters
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  // Selection
  const [selectedId, setSelectedId] = useState<string>(MOCK_TECHNICAL_LOGS[0].id);

  // Inspector tab
  const [tab, setTab] = useState<"overview" | "request" | "response" | "trace" | "timeline" | "related">("overview");

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Safe repair modal
  const [repairState, setRepairState] = useState<{
    open: boolean;
    repair: TechnicalLogRecord["safeRepairs"][0] | null;
    log: TechnicalLogRecord | null;
    reason: string;
    caseRef: string;
    confirmed: boolean;
    running: boolean;
    done: boolean;
  }>({
    open: false,
    repair: null,
    log: null,
    reason: "",
    caseRef: "",
    confirmed: false,
    running: false,
    done: false,
  });

  // Audit View State
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(MOCK_AUDIT_EVENTS);
  const [selectedAuditId, setSelectedAuditId] = useState<string>("evt_8f29a7c1b3e4");
  const [auditTab, setAuditTab] = useState<"details" | "json" | "related" | "timeline" | "actions" | "audit">("details");
  const [auditSortBy, setAuditSortBy] = useState<"latest" | "oldest" | "status">("latest");

  // Derived filter options
  const allProducts = useMemo(
    () => Array.from(new Set(MOCK_TECHNICAL_LOGS.map((l) => l.product))).sort(),
    []
  );

  const allServices = useMemo(
    () => Array.from(new Set(MOCK_TECHNICAL_LOGS.map((l) => l.service))).sort(),
    []
  );

  const productOptions = useMemo(
    () => [
      { value: "all", label: "All Products" },
      ...allProducts.map((p) => ({ value: p, label: p })),
    ],
    [allProducts]
  );

  const serviceOptions = useMemo(
    () => [
      { value: "all", label: "All Services" },
      ...allServices.map((s) => ({ value: s, label: s })),
    ],
    [allServices]
  );

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses", sub: "All response codes" },
    { value: "errors", label: "Errors (≥ 400)", sub: "4xx & 5xx responses" },
    { value: "2xx", label: "2xx Success", sub: "Successful requests" },
    { value: "4xx", label: "4xx Client Errors", sub: "Client validation / auth" },
    { value: "5xx", label: "5xx Server Errors", sub: "Server / upstream faults" },
  ];

  const envOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Environments", sub: "All deployment targets" },
    { value: "Production", label: "Production", sub: "Live customer traffic" },
    { value: "Staging", label: "Staging", sub: "Pre-release sandbox" },
  ];

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    const list = MOCK_TECHNICAL_LOGS.filter((log) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const haystack = [
          log.traceId,
          log.requestId,
          log.workspace.name,
          log.workspace.id,
          log.product,
          log.service,
          log.endpoint,
          log.operation,
          log.diagnostic.errorCode,
          log.diagnostic.problem,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (productFilter !== "all" && log.product !== productFilter) return false;
      if (serviceFilter !== "all" && log.service !== serviceFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "2xx" && (log.status < 200 || log.status >= 300)) return false;
        if (statusFilter === "4xx" && (log.status < 400 || log.status >= 500)) return false;
        if (statusFilter === "5xx" && log.status < 500) return false;
        if (statusFilter === "errors" && log.status < 400) return false;
      }
      if (envFilter !== "all" && log.environment !== envFilter) return false;
      return true;
    });

    // Apply sorting
    return list.sort((a, b) => {
      if (sortBy === "latest") {
        return parseSecondsFromTimestamp(b.absoluteTimestamp) - parseSecondsFromTimestamp(a.absoluteTimestamp);
      }
      if (sortBy === "oldest") {
        return parseSecondsFromTimestamp(a.absoluteTimestamp) - parseSecondsFromTimestamp(b.absoluteTimestamp);
      }
      if (sortBy === "latency") {
        return b.durationMs - a.durationMs;
      }
      if (sortBy === "status") {
        return b.status - a.status;
      }
      return 0;
    });
  }, [search, productFilter, serviceFilter, statusFilter, envFilter, sortBy]);

  const selectedLog = useMemo(
    () =>
      filteredLogs.find((l) => l.id === selectedId) ??
      filteredLogs[0] ??
      MOCK_TECHNICAL_LOGS[0],
    [filteredLogs, selectedId]
  );

  // Filtered Audit Events
  const filteredAuditEvents = useMemo(() => {
    return auditLogs
      .filter((evt) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            evt.id.toLowerCase().includes(q) ||
            evt.title.toLowerCase().includes(q) ||
            evt.subtitle.toLowerCase().includes(q) ||
            evt.action.toLowerCase().includes(q) ||
            evt.traceId.toLowerCase().includes(q) ||
            evt.requestId.toLowerCase().includes(q) ||
            evt.affectedScope.workspaceName.toLowerCase().includes(q) ||
            evt.affectedScope.workspaceId.toLowerCase().includes(q) ||
            evt.affectedScope.product.toLowerCase().includes(q) ||
            evt.actor.name.toLowerCase().includes(q) ||
            evt.actor.email.toLowerCase().includes(q);
          if (!matches) return false;
        }
        if (
          productFilter !== "all" &&
          evt.affectedScope.productSlug !== productFilter &&
          !evt.affectedScope.product.toLowerCase().includes(productFilter.toLowerCase())
        ) {
          return false;
        }
        if (statusFilter === "errors" && evt.result !== "Failed") {
          return false;
        }
        if (statusFilter === "2xx" && evt.result !== "Success") {
          return false;
        }
        if (envFilter !== "all" && evt.affectedScope.environment !== envFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (auditSortBy === "latest") return 0;
        if (auditSortBy === "oldest") return -1;
        if (auditSortBy === "status") {
          if (a.result === "Failed" && b.result !== "Failed") return -1;
          if (a.result !== "Failed" && b.result === "Failed") return 1;
        }
        return 0;
      });
  }, [auditLogs, search, productFilter, statusFilter, envFilter, auditSortBy]);

  const selectedAudit = useMemo(() => {
    return (
      filteredAuditEvents.find((e) => e.id === selectedAuditId) ??
      filteredAuditEvents[0] ??
      MOCK_AUDIT_EVENTS[0]
    );
  }, [filteredAuditEvents, selectedAuditId]);

  // Safe repair handler
  const runRepair = () => {
    if (!repairState.log || !repairState.repair) return;
    const log = repairState.log;
    const repair = repairState.repair;
    setRepairState((s) => ({ ...s, running: true }));
    setTimeout(() => {
      const entry: AuditEvent = {
        id: `evt_${Date.now().toString().slice(-8)}`,
        time: "Just now",
        relativeTime: "Just now",
        fullTimestamp: "Just now",
        title: `Safe Repair: ${repair.label}`,
        subtitle: repair.target,
        scopeText: `${log.workspace.name} · ${log.product}`,
        iconType: "settings",
        action: `SAFE_REPAIR_${repair.label.toUpperCase().replace(/\s+/g, "_")}`,
        result: "Success",
        ipAddress: "103.21.44.91",
        userAgent: "Setu Console / Safe Repair Worker",
        traceId: log.traceId,
        requestId: log.requestId,
        actor: {
          name: "Dhruv Singla",
          email: "dhruv.singla@setu.co",
          initials: "DS",
        },
        affectedScope: {
          workspaceName: log.workspace.name,
          workspaceId: log.workspace.id,
          organisation: `${log.workspace.name} Pvt. Ltd.`,
          product: log.product,
          productSlug: log.product.toLowerCase().replace(/\s+/g, "-"),
          service: log.service,
          integration: "Setu Integration Core",
          integrationSlug: "default",
          environment: log.environment,
        },
        relatedObjects: {
          workspace360: log.workspace.id,
          integration360: "CORE-01",
          subscription360: "SUB-AUTO",
          user360: "USR-DS01",
        },
        description: `Safe repair executed successfully: ${repair.expectedOutcome}. Reason: ${repairState.reason || "Manual Remediation"}.`,
      };
      setAuditLogs((prev) => [entry, ...prev]);
      setRepairState((s) => ({ ...s, running: false, done: true }));
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">

      {/* ─────────────────────────────────────────────────────────────────
          TOP BAR: Breadcrumb + View Toggle (Clean, no redundant duplicate controls)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-2 px-1 sm:px-2 mb-1">
        {/* Breadcrumb & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--text-muted)] font-normal">Technical Support</span>
            <span className="text-[var(--text-muted)]/60 font-light">&gt;</span>
            <span className="font-bold text-[var(--text-heading)]">Logs &amp; Traces</span>
          </div>

          <div className="flex items-center rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("technical")}
              className={`rounded-md px-2.5 py-0.5 font-medium transition-colors cursor-pointer ${
                viewMode === "technical"
                  ? "bg-[var(--surface)] text-[var(--text-heading)] shadow-xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              }`}
            >
              Technical
            </button>
            <button
              type="button"
              onClick={() => setViewMode("audit")}
              className={`rounded-md px-2.5 py-0.5 font-medium transition-colors cursor-pointer ${
                viewMode === "audit"
                  ? "bg-[var(--surface)] text-[var(--text-heading)] shadow-xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              }`}
            >
              Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          KPI METRICS ROW (RESPONSIVE: 2 cols on mobile, 3 on tablet, 6 on desktop)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* Card 1: Total Events */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3" style={{ boxShadow: "var(--card-shadow)" }}>
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Total Events</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">12.4K</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 12%
            </span>
          </div>
        </div>

        {/* Card 2: Errors */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "errors" ? "all" : "errors")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "errors" ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20" : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Errors</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">342</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 8%
            </span>
          </div>
        </button>

        {/* Card 3: 4xx (Client) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "4xx" ? "all" : "4xx")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "4xx" ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20" : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">4xx (Client)</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-warn)] leading-none">255</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 5%
            </span>
          </div>
        </button>

        {/* Card 4: 5xx (Server) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "5xx" ? "all" : "5xx")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "5xx" ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20" : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">5xx (Server)</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">87</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &darr; 22%
            </span>
          </div>
        </button>

        {/* Card 5: P95 Latency */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3" style={{ boxShadow: "var(--card-shadow)" }}>
          <p className="text-[11px] font-medium text-[var(--text-muted)]">P95 Latency</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-good)] leading-none">1.2 s</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 18%
            </span>
          </div>
        </div>

        {/* Card 6: Active Incidents (CRITICAL: NAVIGATES TO INCIDENTS TAB) */}
        <Link
          href="/technical-support/incidents"
          title="Open Incidents Workspace"
          className="group flex flex-col justify-between bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 transition-all hover:border-[var(--icon-btn-navy)] cursor-pointer"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Active Incidents</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--status-critical-fg)] leading-none">3</span>
            <span className="text-[var(--text-muted)] group-hover:text-[var(--icon-btn-navy)] group-hover:translate-x-1 transition-all text-sm font-bold">
              &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          FILTER BAR (RESPONSIVE FLEX-WRAP)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-1 sm:px-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]" />
          <input
            type="text"
            placeholder="Search by trace ID, workspace, endpoint, error code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 sm:py-2 pl-9 pr-3 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] shadow-xs outline-none focus:border-[var(--sidebar-active)]"
          />
        </div>

        {/* Filter Controls Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* All Products */}
          <FilterDropdown
            value={productFilter}
            onChange={setProductFilter}
            options={productOptions}
            placeholder="All Products"
            title="Filter by Product"
            searchable
            searchPlaceholder="Search product..."
            showClear
          />

          {/* All Services */}
          <FilterDropdown
            value={serviceFilter}
            onChange={setServiceFilter}
            options={serviceOptions}
            placeholder="All Services"
            title="Filter by Service"
            searchable
            searchPlaceholder="Search service..."
            showClear
          />

          {/* All Statuses */}
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All Statuses"
            title="Filter by Status"
            showClear
          />

          {/* All Environments */}
          <FilterDropdown
            value={envFilter}
            onChange={setEnvFilter}
            options={envOptions}
            placeholder="All Environments"
            title="Filter by Environment"
            className="hidden sm:inline-block"
            showClear
          />

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowMoreFilters((s) => !s)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border py-1.5 sm:py-2 px-2.5 sm:px-3 text-xs font-medium shadow-xs transition-colors cursor-pointer ${
              showMoreFilters
                ? "border-[var(--accent-solid)] bg-[var(--accent-solid)] text-white"
                : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--sidebar-active)] hover:bg-[var(--search-bg)]"
            }`}
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">More filters</span>
            <span className="sm:hidden">Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showMoreFilters && (
        <div className="mx-1 sm:mx-2 mb-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="font-semibold text-[var(--text-heading)]">Quick Filters:</span>
            {[
              { label: "Environment: Production", action: () => setEnvFilter("Production") },
              { label: "Environment: Staging", action: () => setEnvFilter("Staging") },
              { label: "Only Errors", action: () => setStatusFilter("errors") },
              { label: "Only Success", action: () => setStatusFilter("2xx") },
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={f.action}
                className="rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] cursor-pointer"
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setProductFilter("all");
                setServiceFilter("all");
                setStatusFilter("all");
                setEnvFilter("all");
              }}
              className="ml-auto text-[var(--icon-btn-navy)] font-medium hover:underline text-[11px] cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MAIN WORKSPACE: RESPONSIVE TWO-PANE LAYOUT
          - Stacks vertically on mobile/tablet (< lg)
          - Side-by-side with independent scroll on desktop (lg / xl)
      ────────────────────────────────────────────────────────────────── */}
      {viewMode === "technical" ? (
        <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">

          {/* ── Left Pane: Events List ───────────────────────────────────── */}
          <div className="w-full lg:w-[42%] xl:w-[440px] 2xl:w-[480px] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[420px] lg:max-h-none lg:h-[calc(100dvh-14rem)]" style={{ boxShadow: "var(--card-shadow)" }}>
            {/* Header with Working Sort-By Control */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
              <span className="text-sm font-bold text-[var(--text-heading)]">
                Events ({filteredLogs.length.toLocaleString()})
              </span>

              {/* Working Sort-by Dropdown matching Sahayogi Setu UI */}
              <FilterDropdown
                label="Sort by:"
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={SORT_OPTIONS.map((o) => ({
                  value: o.id,
                  label: o.label,
                  sub: o.sub,
                }))}
                placeholder="Latest"
                title="Sort Events"
                align="right"
              />
            </div>

            {/* Event Items */}
            <div className="flex-1 overflow-y-auto pt-2 space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[var(--text-muted)]">
                  <Filter size={20} className="mb-2 text-[var(--text-muted)]/50" />
                  No events match the selected filters
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = log.id === selectedLog.id;
                  const timeStr = timeFromTimestamp(log.absoluteTimestamp, log.timestamp);

                  return (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(log.id);
                        setTab("overview");
                      }}
                      className={`group relative flex w-full items-center justify-between rounded-xl p-2 sm:p-2.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--icon-chip-bg)] border border-[var(--sidebar-active)]/40 shadow-2xs"
                          : "border border-transparent hover:bg-[var(--search-bg)]"
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isSelected && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[var(--sidebar-active)] rounded-r" />
                      )}

                      {/* Content Container */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 pl-1">
                        {/* Column 1: Time */}
                        <div className="shrink-0 flex flex-col items-start w-14 sm:w-16">
                          <span className="font-mono text-[10.5px] sm:text-[11px] font-semibold text-[var(--text-secondary)]">
                            {timeStr}
                          </span>
                          <span className="text-[9.5px] sm:text-[10px] text-[var(--text-muted)] leading-tight">
                            {log.timestamp}
                          </span>
                        </div>

                        {/* Column 2: Status & Method */}
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] sm:text-[11px] font-bold leading-none ${statusPillClass(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                          <span className="rounded bg-[var(--surface-muted)] px-1 sm:px-1.5 py-0.5 font-mono text-[9.5px] sm:text-[10px] font-bold text-[var(--text-secondary)] leading-none">
                            {log.method}
                          </span>
                        </div>

                        {/* Column 3: Endpoint & Product/Workspace */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[11px] sm:text-[11.5px] font-bold text-[var(--text-heading)] leading-tight">
                            {log.endpoint}
                          </p>
                          <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 min-w-0">
                            {/* Official Sahayogi Brand Icon (Never WhatsApp) */}
                            <ProductIcon product={log.product} size={14} />
                            <span className="truncate text-[10.5px] sm:text-[11px] text-[var(--text-secondary)] font-medium">
                              {log.product}
                            </span>
                            <span className="text-[var(--divider)] text-[10px]">&middot;</span>
                            <span className="truncate text-[10.5px] sm:text-[11px] text-[var(--text-muted)]">
                              {log.workspace.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 4: Latency & Chevron */}
                      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 pl-1.5">
                        <span className="font-mono text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                          {formatLatency(log.durationMs)}
                        </span>
                        <ChevronRight
                          size={13}
                          className="text-[var(--text-muted)]/50 group-hover:text-[var(--text-secondary)] transition-colors"
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right Pane: Diagnostic Inspector ─────────────────────────── */}
          <div className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-14rem)]" style={{ boxShadow: "var(--card-shadow)" }}>
            {selectedLog ? (
              <div className="flex flex-col h-full overflow-y-auto">
                {/* 1. Header with Status, Classification, and Actions */}
                <div className="flex flex-wrap items-start justify-between gap-2.5 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-sm font-bold ${statusPillClass(
                        selectedLog.status
                      )}`}
                    >
                      {selectedLog.status}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-none">
                      {selectedLog.response.statusText || "Error"}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-critical-bg)] px-2.5 py-0.5 text-[10.5px] sm:text-[11px] font-medium text-[var(--status-critical-fg)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-critical-fg)]" />
                      {selectedLog.classification === "customer_specific"
                        ? "Customer-Specific"
                        : selectedLog.classification === "third_party_provider"
                        ? "Third-Party Provider"
                        : "Platform-Wide"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copy(selectedLog.traceId, "trace")}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-xs hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
                    >
                      {copiedKey === "trace" ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} className="text-[var(--text-muted)]" />
                      )}
                      <span className="hidden sm:inline">Copy Trace ID</span>
                      <span className="sm:hidden">Trace ID</span>
                    </button>

                    <Link
                      href={`/technical-support/diagnostics?target=${selectedLog.workspace.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 transition-colors cursor-pointer"
                    >
                      <Stethoscope size={12} />
                      <span className="hidden sm:inline">Run Diagnostics</span>
                      <span className="sm:hidden">Diagnostics</span>
                    </Link>
                  </div>
                </div>

                {/* 2. Method, Endpoint and Summary */}
                <div className="mt-2.5">
                  <p className="font-mono text-xs sm:text-sm font-bold text-[var(--text-heading)] break-all">
                    {selectedLog.method} &nbsp;{selectedLog.endpoint}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {selectedLog.diagnostic.problem}
                  </p>
                </div>

                {/* 3. Responsive 4-Column Metadata Grid (Workspace, Product, Service, Environment) */}
                <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5 sm:gap-4 py-3 sm:py-3.5 border-y border-[var(--divider)] my-3 sm:my-3.5">
                  {/* Workspace */}
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <Building2 size={11} />
                      Workspace
                    </div>
                    <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                      {selectedLog.workspace.name}
                    </p>
                    <p className="font-mono text-[10px] text-[var(--text-muted)]">
                      {selectedLog.workspace.id}
                    </p>
                  </div>

                  {/* Product (Strictly Sahayogi Logo Only, No WhatsApp) */}
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <Package size={11} />
                      Product
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                      <ProductIcon product={selectedLog.product} size={16} />
                      <p className="text-xs font-bold text-[var(--text-heading)] truncate">
                        {selectedLog.product}
                      </p>
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <Layers size={11} />
                      Service
                    </div>
                    <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                      {selectedLog.service}
                    </p>
                  </div>

                  {/* Environment */}
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <Globe size={11} />
                      Environment
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-healthy-fg)]" />
                      <p className="text-xs font-bold text-[var(--text-heading)]">
                        {selectedLog.environment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Responsive Technical Identifiers Row */}
                <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">Trace ID</span>
                    <span className="font-mono font-semibold text-[var(--text-secondary)] text-[10.5px] sm:text-[11px] truncate block">
                      {selectedLog.traceId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">Timestamp</span>
                    <span className="font-medium text-[var(--text-secondary)] text-[10.5px] sm:text-[11px] truncate block">
                      {selectedLog.absoluteTimestamp}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">Latency</span>
                    <span className="font-mono font-semibold text-[var(--text-secondary)] text-[10.5px] sm:text-[11px] block">
                      {formatLatency(selectedLog.durationMs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">Request ID</span>
                    <span className="font-mono font-semibold text-[var(--text-secondary)] text-[10.5px] sm:text-[11px] truncate block">
                      {selectedLog.requestId}
                    </span>
                  </div>
                </div>

                {/* 5. Diagnostic Summary Callout Card */}
                <div className="rounded-xl border border-[var(--status-critical-fg)]/20 bg-[var(--status-critical-bg)]/20 p-3 sm:p-4 my-3 sm:my-3.5">
                  <div className="flex items-center gap-1.5 text-[var(--status-critical-fg)] font-bold text-xs">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-critical-fg)] text-[10px] text-white font-black">
                      !
                    </span>
                    Diagnostic Summary
                  </div>
                  <p className="text-xs text-[var(--text-heading)] mt-1.5 leading-relaxed font-normal">
                    {selectedLog.diagnostic.detectedCause}
                  </p>
                  <div className="mt-3 pt-3 border-t border-[var(--divider)] grid grid-cols-1 screen-sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                        Error Code
                      </span>
                      <span className="font-mono font-bold text-[var(--text-heading)] text-[11px]">
                        {selectedLog.diagnostic.errorCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                        Failed Layer
                      </span>
                      <span className="font-medium text-[var(--text-secondary)] text-[11px]">
                        {selectedLog.diagnostic.failedLayer}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                        Confidence
                      </span>
                      <span className="inline-flex rounded bg-[var(--status-info-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-info-fg)]">
                        {selectedLog.diagnostic.confidence}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Tabs Header */}
                <div className="flex items-center gap-4 sm:gap-6 border-b border-[var(--divider)] text-xs font-semibold overflow-x-auto">
                  {(["overview", "request", "response", "trace", "timeline", "related"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`pb-2.5 capitalize transition-colors relative cursor-pointer shrink-0 ${
                        tab === t
                          ? "text-[var(--sidebar-active)] font-bold"
                          : "text-[var(--text-muted)] hover:text-[var(--text-heading)] font-medium"
                      }`}
                    >
                      {t === "trace" ? "Trace" : t}
                      {tab === t && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--sidebar-active)] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 7. Tab Content */}
                <div className="pt-3 flex-1">
                  {tab === "overview" && (
                    <div className="space-y-4">
                      {/* Impact Section Header */}
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2">Impact</h4>
                        <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2 sm:gap-2.5">
                          {/* 1. Similar errors */}
                          <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3" style={{ boxShadow: "var(--card-shadow)" }}>
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px] sm:text-[11px]">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]">
                                <Flame size={12} />
                              </span>
                              Similar errors
                            </div>
                            <p className="mt-1.5 text-base font-bold text-[var(--text-heading)] leading-none">
                              {selectedLog.impact.similarErrorsLastHour}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">in last 1 hour</p>
                          </div>

                          {/* 2. Affected workspaces */}
                          <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3" style={{ boxShadow: "var(--card-shadow)" }}>
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px] sm:text-[11px]">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--status-info-bg)] text-[var(--status-info-fg)]">
                                <Building2 size={12} />
                              </span>
                              Affected workspaces
                            </div>
                            <p className="mt-1.5 text-base font-bold text-[var(--text-heading)] leading-none">
                              {selectedLog.impact.affectedWorkspacesCount}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                              {selectedLog.workspace.name}
                            </p>
                          </div>

                          {/* 3. Active incident (CLICKABLE LINK TO INCIDENTS) */}
                          <Link
                            href="/technical-support/incidents?id=INC-10291"
                            title="View Incident Details"
                            className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 hover:border-[var(--status-critical-fg)] transition-all group block"
                            style={{ boxShadow: "var(--card-shadow)" }}
                          >
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px] sm:text-[11px]">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]">
                                <AlertTriangle size={12} />
                              </span>
                              Active incident
                            </div>
                            <p className="mt-1.5 text-xs font-bold text-[var(--status-critical-fg)] group-hover:underline leading-none">
                              {selectedLog.impact.linkedIncident?.id ?? "INC-10291"}
                            </p>
                            <p className="text-[10px] text-[var(--status-critical-fg)] font-medium mt-0.5">
                              {selectedLog.impact.linkedIncident?.status ?? "Investigating"}
                            </p>
                          </Link>

                          {/* 4. Last successful */}
                          <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3" style={{ boxShadow: "var(--card-shadow)" }}>
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px] sm:text-[11px]">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)]">
                                <CheckCircle2 size={12} />
                              </span>
                              Last successful
                            </div>
                            <p className="mt-1.5 text-xs font-bold text-[var(--text-heading)] leading-none">
                              {selectedLog.timeline[0]?.time ?? "27 Sep, 18:42"}
                            </p>
                            <p className="text-[10px] text-[var(--status-healthy-fg)] font-medium mt-0.5">
                              (200)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Evidence */}
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-heading)] mb-1.5">Evidence</h4>
                        <ul className="space-y-1">
                          {selectedLog.diagnostic.evidence.map((ev, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-muted)]" />
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended checks */}
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-heading)] mb-1.5">Recommended Next Steps</h4>
                        <ul className="space-y-1">
                          {selectedLog.diagnostic.recommendedChecks.map((chk, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--status-healthy-fg)]" />
                              <span>{chk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Related BoSS case */}
                      {selectedLog.impact.relatedBossCase && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-3">
                          <div>
                            <p className="text-xs font-bold text-[var(--text-heading)]">
                              Related BoSS Case — {selectedLog.impact.relatedBossCase.id}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {selectedLog.impact.relatedBossCase.title}
                            </p>
                          </div>
                          <a
                            href={selectedLog.impact.relatedBossCase.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--icon-btn-navy)] shadow-xs hover:bg-[var(--search-bg)]"
                          >
                            Open in BoSS <ExternalLink size={11} />
                          </a>
                        </div>
                      )}

                      {/* Safe Repairs */}
                      {selectedLog.safeRepairs.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2">
                            Safe Repair Operations ({selectedLog.safeRepairs.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedLog.safeRepairs.map((r) => (
                              <div
                                key={r.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[var(--sidebar-active)] transition-colors shadow-xs"
                              >
                                <div className="min-w-0 pr-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[var(--text-heading)]">{r.label}</span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                                        r.riskLevel === "safe"
                                          ? "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)]"
                                          : "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]"
                                      }`}
                                    >
                                      {r.riskLevel === "safe" ? "Safe" : "Requires Confirmation"}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-xs text-[var(--text-muted)] truncate">{r.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRepairState({
                                      open: true,
                                      repair: r,
                                      log: selectedLog,
                                      reason: "",
                                      caseRef: selectedLog.impact.relatedBossCase?.id ?? "",
                                      confirmed: false,
                                      running: false,
                                      done: false,
                                    })
                                  }
                                  className="shrink-0 self-start sm:self-auto rounded-xl bg-[var(--accent-solid)] px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-colors shadow-xs cursor-pointer"
                                >
                                  Execute
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === "request" && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide block mb-1">
                          Request URL
                        </span>
                        <div className="rounded-lg bg-[var(--surface-muted)] border border-[var(--divider)] p-2.5 font-mono text-[11px] text-[var(--text-heading)] break-all">
                          {selectedLog.request.url}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide block mb-1">
                          Headers
                        </span>
                        <pre className="rounded-lg bg-[var(--surface-muted)] border border-[var(--divider)] p-2.5 font-mono text-[11px] text-[var(--text-secondary)] overflow-x-auto">
                          {Object.entries(selectedLog.request.headers)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join("\n")}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide block mb-1">
                          Body Payload
                        </span>
                        <pre className="rounded-lg bg-[var(--surface-muted)] border border-[var(--divider)] p-2.5 font-mono text-[11px] text-[var(--status-healthy-fg)] overflow-x-auto max-h-56">
                          {typeof selectedLog.request.body === "string"
                            ? selectedLog.request.body
                            : JSON.stringify(selectedLog.request.body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {tab === "response" && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 font-mono text-sm font-bold ${statusPillClass(selectedLog.status)}`}>
                          {selectedLog.status}
                        </span>
                        <span className="font-semibold text-[var(--text-heading)]">{selectedLog.response.statusText}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide block mb-1">
                          Response Body
                        </span>
                        <pre className="rounded-lg bg-[var(--surface-muted)] border border-[var(--divider)] p-2.5 font-mono text-[11px] text-[var(--status-critical-fg)] overflow-x-auto max-h-56">
                          {typeof selectedLog.response.body === "string"
                            ? selectedLog.response.body
                            : JSON.stringify(selectedLog.response.body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {tab === "trace" && (
                    <div className="space-y-2 text-xs">
                      <p className="text-[var(--text-muted)] mb-2">
                        Trace waterfall execution path ({selectedLog.tracePath.spans.length} spans):
                      </p>
                      {selectedLog.tracePath.spans.map((sp, i) => (
                        <div
                          key={i}
                          className={`rounded-xl border p-2.5 shadow-xs ${
                            sp.status === "error"
                              ? "border-[var(--status-critical-fg)]/30 bg-[var(--status-critical-bg)]/20"
                              : "border-[var(--divider)] bg-[var(--surface)]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[var(--text-heading)]">{sp.name}</span>
                            <span className="font-mono text-[var(--text-secondary)] font-semibold">{sp.durationMs} ms</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)]">{sp.service}</p>
                          {sp.errorDetail && (
                            <p className="text-[11px] font-mono text-[var(--status-critical-fg)] mt-1 font-semibold">
                              &rarr; {sp.errorDetail}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "timeline" && (
                    <div className="relative pl-6 space-y-4 border-l-2 border-[var(--divider)] ml-2 text-xs">
                      {selectedLog.timeline.map((item, i) => (
                        <div key={i} className="relative">
                          <span
                            className={`absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
                              item.type === "error"
                                ? "bg-[var(--status-critical-fg)]"
                                : item.type === "retry"
                                ? "bg-[var(--status-warning-fg)]"
                                : "bg-[var(--status-healthy-fg)]"
                            }`}
                          />
                          <p className="font-mono text-[10px] text-[var(--text-muted)]">{item.time}</p>
                          <p className="font-bold text-[var(--text-heading)]">{item.title}</p>
                          <p className="text-[var(--text-muted)] text-[11px]">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "related" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-1">Workspace</span>
                        <Link
                          href={`/technical-support/workspaces?id=${selectedLog.workspace.id}`}
                          className="font-bold text-[var(--icon-btn-navy)] hover:underline"
                        >
                          {selectedLog.workspace.name} &rarr;
                        </Link>
                        <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">{selectedLog.workspace.id}</p>
                      </div>

                      <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-1">Product</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ProductIcon product={selectedLog.product} size={15} />
                          <span className="font-bold text-[var(--text-heading)]">{selectedLog.product}</span>
                        </div>
                      </div>

                      {selectedLog.impact.linkedIncident && (
                        <div className="rounded-xl border border-[var(--status-info-fg)]/20 bg-[var(--status-info-bg)]/20 p-3 sm:col-span-2">
                          <span className="text-[10px] font-bold uppercase text-[var(--status-info-fg)] block mb-1">Incident</span>
                          <Link
                            href={`/technical-support/incidents?id=${selectedLog.impact.linkedIncident.id}`}
                            className="font-bold text-[var(--status-info-fg)] hover:underline"
                          >
                            {selectedLog.impact.linkedIncident.id} &rarr;
                          </Link>
                          <p className="text-[11px] text-[var(--status-info-fg)]/80 mt-0.5">{selectedLog.impact.linkedIncident.title}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-[var(--text-muted)] py-12">
                Select an event from the list to inspect diagnostics
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Audit Trail View (Two-Pane Workspace Matching Target Mockup) ── */
        <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">

          {/* ── Left Pane: Audit Events List ──────────────────────────────── */}
          <div
            className="w-full lg:w-[45%] xl:w-[490px] 2xl:w-[530px] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[460px] lg:max-h-none lg:h-[calc(100dvh-14rem)]"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            {/* Header: Title + Sort By */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
              <span className="text-sm font-bold text-[var(--text-heading)]">
                Audit Events ({filteredAuditEvents.length.toLocaleString()})
              </span>

              {/* Working Sort-by Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span>Sort by:</span>
                <div className="relative">
                  <select
                    value={auditSortBy}
                    onChange={(e) => setAuditSortBy(e.target.value as "latest" | "oldest" | "status")}
                    aria-label="Sort audit events"
                    className="appearance-none rounded-lg border border-[var(--divider)] bg-[var(--surface)] py-1 pl-2.5 pr-6 text-xs font-semibold text-[var(--text-secondary)] shadow-2xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="status">Status</option>
                  </select>
                  <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>
              </div>
            </div>

            {/* Event Items List */}
            <div className="flex-1 overflow-y-auto pt-2 space-y-1.5">
              {filteredAuditEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[var(--text-muted)]">
                  <Filter size={20} className="mb-2 text-[var(--text-muted)]/50" />
                  No audit events match the selected filters
                </div>
              ) : (
                filteredAuditEvents.map((evt) => {
                  const isSelected = evt.id === selectedAudit.id;

                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => {
                        setSelectedAuditId(evt.id);
                        setAuditTab("details");
                      }}
                      className={`group relative flex w-full items-center justify-between rounded-xl p-2.5 sm:p-3 text-left transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#F4F8FF] dark:bg-[#0B1E38] border-[#0058DD]/50 shadow-2xs"
                          : "border-transparent hover:border-[var(--divider)] hover:bg-[var(--search-bg)]/40"
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isSelected && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#0058DD] rounded-r" />
                      )}

                      {/* Content Container */}
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 pl-1">
                        {/* Column 1: Time */}
                        <div className="shrink-0 flex flex-col items-start w-16 sm:w-18">
                          <span className="font-mono text-xs font-bold text-[var(--text-heading)] leading-tight">
                            {evt.time}
                          </span>
                          <span className="text-[10px] sm:text-[10.5px] text-[var(--text-muted)] mt-0.5 leading-tight">
                            {evt.relativeTime}
                          </span>
                        </div>

                        {/* Column 2: Event Icon */}
                        <span
                          className={`flex h-8.5 w-8.5 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${
                            evt.iconType === "settings"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                              : evt.iconType === "key"
                              ? "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300"
                              : evt.iconType === "box"
                              ? "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300"
                              : evt.iconType === "shield"
                              ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300"
                              : evt.iconType === "users"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                              : evt.iconType === "layers"
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {evt.iconType === "settings" && <Settings size={16} />}
                          {evt.iconType === "key" && <Key size={16} />}
                          {evt.iconType === "box" && <Box size={16} />}
                          {evt.iconType === "shield" && <ShieldAlert size={16} />}
                          {evt.iconType === "users" && <Users size={16} />}
                          {evt.iconType === "layers" && <Layers size={16} />}
                          {evt.iconType === "user" && <User size={16} />}
                        </span>

                        {/* Column 3: Event Details */}
                        <div className="min-w-0 flex-1 pl-1">
                          <p className="font-bold text-xs sm:text-[13px] text-[var(--text-heading)] leading-snug truncate">
                            {evt.title}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                            {evt.subtitle}
                          </p>
                          <p className="text-[10.5px] text-[var(--text-muted)]/80 truncate">
                            {evt.scopeText}
                          </p>
                        </div>
                      </div>

                      {/* Column 4: Status Pill & Chevron */}
                      <div className="flex shrink-0 items-center gap-2 pl-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold leading-none ${
                            evt.result === "Success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                          }`}
                        >
                          {evt.result}
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-[var(--text-muted)]/50 group-hover:text-[var(--text-secondary)] transition-colors"
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right Pane: Audit Inspector ──────────────────────────────── */}
          <div
            className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-14rem)]"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            {selectedAudit ? (
              <div className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* 1. Fixed Header with Icon, Title, Status, Subtitle, and Actions */}
                <div className="shrink-0 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--divider)] pb-3.5">
                  {/* Left: Icon + Title + Status + Subtitle */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
                        selectedAudit.iconType === "settings"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                          : selectedAudit.iconType === "key"
                          ? "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300"
                          : selectedAudit.iconType === "box"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300"
                          : selectedAudit.iconType === "shield"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300"
                          : selectedAudit.iconType === "users"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                          : selectedAudit.iconType === "layers"
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {selectedAudit.iconType === "settings" && <Settings size={20} />}
                      {selectedAudit.iconType === "key" && <Key size={20} />}
                      {selectedAudit.iconType === "box" && <Box size={20} />}
                      {selectedAudit.iconType === "shield" && <ShieldAlert size={20} />}
                      {selectedAudit.iconType === "users" && <Users size={20} />}
                      {selectedAudit.iconType === "layers" && <Layers size={20} />}
                      {selectedAudit.iconType === "user" && <User size={20} />}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-snug">
                          {selectedAudit.title}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${
                            selectedAudit.result === "Success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300"
                          }`}
                        >
                          {selectedAudit.result}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {selectedAudit.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Timestamp + Action Buttons */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-normal">
                      <span>{selectedAudit.fullTimestamp}</span>
                      <Sparkles size={12} className="opacity-60" />
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAuditTab(auditTab === "json" ? "details" : "json")}
                        className={`tap-pop flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                          auditTab === "json"
                            ? "border-[#0058DD] bg-[#EFF6FF] text-[#0058DD] dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-secondary)]"
                        }`}
                      >
                        <FileCode size={12} className={auditTab === "json" ? "text-[#0058DD]" : "text-[var(--text-muted)]"} />
                        <span>{auditTab === "json" ? "View Details" : "View Raw Log"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => copy(selectedAudit.id, "audit-id")}
                        className="tap-pop flex items-center gap-1.5 rounded-lg bg-[#0B1B3B] hover:bg-[#122B5E] text-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        {copiedKey === "audit-id" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>Copy Event ID</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Pinned Tabs Navigation: Details | JSON | Related | Timeline | Actions | Audit */}
                <div className="shrink-0 flex items-center gap-4 sm:gap-6 border-b border-[var(--divider)] text-xs font-semibold overflow-x-auto mt-2">
                  {(["details", "json", "related", "timeline", "actions", "audit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAuditTab(t)}
                      className={`pb-2.5 capitalize transition-colors relative cursor-pointer shrink-0 ${
                        auditTab === t
                          ? "text-[#0058DD] font-bold"
                          : "text-[var(--text-muted)] hover:text-[var(--text-heading)] font-medium"
                      }`}
                    >
                      {t === "json" ? "JSON" : t}
                      {auditTab === t && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0058DD] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 3. Scrollable Tab Contents */}
                <div className="flex-1 min-h-0 overflow-y-auto pt-3.5 text-xs pr-1">
                  {/* TAB 1: DETAILS */}
                  {auditTab === "details" && (
                    <div>
                      {/* Top 2-Column Grid: Event Details (Left) + Affected Scope & Related (Right) */}
                      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">

                        {/* LEFT COLUMN: Event Details */}
                        <div>
                          <h3 className="text-xs sm:text-[13px] font-bold text-[var(--text-heading)] mb-3">
                            Event Details
                          </h3>

                          <div className="grid grid-cols-[95px_1fr] items-center gap-y-2.5 text-xs">
                            <span className="text-[var(--text-muted)]">Event ID</span>
                            <span className="font-mono text-xs font-medium text-[var(--text-secondary)]">
                              {selectedAudit.id}
                            </span>

                            <span className="text-[var(--text-muted)]">Timestamp</span>
                            <span className="text-xs text-[var(--text-secondary)]">
                              {selectedAudit.fullTimestamp}
                            </span>

                            <span className="text-[var(--text-muted)]">Actor</span>
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                name={selectedAudit.actor.name}
                                initials={selectedAudit.actor.initials}
                                size={22}
                              />
                              <div>
                                <p className="font-semibold text-xs text-[var(--text-heading)] leading-tight">
                                  {selectedAudit.actor.email}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                                  {selectedAudit.actor.name}
                                </p>
                              </div>
                            </div>

                            <span className="text-[var(--text-muted)]">Action</span>
                            <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">
                              {selectedAudit.action}
                            </span>

                            <span className="text-[var(--text-muted)]">Result</span>
                            <div>
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.2 text-[10.5px] font-semibold ${
                                  selectedAudit.result === "Success"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    : "bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300"
                                }`}
                              >
                                {selectedAudit.result}
                              </span>
                            </div>

                            <span className="text-[var(--text-muted)]">IP Address</span>
                            <span className="font-mono text-xs text-[var(--text-secondary)]">
                              {selectedAudit.ipAddress}
                            </span>

                            <span className="text-[var(--text-muted)]">User Agent</span>
                            <span
                              className="text-xs text-[var(--text-secondary)] truncate max-w-[240px]"
                              title={selectedAudit.userAgent}
                            >
                              {selectedAudit.userAgent}
                            </span>

                            <span className="text-[var(--text-muted)]">Trace ID</span>
                            <Link
                              href={`/technical-support/api-logs?search=${selectedAudit.traceId}`}
                              className="font-mono text-xs text-[#0058DD] hover:underline"
                            >
                              {selectedAudit.traceId}
                            </Link>

                            <span className="text-[var(--text-muted)]">Request ID</span>
                            <Link
                              href={`/technical-support/api-logs?search=${selectedAudit.requestId}`}
                              className="inline-flex items-center gap-1 font-mono text-xs text-[#0058DD] hover:underline"
                            >
                              <span>{selectedAudit.requestId}</span>
                              <ExternalLink size={10} className="opacity-70" />
                            </Link>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Affected Scope & Related Objects */}
                        <div className="flex flex-col gap-4">
                          {/* Sub-block: Affected Scope */}
                          <div>
                            <h3 className="text-xs sm:text-[13px] font-bold text-[var(--text-heading)] mb-3">
                              Affected Scope
                            </h3>

                            <div className="grid grid-cols-[95px_1fr] items-center gap-y-2.5 text-xs">
                              <span className="text-[var(--text-muted)]">Workspace</span>
                              <Link
                                href={`/technical-support/workspaces?id=${selectedAudit.affectedScope.workspaceId}`}
                                className="inline-flex items-center gap-1 font-semibold text-[#0058DD] hover:underline"
                              >
                                <span>{selectedAudit.affectedScope.workspaceName} ({selectedAudit.affectedScope.workspaceId})</span>
                                <ExternalLink size={11} className="opacity-70" />
                              </Link>

                              <span className="text-[var(--text-muted)]">Organisation</span>
                              <span className="text-xs text-[var(--text-secondary)]">
                                {selectedAudit.affectedScope.organisation}
                              </span>

                              {/* Product: Strict Sahayogi Logo Requirement */}
                              <span className="text-[var(--text-muted)]">Product</span>
                              <div className="flex items-center gap-1.5">
                                <ProductIcon product={selectedAudit.affectedScope.productSlug} size={16} />
                                <Link
                                  href={`/technical-support/dashboard?product=${selectedAudit.affectedScope.productSlug}`}
                                  className="inline-flex items-center gap-1 font-semibold text-[#0058DD] hover:underline"
                                >
                                  <span>{selectedAudit.affectedScope.product}</span>
                                  <ExternalLink size={11} className="opacity-70" />
                                </Link>
                              </div>

                              <span className="text-[var(--text-muted)]">Service</span>
                              <Link
                                href={`/technical-support/api-logs?search=${encodeURIComponent(selectedAudit.affectedScope.service)}`}
                                className="inline-flex items-center gap-1 text-[#0058DD] hover:underline font-medium"
                              >
                                <span>{selectedAudit.affectedScope.service}</span>
                                <ExternalLink size={11} className="opacity-70" />
                              </Link>

                              <span className="text-[var(--text-muted)]">Integration</span>
                              <div className="flex items-center gap-1.5">
                                <IntegrationIcon integration={selectedAudit.affectedScope.integrationSlug} size={16} />
                                <Link
                                  href={`/technical-support/integrations`}
                                  className="inline-flex items-center gap-1 text-[#0058DD] hover:underline font-medium"
                                >
                                  <span>{selectedAudit.affectedScope.integration}</span>
                                  <ExternalLink size={11} className="opacity-70" />
                                </Link>
                              </div>

                              <span className="text-[var(--text-muted)]">Environment</span>
                              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                <span>{selectedAudit.affectedScope.environment}</span>
                              </div>
                            </div>
                          </div>

                          {/* Sub-block: Related Objects */}
                          <div className="pt-2">
                            <h3 className="text-xs sm:text-[13px] font-bold text-[var(--text-heading)] mb-2.5">
                              Related Objects
                            </h3>

                            <div className="flex flex-col gap-2">
                              <Link
                                href={`/technical-support/workspaces?id=${selectedAudit.relatedObjects.workspace360}`}
                                className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors"
                              >
                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                  <Radio size={12} className="text-[var(--text-muted)] shrink-0" />
                                  <span>Workspace 360</span>
                                </div>
                                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#0058DD] font-semibold hover:underline">
                                  {selectedAudit.relatedObjects.workspace360}
                                  <ExternalLink size={10} className="opacity-70" />
                                </span>
                              </Link>

                              <Link
                                href={`/technical-support/integrations`}
                                className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors"
                              >
                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                  <Activity size={12} className="text-[var(--text-muted)] shrink-0" />
                                  <span>Integration 360</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#0058DD] font-medium hover:underline">
                                  {selectedAudit.relatedObjects.integration360}
                                  <ExternalLink size={10} className="opacity-70" />
                                </span>
                              </Link>

                              <Link
                                href={`/technical-support/workspaces?tab=subscriptions&id=${selectedAudit.affectedScope.workspaceId}`}
                                className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors"
                              >
                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                  <Layers size={12} className="text-[var(--text-muted)] shrink-0" />
                                  <span>Subscription 360</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#0058DD] font-medium hover:underline">
                                  {selectedAudit.relatedObjects.subscription360}
                                  <ExternalLink size={10} className="opacity-70" />
                                </span>
                              </Link>

                              <Link
                                href={`/technical-support/workspaces?tab=members&id=${selectedAudit.affectedScope.workspaceId}`}
                                className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors"
                              >
                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                  <User size={12} className="text-[var(--text-muted)] shrink-0" />
                                  <span>User 360</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#0058DD] font-medium hover:underline">
                                  {selectedAudit.relatedObjects.user360}
                                  <ExternalLink size={10} className="opacity-70" />
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Full-Width Section: Description */}
                      <div className="mt-5 pt-4 border-t border-[var(--divider)]">
                        <h3 className="text-xs sm:text-[13px] font-bold text-[var(--text-heading)] mb-1.5">
                          Description
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {selectedAudit.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: JSON */}
                  {auditTab === "json" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--text-muted)] font-mono">
                          Raw Immutable Audit Record (Signed by Setu Ledger)
                        </p>
                        <button
                          type="button"
                          onClick={() => copy(JSON.stringify(selectedAudit, null, 2), "audit-json")}
                          className="tap-pop flex items-center gap-1 text-xs text-[#0058DD] font-semibold hover:underline cursor-pointer"
                        >
                          {copiedKey === "audit-json" ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedKey === "audit-json" ? "Copied" : "Copy JSON"}</span>
                        </button>
                      </div>
                      <pre className="rounded-xl border border-[var(--divider)] bg-[var(--search-bg)] p-3.5 font-mono text-[11px] text-[var(--text-heading)] overflow-x-auto max-h-[380px] leading-relaxed">
                        {JSON.stringify(
                          {
                            eventId: selectedAudit.id,
                            timestamp: selectedAudit.fullTimestamp,
                            actor: selectedAudit.actor,
                            action: selectedAudit.action,
                            result: selectedAudit.result,
                            ipAddress: selectedAudit.ipAddress,
                            userAgent: selectedAudit.userAgent,
                            traceId: selectedAudit.traceId,
                            requestId: selectedAudit.requestId,
                            affectedScope: selectedAudit.affectedScope,
                            relatedObjects: selectedAudit.relatedObjects,
                            description: selectedAudit.description,
                            ledgerSignature: "sha256_secp256k1_9b2e7fa89014...",
                            tamperProofStatus: "VERIFIED_VALID",
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}

                  {/* TAB 3: RELATED */}
                  {auditTab === "related" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <Link
                        href={`/technical-support/workspaces?id=${selectedAudit.affectedScope.workspaceId}`}
                        className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                          Workspace 360
                        </span>
                        <p className="font-bold text-[var(--text-heading)]">
                          {selectedAudit.affectedScope.workspaceName} &rarr;
                        </p>
                        <p className="font-mono text-[10.5px] text-[var(--text-muted)] mt-0.5">
                          {selectedAudit.affectedScope.workspaceId}
                        </p>
                      </Link>

                      <Link
                        href={`/technical-support/dashboard?product=${selectedAudit.affectedScope.productSlug}`}
                        className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                          Product 360
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ProductIcon product={selectedAudit.affectedScope.productSlug} size={15} />
                          <span className="font-bold text-[var(--text-heading)]">
                            {selectedAudit.affectedScope.product} &rarr;
                          </span>
                        </div>
                      </Link>

                      <Link
                        href={`/technical-support/integrations`}
                        className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                          Integration 360
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <IntegrationIcon integration={selectedAudit.affectedScope.integrationSlug} size={15} />
                          <span className="font-bold text-[var(--text-heading)]">
                            {selectedAudit.affectedScope.integration} &rarr;
                          </span>
                        </div>
                      </Link>

                      <Link
                        href={`/technical-support/api-logs?search=${selectedAudit.traceId}`}
                        className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                          Correlated Trace
                        </span>
                        <p className="font-mono text-[11px] font-bold text-[#0058DD] truncate">
                          {selectedAudit.traceId} &rarr;
                        </p>
                        <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                          Click to jump to telemetry stream
                        </p>
                      </Link>
                    </div>
                  )}

                  {/* TAB 4: TIMELINE */}
                  {auditTab === "timeline" && (
                    <div className="relative pl-5 border-l-2 border-[var(--divider)] ml-2 space-y-4">
                      <div className="relative">
                        <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] bg-blue-500 ring-2 ring-blue-100 dark:ring-blue-900" />
                        <p className="font-mono text-[10px] text-[var(--text-muted)]">Step 1 · Ingress Received</p>
                        <p className="font-bold text-[var(--text-heading)]">API Gateway Request Captured</p>
                        <p className="text-[var(--text-secondary)] text-[11px]">
                          Action payload signed with HMAC SHA-256 ingress token from {selectedAudit.ipAddress}.
                        </p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900" />
                        <p className="font-mono text-[10px] text-[var(--text-muted)]">Step 2 · Authentication &amp; RBAC</p>
                        <p className="font-bold text-[var(--text-heading)]">Operator Identity Verified</p>
                        <p className="text-[var(--text-secondary)] text-[11px]">
                          Authenticated as {selectedAudit.actor.email} via Setu Corporate IdP. Permission scope valid.
                        </p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900" />
                        <p className="font-mono text-[10px] text-[var(--text-muted)]">Step 3 · Execution</p>
                        <p className="font-bold text-[var(--text-heading)]">Mutation Committed to Cluster</p>
                        <p className="text-[var(--text-secondary)] text-[11px]">
                          {selectedAudit.description}
                        </p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-900" />
                        <p className="font-mono text-[10px] text-[var(--text-muted)]">Step 4 · Ledger Immutability</p>
                        <p className="font-bold text-[var(--text-heading)]">Signed into Audit Block</p>
                        <p className="text-[var(--text-secondary)] text-[11px]">
                          Block committed with SHA-256 seal. Tamper-evident cryptographic ledger updated.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: ACTIONS */}
                  {auditTab === "actions" && (
                    <div className="space-y-3">
                      <p className="text-[var(--text-muted)]">
                        Compliance and investigation operations available for this audit record.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => alert(`Cryptographic integrity verified for event ${selectedAudit.id}. Signature valid.`)}
                          className="tap-pop flex items-start gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 text-left hover:border-[#0058DD] cursor-pointer"
                        >
                          <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-[var(--text-heading)]">Verify Cryptographic Proof</p>
                            <p className="text-[11px] text-[var(--text-muted)]">Re-check SHA-256 signature against KMS seal.</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => alert(`Audit certificate downloaded for ${selectedAudit.id}.`)}
                          className="tap-pop flex items-start gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 text-left hover:border-[#0058DD] cursor-pointer"
                        >
                          <FileText size={16} className="text-[#0058DD] mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-[var(--text-heading)]">Export Compliance PDF</p>
                            <p className="text-[11px] text-[var(--text-muted)]">Generate auditor-ready timestamped summary.</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: AUDIT */}
                  {auditTab === "audit" && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40 p-3.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                          <h4 className="font-bold text-blue-950 dark:text-blue-200">
                            Immutable Setu Ledger Seal
                          </h4>
                        </div>
                        <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                          This entry is permanently etched into the Setu append-only audit trail according to the master architecture blueprint. Once recorded, entries cannot be mutated or purged by any role.
                        </p>
                      </div>

                      <div className="grid grid-cols-[120px_1fr] items-center gap-y-2 text-xs border border-[var(--divider)] rounded-xl p-3 bg-[var(--surface)]">
                        <span className="text-[var(--text-muted)]">Ledger Sequence</span>
                        <span className="font-mono text-xs text-[var(--text-heading)] font-semibold">#1,248,819</span>

                        <span className="text-[var(--text-muted)]">Block Hash</span>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)] truncate">
                          sha256:7f92a10b48c1e847d01829f04128ba7...
                        </span>

                        <span className="text-[var(--text-muted)]">KMS Key ID</span>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                          arn:aws:kms:ap-south-1:setu:audit-key-prod
                        </span>

                        <span className="text-[var(--text-muted)]">SLA Authority</span>
                        <span className="text-xs text-[var(--text-secondary)] font-medium">
                          BoSS Case Authority / Setu Telemetry Layer
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-[var(--text-muted)] py-12">
                Select an audit event from the list to inspect details
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SAFE REPAIR MODAL
      ────────────────────────────────────────────────────────────────── */}
      {repairState.open && repairState.repair && repairState.log && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] shadow-2xl border border-[var(--divider)] overflow-hidden">
            <div className="border-b border-[var(--divider)] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Authorised Safe Repair</p>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">{repairState.repair.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setRepairState((s) => ({ ...s, open: false }))}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)] text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {repairState.done ? (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <CheckCircle2 size={36} className="text-[var(--status-healthy-fg)]" />
                <p className="font-bold text-[var(--text-heading)]">Repair executed successfully.</p>
                <p className="text-xs text-[var(--text-muted)]">Operation recorded to immutable audit trail.</p>
                <button
                  type="button"
                  onClick={() => setRepairState((s) => ({ ...s, open: false }))}
                  className="rounded-xl bg-[var(--accent-solid)] px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110 cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-3 text-xs">
                <div className="rounded-xl bg-[var(--search-bg)] border border-[var(--divider)] p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Target</span>
                    <span className="font-semibold text-[var(--text-heading)]">{repairState.repair.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Workspace</span>
                    <span className="font-semibold text-[var(--text-heading)]">{repairState.log.workspace.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Expected Outcome</span>
                    <span className="font-semibold text-[var(--status-healthy-fg)] text-right max-w-[200px] truncate">
                      {repairState.repair.expectedOutcome}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-[var(--text-heading)]">
                    Reason / Justification <span className="text-[var(--status-critical-fg)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={repairState.reason}
                    onChange={(e) => setRepairState((s) => ({ ...s, reason: e.target.value }))}
                    placeholder="Enter support operator reason..."
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--sidebar-active)]"
                  />
                </div>

                <label className="flex items-start gap-2 rounded-xl border border-[var(--status-warning-fg)]/30 bg-[var(--status-warning-bg)]/30 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repairState.confirmed}
                    onChange={(e) => setRepairState((s) => ({ ...s, confirmed: e.target.checked }))}
                    className="mt-0.5 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-[var(--status-warning-fg)] leading-snug">
                    I confirm this repair is safe and understand it will be logged to the Setu immutable audit trail.
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRepairState((s) => ({ ...s, open: false }))}
                    className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--search-bg)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!repairState.confirmed || !repairState.reason || repairState.running}
                    onClick={runRepair}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold text-white ${
                      repairState.confirmed && repairState.reason && !repairState.running
                        ? "bg-[var(--accent-solid)] hover:brightness-110 cursor-pointer"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed"
                    }`}
                  >
                    {repairState.running && <RefreshCw size={12} className="animate-spin" />}
                    Authorise &amp; Execute
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
