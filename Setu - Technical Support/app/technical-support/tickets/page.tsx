"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Layers,
  Terminal,
  User,
  Ticket as TicketIcon,
  Activity,
  Zap,
  RefreshCw,
  Play,
  ShieldAlert,
  Building2,
  Sparkles,
  Stethoscope,
  RotateCw,
  CheckCheck,
  KeyRound,
  ShieldCheck,
  Briefcase,
  Radio,
  FileCode,
  X,
  MoreHorizontal,
  ArrowUpRight,
  CornerDownRight,
  Shield,
} from "lucide-react";
import ProductIcon, { SAHAYOGI_PRODUCTS_MAP } from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import UserAvatar from "@/components/shared/UserAvatar";
import {
  INITIAL_TICKETS,
  type Ticket,
  type TicketType,
  type TicketPriority,
  type TicketStatus,
  type TechnicalChainNode,
} from "@/lib/mock-data/tickets";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Styling Constants
// ─────────────────────────────────────────────────────────────────────────────

type SegmentFilter = "all" | "user_request" | "technical_case" | "platform_incident" | "needs_action";

type TabType = "details" | "timeline" | "related" | "actions" | "audit";

const TYPE_CONFIG: Record<TicketType, { label: string; badgeClass: string }> = {
  user_request: {
    label: "User Request",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
  },
  technical_case: {
    label: "Technical Case",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40",
  },
  platform_incident: {
    label: "Platform Incident",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
  },
  integration_failure: {
    label: "Integration Failure",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
  },
  provisioning_failure: {
    label: "Provisioning Failure",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
  },
  access_security: {
    label: "Access / Security",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  },
  billing_commercial: {
    label: "Billing / Commercial",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/40",
  },
  compliance: {
    label: "Compliance",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40",
  },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; badgeClass: string }> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-red-50 text-red-700 border border-red-200/70 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/50 font-medium",
  },
  high: {
    label: "High",
    badgeClass: "bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40 font-medium",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40 font-medium",
  },
  low: {
    label: "Low",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40 font-medium",
  },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; badgeClass: string; dotClass: string }> = {
  open: {
    label: "Open",
    badgeClass: "bg-red-50/80 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/40",
    dotClass: "bg-red-600",
  },
  investigating: {
    label: "Investigating",
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40",
    dotClass: "bg-blue-600",
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
    dotClass: "bg-amber-600",
  },
  waiting_customer: {
    label: "Waiting on Customer",
    badgeClass: "bg-amber-50/70 text-amber-800 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
    dotClass: "bg-amber-500",
  },
  waiting_provider: {
    label: "Waiting on Provider",
    badgeClass: "bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40",
    dotClass: "bg-purple-600",
  },
  mitigating: {
    label: "Mitigating",
    badgeClass: "bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
    dotClass: "bg-amber-600 animate-pulse",
  },
  resolved: {
    label: "Resolved",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40",
    dotClass: "bg-emerald-600",
  },
  closed: {
    label: "Closed",
    badgeClass: "bg-gray-100 text-gray-700 border border-gray-200/80 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    dotClass: "bg-gray-500",
  },
  retrying: {
    label: "Retrying",
    badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/40",
    dotClass: "bg-indigo-600 animate-pulse",
  },
  approval_pending: {
    label: "Approval Pending",
    badgeClass: "bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40",
    dotClass: "bg-purple-600",
  },
  partially_resolved: {
    label: "Partially Resolved",
    badgeClass: "bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/40",
    dotClass: "bg-teal-600",
  },
};

const MONITORED_WORKSPACES = [
  { id: "WS-94812", name: "Sharma Traders" },
  { id: "WS-76211", name: "Sharma Traders (Sub)" },
  { id: "WS-66104", name: "Bharat Agro" },
  { id: "WS-55321", name: "Kalyan Logistics" },
  { id: "WS-77432", name: "Rajdhani Fleet" },
  { id: "WS-88217", name: "Zenith Media" },
  { id: "WS-33910", name: "Vanguard Labs" },
  { id: "WS-10842", name: "Apex Engineering" },
];

export default function SupportCasesPage() {
  const router = useRouter();

  // Primary dataset & selection
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(INITIAL_TICKETS[0].id);

  // Segmented top filter: All | User Requests | Technical Cases | Platform Incidents | Needs Action
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");

  // Secondary filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "priority" | "status">("latest");

  // Inspector active tab
  const [inspectorTab, setInspectorTab] = useState<TabType>("details");

  // Interactive feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [diagnosticState, setDiagnosticState] = useState<{
    running: boolean;
    executed: boolean;
    result: "success" | "failure" | null;
    message: string;
  }>({
    running: false,
    executed: false,
    result: null,
    message: "",
  });

  // Safe action / Maker-Checker approval modal
  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    actionLabel: string;
    description: string;
    reason: string;
    submitting: boolean;
  }>({
    open: false,
    actionLabel: "",
    description: "",
    reason: "",
    submitting: false,
  });

  // Create Case Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<TicketType>("technical_case");
  const [newProductSlug, setNewProductSlug] = useState("chat-with-sahayogi");
  const [newWorkspaceId, setNewWorkspaceId] = useState(MONITORED_WORKSPACES[0].id);
  const [newService, setNewService] = useState("Webhook Delivery");
  const [newPriority, setNewPriority] = useState<TicketPriority>("high");
  const [newDescription, setNewDescription] = useState("");

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Live Counts for Segmented Control
  const counts = useMemo(() => {
    const all = tickets.length;
    const userReqs = tickets.filter(
      (t) => t.type === "user_request" || t.type === "billing_commercial" || t.type === "compliance"
    ).length;
    const techCases = tickets.filter(
      (t) => t.type === "technical_case" || t.type === "integration_failure" || t.type === "provisioning_failure"
    ).length;
    const incidents = tickets.filter(
      (t) => t.type === "platform_incident" || Boolean(t.affectedScope.relatedIncidentId)
    ).length;
    const needsAction = tickets.filter((t) => t.needsAction).length;

    return { all, userReqs, techCases, incidents, needsAction };
  }, [tickets]);

  // Filtered & Sorted Cases
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Segment filter
      if (segmentFilter === "user_request" && t.type !== "user_request" && t.type !== "billing_commercial" && t.type !== "compliance") {
        return false;
      }
      if (segmentFilter === "technical_case" && t.type !== "technical_case" && t.type !== "integration_failure" && t.type !== "provisioning_failure") {
        return false;
      }
      if (segmentFilter === "platform_incident" && t.type !== "platform_incident" && !t.affectedScope.relatedIncidentId) {
        return false;
      }
      if (segmentFilter === "needs_action" && !t.needsAction) {
        return false;
      }

      // 2. Dropdown filters
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (productFilter !== "all" && t.productSlug !== productFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (envFilter !== "all" && t.environment !== envFilter) return false;
      if (assigneeFilter !== "all" && !t.assignee.name.toLowerCase().includes(assigneeFilter.toLowerCase())) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = [
          t.id,
          t.title,
          t.workspaceName,
          t.workspaceId,
          t.product,
          t.service,
          t.integration,
          t.diagnosticContext.error,
          t.diagnosticContext.correlationId,
          t.diagnosticContext.traceId,
          t.affectedScope.relatedIncidentId ?? "",
          t.relatedLinks.bossCaseRef,
          ...t.tags,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [tickets, segmentFilter, typeFilter, productFilter, priorityFilter, statusFilter, envFilter, assigneeFilter, searchQuery]);

  // Selected Ticket object
  const selectedTicket = useMemo(() => {
    return filteredTickets.find((t) => t.id === selectedTicketId) ?? filteredTickets[0] ?? tickets[0];
  }, [filteredTickets, selectedTicketId, tickets]);

  // Status transitions
  const handleStatusChange = (ticketId: string, nextStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updatedTimeline = [
            {
              id: `tl-${Date.now()}`,
              time: "Just now",
              title: `Status changed to ${STATUS_CONFIG[nextStatus].label}`,
              detail: `Updated by Dhruv Singla (Senior Support Engineer)`,
              actor: "Dhruv Singla",
              actorRole: "Senior Support Engineer",
              actorType: "engineer" as const,
              statusVariant: nextStatus === "resolved" ? ("success" as const) : ("info" as const),
            },
            ...t.timeline,
          ];
          return {
            ...t,
            status: nextStatus,
            needsAction: nextStatus === "resolved" || nextStatus === "closed" ? false : t.needsAction,
            updatedAt: "Just now",
            timeline: updatedTimeline,
          };
        }
        return t;
      })
    );
  };

  // Run Diagnostic Action simulation
  const handleRunDiagnostic = () => {
    if (!selectedTicket) return;
    setDiagnosticState({
      running: true,
      executed: false,
      result: null,
      message: "Probing endpoint and validating connection credentials...",
    });

    setTimeout(() => {
      if (selectedTicket.id === "TK-9011") {
        setDiagnosticState({
          running: false,
          executed: true,
          result: "failure",
          message: "Probe failed: Meta WABA webhook returned 401 HMAC mismatch. Egress secret token mismatch detected.",
        });
      } else {
        setDiagnosticState({
          running: false,
          executed: true,
          result: "success",
          message: "Diagnostic completed: Integration health score 98%. Upstream latency 28ms. No anomalous packet drop.",
        });
      }
    }, 1200);
  };

  // Create Case Handler
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const ws = MONITORED_WORKSPACES.find((w) => w.id === newWorkspaceId) ?? MONITORED_WORKSPACES[0];
    const productMeta = SAHAYOGI_PRODUCTS_MAP[newProductSlug] ?? SAHAYOGI_PRODUCTS_MAP["chat-with-sahayogi"];
    const newId = `TK-${Math.floor(9020 + Math.random() * 900)}`;

    const newCase: Ticket = {
      id: newId,
      title: newTitle.trim(),
      type: newType,
      product: productMeta.label,
      productSlug: productMeta.slug,
      service: newService.trim() || "Core Platform",
      integration: productMeta.label.includes("Chat") ? "Meta WhatsApp Business Platform" : "Setu Core Ingress",
      workspaceId: ws.id,
      workspaceName: ws.name,
      priority: newPriority,
      status: "open",
      needsAction: true,
      category: newService.trim() || "Operations",
      description: newDescription.trim(),
      assignee: {
        name: "Dhruv Singla",
        role: "Senior Support Engineer",
        initials: "DS",
        email: "dhruv.singla@setu.co",
      },
      reporter: {
        name: "Support Desk Agent",
        email: "support@setu.co",
        type: "Support Agent",
      },
      createdAt: "Just now",
      updatedAt: "Just now",
      environment: "Production",
      diagnosticContext: {
        product: productMeta.label,
        productSlug: productMeta.slug,
        service: newService.trim() || "Core Platform",
        integration: productMeta.label.includes("Chat") ? "Meta WhatsApp Business Platform" : "Setu Ingress",
        integrationSlug: productMeta.label.includes("Chat") ? "meta-waba" : "default",
        environment: "Production",
        endpoint: `/v2/${productMeta.slug}/operations`,
        error: "200 Telemetry Normal",
        correlationId: `evt_${Date.now().toString(36)}`,
        traceId: `trc_${ws.id.replace("WS-", "")}_${Date.now().toString(36)}`,
        firstDetected: "Just now",
        lastSuccessful: "10 mins ago",
      },
      affectedScope: {
        workspaceId: ws.id,
        workspaceName: ws.name,
        organisation: `${ws.name} Pvt. Ltd.`,
        subscriptionPlan: `${productMeta.label} — Standard`,
        usersAffected: 1,
      },
      technicalChain: [
        { step: "workspace", title: ws.name, subtitle: `Workspace (${ws.id})`, type: "Workspace", iconType: "workspace" },
        { step: "product", title: productMeta.label, subtitle: "Product", type: "Product", iconType: "product", productSlug: productMeta.slug },
        { step: "service", title: newService.trim() || "Core Service", subtitle: "Service", type: "Service", iconType: "service" },
        { step: "integration", title: "Setu Integration Layer", subtitle: "Integration", type: "Integration", iconType: "integration" },
        { step: "event", title: "Case Initialized", subtitle: "Event", type: "Event", iconType: "event" },
        { step: "error", title: "Awaiting Triage", subtitle: "Status", type: "Error", iconType: "error", isError: false },
        { step: "ticket", title: newId, subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
      ],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: "Just now",
          title: "Support Case Created",
          detail: `Logged by Support Desk Agent into Setu Technical Support Console`,
          actor: "Support Desk Agent",
          actorType: "engineer",
          statusVariant: "info",
        },
      ],
      relatedLinks: {
        workspace360: `/technical-support/workspaces?id=${ws.id}`,
        product360: `/technical-support/dashboard?product=${productMeta.slug}`,
        subscription360: `/technical-support/workspaces?tab=subscriptions&id=${ws.id}`,
        integration360: `/technical-support/integrations`,
        bossCaseRef: `CUS-${Math.floor(89000 + Math.random() * 900)}`,
      },
      availableActions: [
        {
          id: "run-diag",
          label: "Run Diagnostic",
          actionType: "diagnostic",
          description: "Runs real-time connectivity and health probes across workspace dependencies.",
        },
      ],
      tags: [productMeta.slug, "support", "triage"],
    };

    setTickets((prev) => [newCase, ...prev]);
    setSelectedTicketId(newId);
    setIsCreateOpen(false);

    // Reset fields
    setNewTitle("");
    setNewDescription("");
    setNewService("Webhook Delivery");
  };

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">

      {/* ─────────────────────────────────────────────────────────────────
          TOP PAGE HEADER: Title + Subtitle + "+ Create Case" Button
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 sm:px-2 mb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
            Support Cases
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Customer cases with technical diagnostics and operational context
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="tap-pop flex items-center gap-1.5 rounded-xl bg-[#001433] hover:bg-[#002255] text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Create Case</span>
          <ChevronDown size={13} className="opacity-70 ml-0.5" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SEGMENTED STATUS SUMMARY CONTROL (Replaces 4 Large KPI Cards)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 sm:px-2 mb-3">
        {/* All */}
        <button
          type="button"
          onClick={() => setSegmentFilter("all")}
          className={`tap-pop flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border shrink-0 ${
            segmentFilter === "all"
              ? "border-[#0058DD] bg-[#0058DD]/10 text-[#0058DD] font-semibold ring-1 ring-[#0058DD]/20"
              : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
          }`}
        >
          <span>All</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-bold ${
              segmentFilter === "all"
                ? "bg-[#0058DD] text-white"
                : "bg-[var(--search-bg)] text-[var(--text-muted)]"
            }`}
          >
            {counts.all}
          </span>
        </button>

        {/* User Requests */}
        <button
          type="button"
          onClick={() => setSegmentFilter("user_request")}
          className={`tap-pop flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border shrink-0 ${
            segmentFilter === "user_request"
              ? "border-[#0058DD] bg-[#0058DD]/10 text-[#0058DD] font-semibold ring-1 ring-[#0058DD]/20"
              : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
          }`}
        >
          <User size={13} className="opacity-80" />
          <span>User Requests</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-bold ${
              segmentFilter === "user_request"
                ? "bg-[#0058DD] text-white"
                : "bg-[var(--search-bg)] text-[var(--text-muted)]"
            }`}
          >
            {counts.userReqs}
          </span>
        </button>

        {/* Technical Cases */}
        <button
          type="button"
          onClick={() => setSegmentFilter("technical_case")}
          className={`tap-pop flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border shrink-0 ${
            segmentFilter === "technical_case"
              ? "border-[#0058DD] bg-[#0058DD]/10 text-[#0058DD] font-semibold ring-1 ring-[#0058DD]/20"
              : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
          }`}
        >
          <Terminal size={13} className="opacity-80" />
          <span>Technical Cases</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-bold ${
              segmentFilter === "technical_case"
                ? "bg-[#0058DD] text-white"
                : "bg-[var(--search-bg)] text-[var(--text-muted)]"
            }`}
          >
            {counts.techCases}
          </span>
        </button>

        {/* Platform Incidents */}
        <button
          type="button"
          onClick={() => setSegmentFilter("platform_incident")}
          className={`tap-pop flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border shrink-0 ${
            segmentFilter === "platform_incident"
              ? "border-[#0058DD] bg-[#0058DD]/10 text-[#0058DD] font-semibold ring-1 ring-[#0058DD]/20"
              : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
          }`}
        >
          <Activity size={13} className="text-rose-500" />
          <span>Platform Incidents</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-bold ${
              segmentFilter === "platform_incident"
                ? "bg-rose-600 text-white"
                : "bg-[var(--search-bg)] text-[var(--text-muted)]"
            }`}
          >
            {counts.incidents}
          </span>
        </button>

        {/* Needs Action */}
        <button
          type="button"
          onClick={() => setSegmentFilter("needs_action")}
          className={`tap-pop flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border shrink-0 ${
            segmentFilter === "needs_action"
              ? "border-[#0058DD] bg-[#0058DD]/10 text-[#0058DD] font-semibold ring-1 ring-[#0058DD]/20"
              : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
          }`}
        >
          <AlertCircle size={13} className="text-amber-500" />
          <span>Needs Action</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-bold ${
              segmentFilter === "needs_action"
                ? "bg-amber-600 text-white"
                : "bg-[var(--search-bg)] text-[var(--text-muted)]"
            }`}
          >
            {counts.needsAction}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          COMPACT FILTER & SEARCH BAR
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2 mb-3">
        {/* Search input with Ctrl+K shortcut badge */}
        <div className="relative flex-1 min-w-[240px] max-w-[420px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]" />
          <input
            type="text"
            placeholder="Search tickets, workspace, case ID, event, incident, trace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-9 pr-14 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] shadow-xs outline-none focus:border-[#0058DD]"
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded border border-[var(--divider)] bg-[var(--search-bg)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>

        {/* Dropdowns cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Type Dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by case type"
              className="appearance-none rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-3 pr-7 text-xs text-[var(--text-secondary)] shadow-xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
            >
              <option value="all">Type</option>
              <option value="technical_case">Technical Case</option>
              <option value="user_request">User Request</option>
              <option value="platform_incident">Platform Incident</option>
              <option value="integration_failure">Integration Failure</option>
              <option value="provisioning_failure">Provisioning Failure</option>
              <option value="access_security">Access / Security</option>
              <option value="compliance">Compliance</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Product Dropdown */}
          <div className="relative">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              aria-label="Filter by Sahayogi product"
              className="appearance-none rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-3 pr-7 text-xs text-[var(--text-secondary)] shadow-xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
            >
              <option value="all">Product</option>
              <option value="chat-with-sahayogi">Chat with Sahayogi</option>
              <option value="boss">BoSS</option>
              <option value="sahayogi-cloud">Sahayogi Cloud</option>
              <option value="sahayogi-one">Sahayogi One</option>
              <option value="tax-sahayogi">Tax Sahayogi</option>
              <option value="investor-sahayogi">Investor Sahayogi</option>
              <option value="studio-sahayogi">Studio Sahayogi</option>
              <option value="my-sahayogi">My Sahayogi</option>
              <option value="office-sahayogi">Office Sahayogi</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
              className="appearance-none rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-3 pr-7 text-xs text-[var(--text-secondary)] shadow-xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
            >
              <option value="all">Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="appearance-none rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-3 pr-7 text-xs text-[var(--text-secondary)] shadow-xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
            >
              <option value="all">Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_customer">Waiting on Customer</option>
              <option value="mitigating">Mitigating</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Environment Dropdown */}
          <div className="relative">
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              aria-label="Filter by environment"
              className="appearance-none rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-3 pr-7 text-xs text-[var(--text-secondary)] shadow-xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
            >
              <option value="all">Environment</option>
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Assignee Dropdown */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              aria-label="Filter by assignee"
              className="appearance-none rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-3 pr-7 text-xs text-[var(--text-secondary)] shadow-xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
            >
              <option value="all">Assignee</option>
              <option value="Dhruv Singla">Dhruv Singla</option>
              <option value="Priyanka Rao">Priyanka Rao</option>
              <option value="Amit Kumar">Amit Kumar</option>
              <option value="Riya Patel">Riya Patel</option>
              <option value="Neeraj Sharma">Neeraj Sharma</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort cases"
                className="appearance-none rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-2.5 pr-6 text-xs font-medium text-[var(--text-secondary)] shadow-xs outline-none hover:border-[var(--text-muted)] cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MAIN TWO-COLUMN WORKSPACE: Ticket Stream (Left) + Inspector (Right)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] screen-lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-3 px-1 sm:px-2">

        {/* ── LEFT COLUMN: Ticket Stream (Inside single unified white container) ── */}
        <div className="rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-2 sm:p-2.5 flex flex-col gap-1.5 shadow-2xs">
          {filteredTickets.length === 0 ? (
            <div className="rounded-xl p-12 text-center">
              <TicketIcon size={36} className="mx-auto mb-3 text-[var(--text-muted)]/50" />
              <p className="text-sm font-semibold text-[var(--text-heading)]">No matching cases found</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Try relaxing filters or search terms.</p>
              <button
                type="button"
                onClick={() => {
                  setSegmentFilter("all");
                  setSearchQuery("");
                  setTypeFilter("all");
                  setProductFilter("all");
                  setPriorityFilter("all");
                  setStatusFilter("all");
                  setEnvFilter("all");
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              const typeCfg = TYPE_CONFIG[ticket.type] ?? TYPE_CONFIG.technical_case;
              const priorityCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
              const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`group relative flex items-start justify-between rounded-xl p-3 sm:p-3.5 text-left transition-all cursor-pointer border ${
                    isSelected
                      ? "border-[#0058DD] bg-[#F4F8FF] dark:bg-[#0B1E38] shadow-2xs ring-1 ring-[#0058DD]/30"
                      : "border-transparent hover:border-[var(--divider)] hover:bg-[var(--search-bg)]/40"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                    {/* CRITICAL: Primary Product Icon (Official Sahayogi product mark, NEVER WhatsApp) */}
                    <div className="shrink-0 mt-0.5">
                      <ProductIcon
                        product={ticket.productSlug}
                        size={38}
                        className="rounded-xl shadow-2xs"
                      />
                    </div>

                    {/* Middle Info Column */}
                    <div className="min-w-0 flex-1">
                      {/* Line 1: Ticket ID · TYPE */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-xs font-bold tracking-tight text-[var(--text-heading)]">
                          {ticket.id}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.2 text-[10.5px] font-medium border ${typeCfg.badgeClass}`}
                        >
                          {typeCfg.label}
                        </span>
                      </div>

                      {/* Line 2: Ticket Title */}
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-heading)] line-clamp-1 mb-1 leading-snug">
                        {ticket.title}
                      </p>

                      {/* Line 3: Product · technical domain · time · workspace ID */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                        <span>{ticket.product}</span>
                        <span>·</span>
                        <span>{ticket.service}</span>
                        <span>·</span>
                        <span>{ticket.createdAt}</span>
                        <span>·</span>
                        <span className="font-mono text-[10.5px] opacity-80">{ticket.workspaceId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Priority Pill + Status Pill (Top) · Assignee Avatar + Name (Bottom) */}
                  <div className="flex flex-col items-end justify-between shrink-0 self-stretch gap-2.5 pl-2">
                    {/* Top Row: Priority Pill + Status Pill */}
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${priorityCfg.badgeClass}`}>
                        {priorityCfg.label}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${statusCfg.badgeClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>

                    {/* Bottom Row: Assignee Avatar + Name */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                      <UserAvatar
                        name={ticket.assignee.name}
                        initials={ticket.assignee.initials}
                        size={22}
                      />
                      <span className="truncate hidden sm:inline text-[11.5px] text-gray-500 dark:text-gray-400 font-normal">
                        {ticket.assignee.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* ── RIGHT COLUMN: Diagnostic Inspector ────────────────────── */}
        {selectedTicket && (
          <div className="rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs sticky top-3">

            {/* Inspector Top Row: Ticket ID + Badges + Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--divider)] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-heading)]">
                  {selectedTicket.id}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(selectedTicket.id, "ticket-id")}
                  title="Copy Ticket ID"
                  className="tap-pop flex h-6 w-6 items-center justify-center rounded-md border border-[var(--divider)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer"
                >
                  {copiedId === "ticket-id" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>

                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${PRIORITY_CONFIG[selectedTicket.priority].badgeClass}`}>
                  {PRIORITY_CONFIG[selectedTicket.priority].label}
                </span>

                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${STATUS_CONFIG[selectedTicket.status].badgeClass}`}>
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_CONFIG[selectedTicket.status].dotClass}`} />
                  <span>{STATUS_CONFIG[selectedTicket.status].label}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>Created {selectedTicket.createdAt}</span>
                <button
                  type="button"
                  title="More actions"
                  className="tap-pop flex h-6 w-6 items-center justify-center rounded-md border border-[var(--divider)] hover:bg-[var(--search-bg)] text-[var(--text-muted)] cursor-pointer"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* Big Ticket Title */}
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)] mt-3 leading-snug">
              {selectedTicket.title}
            </h2>

            {/* Tags row: Product Icon + Product Name, Service, Environment */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--text-heading)]">
                <ProductIcon product={selectedTicket.productSlug} size={16} />
                <span>{selectedTicket.product}</span>
              </div>

              <span className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                {selectedTicket.service}
              </span>

              <span className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text-muted)] font-mono">
                {selectedTicket.environment}
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-[var(--divider)]">
              {selectedTicket.status !== "in_progress" ? (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedTicket.id, "in_progress")}
                  className="tap-pop flex items-center gap-1.5 rounded-lg bg-[#0058DD] hover:bg-[#0047B3] text-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Mark In Progress</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedTicket.id, "open")}
                  className="tap-pop flex items-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-secondary)] px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>Reopen Case</span>
                </button>
              )}

              {selectedTicket.status !== "resolved" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedTicket.id, "resolved")}
                  className="tap-pop flex items-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-secondary)] px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>Resolve</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRunDiagnostic}
                disabled={diagnosticState.running}
                className="tap-pop flex items-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-heading)] px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play size={12} className={diagnosticState.running ? "animate-spin text-[#0058DD]" : "text-[#0058DD] fill-[#0058DD]"} />
                <span>{diagnosticState.running ? "Running..." : "Run Diagnostic"}</span>
              </button>

              <div className="relative">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                  aria-label="More ticket actions"
                  className="appearance-none rounded-lg border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-3 pr-7 text-xs font-medium text-[var(--text-secondary)] shadow-2xs outline-none hover:bg-[var(--search-bg)] cursor-pointer"
                >
                  <option value={selectedTicket.status}>More ▾</option>
                  <option value="open">Mark Open</option>
                  <option value="investigating">Mark Investigating</option>
                  <option value="in_progress">Mark In Progress</option>
                  <option value="waiting_customer">Waiting on Customer</option>
                  <option value="waiting_provider">Waiting on Provider</option>
                  <option value="mitigating">Mark Mitigating</option>
                  <option value="resolved">Mark Resolved</option>
                  <option value="closed">Close Case</option>
                </select>
                <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Diagnostic execution banner if triggered */}
            {diagnosticState.executed && (
              <div
                className={`mt-3 flex items-start gap-2.5 rounded-xl p-3 text-xs border ${
                  diagnosticState.result === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
                }`}
              >
                {diagnosticState.result === "success" ? (
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle size={16} className="shrink-0 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{diagnosticState.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDiagnosticState({ running: false, executed: false, result: null, message: "" })}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Tabs Navigation: Details | Timeline | Related | Actions | Audit */}
            <div className="flex items-center gap-1 border-b border-[var(--divider)] mt-4">
              {(["details", "timeline", "related", "actions", "audit"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInspectorTab(tab)}
                  className={`tap-pop relative px-3 py-2 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    inspectorTab === tab
                      ? "text-[#0058DD]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  }`}
                >
                  {tab}
                  {inspectorTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0058DD] rounded-t" />
                  )}
                </button>
              ))}
            </div>

            {/* ── TAB 1: DETAILS ──────────────────────────────────────── */}
            {inspectorTab === "details" && (
              <div className="pt-3 text-xs">
                {/* 2-Column Grid: Left (Description, Diagnostic Context, Affected Scope) | Right (Technical Chain, Quick Links) */}
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)] gap-4 items-start">

                  {/* LEFT SUB-COLUMN: Description, Diagnostic Context, Affected Scope */}
                  <div className="flex flex-col gap-4">
                    {/* Section 1: Description */}
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-heading)] mb-1">
                        Description
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {selectedTicket.description}
                      </p>
                    </div>

                    {/* Section 2: Diagnostic Context */}
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">
                        Diagnostic Context
                      </h3>

                      <div className="grid grid-cols-[105px_1fr] items-center gap-y-1.5 text-xs">
                        <span className="text-[var(--text-muted)]">Product</span>
                        <span className="font-medium text-[var(--text-heading)]">
                          {selectedTicket.diagnosticContext.product}
                        </span>

                        <span className="text-[var(--text-muted)]">Service</span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedTicket.diagnosticContext.service}
                        </span>

                        <span className="text-[var(--text-muted)]">Integration</span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedTicket.diagnosticContext.integration}
                        </span>

                        <span className="text-[var(--text-muted)]">Environment</span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedTicket.diagnosticContext.environment}
                        </span>

                        {selectedTicket.diagnosticContext.endpoint && (
                          <>
                            <span className="text-[var(--text-muted)]">Endpoint</span>
                            <div>
                              <span className="inline-block font-mono text-[11px] text-[#0058DD] bg-[#EFF6FF] dark:bg-blue-950/40 px-1.5 py-0.5 rounded truncate max-w-full">
                                {selectedTicket.diagnosticContext.endpoint}
                              </span>
                            </div>
                          </>
                        )}

                        <span className="text-[var(--text-muted)]">Error</span>
                        <span className="font-mono text-[11px] font-bold text-red-600 dark:text-red-400">
                          {selectedTicket.diagnosticContext.error}
                        </span>

                        <span className="text-[var(--text-muted)]">Correlation ID</span>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)] truncate">
                          {selectedTicket.diagnosticContext.correlationId}
                        </span>

                        <span className="text-[var(--text-muted)]">First detected</span>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {selectedTicket.diagnosticContext.firstDetected}
                        </span>

                        <span className="text-[var(--text-muted)]">Last successful delivery</span>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {selectedTicket.diagnosticContext.lastSuccessful}
                        </span>
                      </div>
                    </div>

                    {/* Section 3: Affected Scope */}
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">
                        Affected Scope
                      </h3>

                      <div className="grid grid-cols-[105px_1fr] items-center gap-y-1.5 text-xs">
                        <span className="text-[var(--text-muted)]">Workspace</span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedTicket.affectedScope.workspaceName} ({selectedTicket.affectedScope.workspaceId})
                        </span>

                        <span className="text-[var(--text-muted)]">Organisation</span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedTicket.affectedScope.organisation}
                        </span>

                        <span className="text-[var(--text-muted)]">Subscription</span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedTicket.affectedScope.subscriptionPlan}
                        </span>

                        <span className="text-[var(--text-muted)]">Users affected</span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedTicket.affectedScope.usersAffected}
                        </span>

                        {selectedTicket.affectedScope.relatedIncidentId && (
                          <>
                            <span className="text-[var(--text-muted)]">Related incident</span>
                            <Link
                              href={`/technical-support/incidents?id=${selectedTicket.affectedScope.relatedIncidentId}`}
                              className="font-semibold text-[#0058DD] hover:underline"
                            >
                              {selectedTicket.affectedScope.relatedIncidentId}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SUB-COLUMN: Technical Chain & Quick Links */}
                  <div className="flex flex-col gap-3.5">
                    {/* Card: Technical Chain (Enclosed inside bordered card) */}
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-2xs">
                      <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2.5">
                        Technical Chain
                      </h3>

                      <div className="flex flex-col">
                        {selectedTicket.technicalChain.map((node, idx) => (
                          <div key={idx} className="flex flex-col">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md ${
                                  node.isError
                                    ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300"
                                    : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                                }`}
                              >
                                {node.iconType === "workspace" && <Building2 size={12} />}
                                {node.iconType === "product" && (
                                  <ProductIcon product={node.productSlug ?? selectedTicket.productSlug} size={15} />
                                )}
                                {node.iconType === "service" && <Terminal size={12} />}
                                {node.iconType === "integration" && (
                                  <IntegrationIcon integration={node.integrationSlug ?? selectedTicket.diagnosticContext.integrationSlug} size={15} />
                                )}
                                {node.iconType === "event" && <Zap size={12} />}
                                {node.iconType === "error" && <AlertCircle size={12} />}
                                {node.iconType === "ticket" && <TicketIcon size={12} />}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-[11.5px] font-bold leading-tight ${
                                    node.isError ? "text-red-600 dark:text-red-400" : "text-[var(--text-heading)]"
                                  }`}
                                >
                                  {node.title}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                                  {node.type}
                                </p>
                              </div>
                            </div>

                            {idx < selectedTicket.technicalChain.length - 1 && (
                              <div className="flex w-5.5 justify-center py-0.5 text-blue-500/70">
                                <span className="text-[10px] leading-none">↓</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section: Quick Links (Clean unboxed list below Technical Chain) */}
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">
                        Quick Links
                      </h3>

                      <div className="flex flex-col gap-1.5">
                        <Link
                          href={selectedTicket.relatedLinks.workspace360}
                          className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors py-0.5"
                        >
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Radio size={12} className="text-[var(--text-muted)] shrink-0" />
                            <span>Workspace 360</span>
                          </div>
                          <span className="text-[var(--text-muted)] font-mono text-[11px]">
                            {selectedTicket.affectedScope.workspaceId}
                          </span>
                        </Link>

                        <Link
                          href={selectedTicket.relatedLinks.product360}
                          className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors py-0.5"
                        >
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Layers size={12} className="text-[var(--text-muted)] shrink-0" />
                            <span>Product 360</span>
                          </div>
                          <span className="text-[var(--text-muted)] text-[11px]">
                            {selectedTicket.product}
                          </span>
                        </Link>

                        <Link
                          href={selectedTicket.relatedLinks.integration360}
                          className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors py-0.5"
                        >
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Activity size={12} className="text-[var(--text-muted)] shrink-0" />
                            <span>Integration 360</span>
                          </div>
                          <span className="text-[var(--text-muted)] text-[11px]">
                            {selectedTicket.diagnosticContext.integration.replace(" Business Platform", "")}
                          </span>
                        </Link>

                        <Link
                          href={`/technical-support/incidents?id=${selectedTicket.affectedScope.relatedIncidentId ?? "INC-2041"}`}
                          className="flex items-center justify-between text-xs hover:text-[#0058DD] transition-colors py-0.5"
                        >
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <ShieldAlert size={12} className="text-[var(--text-muted)] shrink-0" />
                            <span>Incident 360</span>
                          </div>
                          <span className="font-semibold text-[#0058DD] text-[11px]">
                            {selectedTicket.affectedScope.relatedIncidentId ?? "INC-2041"}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ── TAB 2: TIMELINE ─────────────────────────────────────── */}
            {inspectorTab === "timeline" && (
              <div className="flex flex-col gap-3 pt-3 text-xs">
                <div className="relative pl-5 border-l-2 border-[var(--divider)] ml-2 space-y-4">
                  {selectedTicket.timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] ${
                          event.statusVariant === "critical"
                            ? "bg-red-500 ring-2 ring-red-200"
                            : event.statusVariant === "warning"
                            ? "bg-amber-500 ring-2 ring-amber-200"
                            : event.statusVariant === "success"
                            ? "bg-emerald-500 ring-2 ring-emerald-200"
                            : "bg-[#0058DD] ring-2 ring-blue-200"
                        }`}
                      />

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[var(--text-heading)]">
                          {event.title}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          {event.time}
                        </span>
                      </div>

                      <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                        {event.detail}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)] mt-1">
                        <span className="font-semibold text-[var(--text-secondary)]">{event.actor}</span>
                        {event.actorRole && <span>· {event.actorRole}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: RELATED OBJECTS ──────────────────────────────── */}
            {inspectorTab === "related" && (
              <div className="flex flex-col gap-3 pt-3 text-xs">
                <p className="text-[var(--text-muted)]">
                  Correlation graph for operational context. BoSS holds customer-service case authority; Setu correlates diagnostic and platform telemetry.
                </p>

                <div className="grid grid-cols-1 screen-sm:grid-cols-2 gap-2.5">
                  <Link
                    href={selectedTicket.relatedLinks.workspace360}
                    className="flex items-start gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                  >
                    <Building2 size={16} className="text-[#0058DD] mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--text-heading)]">Workspace 360</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{selectedTicket.affectedScope.workspaceName}</p>
                    </div>
                  </Link>

                  <Link
                    href={selectedTicket.relatedLinks.product360}
                    className="flex items-start gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                  >
                    <ProductIcon product={selectedTicket.productSlug} size={18} className="mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--text-heading)]">Product 360</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{selectedTicket.product}</p>
                    </div>
                  </Link>

                  <Link
                    href={selectedTicket.relatedLinks.integration360}
                    className="flex items-start gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                  >
                    <IntegrationIcon integration={selectedTicket.diagnosticContext.integrationSlug} size={18} className="mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--text-heading)]">Integration 360</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{selectedTicket.integration}</p>
                    </div>
                  </Link>

                  <Link
                    href={`/technical-support/api-logs?search=${selectedTicket.diagnosticContext.traceId}`}
                    className="flex items-start gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[#0058DD] transition-all"
                  >
                    <FileCode size={16} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--text-heading)]">Logs & Traces</p>
                      <p className="font-mono text-[10.5px] text-[var(--text-muted)] truncate">{selectedTicket.diagnosticContext.traceId}</p>
                    </div>
                  </Link>
                </div>

                {/* BoSS Case Reference Box */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 p-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-600 text-white font-bold text-[10px]">
                        BS
                      </span>
                      <span className="font-bold text-amber-900 dark:text-amber-300">
                        BoSS Customer Service Authority
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-400">
                      {selectedTicket.relatedLinks.bossCaseRef}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                    Customer case communications and contractual SLA ticketing remain authoritative in BoSS. Setu manages the correlated diagnostic layer, telemetry, and platform remediation.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB 4: ACTIONS ──────────────────────────────────────── */}
            {inspectorTab === "actions" && (
              <div className="flex flex-col gap-3 pt-3 text-xs">
                <p className="text-[var(--text-muted)]">
                  Context-aware operational actions for {selectedTicket.product}. High-risk actions require Maker-Checker justification according to the Setu security blueprint.
                </p>

                <div className="flex flex-col gap-2.5">
                  {selectedTicket.availableActions.map((act) => (
                    <div
                      key={act.id}
                      className="flex flex-col screen-sm:flex-row screen-sm:items-center justify-between gap-2 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 hover:border-[var(--text-muted)] transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-heading)]">{act.label}</span>
                          {act.isHighRisk && (
                            <span className="rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2 py-0.2 text-[10px] font-bold">
                              High Risk
                            </span>
                          )}
                          {act.requiresApproval && (
                            <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.2 text-[10px] font-semibold">
                              Requires Maker-Checker
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {act.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (act.requiresApproval) {
                            setApprovalModal({
                              open: true,
                              actionLabel: act.label,
                              description: act.description,
                              reason: "",
                              submitting: false,
                            });
                          } else {
                            handleRunDiagnostic();
                          }
                        }}
                        className={`tap-pop px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                          act.isHighRisk
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-2xs"
                            : "bg-[#0058DD] hover:bg-[#0047B3] text-white shadow-2xs"
                        }`}
                      >
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 5: AUDIT ────────────────────────────────────────── */}
            {inspectorTab === "audit" && (
              <div className="flex flex-col gap-3 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-heading)]">Audit Log</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Setu Immutable Ledger</span>
                </div>

                <div className="space-y-2">
                  <div className="rounded-xl border border-[var(--divider)] bg-[var(--search-bg)]/40 p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[var(--text-heading)]">CASE_STATUS_CHANGED</span>
                      <span className="text-[var(--text-muted)] font-mono">10:19 AM</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Status moved to Open. Auto-assigned to Tier-2 SRE queue.
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)]">Actor: System Dispatcher (alert-bot@setu.co)</span>
                  </div>

                  <div className="rounded-xl border border-[var(--divider)] bg-[var(--search-bg)]/40 p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[var(--text-heading)]">DIAGNOSTIC_RUN</span>
                      <span className="text-[var(--text-muted)] font-mono">10:22 AM</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Executed Meta WABA credential handshake probe. Returned 401 HMAC mismatch.
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)]">Actor: Dhruv Singla (dhruv.singla@setu.co)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          CREATE CASE MODAL
      ────────────────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--divider)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--text-heading)]">Create Support Case</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Log a new case with technical diagnostics & correlation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="tap-pop text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-heading)] mb-1">
                  Case Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. HMAC signature verification rejecting Meta WhatsApp webhooks"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-heading)] mb-1">
                    Case Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TicketType)}
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD] cursor-pointer"
                  >
                    <option value="technical_case">Technical Case</option>
                    <option value="user_request">User Request</option>
                    <option value="platform_incident">Platform Incident</option>
                    <option value="integration_failure">Integration Failure</option>
                    <option value="provisioning_failure">Provisioning Failure</option>
                    <option value="access_security">Access / Security</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-heading)] mb-1">
                    Sahayogi Product
                  </label>
                  <select
                    value={newProductSlug}
                    onChange={(e) => setNewProductSlug(e.target.value)}
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD] cursor-pointer"
                  >
                    <option value="chat-with-sahayogi">Chat with Sahayogi</option>
                    <option value="boss">BoSS</option>
                    <option value="sahayogi-cloud">Sahayogi Cloud</option>
                    <option value="sahayogi-one">Sahayogi One</option>
                    <option value="tax-sahayogi">Tax Sahayogi</option>
                    <option value="investor-sahayogi">Investor Sahayogi</option>
                    <option value="studio-sahayogi">Studio Sahayogi</option>
                    <option value="my-sahayogi">My Sahayogi</option>
                    <option value="office-sahayogi">Office Sahayogi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-heading)] mb-1">
                    Workspace
                  </label>
                  <select
                    value={newWorkspaceId}
                    onChange={(e) => setNewWorkspaceId(e.target.value)}
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD] cursor-pointer"
                  >
                    {MONITORED_WORKSPACES.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-heading)] mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD] cursor-pointer"
                  >
                    <option value="critical">Critical (P0)</option>
                    <option value="high">High (P1)</option>
                    <option value="medium">Medium (P2)</option>
                    <option value="low">Low (P3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-heading)] mb-1">
                  Service / Technical Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. Webhook Delivery, User Provisioning, Payment Gateway"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-heading)] mb-1">
                  Description & Error Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of the operational issue, error logs, or observed anomaly..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--divider)] mt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="tap-pop rounded-xl border border-[var(--divider)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--search-bg)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tap-pop rounded-xl bg-[#0058DD] hover:bg-[#0047B3] text-white px-4 py-1.5 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MAKER-CHECKER APPROVAL MODAL (For High-Risk Context Actions)
      ────────────────────────────────────────────────────────────────── */}
      {approvalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldAlert size={20} />
              <h3 className="text-base font-bold text-[var(--text-heading)]">
                Authorization Required
              </h3>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              {approvalModal.description}
            </p>

            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-900 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200">
              <span className="font-bold">Setu Security Policy:</span> This high-risk operation modifies production ingress credentials and will trigger an audit alert to the Lead SRE.
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
                Operational Justification / BoSS Reference:
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Approved under emergency change request for BoSS Case CUS-89211"
                value={approvalModal.reason}
                onChange={(e) => setApprovalModal((s) => ({ ...s, reason: e.target.value }))}
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs outline-none focus:border-[#0058DD]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--divider)] mt-4">
              <button
                type="button"
                onClick={() => setApprovalModal((s) => ({ ...s, open: false }))}
                className="tap-pop rounded-xl border border-[var(--divider)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setApprovalModal((s) => ({ ...s, open: false }));
                  handleRunDiagnostic();
                }}
                className="tap-pop rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-xs font-semibold shadow-xs cursor-pointer"
              >
                Authorize &amp; Execute
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
