export type RiskLevel = "SAFE" | "APPROVAL REQUIRED" | "RESTRICTED";

export type DiagnosticActionItem = {
  id: string;
  name: string;
  description: string;
  risk: RiskLevel;
  lastRun?: string;
  result?: "Passed" | "Failed" | "Untested";
  durationMs?: number;
  expectedEffect: string;
};

export type DiagnosticInvestigation = {
  id: string;
  timestamp: string; // e.g. "14:24:18"
  relativeTime: string; // e.g. "2 mins ago"
  absoluteTimestamp: string; // e.g. "28 Sep 2026, 14:24:18.421 IST"
  status: "Failed" | "Success" | "Warning";
  statusCode: number;
  statusText: string;
  product: string; // e.g. "Chat with Sahayogi"
  service: string; // e.g. "WhatsApp Integration"
  integration: string; // e.g. "Meta WhatsApp (WABA)"
  integrationSlug: string; // e.g. "meta-waba"
  workspace: {
    id: string; // e.g. "WS-94812"
    name: string; // e.g. "Sharma Traders Operations"
    shortName: string; // e.g. "Sharma Traders"
    org: string;
  };
  environment: "Production" | "Staging";
  resultLabel: string; // e.g. "401 HMAC mismatch"
  durationMs: number;
  endpoint: string;
  traceId: string;
  requestId: string;
  incidentId?: string;
  caseId?: string;
  problem: string;
  classification: "Customer Configuration" | "Platform" | "Provider" | "Dependency" | "Release" | "Unknown";
  confidence: "High" | "Medium" | "Low";
  diagnosticSummary: {
    title: string;
    message: string;
    errorCode: string;
    failedLayer: string;
    confidence: "High" | "Medium" | "Low";
  };
  impact: {
    similarErrorsLastHour: number;
    affectedWorkspacesCount: number;
    affectedWorkspacesSummary: string;
    activeIncidentId?: string;
    activeIncidentStatus?: string;
    lastSuccessfulTime: string;
    lastSuccessfulCode: number;
  };
  chain: Array<{
    type: "Workspace" | "Product" | "Service" | "Integration" | "Endpoint" | "Event" | "Result";
    label: string;
    isError?: boolean;
  }>;
  availableActions: DiagnosticActionItem[];
  executionOutput: {
    status: "PROBE FAILED" | "PROBE PASSED" | "RUNNING";
    durationMs: number;
    probeId: string;
    operator: string;
    logs: string[];
    reason: string;
    suggestedAction: string;
    canRevalidateCredential?: boolean;
    openIntegrationHref?: string;
  };
  relatedObjects: {
    workspaceId: string;
    workspaceName: string;
    product: string;
    integration: string;
    incidentId?: string;
    caseId?: string;
    traceId: string;
    release: string;
  };
  timeline: Array<{
    time: string;
    actor: string;
    action: string;
    result: string;
    type: "success" | "error" | "diagnostic" | "incident" | "case";
  }>;
  auditTrail: Array<{
    eventId: string;
    correlationId: string;
    actor: string;
    role: string;
    timestamp: string;
    environment: string;
    target: string;
    action: string;
    reason: string;
    result: "Failed" | "Success" | "Pending";
    linkedIncident?: string;
    linkedCase?: string;
  }>;
};

export const MOCK_DIAGNOSTIC_RUNS: DiagnosticInvestigation[] = [
  // 1. Chat with Sahayogi — Meta WhatsApp HMAC Mismatch (Selected Default)
  {
    id: "diag-101",
    timestamp: "14:24:18",
    relativeTime: "2 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:24:18.421 IST",
    status: "Failed",
    statusCode: 401,
    statusText: "HMAC signature verification failed",
    product: "Chat with Sahayogi",
    service: "WhatsApp Integration",
    integration: "Meta WhatsApp (WABA)",
    integrationSlug: "meta-waba",
    workspace: {
      id: "WS-94812",
      name: "Sharma Traders Operations",
      shortName: "Sharma Traders",
      org: "Sharma Enterprises Group",
    },
    environment: "Production",
    resultLabel: "401 HMAC mismatch",
    durationMs: 342,
    endpoint: "/v2/whatsapp/messages/webhook",
    traceId: "trc_94812_01j8m4k",
    requestId: "req_7fa92k3",
    incidentId: "INC-10291",
    caseId: "TK-9011",
    problem: "HMAC signature verification failed for incoming WhatsApp webhook.",
    classification: "Customer Configuration",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message:
        "The configured provider credential or app-secret hash could not be validated against the payload signature.",
      errorCode: "WHATSAPP_AUTH_401",
      failedLayer: "External Provider Integration (Meta Egress)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 7,
      affectedWorkspacesCount: 1,
      affectedWorkspacesSummary: "Sharma Traders",
      activeIncidentId: "INC-10291",
      activeIncidentStatus: "Investigating",
      lastSuccessfulTime: "27 Sep, 18:42",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Sharma Traders Operations (WS-94812)" },
      { type: "Product", label: "Chat with Sahayogi" },
      { type: "Service", label: "WhatsApp Integration" },
      { type: "Integration", label: "Meta WhatsApp (WABA)" },
      { type: "Endpoint", label: "/v2/whatsapp/messages/webhook" },
      { type: "Event", label: "Webhook Event" },
      { type: "Result", label: "401 HMAC mismatch", isError: true },
    ],
    availableActions: [
      {
        id: "webhook_ping",
        name: "Webhook Ping & ACK",
        description: "Tests end-to-end webhook handshake & delivery acknowledgment",
        risk: "SAFE",
        lastRun: "2 mins ago",
        result: "Failed",
        durationMs: 342,
        expectedEffect: "Read-only probe. Sends synthetic test packet to verify ACK.",
      },
      {
        id: "hmac_check",
        name: "HMAC Signature Check",
        description: "Compares secret hash agreement against recent webhook payload signature",
        risk: "SAFE",
        lastRun: "2 mins ago",
        result: "Failed",
        durationMs: 396,
        expectedEffect: "Read-only diagnostic check. No customer configuration will be modified.",
      },
      {
        id: "ssl_cert",
        name: "Verify SSL/TLS Certificate",
        description: "Validates endpoint TLS chain, SAN entries, and expiry dates",
        risk: "SAFE",
        lastRun: "12 mins ago",
        result: "Passed",
        durationMs: 42,
        expectedEffect: "Read-only TLS handshake check against Cloudflare CDN edge.",
      },
      {
        id: "dns_edge",
        name: "Validate DNS & Edge",
        description: "Checks edge resolving, Anycast routing, and TTL expiration",
        risk: "SAFE",
        lastRun: "20 mins ago",
        result: "Passed",
        durationMs: 24,
        expectedEffect: "Performs DNS lookup and edge traceroute for customer domain.",
      },
      {
        id: "provider_health",
        name: "Provider Health Check",
        description: "Queries Meta Graph Cloud API status & rate limits for this WABA account",
        risk: "SAFE",
        lastRun: "35 mins ago",
        result: "Passed",
        durationMs: 148,
        expectedEffect: "Fetches Meta public status endpoint. No write operations.",
      },
      {
        id: "cred_validation",
        name: "Integration Credential Validation",
        description: "Re-checks WABA system token handshake against Meta Graph API",
        risk: "APPROVAL REQUIRED",
        expectedEffect: "Requires approval. Refreshes token session state against keystore.",
      },
      {
        id: "replay_check",
        name: "Recent Event Replay Check",
        description: "Re-delivers last failed webhook payload into isolated sandbox verifier",
        risk: "APPROVAL REQUIRED",
        expectedEffect: "Requires approval. Replays sanitized webhook payload in sandbox.",
      },
      {
        id: "dep_health",
        name: "Dependency Health Check",
        description: "Runs upstream ping checks on Redis idempotency cache and Postgres queue",
        risk: "SAFE",
        lastRun: "5 mins ago",
        result: "Passed",
        durationMs: 18,
        expectedEffect: "Internal dependency probe. Zero customer impact.",
      },
    ],
    executionOutput: {
      status: "PROBE FAILED",
      durationMs: 396,
      probeId: "prb_auto_WS-94812",
      operator: "Dhruv Singla",
      logs: [
        "[12:54:12] Initializing HMAC signature diagnostic",
        "[12:54:12] Target: Meta WhatsApp webhook",
        "[12:54:13] Event signature received",
        "[12:54:13] Comparing configured app-secret hash",
        "[12:54:14] FAIL: Signature validation failed",
        "[12:54:14] Provider credential appears expired",
      ],
      reason: "Configured provider credential could not validate the incoming webhook signature.",
      suggestedAction:
        "Revalidate / rotate the Meta WABA credential after confirming the current Meta app-secret configuration.",
      canRevalidateCredential: true,
      openIntegrationHref: "/technical-support/integrations",
    },
    relatedObjects: {
      workspaceId: "WS-94812",
      workspaceName: "Sharma Traders Operations",
      product: "Chat with Sahayogi",
      integration: "Meta WhatsApp (WABA)",
      incidentId: "INC-10291",
      caseId: "TK-9011",
      traceId: "trc_94812_01j8m4k",
      release: "Release 2026.09.27.3",
    },
    timeline: [
      {
        time: "14:18",
        actor: "Meta Egress",
        action: "Webhook delivery succeeded",
        result: "200 OK",
        type: "success",
      },
      {
        time: "14:21",
        actor: "Meta Health Monitor",
        action: "Provider credential validation failed",
        result: "Token Stale",
        type: "error",
      },
      {
        time: "14:22",
        actor: "Ingress Gateway",
        action: "First 401 webhook rejection detected",
        result: "401 Unauthorized",
        type: "error",
      },
      {
        time: "14:24",
        actor: "Dhruv Singla",
        action: "Diagnostic probe executed",
        result: "Completed (396 ms)",
        type: "diagnostic",
      },
      {
        time: "14:24",
        actor: "Setu Probe Worker",
        action: "HMAC validation failed",
        result: "FAIL: Signature Mismatch",
        type: "error",
      },
      {
        time: "14:25",
        actor: "Automated SRE Correlator",
        action: "Incident INC-10291 linked",
        result: "Active (Investigating)",
        type: "incident",
      },
      {
        time: "14:26",
        actor: "BoSS Bridge",
        action: "Support case TK-9011 updated",
        result: "Synchronized",
        type: "case",
      },
    ],
    auditTrail: [
      {
        eventId: "evt_prb_94812_01",
        correlationId: "corr_waba_7fa92k3",
        actor: "dhruv.singla@setu.co",
        role: "Tier-2 Technical Support",
        timestamp: "28 Sep 2026, 14:24:18 IST",
        environment: "Production",
        target: "Sharma Traders Operations (WS-94812)",
        action: "HMAC_SIGNATURE_CHECK",
        reason: "TK-9011",
        result: "Failed",
        linkedIncident: "INC-10291",
        linkedCase: "TK-9011",
      },
      {
        eventId: "evt_prb_94812_02",
        correlationId: "corr_waba_7fa92k4",
        actor: "dhruv.singla@setu.co",
        role: "Tier-2 Technical Support",
        timestamp: "28 Sep 2026, 14:24:20 IST",
        environment: "Production",
        target: "Sharma Traders Operations (WS-94812)",
        action: "WEBHOOK_PING_ACK",
        reason: "TK-9011",
        result: "Failed",
        linkedIncident: "INC-10291",
        linkedCase: "TK-9011",
      },
      {
        eventId: "evt_prb_94812_03",
        correlationId: "corr_tls_94812",
        actor: "system.automated_probe@setu.co",
        role: "Automated Probe Daemon",
        timestamp: "28 Sep 2026, 14:12:00 IST",
        environment: "Production",
        target: "Sharma Traders Operations (WS-94812)",
        action: "VERIFY_SSL_TLS_CERT",
        reason: "Scheduled Health Sweep",
        result: "Success",
      },
    ],
  },

  // 2. BoSS — Payment Reconciliation (Bharat Agro)
  {
    id: "diag-102",
    timestamp: "14:18:42",
    relativeTime: "8 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:18:42.110 IST",
    status: "Success",
    statusCode: 200,
    statusText: "Reconciliation cycle nominal",
    product: "BoSS",
    service: "Payment Reconciliation",
    integration: "Razorpay Core Gateway",
    integrationSlug: "razorpay",
    workspace: {
      id: "WS-51928",
      name: "Bharat Agro Primary",
      shortName: "Bharat Agro",
      org: "Bharat Agro Exporters Ltd",
    },
    environment: "Production",
    resultLabel: "200 OK",
    durationMs: 184,
    endpoint: "/api/v3/reconcile/payments/batch",
    traceId: "trc_51928_88f91a",
    requestId: "req_3bc11x9",
    problem: "Nominal batch reconciliation cycle completed without ledger drift.",
    classification: "Platform",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message: "Payment gateway settlements and ledger journal entries matched with zero variance.",
      errorCode: "RECONCILE_SUCCESS_200",
      failedLayer: "None (All Systems Nominal)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 0,
      affectedWorkspacesCount: 0,
      affectedWorkspacesSummary: "None",
      lastSuccessfulTime: "28 Sep, 14:18",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Bharat Agro Primary (WS-51928)" },
      { type: "Product", label: "BoSS" },
      { type: "Service", label: "Payment Reconciliation" },
      { type: "Integration", label: "Razorpay Core Gateway" },
      { type: "Endpoint", label: "/api/v3/reconcile/payments/batch" },
      { type: "Event", label: "Settlement Batch Ingestion" },
      { type: "Result", label: "200 OK" },
    ],
    availableActions: [
      {
        id: "ledger_drift_check",
        name: "Ledger Balance Drift Check",
        description: "Compares Razorpay captured sum against ERP accounts receivable journal",
        risk: "SAFE",
        lastRun: "8 mins ago",
        result: "Passed",
        durationMs: 184,
        expectedEffect: "Read-only settlement query across 12 hours.",
      },
      {
        id: "webhook_signature_check",
        name: "Payment Webhook Verifier",
        description: "Validates payment.captured HMAC SHA-256 secret against gateway secret",
        risk: "SAFE",
        lastRun: "1 hour ago",
        result: "Passed",
        durationMs: 38,
        expectedEffect: "Verifies test webhook HMAC without mutating records.",
      },
    ],
    executionOutput: {
      status: "PROBE PASSED",
      durationMs: 184,
      probeId: "prb_auto_WS-51928",
      operator: "Dhruv Singla",
      logs: [
        "[14:18:40] Initiating Razorpay payment settlement audit",
        "[14:18:41] Retrieved 428 transaction entries from gateway",
        "[14:18:42] Ledger reconciliation hash: 0x9f1a28... Verified",
        "[14:18:42] PASS: All 428 transactions matched with 0 balance drift",
      ],
      reason: "All ledger records verified against Razorpay payout reports.",
      suggestedAction: "No action required. All payment reconciliation services healthy.",
      canRevalidateCredential: false,
    },
    relatedObjects: {
      workspaceId: "WS-51928",
      workspaceName: "Bharat Agro Primary",
      product: "BoSS",
      integration: "Razorpay Core Gateway",
      traceId: "trc_51928_88f91a",
      release: "Release 2026.09.28.1",
    },
    timeline: [
      {
        time: "14:18",
        actor: "Reconciliation Worker",
        action: "Batch reconciliation completed",
        result: "200 OK",
        type: "success",
      },
    ],
    auditTrail: [
      {
        eventId: "evt_prb_51928_01",
        correlationId: "corr_recon_3bc11x9",
        actor: "system.cron@setu.co",
        role: "Settlement Correlator",
        timestamp: "28 Sep 2026, 14:18:42 IST",
        environment: "Production",
        target: "Bharat Agro Primary (WS-51928)",
        action: "LEDGER_BALANCE_DRIFT_CHECK",
        reason: "Periodic Settlement",
        result: "Success",
      },
    ],
  },

  // 3. Sahayogi Cloud — Tally Health (Kalyan Logistics)
  {
    id: "diag-103",
    timestamp: "14:17:05",
    relativeTime: "12 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:17:05.814 IST",
    status: "Failed",
    statusCode: 503,
    statusText: "Gateway Timeout / Agent Unresponsive",
    product: "Sahayogi Cloud",
    service: "Tally Health",
    integration: "Tally on Cloud",
    integrationSlug: "tally",
    workspace: {
      id: "WS-73194",
      name: "Kalyan Logistics",
      shortName: "Kalyan Logistics",
      org: "Kalyan Supply Chain Ltd",
    },
    environment: "Production",
    resultLabel: "503 Gateway Timeout",
    durationMs: 3100,
    endpoint: "/v1/tally/company/sync",
    traceId: "trc_73194_49c81b",
    requestId: "req_8812ka9",
    incidentId: "INC-10304",
    caseId: "TK-9042",
    problem: "Tally ERP sync agent unresponsiveness exceeded 3000ms deadline.",
    classification: "Provider",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message:
        "The dedicated Tally Prime virtual container did not respond to XML synchronization within the timeout window.",
      errorCode: "TALLY_GW_TIMEOUT_503",
      failedLayer: "Cloud Infrastructure (Tally Dedicated VM)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 14,
      affectedWorkspacesCount: 1,
      affectedWorkspacesSummary: "Kalyan Logistics",
      activeIncidentId: "INC-10304",
      activeIncidentStatus: "Investigating",
      lastSuccessfulTime: "28 Sep, 13:40",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Kalyan Logistics (WS-73194)" },
      { type: "Product", label: "Sahayogi Cloud" },
      { type: "Service", label: "Tally Health" },
      { type: "Integration", label: "Tally on Cloud" },
      { type: "Endpoint", label: "/v1/tally/company/sync" },
      { type: "Event", label: "Tally Prime XML Sync Request" },
      { type: "Result", label: "503 Gateway Timeout", isError: true },
    ],
    availableActions: [
      {
        id: "tally_agent_ping",
        name: "Tally Agent Process Ping",
        description: "Checks PID status and socket listening port on dedicated virtual machine",
        risk: "SAFE",
        lastRun: "12 mins ago",
        result: "Failed",
        durationMs: 3100,
        expectedEffect: "Socket health check. Does not restart service.",
      },
      {
        id: "vm_resource_check",
        name: "VM IOPS & Memory Profiler",
        description: "Checks EBS disk throughput and RAM usage for virtual host container",
        risk: "SAFE",
        lastRun: "10 mins ago",
        result: "Passed",
        durationMs: 142,
        expectedEffect: "Read-only metrics query to hypervisor.",
      },
      {
        id: "restart_tally_service",
        name: "Restart Tally XML Service",
        description: "Executes graceful systemctl restart on customer isolated Tally bridge",
        risk: "APPROVAL REQUIRED",
        expectedEffect: "Restarts background process. Requires support lead sign-off.",
      },
    ],
    executionOutput: {
      status: "PROBE FAILED",
      durationMs: 3100,
      probeId: "prb_auto_WS-73194",
      operator: "Dhruv Singla",
      logs: [
        "[14:17:02] Probing Tally agent socket: tcp://10.240.12.8:9000",
        "[14:17:03] Connection established, sending test XML handshake",
        "[14:17:05] Socket timed out after 3000ms waiting for TALLYREQUEST response",
        "[14:17:05] FAIL: Tally Prime process deadlocked or servicing heavy report calculation",
      ],
      reason: "Tally container process busy or deadlocked on large ledger calculation.",
      suggestedAction: "Check VM active memory and request approval for graceful service restart.",
      canRevalidateCredential: false,
    },
    relatedObjects: {
      workspaceId: "WS-73194",
      workspaceName: "Kalyan Logistics",
      product: "Sahayogi Cloud",
      integration: "Tally on Cloud",
      incidentId: "INC-10304",
      caseId: "TK-9042",
      traceId: "trc_73194_49c81b",
      release: "Release 2026.09.26.1",
    },
    timeline: [
      {
        time: "14:15",
        actor: "Sync Scheduler",
        action: "Hourly ledger sync triggered",
        result: "Started",
        type: "diagnostic",
      },
      {
        time: "14:17",
        actor: "Gateway Proxy",
        action: "503 timeout returned to client",
        result: "503 Timeout",
        type: "error",
      },
    ],
    auditTrail: [
      {
        eventId: "evt_prb_73194_01",
        correlationId: "corr_tally_49c81b",
        actor: "dhruv.singla@setu.co",
        role: "Tier-2 Technical Support",
        timestamp: "28 Sep 2026, 14:17:05 IST",
        environment: "Production",
        target: "Kalyan Logistics (WS-73194)",
        action: "TALLY_AGENT_PROCESS_PING",
        reason: "TK-9042",
        result: "Failed",
        linkedIncident: "INC-10304",
        linkedCase: "TK-9042",
      },
    ],
  },

  // 4. Office Sahayogi — Deep Link Service (Rajdhani Fleet)
  {
    id: "diag-104",
    timestamp: "14:16:12",
    relativeTime: "16 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:16:12.440 IST",
    status: "Success",
    statusCode: 200,
    statusText: "Deep link resolution successful",
    product: "Office Sahayogi",
    service: "Deep Link Service",
    integration: "Microsoft Graph / 365 API",
    integrationSlug: "microsoft-365",
    workspace: {
      id: "WS-31902",
      name: "Rajdhani Fleet",
      shortName: "Rajdhani Fleet",
      org: "Rajdhani Logistics Network",
    },
    environment: "Production",
    resultLabel: "200 OK",
    durationMs: 48,
    endpoint: "/v1/office/deeplink/resolve",
    traceId: "trc_31902_72a11b",
    requestId: "req_19bc88a",
    problem: "Deep link resolution and JWT validation passed nominal threshold.",
    classification: "Platform",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message: "Office document token generated and cross-tenant deep link resolved cleanly.",
      errorCode: "OFFICE_SUCCESS_200",
      failedLayer: "None (All Systems Nominal)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 0,
      affectedWorkspacesCount: 0,
      affectedWorkspacesSummary: "None",
      lastSuccessfulTime: "28 Sep, 14:16",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Rajdhani Fleet (WS-31902)" },
      { type: "Product", label: "Office Sahayogi" },
      { type: "Service", label: "Deep Link Service" },
      { type: "Integration", label: "Microsoft Graph / 365 API" },
      { type: "Endpoint", label: "/v1/office/deeplink/resolve" },
      { type: "Event", label: "M365 OAuth Token Verification" },
      { type: "Result", label: "200 OK" },
    ],
    availableActions: [
      {
        id: "deeplink_jwt_check",
        name: "Verify Deep Link Signature",
        description: "Validates HMAC-SHA256 signature and expiry timestamp on shared URL",
        risk: "SAFE",
        lastRun: "16 mins ago",
        result: "Passed",
        durationMs: 48,
        expectedEffect: "Cryptographic signature validation without token refresh.",
      },
    ],
    executionOutput: {
      status: "PROBE PASSED",
      durationMs: 48,
      probeId: "prb_auto_WS-31902",
      operator: "Dhruv Singla",
      logs: [
        "[14:16:11] Validating M365 tenant deep link URL",
        "[14:16:12] Azure AD signing key ID (kid) retrieved from cache",
        "[14:16:12] Token signature verified (48ms total latency)",
        "[14:16:12] PASS: Destination URI valid and tenant authorized",
      ],
      reason: "All Azure AD signing certificates valid and token signatures verified.",
      suggestedAction: "System nominal.",
    },
    relatedObjects: {
      workspaceId: "WS-31902",
      workspaceName: "Rajdhani Fleet",
      product: "Office Sahayogi",
      integration: "Microsoft Graph / 365 API",
      traceId: "trc_31902_72a11b",
      release: "Release 2026.09.28.1",
    },
    timeline: [
      {
        time: "14:16",
        actor: "Deep Link Proxy",
        action: "Token validated and routed",
        result: "200 OK",
        type: "success",
      },
    ],
    auditTrail: [],
  },

  // 5. Tax Sahayogi — ITR API Sync (Mehta & Co)
  {
    id: "diag-105",
    timestamp: "14:12:08",
    relativeTime: "20 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:12:08.902 IST",
    status: "Success",
    statusCode: 200,
    statusText: "ITD portal session token valid",
    product: "Tax Sahayogi",
    service: "ITR API Sync",
    integration: "Income Tax Department API",
    integrationSlug: "income-tax-api",
    workspace: {
      id: "WS-84102",
      name: "Mehta & Co Operations",
      shortName: "Mehta & Co",
      org: "Mehta Chartered Accountants LLP",
    },
    environment: "Production",
    resultLabel: "200 OK",
    durationMs: 612,
    endpoint: "/v2/tax/itr/ack-status",
    traceId: "trc_84102_19c84e",
    requestId: "req_4412mm7",
    problem: "ITD Portal session token validated successfully and ACK retrieved.",
    classification: "Platform",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message: "Income Tax Department E-filing portal authenticated and verified returns.",
      errorCode: "ITD_AUTH_200",
      failedLayer: "None (All Systems Nominal)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 0,
      affectedWorkspacesCount: 0,
      affectedWorkspacesSummary: "None",
      lastSuccessfulTime: "28 Sep, 14:12",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Mehta & Co Operations (WS-84102)" },
      { type: "Product", label: "Tax Sahayogi" },
      { type: "Service", label: "ITR API Sync" },
      { type: "Integration", label: "Income Tax Department API" },
      { type: "Endpoint", label: "/v2/tax/itr/ack-status" },
      { type: "Event", label: "ITD Session Handshake" },
      { type: "Result", label: "200 OK" },
    ],
    availableActions: [
      {
        id: "itd_cert_check",
        name: "Verify Digital Signature (DSC) Bridge",
        description: "Validates USB/Cloud DSC cryptographic signature provider",
        risk: "SAFE",
        lastRun: "20 mins ago",
        result: "Passed",
        durationMs: 612,
        expectedEffect: "Cryptographic validation of CA class 3 certificate chain.",
      },
    ],
    executionOutput: {
      status: "PROBE PASSED",
      durationMs: 612,
      probeId: "prb_auto_WS-84102",
      operator: "Dhruv Singla",
      logs: [
        "[14:12:07] Connecting to ITD E-filing gateway via NIC Bridge",
        "[14:12:08] Mutual TLS certificate authenticated",
        "[14:12:08] PASS: Received HTTP 200 with ACK token",
      ],
      reason: "ITD Gateway nominal and DSC session alive.",
      suggestedAction: "System nominal.",
    },
    relatedObjects: {
      workspaceId: "WS-84102",
      workspaceName: "Mehta & Co Operations",
      product: "Tax Sahayogi",
      integration: "Income Tax Department API",
      traceId: "trc_84102_19c84e",
      release: "Release 2026.09.27.3",
    },
    timeline: [],
    auditTrail: [],
  },

  // 6. Investor Sahayogi — Market Data Feed (Sharma Traders)
  {
    id: "diag-106",
    timestamp: "14:09:33",
    relativeTime: "28 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:09:33.201 IST",
    status: "Failed",
    statusCode: 429,
    statusText: "Rate Limit Exceeded from Upstream Feed",
    product: "Investor Sahayogi",
    service: "Market Data Feed",
    integration: "CAMS / KFintech Statement Feed",
    integrationSlug: "cams",
    workspace: {
      id: "WS-94812",
      name: "Sharma Traders Operations",
      shortName: "Sharma Traders",
      org: "Sharma Enterprises Group",
    },
    environment: "Production",
    resultLabel: "429 Rate Limited",
    durationMs: 1240,
    endpoint: "/v1/investor/portfolio/nav-sync",
    traceId: "trc_94812_09c71a",
    requestId: "req_8182pq1",
    incidentId: "INC-10288",
    caseId: "TK-8994",
    problem: "Upstream RTAs rate-limited synchronous quote requests from this IP.",
    classification: "Provider",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message:
        "CAMS/KFintech statement service throttled inbound calls exceeding 120 calls/min tier allowance.",
      errorCode: "FEED_RATE_LIMIT_429",
      failedLayer: "External Provider Integration (CAMS Egress)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 18,
      affectedWorkspacesCount: 1,
      affectedWorkspacesSummary: "Sharma Traders",
      activeIncidentId: "INC-10288",
      activeIncidentStatus: "Investigating",
      lastSuccessfulTime: "28 Sep, 13:50",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Sharma Traders Operations (WS-94812)" },
      { type: "Product", label: "Investor Sahayogi" },
      { type: "Service", label: "Market Data Feed" },
      { type: "Integration", label: "CAMS / KFintech Statement Feed" },
      { type: "Endpoint", label: "/v1/investor/portfolio/nav-sync" },
      { type: "Event", label: "RTA NAV Polling Request" },
      { type: "Result", label: "429 Rate Limited", isError: true },
    ],
    availableActions: [
      {
        id: "quota_probe",
        name: "Check RTA API Token Quota",
        description: "Queries current hourly bucket consumption on upstream aggregator",
        risk: "SAFE",
        lastRun: "28 mins ago",
        result: "Failed",
        durationMs: 1240,
        expectedEffect: "Read quota status header. Zero side effects.",
      },
      {
        id: "flush_nav_cache",
        name: "Flush Local Stale NAV Cache",
        description: "Clears Redis in-memory cache to trigger fresh pull after cooldown",
        risk: "APPROVAL REQUIRED",
        expectedEffect: "Clears cache keys. Requires SRE confirmation.",
      },
    ],
    executionOutput: {
      status: "PROBE FAILED",
      durationMs: 1240,
      probeId: "prb_auto_WS-94812",
      operator: "Dhruv Singla",
      logs: [
        "[14:09:31] Sending synthetic ping to CAMS API endpoint",
        "[14:09:32] Response HTTP 429 Too Many Requests",
        "[14:09:33] Retry-After header indicates 180s cooldown needed",
      ],
      reason: "Aggregator rate limiting active. 180-second backoff required.",
      suggestedAction: "Wait for cooldown or route via secondary KFintech failover pool.",
    },
    relatedObjects: {
      workspaceId: "WS-94812",
      workspaceName: "Sharma Traders Operations",
      product: "Investor Sahayogi",
      integration: "CAMS / KFintech Statement Feed",
      incidentId: "INC-10288",
      caseId: "TK-8994",
      traceId: "trc_94812_09c71a",
      release: "Release 2026.09.27.3",
    },
    timeline: [],
    auditTrail: [],
  },

  // 7. My Sahayogi — Payslip Sync (Deccan Retail)
  {
    id: "diag-107",
    timestamp: "14:05:11",
    relativeTime: "32 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:05:11.890 IST",
    status: "Success",
    statusCode: 200,
    statusText: "Payslip batch encrypted and signed",
    product: "My Sahayogi",
    service: "Payslip Sync",
    integration: "Setu Account Aggregator",
    integrationSlug: "setu-aa",
    workspace: {
      id: "WS-44192",
      name: "Deccan Retail",
      shortName: "Deccan Retail",
      org: "Deccan Retail Outlets Pvt Ltd",
    },
    environment: "Production",
    resultLabel: "200 OK",
    durationMs: 220,
    endpoint: "/v1/my/payroll/dispatch",
    traceId: "trc_44192_81d09x",
    requestId: "req_5901la2",
    problem: "Digital payslip signature verification & encrypted delivery completed.",
    classification: "Platform",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message: "End-to-end payroll encryption keys verified and salary receipts signed.",
      errorCode: "PAYROLL_SYNC_200",
      failedLayer: "None (All Systems Nominal)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 0,
      affectedWorkspacesCount: 0,
      affectedWorkspacesSummary: "None",
      lastSuccessfulTime: "28 Sep, 14:05",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Deccan Retail (WS-44192)" },
      { type: "Product", label: "My Sahayogi" },
      { type: "Service", label: "Payslip Sync" },
      { type: "Integration", label: "Setu Account Aggregator" },
      { type: "Endpoint", label: "/v1/my/payroll/dispatch" },
      { type: "Event", label: "KMS Envelope Decryption" },
      { type: "Result", label: "200 OK" },
    ],
    availableActions: [
      {
        id: "kms_key_audit",
        name: "Audit KMS Encryption Key Ring",
        description: "Validates AWS KMS master key state and IAM policy permissions",
        risk: "SAFE",
        lastRun: "32 mins ago",
        result: "Passed",
        durationMs: 220,
        expectedEffect: "Read-only IAM policy check.",
      },
    ],
    executionOutput: {
      status: "PROBE PASSED",
      durationMs: 220,
      probeId: "prb_auto_WS-44192",
      operator: "Dhruv Singla",
      logs: [
        "[14:05:10] Querying AWS KMS key ring: arn:aws:kms:ap-south-1:.../setu-payslip",
        "[14:05:11] Key state: Enabled, policy allow: Valid",
        "[14:05:11] PASS: All 1,840 payslips encrypted successfully",
      ],
      reason: "All cryptographic operations verified.",
      suggestedAction: "System nominal.",
    },
    relatedObjects: {
      workspaceId: "WS-44192",
      workspaceName: "Deccan Retail",
      product: "My Sahayogi",
      integration: "Setu Account Aggregator",
      traceId: "trc_44192_81d09x",
      release: "Release 2026.09.28.1",
    },
    timeline: [],
    auditTrail: [],
  },

  // 8. Studio Sahayogi — Image Generation (PixelCraft)
  {
    id: "diag-108",
    timestamp: "14:02:18",
    relativeTime: "38 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:02:18.102 IST",
    status: "Success",
    statusCode: 200,
    statusText: "Diffusion pipeline nominal",
    product: "Studio Sahayogi",
    service: "Image Generation",
    integration: "GPU Cluster / Midjourney",
    integrationSlug: "midjourney",
    workspace: {
      id: "WS-90214",
      name: "PixelCraft",
      shortName: "PixelCraft",
      org: "PixelCraft Digital Media",
    },
    environment: "Production",
    resultLabel: "200 OK",
    durationMs: 1020,
    endpoint: "/v2/studio/assets/generate",
    traceId: "trc_90214_11a88z",
    requestId: "req_7721ba3",
    problem: "GPU cluster diffusion task rendered and asset hash uploaded to CDN.",
    classification: "Platform",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message: "Diffusion inference workers responding within SLA target (1.02s).",
      errorCode: "STUDIO_GEN_200",
      failedLayer: "None (All Systems Nominal)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 0,
      affectedWorkspacesCount: 0,
      affectedWorkspacesSummary: "None",
      lastSuccessfulTime: "28 Sep, 14:02",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "PixelCraft (WS-90214)" },
      { type: "Product", label: "Studio Sahayogi" },
      { type: "Service", label: "Image Generation" },
      { type: "Integration", label: "GPU Cluster / Midjourney" },
      { type: "Endpoint", label: "/v2/studio/assets/generate" },
      { type: "Event", label: "CUDA Tensor Inference" },
      { type: "Result", label: "200 OK" },
    ],
    availableActions: [
      {
        id: "gpu_vram_probe",
        name: "Check Cluster GPU VRAM & Queue",
        description: "Queries active tensor jobs and VRAM headroom across worker nodes",
        risk: "SAFE",
        lastRun: "38 mins ago",
        result: "Passed",
        durationMs: 1020,
        expectedEffect: "Metrics probe across GPU cluster.",
      },
    ],
    executionOutput: {
      status: "PROBE PASSED",
      durationMs: 1020,
      probeId: "prb_auto_WS-90214",
      operator: "Dhruv Singla",
      logs: [
        "[14:02:17] Connecting to GPU orchestrator",
        "[14:02:18] 8x NVIDIA H100 nodes operational (32% VRAM utilization)",
        "[14:02:18] PASS: Generation inference complete",
      ],
      reason: "All inference nodes nominal.",
      suggestedAction: "System nominal.",
    },
    relatedObjects: {
      workspaceId: "WS-90214",
      workspaceName: "PixelCraft",
      product: "Studio Sahayogi",
      integration: "GPU Cluster / Midjourney",
      traceId: "trc_90214_11a88z",
      release: "Release 2026.09.28.1",
    },
    timeline: [],
    auditTrail: [],
  },

  // 9. Sahayogi One — SSO & Identity Sync (Hind Auto Spares)
  {
    id: "diag-109",
    timestamp: "13:58:45",
    relativeTime: "42 mins ago",
    absoluteTimestamp: "28 Sep 2026, 13:58:45.312 IST",
    status: "Success",
    statusCode: 200,
    statusText: "SAML assertion validated",
    product: "Sahayogi One",
    service: "Identity & SSO Gateway",
    integration: "Setu Integration Core",
    integrationSlug: "setu-aa",
    workspace: {
      id: "WS-29108",
      name: "Hind Auto Spares Hub",
      shortName: "Hind Auto Spares",
      org: "Hind Automotive Ltd",
    },
    environment: "Production",
    resultLabel: "200 OK",
    durationMs: 38,
    endpoint: "/v1/auth/sso/saml/assertion",
    traceId: "trc_29108_55e21w",
    requestId: "req_9104kj8",
    problem: "SAML assertions validated and bearer JWT signed for workspace session.",
    classification: "Platform",
    confidence: "High",
    diagnosticSummary: {
      title: "Diagnostic Summary",
      message: "Customer IdP certificate verified and workspace membership token granted.",
      errorCode: "AUTH_SSO_200",
      failedLayer: "None (All Systems Nominal)",
      confidence: "High",
    },
    impact: {
      similarErrorsLastHour: 0,
      affectedWorkspacesCount: 0,
      affectedWorkspacesSummary: "None",
      lastSuccessfulTime: "28 Sep, 13:58",
      lastSuccessfulCode: 200,
    },
    chain: [
      { type: "Workspace", label: "Hind Auto Spares Hub (WS-29108)" },
      { type: "Product", label: "Sahayogi One" },
      { type: "Service", label: "Identity & SSO Gateway" },
      { type: "Integration", label: "Setu Integration Core" },
      { type: "Endpoint", label: "/v1/auth/sso/saml/assertion" },
      { type: "Event", label: "SAML 2.0 Metadata Check" },
      { type: "Result", label: "200 OK" },
    ],
    availableActions: [
      {
        id: "idp_cert_verify",
        name: "Verify IdP X.509 Certificate",
        description: "Validates corporate Okta/AzureAD SAML signing certificate expiration",
        risk: "SAFE",
        lastRun: "42 mins ago",
        result: "Passed",
        durationMs: 38,
        expectedEffect: "Cryptographic X.509 cert validation. No modification.",
      },
    ],
    executionOutput: {
      status: "PROBE PASSED",
      durationMs: 38,
      probeId: "prb_auto_WS-29108",
      operator: "Dhruv Singla",
      logs: [
        "[13:58:45] Verifying SAML 2.0 Response signature",
        "[13:58:45] Certificate issuer: DigiCert Global Root G2 (Valid for 340 days)",
        "[13:58:45] PASS: Assertion signature valid",
      ],
      reason: "SSO assertion valid and verified.",
      suggestedAction: "System nominal.",
    },
    relatedObjects: {
      workspaceId: "WS-29108",
      workspaceName: "Hind Auto Spares Hub",
      product: "Sahayogi One",
      integration: "Setu Integration Core",
      traceId: "trc_29108_55e21w",
      release: "Release 2026.09.28.1",
    },
    timeline: [],
    auditTrail: [],
  },
];
