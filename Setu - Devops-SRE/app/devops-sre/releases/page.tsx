"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Rocket,
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  ShieldAlert,
  Layers,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Clock,
  ShieldCheck,
  X,
  Filter,
  TrendingDown,
  TrendingUp,
  Activity,
  ChevronRight,
  Server,
  Terminal,
  FileCode,
  FileText,
  Play,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Sparkles,
  Lock,
  Eye,
  AlertOctagon,
  Radio,
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import { triggerRefresh } from "@/lib/events/refresh";

export interface SreReleaseFull {
  id: string;
  version: string;
  previousVersion: string;
  service: string;
  serviceId: string;
  product: string;
  productSlug: string;
  environment: "Production" | "Canary" | "Staging";
  commitHash: string;
  commitMessage: string;
  branch: string;
  initiator: {
    name: string;
    role: string;
    avatar: string;
    email: string;
  };
  deployedAt: string;
  deployDuration: string;
  pipelineRef: string;
  pipelineUrl: string;
  argoSyncStatus: "Synced" | "OutOfSync" | "Degraded";
  k8sCluster: string;
  k8sNamespace: string;
  helmRevision: number;
  rolloutStrategy: "Canary Rollout" | "Blue-Green Switch" | "Rolling Update";
  canaryWeight: number;
  canaryStatus: "5% Internal" | "25% Active" | "50% Regional" | "100% Promoted" | "Rollback Initiated" | "Rolled Back";
  status: "Healthy" | "Correlated to Incident" | "Rollback Executed" | "Canary Degraded";
  statusType: "healthy" | "critical" | "warning";
  correlatedIncident?: {
    id: string;
    title: string;
    severity: "P1-Critical" | "P2-Major";
    timeDelta: string;
    blastRadius: number;
    commander: string;
    correlationRule: string;
  };
  telemetryDiff: {
    p50Before: number;
    p50After: number;
    p95Before: number;
    p95After: number;
    p99Before: number;
    p99After: number;
    errorRateBefore: number;
    errorRateAfter: number;
    throughputBefore: number;
    throughputAfter: number;
    error504Count: number;
    error500Count: number;
    error502Count: number;
    success200Count: number;
  };
  pods: {
    name: string;
    status: "Running" | "CrashLoopBackOff" | "Terminating" | "Pending";
    restarts: number;
    cpuThrottling: number;
    memMb: number;
    canaryCohort: boolean;
  }[];
  helmDiff: string;
  pipelineLogs: string[];
  auditHash: string;
}

export const SRE_RELEASES_DATA: SreReleaseFull[] = [
  {
    id: "rel-01",
    version: "v3.4.1",
    previousVersion: "v3.4.0",
    service: "WhatsApp Cloud Gateway",
    serviceId: "svc-waba",
    product: "Chat with Sahayogi",
    productSlug: "chat-with-sahayogi",
    environment: "Production",
    commitHash: "e8b29c1",
    commitMessage: "refactor(waba): optimize http client connection pool keep-alive & reduce egress timeout to 3000ms",
    branch: "main",
    initiator: {
      name: "Priyanka Rao",
      role: "Lead Platform Engineer",
      avatar: "PR",
      email: "priyanka.rao@setu.co",
    },
    deployedAt: "13:42:10 (45 mins ago)",
    deployDuration: "4m 12s",
    pipelineRef: "argo-cd/pipe-8912",
    pipelineUrl: "https://argocd.internal.setu.co/applications/waba-gateway-prod",
    argoSyncStatus: "Degraded",
    k8sCluster: "k8s-prod-ap-south-1a",
    k8sNamespace: "production-messaging",
    helmRevision: 44,
    rolloutStrategy: "Canary Rollout",
    canaryWeight: 25,
    canaryStatus: "Rollback Initiated",
    status: "Correlated to Incident",
    statusType: "critical",
    correlatedIncident: {
      id: "INC-1042",
      title: "Meta WhatsApp WABA Egress 504 Gateway Timeouts & Auth Cascade",
      severity: "P1-Critical",
      timeDelta: "Deployed 18m before outage detection",
      blastRadius: 48,
      commander: "Kabir S. (Lead SRE)",
      correlationRule: "UC-06: 2-Hour Bad Release Correlation Rule (Confidence: 99.4%)",
    },
    telemetryDiff: {
      p50Before: 140,
      p50After: 280,
      p95Before: 124,
      p95After: 3420,
      p99Before: 280,
      p99After: 5120,
      errorRateBefore: 0.02,
      errorRateAfter: 4.82,
      throughputBefore: 420,
      throughputAfter: 310,
      error504Count: 1420,
      error500Count: 88,
      error502Count: 42,
      success200Count: 28940,
    },
    pods: [
      { name: "waba-gw-78f99-canary-01", status: "CrashLoopBackOff", restarts: 4, cpuThrottling: 84, memMb: 890, canaryCohort: true },
      { name: "waba-gw-78f99-canary-02", status: "Running", restarts: 2, cpuThrottling: 78, memMb: 840, canaryCohort: true },
      { name: "waba-gw-78f99-canary-03", status: "CrashLoopBackOff", restarts: 3, cpuThrottling: 91, memMb: 920, canaryCohort: true },
      { name: "waba-gw-5b821-prod-01", status: "Running", restarts: 0, cpuThrottling: 12, memMb: 410, canaryCohort: false },
      { name: "waba-gw-5b821-prod-02", status: "Running", restarts: 0, cpuThrottling: 15, memMb: 425, canaryCohort: false },
      { name: "waba-gw-5b821-prod-03", status: "Running", restarts: 0, cpuThrottling: 14, memMb: 418, canaryCohort: false },
    ],
    helmDiff: `--- a/charts/waba-gateway/values.yaml\n+++ b/charts/waba-gateway/values.yaml\n@@ -24,8 +24,8 @@\n ingress:\n   timeoutSeconds: 30\n config:\n-  UPSTREAM_TIMEOUT_MS: 15000\n-  MAX_KEEP_ALIVE_CONNS: 256\n+  UPSTREAM_TIMEOUT_MS: 3000   # <-- ROOT CAUSE: Reduced timeout caused premature 504 timeouts under Meta Graph API latency spike!\n+  MAX_KEEP_ALIVE_CONNS: 64\n   RETRY_MAX_ATTEMPTS: 2`,
    pipelineLogs: [
      "[13:38:00] [CI/CD] Triggered by Priyanka Rao via merge commit e8b29c1",
      "[13:38:45] [Docker] Container image built: registry.setu.co/apps/waba-gw:v3.4.1 (SHA: e8b29c1)",
      "[13:39:20] [ArgoCD] Synchronizing helm release revision 44 to cluster k8s-prod-ap-south-1a",
      "[13:40:00] [Canary] Step 1: 5% Internal Traffic promoted. Telemetry nominal.",
      "[13:42:10] [Canary] Step 2: 25% Tenancy Traffic promoted.",
      "[13:58:30] [ALERT] Datadog Monitor Alert: Error rate exceeded 1.0% threshold (Current: 4.82%)",
      "[14:00:12] [SENTINEL] UC-06 Correlation Triggered: Release v3.4.1 correlated to P1 Outage INC-1042",
      "[14:02:40] [SRE] Emergency Governed Rollback Request generated by Arjun Mehta [Lead SRE]",
    ],
    auditHash: "0x8f2a9914bca81014e21df904aa76c029d115e219ba820491fae29910ac8b1049",
  },
  {
    id: "rel-02",
    version: "v4.12.0",
    previousVersion: "v4.11.4",
    service: "UPI Payment Rail Switch",
    serviceId: "svc-upi",
    product: "BoSS",
    productSlug: "boss",
    environment: "Production",
    commitHash: "9a4f210",
    commitMessage: "feat(upi): implement NPCI mandate 2.8 recurring auto-debit vpa validation protocols",
    branch: "main",
    initiator: {
      name: "Arjun Mehta",
      role: "Lead SRE",
      avatar: "AM",
      email: "arjun.mehta@setu.co",
    },
    deployedAt: "Yesterday, 22:15:00",
    deployDuration: "6m 40s",
    pipelineRef: "argo-cd/pipe-8894",
    pipelineUrl: "https://argocd.internal.setu.co/applications/upi-rail-prod",
    argoSyncStatus: "Synced",
    k8sCluster: "k8s-prod-ap-south-1a",
    k8sNamespace: "production-payments",
    helmRevision: 112,
    rolloutStrategy: "Blue-Green Switch",
    canaryWeight: 100,
    canaryStatus: "100% Promoted",
    status: "Healthy",
    statusType: "healthy",
    telemetryDiff: {
      p50Before: 9,
      p50After: 8,
      p95Before: 19,
      p95After: 18,
      p99Before: 42,
      p99After: 38,
      errorRateBefore: 0.02,
      errorRateAfter: 0.01,
      throughputBefore: 1820,
      throughputAfter: 1840,
      error504Count: 2,
      error500Count: 1,
      error502Count: 0,
      success200Count: 124800,
    },
    pods: [
      { name: "upi-switch-green-01", status: "Running", restarts: 0, cpuThrottling: 4, memMb: 512, canaryCohort: false },
      { name: "upi-switch-green-02", status: "Running", restarts: 0, cpuThrottling: 5, memMb: 520, canaryCohort: false },
      { name: "upi-switch-green-03", status: "Running", restarts: 0, cpuThrottling: 4, memMb: 510, canaryCohort: false },
      { name: "upi-switch-green-04", status: "Running", restarts: 0, cpuThrottling: 6, memMb: 535, canaryCohort: false },
    ],
    helmDiff: `--- a/charts/upi-switch/values.yaml\n+++ b/charts/upi-switch/values.yaml\n@@ -10,3 +10,4 @@\n   NPCI_SPEC_VERSION: "2.8"\n+  ENABLE_RECURRING_MANDATES: "true"`,
    pipelineLogs: [
      "[22:08:20] [CI/CD] Build passed. Unit & integration test suites passed (1,482 assertions)",
      "[22:10:00] [Staging] Verified against NPCI sandbox simulator",
      "[22:12:30] [ArgoCD] Blue-Green deployment initiated. Green cluster ready.",
      "[22:15:00] [ArgoCD] Production traffic switched to Green. 100% promoted. Zero dropped packets.",
    ],
    auditHash: "0x34e1098bca722019e12019acbd7890aef48194019ab294719faee4019a8bc471",
  },
  {
    id: "rel-03",
    version: "v2.8.2",
    previousVersion: "v2.8.1",
    service: "GST Ingestion Gateway",
    serviceId: "svc-gst",
    product: "Tax Sahayogi",
    productSlug: "tax-sahayogi",
    environment: "Production",
    commitHash: "4b7c109",
    commitMessage: "fix(gst): add circuit breaker failsafe for intermittent NIC portal 504 gateway timeouts",
    branch: "main",
    initiator: {
      name: "Siddharth Verma",
      role: "Senior Backend Engineer",
      avatar: "SV",
      email: "siddharth.verma@setu.co",
    },
    deployedAt: "Yesterday, 18:30:12",
    deployDuration: "5m 18s",
    pipelineRef: "argo-cd/pipe-8871",
    pipelineUrl: "https://argocd.internal.setu.co/applications/gst-gateway-prod",
    argoSyncStatus: "Synced",
    k8sCluster: "k8s-prod-ap-south-1b",
    k8sNamespace: "production-tax",
    helmRevision: 68,
    rolloutStrategy: "Canary Rollout",
    canaryWeight: 100,
    canaryStatus: "100% Promoted",
    status: "Healthy",
    statusType: "healthy",
    telemetryDiff: {
      p50Before: 840,
      p50After: 680,
      p95Before: 4120,
      p95After: 2840,
      p99Before: 6200,
      p99After: 4800,
      errorRateBefore: 6.8,
      errorRateAfter: 2.1,
      throughputBefore: 180,
      throughputAfter: 210,
      error504Count: 180,
      error500Count: 12,
      error502Count: 4,
      success200Count: 18400,
    },
    pods: [
      { name: "gst-gateway-prod-01", status: "Running", restarts: 0, cpuThrottling: 8, memMb: 640, canaryCohort: false },
      { name: "gst-gateway-prod-02", status: "Running", restarts: 0, cpuThrottling: 7, memMb: 630, canaryCohort: false },
    ],
    helmDiff: `--- a/charts/gst-gateway/values.yaml\n+++ b/charts/gst-gateway/values.yaml\n@@ -18,2 +18,4 @@\n   CIRCUIT_BREAKER_FAIL_THRESHOLD: 5\n+  CIRCUIT_BREAKER_OPEN_TIMEOUT_MS: 30000`,
    pipelineLogs: [
      "[18:25:00] [CI/CD] Automated Canary test run against NIC staging endpoints",
      "[18:28:00] [Canary] Step 1 (10%) nominal. Step 2 (50%) nominal.",
      "[18:30:12] [Canary] 100% Promoted. Circuit breaker protection activated.",
    ],
    auditHash: "0x78a1049bfe99120489acbd78104892019e1201948920acbd4719029381049281",
  },
  {
    id: "rel-04",
    version: "v1.19.4",
    previousVersion: "v1.19.3",
    service: "BBPS Ingestion Switch",
    serviceId: "svc-bbps",
    product: "BoSS",
    productSlug: "boss",
    environment: "Production",
    commitHash: "1f8e24a",
    commitMessage: "perf(bbps): optimize bill fetch redis serialization and connection pooling",
    branch: "main",
    initiator: {
      name: "Priyanka Rao",
      role: "Lead Platform Engineer",
      avatar: "PR",
      email: "priyanka.rao@setu.co",
    },
    deployedAt: "03 Oct 2026, 14:10:00",
    deployDuration: "3m 50s",
    pipelineRef: "argo-cd/pipe-8850",
    pipelineUrl: "https://argocd.internal.setu.co/applications/bbps-switch-prod",
    argoSyncStatus: "Synced",
    k8sCluster: "k8s-prod-ap-south-1a",
    k8sNamespace: "production-payments",
    helmRevision: 89,
    rolloutStrategy: "Rolling Update",
    canaryWeight: 100,
    canaryStatus: "100% Promoted",
    status: "Healthy",
    statusType: "healthy",
    telemetryDiff: {
      p50Before: 14,
      p50After: 12,
      p95Before: 28,
      p95After: 24,
      p99Before: 55,
      p99After: 48,
      errorRateBefore: 0.02,
      errorRateAfter: 0.01,
      throughputBefore: 610,
      throughputAfter: 620,
      error504Count: 0,
      error500Count: 1,
      error502Count: 0,
      success200Count: 48900,
    },
    pods: [
      { name: "bbps-switch-01", status: "Running", restarts: 0, cpuThrottling: 2, memMb: 420, canaryCohort: false },
      { name: "bbps-switch-02", status: "Running", restarts: 0, cpuThrottling: 3, memMb: 430, canaryCohort: false },
    ],
    helmDiff: `--- a/charts/bbps-switch/values.yaml\n+++ b/charts/bbps-switch/values.yaml\n@@ -12,2 +12,2 @@\n-  REDIS_POOL_SIZE: 32\n+  REDIS_POOL_SIZE: 64`,
    pipelineLogs: [
      "[14:06:00] [CI/CD] Container image verified and signed with Sigstore",
      "[14:10:00] [ArgoCD] Rolling update complete across 2 replicas",
    ],
    auditHash: "0x12a99014bc81902489acbd78104892019e1201948920acbd4719029381049281",
  },
  {
    id: "rel-05",
    version: "v5.2.0-canary",
    previousVersion: "v5.1.8",
    service: "OAuth 2.0 Auth Service",
    serviceId: "svc-auth",
    product: "Sahayogi One",
    productSlug: "sahayogi-one",
    environment: "Canary",
    commitHash: "7c2901a",
    commitMessage: "feat(iam): introduce FIDO2 WebAuthn hardware security key challenge endpoint",
    branch: "feature/fido2-webauthn",
    initiator: {
      name: "Arjun Mehta",
      role: "Lead SRE",
      avatar: "AM",
      email: "arjun.mehta@setu.co",
    },
    deployedAt: "Today, 11:15:20",
    deployDuration: "4m 02s",
    pipelineRef: "argo-cd/pipe-8908",
    pipelineUrl: "https://argocd.internal.setu.co/applications/auth-service-canary",
    argoSyncStatus: "Synced",
    k8sCluster: "k8s-prod-ap-south-1a",
    k8sNamespace: "production-security",
    helmRevision: 154,
    rolloutStrategy: "Canary Rollout",
    canaryWeight: 10,
    canaryStatus: "5% Internal",
    status: "Healthy",
    statusType: "healthy",
    telemetryDiff: {
      p50Before: 28,
      p50After: 26,
      p95Before: 45,
      p95After: 42,
      p99Before: 88,
      p99After: 84,
      errorRateBefore: 0.00,
      errorRateAfter: 0.00,
      throughputBefore: 820,
      throughputAfter: 840,
      error504Count: 0,
      error500Count: 0,
      error502Count: 0,
      success200Count: 32000,
    },
    pods: [
      { name: "auth-svc-canary-01", status: "Running", restarts: 0, cpuThrottling: 1, memMb: 380, canaryCohort: true },
    ],
    helmDiff: `--- a/charts/auth-svc/values.yaml\n+++ b/charts/auth-svc/values.yaml\n@@ -15,1 +15,2 @@\n+  ENABLE_WEBAUTHN_FIDO2: "true"`,
    pipelineLogs: [
      "[11:11:00] [CI/CD] Security vulnerability scan passed: 0 CVEs detected",
      "[11:15:20] [Canary] Step 1: 5% Internal traffic routing active. Zero errors observed.",
    ],
    auditHash: "0x981249bca781902489acbd78104892019e1201948920acbd4719029381049281",
  },
  {
    id: "rel-06",
    version: "v2.1.0",
    previousVersion: "v2.0.4",
    service: "Sahayogi Cloud VPS Provisioner",
    serviceId: "svc-vps",
    product: "Sahayogi Cloud",
    productSlug: "sahayogi-cloud",
    environment: "Production",
    commitHash: "3d9a184",
    commitMessage: "chore(infra): bump terraform openstack provider to v2.4.1 for nvme attachment speedups",
    branch: "main",
    initiator: {
      name: "Karan Johar",
      role: "DevOps Engineer",
      avatar: "KJ",
      email: "karan.johar@setu.co",
    },
    deployedAt: "02 Oct 2026, 17:40:11",
    deployDuration: "5m 45s",
    pipelineRef: "argo-cd/pipe-8822",
    pipelineUrl: "https://argocd.internal.setu.co/applications/vps-provisioner-prod",
    argoSyncStatus: "Synced",
    k8sCluster: "k8s-prod-ap-south-1b",
    k8sNamespace: "production-cloud",
    helmRevision: 31,
    rolloutStrategy: "Rolling Update",
    canaryWeight: 100,
    canaryStatus: "100% Promoted",
    status: "Healthy",
    statusType: "healthy",
    telemetryDiff: {
      p50Before: 120,
      p50After: 88,
      p95Before: 240,
      p95After: 180,
      p99Before: 510,
      p99After: 390,
      errorRateBefore: 0.01,
      errorRateAfter: 0.00,
      throughputBefore: 45,
      throughputAfter: 48,
      error504Count: 0,
      error500Count: 0,
      error502Count: 0,
      success200Count: 4200,
    },
    pods: [
      { name: "vps-prov-prod-01", status: "Running", restarts: 0, cpuThrottling: 2, memMb: 490, canaryCohort: false },
    ],
    helmDiff: `--- a/charts/vps-provisioner/values.yaml\n+++ b/charts/vps-provisioner/values.yaml\n@@ -8,2 +8,2 @@\n-  TF_PROVIDER_VERSION: "2.3.9"\n+  TF_PROVIDER_VERSION: "2.4.1"`,
    pipelineLogs: [
      "[17:35:00] [CI/CD] Terraform plan validated with 0 errors",
      "[17:40:11] [ArgoCD] Rollout completed.",
    ],
    auditHash: "0x54e99104bca781902489acbd78104892019e1201948920acbd4719029381049281",
  },
];

type InspectorTab =
  | "overview"
  | "telemetry-diff"
  | "canary-pods"
  | "pipeline-helm"
  | "correlated-incidents"
  | "audit-history";

export default function SreReleasesPage() {
  const [releases, setReleases] = useState<SreReleaseFull[]>(SRE_RELEASES_DATA);
  const [selectedId, setSelectedId] = useState<string>("rel-01");
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterEnv, setFilterEnv] = useState("all");
  const [filterStrategy, setFilterStrategy] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "error-jump" | "duration">("latest");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [targetRelease, setTargetRelease] = useState<SreReleaseFull | null>(null);
  const [targetRollbackVersion, setTargetRollbackVersion] = useState("v3.4.0");
  const [rollbackReason, setRollbackReason] = useState("Correlated to P1 INC-1042: 504 Timeouts on Meta WABA");
  const [rollbackUrgency, setRollbackUrgency] = useState<"Emergency" | "High" | "Standard">("Emergency");
  const [dryRunSuccess, setDryRunSuccess] = useState<boolean | null>(null);
  const [isExecutingDryRun, setIsExecutingDryRun] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const selectedRelease = useMemo(() => {
    return releases.find((r) => r.id === selectedId) || releases[0];
  }, [releases, selectedId]);

  const serviceOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Services" },
    { value: "WhatsApp Cloud Gateway", label: "WhatsApp Cloud Gateway" },
    { value: "UPI Payment Rail Switch", label: "UPI Payment Rail Switch" },
    { value: "GST Ingestion Gateway", label: "GST Ingestion Gateway" },
    { value: "BBPS Ingestion Switch", label: "BBPS Ingestion Switch" },
    { value: "OAuth 2.0 Auth Service", label: "OAuth 2.0 Auth Service" },
    { value: "Sahayogi Cloud VPS Provisioner", label: "Sahayogi Cloud VPS Provisioner" },
  ];

  const envOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Environments" },
    { value: "Production", label: "Production" },
    { value: "Canary", label: "Canary" },
    { value: "Staging", label: "Staging" },
  ];

  const strategyOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Strategies" },
    { value: "Canary Rollout", label: "Canary Rollout" },
    { value: "Blue-Green Switch", label: "Blue-Green Switch" },
    { value: "Rolling Update", label: "Rolling Update" },
  ];

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "Correlated to Incident", label: "Correlated to Incident (UC-06)" },
    { value: "Healthy", label: "Healthy / Nominal" },
    { value: "Rollback Initiated", label: "Rollback Initiated" },
  ];

  const sortOptions: FilterDropdownOption[] = [
    { value: "latest", label: "Latest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "error-jump", label: "Highest Error Jump" },
    { value: "duration", label: "Deploy Duration" },
  ];

  const filteredReleases = useMemo(() => {
    const list = releases.filter((rel) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          rel.version.toLowerCase().includes(q) ||
          rel.service.toLowerCase().includes(q) ||
          rel.commitHash.toLowerCase().includes(q) ||
          rel.initiator.name.toLowerCase().includes(q) ||
          rel.pipelineRef.toLowerCase().includes(q) ||
          rel.commitMessage.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterService !== "all" && rel.service !== filterService) return false;
      if (filterEnv !== "all" && rel.environment !== filterEnv) return false;
      if (filterStrategy !== "all" && rel.rolloutStrategy !== filterStrategy) return false;
      if (filterStatus !== "all") {
        if (filterStatus === "Correlated to Incident" && rel.status !== "Correlated to Incident") return false;
        if (filterStatus === "Healthy" && rel.status !== "Healthy") return false;
        if (filterStatus === "Rollback Initiated" && !rel.canaryStatus.includes("Rollback")) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "error-jump") {
        return (b.telemetryDiff.errorRateAfter - b.telemetryDiff.errorRateBefore) -
          (a.telemetryDiff.errorRateAfter - a.telemetryDiff.errorRateBefore);
      }
      return 0;
    });
  }, [releases, searchQuery, filterService, filterEnv, filterStrategy, filterStatus, sortBy]);

  const totalDeploys48h = releases.length;
  const correlatedCount = releases.filter((r) => r.status === "Correlated to Incident").length;
  const canarySuccessRate = "95.8%";
  const activeRollouts = releases.filter((r) => r.canaryWeight < 100 && r.canaryStatus !== "100% Promoted").length;
  const meanRolloutTime = "4m 52s";
  const rollbackRate = "4.1%";

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const openRollbackModal = (rel: SreReleaseFull) => {
    setTargetRelease(rel);
    setTargetRollbackVersion(rel.previousVersion);
    setRollbackReason(`Correlated to ${rel.correlatedIncident?.id || "P1 Degradation"}: High error rate jump post-deploy`);
    setDryRunSuccess(null);
    setIsRollbackModalOpen(true);
  };

  const handleRunDryRun = () => {
    setIsExecutingDryRun(true);
    setTimeout(() => {
      setIsExecutingDryRun(false);
      setDryRunSuccess(true);
    }, 1200);
  };

  const handleSubmitRollbackRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRelease) return;
    const reqId = `REQ-ROLLBACK-${Date.now().toString().slice(-4)}`;
    setIsRollbackModalOpen(false);
    showToast(
      `Governed Rollback Request ${reqId} dispatched to ArgoCD CI/CD for ${targetRelease.service} (${targetRelease.version} → ${targetRollbackVersion}). Logged in SRE Audit Trail.`
    );
    triggerRefresh({ source: `rollback-${targetRelease.id}` });
  };

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {toastMsg && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 rounded-xl border border-[var(--sidebar-active)]/30 bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-heading)] shadow-lg animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 py-1.5 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)] font-normal">Releases</span>
          <span className="text-[var(--text-muted)]/60 font-light">&gt;</span>
          <span className="font-bold text-[var(--text-heading)]">Deployment Governance</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-0.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                Release 360 &amp; Deployment Governance
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                CANARY ARBITER ACTIVE
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Automated Canary cohorts, telemetry diffs, Git SHA incident correlation (UC-06 2h window), and ArgoCD rollback governance
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => openRollbackModal(selectedRelease)}
              className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs font-semibold shadow-2xs transition-colors"
            >
              <RotateCcw size={14} className="shrink-0" />
              <span>Request Governed Rollback</span>
            </button>
            <button
              onClick={() => showToast("Canary Pipeline health probe refreshed against all Kubernetes clusters")}
              className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-heading)] text-xs font-medium shadow-2xs transition-colors"
            >
              <RefreshCw size={13} className="text-[var(--text-muted)]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        <div
          onClick={() => { setFilterStatus("all"); setFilterService("all"); }}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-[var(--sidebar-active)]/50 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Deploys (48h)</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              <TrendingUp size={10} /> +14.2%
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              {totalDeploys48h}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">Releases</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Across 6 microservices</div>
        </div>

        <div
          onClick={() => setFilterStatus("Correlated to Incident")}
          className={`cursor-pointer group flex flex-col justify-between rounded-xl border p-2.5 sm:p-3 transition-all shadow-2xs ${
            filterStatus === "Correlated to Incident"
              ? "border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-500"
              : "border-[var(--divider)] bg-[var(--surface)] hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">UC-06 Correlated</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded animate-pulse">
              1 Active
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {correlatedCount}
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 ml-1">Incident Link</span>
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 truncate font-medium">
            v3.4.1 → INC-1042
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Canary Success</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              <TrendingDown size={10} /> -4.2%
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              {canarySuccessRate}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Automated verification</div>
        </div>

        <div
          onClick={() => setFilterStrategy("Canary Rollout")}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-purple-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Active Rollouts</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
              Canary
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {activeRollouts}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">In Flight</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Canary 5% / 25%</div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Mean Deploy Time</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              -2.1m
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              {meanRolloutTime}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Target &lt; 8m 00s</div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Rollback Rate</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
              1 Required
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              {rollbackRate}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">ArgoCD Automated</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search release, service, SHA, author, or pipe..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--sidebar-active)] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <FilterDropdown label="Service:" value={filterService} onChange={setFilterService} options={serviceOptions} title="Filter by Microservice" className="text-xs" />
          <FilterDropdown label="Env:" value={filterEnv} onChange={setFilterEnv} options={envOptions} title="Filter by Environment" className="text-xs" />
          <FilterDropdown label="Strategy:" value={filterStrategy} onChange={setFilterStrategy} options={strategyOptions} title="Rollout Strategy" className="text-xs" />
          <FilterDropdown label="Status:" value={filterStatus} onChange={setFilterStatus} options={statusOptions} title="Release Verdict" className="text-xs" />

          <button
            onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            className={`tap-pop flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium shadow-2xs transition-colors ${
              moreFiltersOpen
                ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/10 text-[var(--sidebar-active)]"
                : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-heading)] hover:bg-[var(--search-bg)]"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>More Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <FilterDropdown label="Sort by:" value={sortBy} onChange={(val) => setSortBy(val as any)} options={sortOptions} title="Sort Releases" className="text-xs" align="right" />
        </div>
      </div>

      {moreFiltersOpen && (
        <div className="mx-1 sm:mx-2 mb-3 p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] flex flex-wrap items-center gap-4 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-heading)]">Incident Correlation:</span>
            <button
              onClick={() => setFilterStatus(filterStatus === "Correlated to Incident" ? "all" : "Correlated to Incident")}
              className={`px-2 py-1 rounded-lg border font-medium ${
                filterStatus === "Correlated to Incident"
                  ? "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-[var(--surface)] border-[var(--divider)] text-[var(--text-muted)]"
              }`}
            >
              Only UC-06 Correlated Releases
            </button>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterService("all");
              setFilterEnv("all");
              setFilterStrategy("all");
              setFilterStatus("all");
              setSortBy("latest");
            }}
            className="text-xs text-[var(--sidebar-active)] hover:underline ml-auto"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Split View */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* ── LEFT PANEL: RELEASES QUEUE (45%) ────────────────────────── */}
        <div
          className="w-full lg:w-[45%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)] overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Releases ({filteredReleases.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Canary cohorts, telemetry diffs &amp; rollouts
              </p>
            </div>
            <FilterDropdown
              label="Sort by:"
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={sortOptions}
              title="Sort Releases"
              className="text-xs"
              align="right"
            />
          </div>

          <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
            {filteredReleases.map((rel) => {
              const isSelected = rel.id === selectedId;
              const isCorrelated = rel.status === "Correlated to Incident";

              return (
                <div
                  key={rel.id}
                  onClick={() => setSelectedId(rel.id)}
                  className={`tap-pop cursor-pointer text-left rounded-xl border p-3 transition-all relative ${
                    isSelected
                      ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/[0.04] shadow-xs ring-1 ring-[var(--sidebar-active)]"
                      : "border-[var(--divider)] bg-[var(--surface)] hover:border-[var(--sidebar-active)]/40 hover:bg-[var(--search-bg)]"
                  } ${
                    isCorrelated
                      ? "border-l-4 border-l-rose-500"
                      : rel.canaryWeight < 100
                      ? "border-l-4 border-l-purple-500"
                      : "border-l-4 border-l-emerald-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <ProductIcon product={rel.product} size={18} className="shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[var(--text-heading)] truncate">
                            {rel.service}
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)]">
                            {rel.version}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] truncate block">
                          {rel.product}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isCorrelated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse">
                          <AlertTriangle size={10} />
                          CORRELATED (UC-06)
                        </span>
                      ) : rel.canaryWeight < 100 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          {rel.canaryStatus}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={10} />
                          Healthy
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs mb-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      <GitCommit size={11} />
                      {rel.commitHash}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate flex-1">
                      {rel.commitMessage}
                    </span>
                  </div>

                  {isCorrelated && rel.correlatedIncident && (
                    <div className="mb-2 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300">
                      <span className="font-semibold truncate">
                        ⚡ {rel.correlatedIncident.id}: {rel.correlatedIncident.timeDelta}
                      </span>
                      <span className="font-bold shrink-0">{rel.correlatedIncident.blastRadius} Tenants</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--divider)] text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-muted)]">p95:</span>
                      <span className={`font-semibold ${
                        rel.telemetryDiff.p95After > rel.telemetryDiff.p95Before * 2
                          ? "text-rose-600 font-bold"
                          : "text-[var(--text-heading)]"
                      }`}>
                        {rel.telemetryDiff.p95After}ms
                      </span>
                      <span className="text-[var(--text-muted)]">| Errors:</span>
                      <span className={`font-semibold ${
                        rel.telemetryDiff.errorRateAfter > 1.0 ? "text-rose-600 font-bold" : "text-emerald-600"
                      }`}>
                        {rel.telemetryDiff.errorRateAfter}%
                      </span>
                    </div>

                    <div className="text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={10} />
                      <span>{rel.deployedAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: RELEASE 360 (55%) ─────────────────────────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-3.5 sm:p-4 border-b border-[var(--divider)] bg-[var(--surface)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <ProductIcon product={selectedRelease.product} size={28} className="shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                      {selectedRelease.service}
                    </h2>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)]">
                      {selectedRelease.version}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedRelease.status === "Correlated to Incident"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}>
                      {selectedRelease.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <GitCommit size={12} />
                      {selectedRelease.commitHash}
                      <button
                        onClick={() => handleCopySha(selectedRelease.commitHash)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-heading)] ml-0.5"
                      >
                        {copiedSha === selectedRelease.commitHash ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      </button>
                    </span>
                    <span>·</span>
                    <span className="truncate">{selectedRelease.initiator.name}</span>
                    <span>·</span>
                    <span>Deployed {selectedRelease.deployedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => openRollbackModal(selectedRelease)}
                  className="tap-pop flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold shadow-2xs"
                >
                  <RotateCcw size={13} />
                  <span>Request Rollback</span>
                </button>
                <a
                  href={selectedRelease.pipelineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="tap-pop flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-[var(--text-heading)] text-xs font-medium shadow-2xs"
                >
                  <ExternalLink size={12} />
                  <span>ArgoCD</span>
                </a>
              </div>
            </div>

            {selectedRelease.status === "Correlated to Incident" && selectedRelease.correlatedIncident && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
                <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-rose-800 dark:text-rose-300">
                      ⚡ Incident Correlation Triggered: {selectedRelease.correlatedIncident.id} ({selectedRelease.correlatedIncident.severity})
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                      99.4% SRE Confidence
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    {selectedRelease.correlatedIncident.title}. Deployed 18m before outage detection. Blast radius: {selectedRelease.correlatedIncident.blastRadius} customer workspaces. Commander: {selectedRelease.correlatedIncident.commander}.
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    <span>Rule: {selectedRelease.correlatedIncident.correlationRule}</span>
                    <Link
                      href="/devops-sre/incidents"
                      className="underline font-bold hover:text-rose-800 dark:hover:text-rose-200 flex items-center gap-0.5"
                    >
                      Open in Incident 360 <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 mt-3 border-b border-[var(--divider)] overflow-x-auto scrollbar-none text-xs">
              {[
                { id: "overview", label: "Overview" },
                { id: "telemetry-diff", label: "Telemetry Diff (Pre vs Post)" },
                { id: "canary-pods", label: "Canary & Pods" },
                { id: "pipeline-helm", label: "Pipeline & Helm Diff" },
                { id: "correlated-incidents", label: "Correlated Incidents" },
                { id: "audit-history", label: "Audit & Rollback History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as InspectorTab)}
                  className={`px-3 py-1.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[var(--sidebar-active)] text-[var(--sidebar-active)] font-bold"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 text-xs">
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Rollout Strategy</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5">
                      {selectedRelease.rolloutStrategy}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Canary Traffic Weight</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5">
                      {selectedRelease.canaryWeight}% Promoted
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Kubernetes Cluster</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 font-mono">
                      {selectedRelease.k8sCluster}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Helm Revision</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 font-mono">
                      rev-{selectedRelease.helmRevision}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[var(--text-heading)]">Git Commit Dossier</span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">branch: {selectedRelease.branch}</span>
                  </div>
                  <p className="text-xs text-[var(--text-heading)] font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-[var(--divider)]">
                    {selectedRelease.commitMessage}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2">
                    <span>Committer: {selectedRelease.initiator.name} ({selectedRelease.initiator.email})</span>
                    <span>SHA: {selectedRelease.commitHash}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "telemetry-diff" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-[var(--divider)] overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[var(--text-muted)] border-b border-[var(--divider)]">
                        <th className="p-2.5 font-medium">Metric</th>
                        <th className="p-2.5 font-medium">Pre-Deploy (v{selectedRelease.previousVersion})</th>
                        <th className="p-2.5 font-medium">Post-Deploy (v{selectedRelease.version})</th>
                        <th className="p-2.5 font-medium">Delta (%)</th>
                        <th className="p-2.5 font-medium">SRE Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)] font-mono">
                      <tr>
                        <td className="p-2.5 font-sans font-medium text-[var(--text-heading)]">p50 Latency</td>
                        <td className="p-2.5">{selectedRelease.telemetryDiff.p50Before} ms</td>
                        <td className="p-2.5 font-bold">{selectedRelease.telemetryDiff.p50After} ms</td>
                        <td className="p-2.5 text-rose-600 font-bold">+100%</td>
                        <td className="p-2.5 font-sans"><span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">Degraded</span></td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium text-[var(--text-heading)]">p95 Latency</td>
                        <td className="p-2.5">{selectedRelease.telemetryDiff.p95Before} ms</td>
                        <td className="p-2.5 font-bold text-rose-600">{selectedRelease.telemetryDiff.p95After} ms</td>
                        <td className="p-2.5 text-rose-600 font-bold">+2658%</td>
                        <td className="p-2.5 font-sans"><span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">SLO Breach</span></td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium text-[var(--text-heading)]">Error Rate</td>
                        <td className="p-2.5">{selectedRelease.telemetryDiff.errorRateBefore}%</td>
                        <td className="p-2.5 font-bold text-rose-600">{selectedRelease.telemetryDiff.errorRateAfter}%</td>
                        <td className="p-2.5 text-rose-600 font-bold">+4.80%</td>
                        <td className="p-2.5 font-sans"><span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">Alert Fired</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "canary-pods" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800">
                    <span className="text-[10px] font-bold block mb-1">Stage 1</span>
                    <div className="font-bold text-xs">5% Internal</div>
                    <span className="text-[10px]">Passed</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800">
                    <span className="text-[10px] font-bold block mb-1">Stage 2</span>
                    <div className="font-bold text-xs">25% Tenancy</div>
                    <span className="text-[10px]">Alert Fired (4.82%)</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-slate-50 opacity-50">
                    <span className="text-[10px] font-bold block mb-1">Stage 3</span>
                    <div className="font-bold text-xs">50% Regional</div>
                    <span className="text-[10px]">Halted</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-slate-50 opacity-50">
                    <span className="text-[10px] font-bold block mb-1">Stage 4</span>
                    <div className="font-bold text-xs">100% Global</div>
                    <span className="text-[10px]">Blocked</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold text-xs text-[var(--text-heading)] mb-2 block">
                    Kubernetes Pod Replicas ({selectedRelease.pods.length} Pods)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRelease.pods.map((pod) => (
                      <div
                        key={pod.name}
                        className={`p-2.5 rounded-lg border text-xs ${
                          pod.status === "CrashLoopBackOff"
                            ? "border-rose-300 bg-rose-50/50 text-rose-800"
                            : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-heading)]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-[11px] truncate">{pod.name}</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                            pod.status === "CrashLoopBackOff" ? "bg-rose-200 text-rose-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {pod.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                          <span>Restarts: {pod.restarts}</span>
                          <span>CPU Throttling: {pod.cpuThrottling}%</span>
                          <span>Mem: {pod.memMb}MB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pipeline-helm" && (
              <div className="flex flex-col gap-4 font-mono">
                <div className="rounded-xl border border-[var(--divider)] overflow-hidden">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-b border-[var(--divider)] flex items-center justify-between font-sans">
                    <span className="font-bold text-xs text-[var(--text-heading)]">Helm values.yaml Diff</span>
                    <span className="text-[10px] font-mono text-rose-600 font-bold">1 breaking config change</span>
                  </div>
                  <pre className="p-3 bg-slate-950 text-slate-100 text-[11px] overflow-x-auto leading-relaxed">
                    {selectedRelease.helmDiff}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "correlated-incidents" && (
              <div className="flex flex-col gap-3">
                {selectedRelease.correlatedIncident ? (
                  <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/40 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-rose-800">
                        {selectedRelease.correlatedIncident.id}: {selectedRelease.correlatedIncident.title}
                      </span>
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-rose-600 text-white">
                        {selectedRelease.correlatedIncident.severity}
                      </span>
                    </div>
                    <p className="text-rose-700 mb-3">
                      Rule UC-06 matched because this release went live {selectedRelease.correlatedIncident.timeDelta} on {selectedRelease.service}, directly causing a 2658% latency spike.
                    </p>
                    <Link
                      href="/devops-sre/incidents"
                      className="tap-pop px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1"
                    >
                      Open in Incident 360 Command Center <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[var(--text-muted)] border border-dashed rounded-xl">
                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                    Zero correlated incidents detected for this release.
                  </div>
                )}
              </div>
            )}

            {activeTab === "audit-history" && (
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] font-sans">
                  <span className="font-bold block mb-1">Merkle Audit Hash:</span>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 font-mono text-[11px] break-all border border-[var(--divider)]">
                    {selectedRelease.auditHash}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {isRollbackModalOpen && targetRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl text-[var(--text-heading)]">
            <div className="flex items-center justify-between border-b border-[var(--divider)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="text-rose-600" size={18} />
                <h3 className="font-bold text-sm text-[var(--text-heading)]">
                  Governed Rollback Request: {targetRelease.service}
                </h3>
              </div>
              <button
                onClick={() => setIsRollbackModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitRollbackRequest} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700">
                <span className="font-bold block mb-0.5">SRE Deployment Governance Rule:</span>
                Target release {targetRelease.version} will be rolled back to verified stable release {targetRollbackVersion}.
              </div>

              <div>
                <label className="font-semibold block mb-1">Target Stable Version:</label>
                <input
                  type="text"
                  value={targetRollbackVersion}
                  onChange={(e) => setTargetRollbackVersion(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Urgency Level:</label>
                <select
                  value={rollbackUrgency}
                  onChange={(e) => setRollbackUrgency(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-xs"
                >
                  <option value="Emergency">Emergency (Active P1 Incident - Immediate Trigger)</option>
                  <option value="High">High (Elevated Error Rate - 10m Canary Drain)</option>
                  <option value="Standard">Standard (Maker-Checker Approval Required)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Justification:</label>
                <textarea
                  rows={2}
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs">ArgoCD Manifest Dry-Run:</span>
                  <button
                    type="button"
                    onClick={handleRunDryRun}
                    disabled={isExecutingDryRun}
                    className="tap-pop px-2 py-0.5 rounded bg-[var(--sidebar-active)] text-white text-[11px] font-medium"
                  >
                    {isExecutingDryRun ? "Simulating..." : "Run Dry-Run Check"}
                  </button>
                </div>
                {dryRunSuccess && (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
                    <CheckCircle2 size={13} />
                    <span>Dry-run clean. Target image {targetRollbackVersion} verified in ECR.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--divider)]">
                <button
                  type="button"
                  onClick={() => setIsRollbackModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--divider)] text-xs font-medium hover:bg-[var(--search-bg)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tap-pop px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                >
                  Confirm &amp; Dispatch Rollback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
