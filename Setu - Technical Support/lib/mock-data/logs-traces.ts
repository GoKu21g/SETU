export type FailureClassification =
  | "customer_specific"
  | "product_wide"
  | "platform_wide"
  | "third_party_provider"
  | "unknown";

export type LogRecordType =
  | "http_request"
  | "webhook_delivery"
  | "integration_sync"
  | "provisioning_step"
  | "queue_job"
  | "auth_event"
  | "dependency_failure"
  | "config_change";

export type ReconciliationDrift = {
  expected: string;
  actual: string;
  severity: "benign" | "actionable" | "critical";
  sourceExpected: string;
  sourceActual: string;
  detectedAt: string;
  recommendedRepair: string;
};

export type ReleaseCorrelation = {
  releaseVersion: string;
  environment: string;
  deployedAt: string;
  errorSpikeAt: string;
  affectedService: string;
  preReleaseErrorRate: string;
  postReleaseErrorRate: string;
};

export type ProvisioningDetails = {
  workflowId: string;
  correlationId: string;
  plan: string;
  targetState: string;
  currentState: string;
  steps: Array<{
    stepNumber: number;
    name: string;
    status: "completed" | "failed" | "in_progress" | "pending";
    durationMs: number;
    providerRef?: string;
    errorDetail?: string;
  }>;
};

export type TechnicalLogRecord = {
  id: string;
  traceId: string;
  requestId: string;
  timestamp: string;
  absoluteTimestamp: string;
  status: number;
  statusCategory: "2xx" | "4xx" | "5xx" | "timeout" | "rate_limit" | "dependency";
  severity: "critical" | "warning" | "healthy" | "info";
  recordType: LogRecordType;
  product: string;
  service: string;
  component: string;
  operation: string;
  method: string;
  endpoint: string;
  workspace: {
    id: string;
    name: string;
    org: string;
    accountId: string;
  };
  environment: "Production" | "Staging";
  durationMs: number;
  classification: FailureClassification;
  diagnostic: {
    problem: string;
    errorCode: string;
    category: string;
    failedLayer: string;
    detectedCause: string;
    confidence: "High" | "Medium" | "Low" | "Undetermined";
    evidence: string[];
    recommendedChecks: string[];
  };
  impact: {
    affectedWorkspacesCount: number;
    similarErrorsLastHour: number;
    affectedServices: string[];
    linkedIncident?: {
      id: string;
      title: string;
      severity: "critical" | "warning";
      status: "Investigating" | "Monitoring" | "Resolved";
    };
    relatedBossCase?: {
      id: string;
      title: string;
      customer: string;
      url: string;
    };
  };
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: Record<string, any> | string;
    clientIp: string;
    userAgent: string;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: Record<string, any> | string;
    providerErrorCode?: string;
    providerMessage?: string;
  };
  tracePath: {
    spans: Array<{
      name: string;
      service: string;
      durationMs: number;
      status: "ok" | "error" | "warning";
      errorDetail?: string;
    }>;
  };
  timeline: Array<{
    time: string;
    title: string;
    detail: string;
    type: "info" | "error" | "retry" | "diagnostic" | "repair";
  }>;
  relatedObjects: {
    workspaceId: string;
    productId: string;
    integrationId?: string;
    subscriptionPlan?: string;
    releaseVersion?: string;
    provisioningRunId?: string;
  };
  safeRepairs: Array<{
    id: string;
    label: string;
    description: string;
    riskLevel: "safe" | "requires_confirmation" | "requires_approval";
    target: string;
    expectedOutcome: string;
    idempotent: boolean;
  }>;
  reconciliationDrift?: ReconciliationDrift;
  releaseCorrelation?: ReleaseCorrelation;
  provisioningDetails?: ProvisioningDetails;
};

export const MOCK_TECHNICAL_LOGS: TechnicalLogRecord[] = [
  // 1. Chat with Sahayogi — Meta WhatsApp HMAC Failure (Customer-Specific)
  {
    id: "log-101",
    traceId: "trc_94812_01j8m4k",
    requestId: "req_7fa92k3",
    timestamp: "2 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:24:18.421 IST",
    status: 401,
    statusCategory: "4xx",
    severity: "critical",
    recordType: "webhook_delivery",
    product: "Chat with Sahayogi",
    service: "WhatsApp Integration",
    component: "Meta Webhook Verifier",
    operation: "POST /v2/whatsapp/messages/webhook",
    method: "POST",
    endpoint: "/v2/whatsapp/messages/webhook",
    workspace: {
      id: "WS-94812",
      name: "Sharma Traders",
      org: "Sharma Enterprises Group",
      accountId: "ACC-94812-IN",
    },
    environment: "Production",
    durationMs: 342,
    classification: "customer_specific",
    diagnostic: {
      problem: "HMAC signature verification failed for incoming WhatsApp webhook.",
      errorCode: "WHATSAPP_AUTH_401",
      category: "Authentication / Integration",
      failedLayer: "External Provider Integration (Meta Egress)",
      detectedCause: "HMAC signature verification failed. The configured provider credential or app secret hash could not be validated against the payload signature.",
      confidence: "High",
      evidence: [
        "X-Hub-Signature-256 header provided by Meta did not match local HMAC computation with stored secret reference.",
        "Provider token last modified 28 days ago (expired Meta 60-day rotation cycle).",
        "Out of 18 active WhatsApp tenants, only WS-94812 experienced signature rejections in this window.",
      ],
      recommendedChecks: [
        "Verify registered Meta WABA webhook app secret in Integration Control Centre.",
        "Trigger Safe Credential Revalidation probe to verify handshake without exposing secrets.",
        "Check BoSS Support Case TKT-4821 for recent customer credential changes.",
      ],
    },
    impact: {
      affectedWorkspacesCount: 1,
      similarErrorsLastHour: 7,
      affectedServices: ["WhatsApp Ingress Gateway", "Chat with Sahayogi Message Dispatcher"],
      relatedBossCase: {
        id: "TKT-4821",
        title: "WhatsApp order notifications stopped delivering",
        customer: "Sharma Traders (Ramesh Sharma)",
        url: "https://boss.sahayogi.in/service/tickets/TKT-4821",
      },
      linkedIncident: {
        id: "INC-10291",
        title: "Meta WhatsApp WABA Webhook Ingress Rejections",
        severity: "warning",
        status: "Investigating",
      },
    },
    request: {
      method: "POST",
      url: "https://api.setu.co/v2/whatsapp/messages/webhook",
      headers: {
        "Host": "api.setu.co",
        "Content-Type": "application/json",
        "X-Setu-Trace-ID": "trc_94812_01j8m4k",
        "X-Hub-Signature-256": "sha256=a1b2c3d4e5f6...[VERIFICATION_SIGNATURE]",
        "User-Agent": "facebookplatform/1.0 (+http://developers.facebook.com)",
        "Authorization": "Bearer [SECRET_REF:waba_tok_94812_rot]",
      },
      body: {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "WABA_94812_PROD",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: { display_phone_number: "9198200XXXXX", phone_number_id: "PN_10928" },
                  statuses: [{ id: "wamid.HBgL...", status: "failed", timestamp: "1759049658" }],
                },
                field: "messages",
              },
            ],
          },
        ],
      },
      clientIp: "31.13.88.21 (Meta Edge, Singapore)",
      userAgent: "facebookplatform/1.0",
    },
    response: {
      status: 401,
      statusText: "Unauthorized",
      headers: {
        "Content-Type": "application/json",
        "X-Setu-Request-ID": "req_7fa92k3",
      },
      body: {
        error: {
          code: "UNAUTHORIZED",
          message: "HMAC signature verification failed for incoming WhatsApp webhook.",
          layer: "External Provider Integration (Meta Egress)",
          timestamp: "2026-09-28T14:24:18.421Z",
        },
      },
      providerErrorCode: "META_WABA_SIG_MISMATCH",
      providerMessage: "Provided signature sha256=a1b2... does not match expected payload digest computed with current active key.",
    },
    tracePath: {
      spans: [
        { name: "Cloudflare Edge Ingress", service: "Edge Router", durationMs: 18, status: "ok" },
        { name: "API Gateway Auth Filter", service: "Setu API Gateway", durationMs: 56, status: "ok" },
        { name: "HMAC Verification", service: "WhatsApp Ingress Gateway", durationMs: 268, status: "error", errorDetail: "Signature mismatch with secret ref waba_tok_94812_rot" },
      ],
    },
    timeline: [
      { time: "27 Sep, 18:42", title: "Last Successful Webhook", detail: "Processed 200 OK webhook for Sharma Traders order #4912", type: "info" },
      { time: "14:02:18", title: "First 401 Rejection", detail: "Meta webhook rejected with HMAC signature failure", type: "error" },
      { time: "14:03:45", title: "Webhook Retry Attempted", detail: "Meta retry #1 delivered and rejected with identical 401", type: "retry" },
      { time: "14:15:30", title: "Support Case Linked", detail: "BoSS Case TKT-4821 correlated automatically by workspace ID", type: "info" },
      { time: "14:24:18", title: "Current Failure Logged", detail: "Repeated rejection (7th occurrence this hour)", type: "error" },
    ],
    relatedObjects: {
      workspaceId: "WS-94812",
      productId: "chat-with-sahayogi",
      integrationId: "meta-waba-94812",
      subscriptionPlan: "Chat Business Scale",
      releaseVersion: "v2.8.14",
    },
    safeRepairs: [
      {
        id: "revalidate-waba",
        label: "Revalidate Meta Credential",
        description: "Executes an outbound read-only ping to the Meta Graph API to test credential integrity.",
        riskLevel: "safe",
        target: "Meta WABA Token (WS-94812)",
        expectedOutcome: "Refreshes OAuth token status and reports if customer needs to re-authorize via BoSS.",
        idempotent: true,
      },
      {
        id: "retry-webhook",
        label: "Retry Safe Webhook Ingestion",
        description: "Re-processes the dead-letter webhook payload once credentials have been re-verified.",
        riskLevel: "requires_confirmation",
        target: "Webhook Dead Letter Queue",
        expectedOutcome: "Delivers pending order update message without duplicating customer alerts.",
        idempotent: true,
      },
    ],
    reconciliationDrift: {
      expected: "Chat with Sahayogi = Active & Webhook Verified",
      actual: "WABA connection = Disconnected (HMAC 401 Rejection)",
      severity: "critical",
      sourceExpected: "Sahayogi One Entitlement & Provisioning Master",
      sourceActual: "Meta Graph Webhook Gateway Telemetry",
      detectedAt: "28 Sep 2026, 14:02:18 IST",
      recommendedRepair: "Revalidate Meta Credential and replay buffered dead-letter events",
    },
    releaseCorrelation: {
      releaseVersion: "v2.8.14",
      environment: "Production",
      deployedAt: "13:42 IST",
      errorSpikeAt: "14:02 IST",
      affectedService: "WhatsApp Ingress Gateway",
      preReleaseErrorRate: "0.2%",
      postReleaseErrorRate: "8.4%",
    },
  },

  // 2. BoSS (Finance & Accounts) — Payment Aggregator 504 Timeout (Third-Party Provider)
  {
    id: "log-102",
    traceId: "trc_10842_02k9p1x",
    requestId: "req_10842_rzp_cb_02",
    timestamp: "4 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:23:52.118 IST",
    status: 504,
    statusCategory: "timeout",
    severity: "warning",
    recordType: "integration_sync",
    product: "BoSS",
    service: "Finance & Accounts",
    component: "Payment Gateway Connector",
    operation: "POST /v1/payments/razorpay/callback",
    method: "POST",
    endpoint: "/v1/payments/razorpay/callback",
    workspace: {
      id: "WS-10842",
      name: "Bharat Agro",
      org: "Bharat Agro Producer Co.",
      accountId: "ACC-10842-IN",
    },
    environment: "Production",
    durationMs: 1240,
    classification: "third_party_provider",
    diagnostic: {
      problem: "Upstream payment aggregator callback timed out after exceeding 1200ms latency budget.",
      errorCode: "GATEWAY_TIMEOUT_504",
      category: "Integration / Upstream Provider",
      failedLayer: "Upstream Gateway (Razorpay Bank Rail)",
      detectedCause: "Upstream payment aggregator took >1200ms to respond to bank settlement acknowledgment.",
      confidence: "High",
      evidence: [
        "Ingress connection closed after 1240ms timeout window.",
        "Multiple workspaces across Setu experiencing 504s on the same payment rail (12 occurrences).",
        "Active incident INC-10291 in progress tracking Razorpay UPI latency degraded status.",
      ],
      recommendedChecks: [
        "Check StatusPage for Razorpay UPI banking network latency.",
        "Verify dead-letter queue buffering to ensure idempotency keys prevent duplicate ledger entries.",
      ],
    },
    impact: {
      affectedWorkspacesCount: 8,
      similarErrorsLastHour: 14,
      affectedServices: ["Payment Gateway Connector", "BoSS Invoice Reconciliation"],
      linkedIncident: {
        id: "INC-10291",
        title: "Razorpay / UPI Banking Egress Latency Spike",
        severity: "warning",
        status: "Investigating",
      },
    },
    request: {
      method: "POST",
      url: "https://api.setu.co/v1/payments/razorpay/callback",
      headers: {
        "Content-Type": "application/json",
        "X-Setu-Trace-ID": "trc_10842_02k9p1x",
        "X-Razorpay-Signature": "rzp_sig_77291a...[MASKED]",
      },
      body: {
        event: "payment.captured",
        payload: {
          payment: {
            entity: { id: "pay_K9z8471b", amount: 142000, currency: "INR", status: "captured" },
          },
        },
      },
      clientIp: "52.66.102.81 (Razorpay VPC, Mumbai)",
      userAgent: "Razorpay-Webhook/v1",
    },
    response: {
      status: 504,
      statusText: "Gateway Timeout",
      headers: { "Content-Type": "application/json" },
      body: { error: { code: "GATEWAY_TIMEOUT", message: "Upstream aggregator timeout >1200ms" } },
      providerErrorCode: "RZP_UPSTREAM_SLOW",
      providerMessage: "Bank switch latency 1890ms.",
    },
    tracePath: {
      spans: [
        { name: "Edge Listener", service: "API Gateway", durationMs: 12, status: "ok" },
        { name: "Payment Ingress", service: "Finance Connector", durationMs: 45, status: "ok" },
        { name: "Bank Verification Call", service: "Razorpay Upstream Rail", durationMs: 1183, status: "error", errorDetail: "Socket timed out after 1200ms" },
      ],
    },
    timeline: [
      { time: "14:10:00", title: "Incident INC-10291 Created", detail: "SRE flagged payment aggregator spike", type: "info" },
      { time: "14:23:52", title: "504 Timeout Event", detail: "Bharat Agro callback timed out and buffered to queue", type: "error" },
    ],
    relatedObjects: {
      workspaceId: "WS-10842",
      productId: "boss",
      integrationId: "razorpay-core",
      subscriptionPlan: "BoSS Enterprise 360",
    },
    safeRepairs: [
      {
        id: "check-queue-buffer",
        label: "Verify Payment Ledger Buffer",
        description: "Checks that payment id pay_K9z8471b is safely queued in the reconciliation buffer.",
        riskLevel: "safe",
        target: "Reconciliation Buffer",
        expectedOutcome: "Confirms zero data loss and automated re-attempt when aggregator recovers.",
        idempotent: true,
      },
    ],
  },

  // 3. Office Sahayogi — UPI Deep Links Create (200 OK)
  {
    id: "log-103",
    traceId: "trc_33910_03upi_ok",
    requestId: "req_33910_upi_03",
    timestamp: "6 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:22:41.309 IST",
    status: 200,
    statusCategory: "2xx",
    severity: "info",
    recordType: "http_request",
    product: "Office Sahayogi",
    service: "UPI Integration Switch",
    component: "Deep Link Generator",
    operation: "POST /v1/upi/deep-links/create",
    method: "POST",
    endpoint: "/v1/upi/deep-links/create",
    workspace: {
      id: "WS-33910",
      name: "Rajdhani Fleet",
      org: "Rajdhani Fleet Services Ltd",
      accountId: "ACC-33910-IN",
    },
    environment: "Production",
    durationMs: 48,
    classification: "customer_specific",
    diagnostic: {
      problem: "Request succeeded normally (200 OK). No faults detected.",
      errorCode: "SUCCESS_200",
      category: "Payments / UPI",
      failedLayer: "None",
      detectedCause: "Deep link generated successfully and verified with NPCI PSP handle registry.",
      confidence: "High",
      evidence: [
        "PSP handle validated in 14ms.",
        "QR string and intent URI generated and signed with Setu RSA-4096 key.",
      ],
      recommendedChecks: ["None required."],
    },
    impact: {
      affectedWorkspacesCount: 0,
      similarErrorsLastHour: 0,
      affectedServices: ["UPI Switch"],
    },
    request: {
      method: "POST",
      url: "https://api.setu.co/v1/upi/deep-links/create",
      headers: { "Content-Type": "application/json", "X-Setu-Trace-ID": "trc_33910_03upi_ok" },
      body: { amount: 25000, payeeVpa: "rajdhanifleet@yesbank", orderRef: "ORD_99182" },
      clientIp: "103.22.44.12",
      userAgent: "Setu-OfficeClient/2.0",
    },
    response: {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: { success: true, deepLink: "upi://pay?pa=rajdhanifleet@yesbank&am=25000" },
    },
    tracePath: {
      spans: [
        { name: "API Gateway", service: "Edge Router", durationMs: 8, status: "ok" },
        { name: "PSP Handle Verification", service: "NPCI Connector", durationMs: 14, status: "ok" },
        { name: "URI Signing", service: "Security Vault", durationMs: 26, status: "ok" },
      ],
    },
    timeline: [
      { time: "14:22:41", title: "UPI Link Created", detail: "Generated signed intent URL in 48ms", type: "info" },
    ],
    relatedObjects: {
      workspaceId: "WS-33910",
      productId: "office-sahayogi",
    },
    safeRepairs: [],
  },

  // 4. Sahayogi Cloud — Tally on Cloud VPS Port Unreachable (Customer Workload vs Cloud)
  {
    id: "log-104",
    traceId: "trc_77104_04cloud_503",
    requestId: "req_77104_cloud_04",
    timestamp: "8 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:21:09.882 IST",
    status: 503,
    statusCategory: "dependency",
    severity: "critical",
    recordType: "dependency_failure",
    product: "Sahayogi Cloud",
    service: "Cloud Infrastructure",
    component: "Tally on Cloud VM Bridge",
    operation: "GET /v1/cloud/vps/tally/health",
    method: "GET",
    endpoint: "/v1/cloud/vps/tally/health",
    workspace: {
      id: "WS-77104",
      name: "Kalyan Logistics",
      org: "Kalyan Transport Pvt Ltd",
      accountId: "ACC-77104-IN",
    },
    environment: "Production",
    durationMs: 3100,
    classification: "customer_specific",
    diagnostic: {
      problem: "Tally server service process unresponsive on customer dedicated VPS instance.",
      errorCode: "CLOUD_VPS_SERVICE_UNREACHABLE",
      category: "Cloud Infrastructure / Workload",
      failedLayer: "Customer VM Workload Layer (VM-DEL-042)",
      detectedCause: "Customer VM OS is healthy (CPU 18%, RAM 42%), but internal tally9.exe process hung on locked lockfile.",
      confidence: "High",
      evidence: [
        "Host hypervisor and Azure India Central data residency cluster are 100% operational.",
        "Remote desktop port 3389 reachable; internal IPC port 9000 timed out after 3000ms.",
        "Single-tenant issue isolated to VM-DEL-042 (Kalyan Logistics).",
      ],
      recommendedChecks: [
        "Verify Tally data directory lockfiles on VM-DEL-042.",
        "Restart Tally Background Service using safe non-disruptive supervisor signal.",
      ],
    },
    impact: {
      affectedWorkspacesCount: 1,
      similarErrorsLastHour: 3,
      affectedServices: ["Tally on Cloud", "Remote Desktop Gateway"],
    },
    request: {
      method: "GET",
      url: "https://api.setu.co/v1/cloud/vps/tally/health?vmId=VM-DEL-042",
      headers: { "X-Setu-Trace-ID": "trc_77104_04cloud_503" },
      body: "N/A (GET Request)",
      clientIp: "103.22.44.12",
      userAgent: "Setu-CloudMonitor/2.0",
    },
    response: {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" },
      body: { error: { code: "TALLY_UNREACHABLE", message: "Port 9000 connection refused on VM-DEL-042" } },
      providerErrorCode: "ECONNREFUSED_9000",
      providerMessage: "Target machine actively refused connection.",
    },
    tracePath: {
      spans: [
        { name: "Cloud Supervisor", service: "Sahayogi Cloud Control", durationMs: 25, status: "ok" },
        { name: "Azure Hypervisor Ping", service: "Azure Central India Host", durationMs: 65, status: "ok" },
        { name: "Tally Port Probe", service: "VM-DEL-042", durationMs: 3010, status: "error", errorDetail: "Connection timed out on TCP 9000" },
      ],
    },
    timeline: [
      { time: "14:15:00", title: "VM Healthy", detail: "Memory and CPU within normal operating limits", type: "info" },
      { time: "14:21:09", title: "503 Health Failure", detail: "Automated probe reported Tally engine unreachable", type: "error" },
    ],
    relatedObjects: {
      workspaceId: "WS-77104",
      productId: "sahayogi-cloud",
      subscriptionPlan: "Tally Cloud Dedicated Pro",
    },
    safeRepairs: [
      {
        id: "restart-tally-service",
        label: "Restart Tally Service (Safe)",
        description: "Sends a graceful service reload signal to tally9.exe without rebooting the underlying Windows VM.",
        riskLevel: "safe",
        target: "VM-DEL-042: Tally Engine",
        expectedOutcome: "Clears orphaned TCP ports and restores Tally readiness in ~15 seconds.",
        idempotent: true,
      },
    ],
  },

  // 5. My Sahayogi — BBPS Fetch Bill (200 OK)
  {
    id: "log-105",
    traceId: "trc_55219_05bbps_200",
    requestId: "req_55219_bbps_05",
    timestamp: "10 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:19:44.201 IST",
    status: 200,
    statusCategory: "2xx",
    severity: "info",
    recordType: "http_request",
    product: "My Sahayogi",
    service: "BBPS Bill Ingestion Engine",
    component: "NPCI BBPS Connector",
    operation: "POST /v1/bbps/fetch-bill",
    method: "POST",
    endpoint: "/v1/bbps/fetch-bill",
    workspace: {
      id: "WS-55219",
      name: "Deccan Retail",
      org: "Deccan Retail Chain Ltd",
      accountId: "ACC-55219-IN",
    },
    environment: "Production",
    durationMs: 64,
    classification: "customer_specific",
    diagnostic: {
      problem: "Bill fetched successfully from central NPCI BBPS biller registry.",
      errorCode: "SUCCESS_200",
      category: "BBPS / Utility",
      failedLayer: "None",
      detectedCause: "Electricity bill fetched with valid consumer number (BESCOM_88192).",
      confidence: "High",
      evidence: ["Biller status ACTIVE", "Due amount INR 4,120 retrieved."],
      recommendedChecks: ["None."],
    },
    impact: {
      affectedWorkspacesCount: 0,
      similarErrorsLastHour: 0,
      affectedServices: ["BBPS Connector"],
    },
    request: {
      method: "POST",
      url: "https://api.setu.co/v1/bbps/fetch-bill",
      headers: { "Content-Type": "application/json", "X-Setu-Trace-ID": "trc_55219_05bbps_200" },
      body: { billerId: "BESCOM0001", consumerNumber: "881921004" },
      clientIp: "49.36.128.45",
      userAgent: "Setu-MySahayogi/2.1",
    },
    response: {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: { status: "SUCCESS", amount: 4120, dueDate: "2026-10-05" },
    },
    tracePath: {
      spans: [
        { name: "API Gateway", service: "Edge Router", durationMs: 10, status: "ok" },
        { name: "NPCI BBPS Central Unit", service: "BBPS Biller Rail", durationMs: 54, status: "ok" },
      ],
    },
    timeline: [
      { time: "14:19:44", title: "Bill Fetched", detail: "BESCOM bill query completed in 64ms", type: "info" },
    ],
    relatedObjects: {
      workspaceId: "WS-55219",
      productId: "my-sahayogi",
    },
    safeRepairs: [],
  },

  // 6. Studio Sahayogi — AI Generate Image (429 Rate Limited)
  {
    id: "log-106",
    traceId: "trc_88192_06ai_429",
    requestId: "req_88192_ai_06",
    timestamp: "12 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:18:27.718 IST",
    status: 429,
    statusCategory: "rate_limit",
    severity: "warning",
    recordType: "http_request",
    product: "Studio Sahayogi",
    service: "Creative Operations",
    component: "Sahayogi AI Image Generator",
    operation: "POST /v2/ai/generate-image",
    method: "POST",
    endpoint: "/v2/ai/generate-image",
    workspace: {
      id: "WS-88192",
      name: "PixelCraft",
      org: "PixelCraft Media Pvt Ltd",
      accountId: "ACC-88192-IN",
    },
    environment: "Production",
    durationMs: 820,
    classification: "customer_specific",
    diagnostic: {
      problem: "AI generation request rejected due to workspace hourly token quota consumption.",
      errorCode: "AI_QUOTA_EXCEEDED_429",
      category: "AI & Model Providers",
      failedLayer: "Sahayogi AI Shared Intelligence Layer",
      detectedCause: "Customer creative team generated 45 marketing creatives in 15 minutes, exceeding hourly burst allotment.",
      confidence: "High",
      evidence: [
        "Hourly token consumption reached 100,000 / 100,000 tokens.",
        "Model provider operational with average 1.8s generation speed.",
      ],
      recommendedChecks: [
        "Check PixelCraft Studio Sahayogi plan tier in Workspace 360.",
        "Verify quota reset schedule (resets automatically in 42 minutes).",
      ],
    },
    impact: {
      affectedWorkspacesCount: 1,
      similarErrorsLastHour: 4,
      affectedServices: ["Studio Sahayogi Creative Pipeline"],
    },
    request: {
      method: "POST",
      url: "https://api.setu.co/v2/ai/generate-image",
      headers: { "Content-Type": "application/json", "X-Setu-Trace-ID": "trc_88192_06ai_429" },
      body: { prompt: "Corporate festive greeting poster with Diwali lamps and modern branding", model: "imagen-3" },
      clientIp: "122.161.42.19",
      userAgent: "Setu-StudioWeb/2.3",
    },
    response: {
      status: 429,
      statusText: "Too Many Requests",
      headers: { "Retry-After": "2520", "Content-Type": "application/json" },
      body: { error: { code: "RATE_LIMITED", message: "Hourly AI generation quota reached. Resets in 42m." } },
    },
    tracePath: {
      spans: [
        { name: "Studio Ingress", service: "Studio Sahayogi", durationMs: 15, status: "ok" },
        { name: "Rate Limiter", service: "Sahayogi AI Gateway", durationMs: 805, status: "warning", errorDetail: "Quota bucket exhausted" },
      ],
    },
    timeline: [
      { time: "14:18:27", title: "429 Rate Limit Hit", detail: "Hourly quota ceiling reached for PixelCraft", type: "error" },
    ],
    relatedObjects: {
      workspaceId: "WS-88192",
      productId: "studio-sahayogi",
      subscriptionPlan: "Studio Pro Plan",
    },
    safeRepairs: [
      {
        id: "check-quota-reset",
        label: "Inspect & Verify Quota Reset Window",
        description: "Queries the Redis rate-limiting bucket to verify exact second of automatic burst quota restoration.",
        riskLevel: "safe",
        target: "Sahayogi AI Rate Limiter",
        expectedOutcome: "Confirms automatic unlock timestamp for customer support advisory.",
        idempotent: true,
      },
    ],
  },

  // 7. Investor Sahayogi — Investments Sync (200 OK)
  {
    id: "log-107",
    traceId: "trc_44102_07inv_200",
    requestId: "req_44102_inv_07",
    timestamp: "15 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:17:05.109 IST",
    status: 200,
    statusCategory: "2xx",
    severity: "info",
    recordType: "http_request",
    product: "Investor Sahayogi",
    service: "Wealth Management Engine",
    component: "AMFI NAV Sync Gateway",
    operation: "GET /v1/investments/sync",
    method: "GET",
    endpoint: "/v1/investments/sync",
    workspace: {
      id: "WS-44102",
      name: "Mehta & Co",
      org: "Mehta Financial Advisory LLP",
      accountId: "ACC-44102-IN",
    },
    environment: "Production",
    durationMs: 210,
    classification: "customer_specific",
    diagnostic: {
      problem: "Daily NAV pricing and mutual fund ledger sync executed normally.",
      errorCode: "SUCCESS_200",
      category: "Wealth & Investments",
      failedLayer: "None",
      detectedCause: "AMFI NAV daily feed synced successfully for 124 tracked fund schemes.",
      confidence: "High",
      evidence: ["124 schemes updated with 27-Sep official NAVs.", "Checksum matched AMFI master."],
      recommendedChecks: ["None."],
    },
    impact: {
      affectedWorkspacesCount: 0,
      similarErrorsLastHour: 0,
      affectedServices: ["AMFI Sync Gateway"],
    },
    request: {
      method: "GET",
      url: "https://api.setu.co/v1/investments/sync?portfolioId=PORT_9921",
      headers: { "X-Setu-Trace-ID": "trc_44102_07inv_200" },
      body: "N/A (GET Request)",
      clientIp: "115.111.45.88",
      userAgent: "Setu-InvestorWeb/1.8",
    },
    response: {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
      body: { status: "COMPLETED", schemesUpdated: 124, syncedAt: "14:17:05" },
    },
    tracePath: {
      spans: [
        { name: "API Gateway", service: "Edge Router", durationMs: 12, status: "ok" },
        { name: "AMFI Ingress", service: "AMFI Sync Gateway", durationMs: 198, status: "ok" },
      ],
    },
    timeline: [
      { time: "14:17:05", title: "NAV Sync Complete", detail: "Updated 124 fund schemes in 210ms", type: "info" },
    ],
    relatedObjects: {
      workspaceId: "WS-44102",
      productId: "investor-sahayogi",
    },
    safeRepairs: [],
  },

  // 8. Tax Sahayogi — Tax Filing Status (502 Bad Gateway)
  {
    id: "log-108",
    traceId: "trc_66190_08tax_502",
    requestId: "req_66190_tax_08",
    timestamp: "18 mins ago",
    absoluteTimestamp: "28 Sep 2026, 14:15:32.409 IST",
    status: 502,
    statusCategory: "dependency",
    severity: "warning",
    recordType: "dependency_failure",
    product: "Tax Sahayogi",
    service: "Tax & Compliance Engine",
    component: "GST Portal Proxy Egress",
    operation: "POST /v1/tax/filing/status",
    method: "POST",
    endpoint: "/v1/tax/filing/status",
    workspace: {
      id: "WS-66190",
      name: "Verma & Associates",
      org: "Verma Legal & Tax Consultancy",
      accountId: "ACC-66190-IN",
    },
    environment: "Production",
    durationMs: 980,
    classification: "third_party_provider",
    diagnostic: {
      problem: "SSL Handshake failure when contacting Government NIC GST portal upstream.",
      errorCode: "TLS_CERT_CHAIN_INVALID",
      category: "Compliance Gateway / Upstream Rail",
      failedLayer: "Government Upstream Rail (NIC e-Way/GST)",
      detectedCause: "Government NIC server updated intermediate CA without root cross-signing; Setu truststore rejected cert chain.",
      confidence: "High",
      evidence: [
        "OpenSSL validation returned: unable to get local issuer certificate.",
        "Affects all Tax Sahayogi real-time GST verification requests across all workspaces.",
        "Government portal operational but certificates require updated Indian CCA intermediate trust bundle.",
      ],
      recommendedChecks: [
        "Verify NIC SSL certificate renewal advisory on gst.gov.in.",
        "Deploy updated CCA intermediate bundle to Setu Egress Proxies.",
      ],
    },
    impact: {
      affectedWorkspacesCount: 34,
      similarErrorsLastHour: 52,
      affectedServices: ["GST Verification Engine", "Tax Sahayogi Notice Assistant"],
      linkedIncident: {
        id: "INC-10288",
        title: "NIC GST Portal Intermediate CA Truststore Mismatch",
        severity: "warning",
        status: "Investigating",
      },
    },
    request: {
      method: "POST",
      url: "https://api.setu.co/v1/tax/filing/status",
      headers: { "Content-Type": "application/json", "X-Setu-Trace-ID": "trc_66190_08tax_502" },
      body: { gstin: "27AAACS1429B1ZB", returnPeriod: "082026", formType: "GSTR3B" },
      clientIp: "103.44.88.19",
      userAgent: "Setu-TaxClient/3.1",
    },
    response: {
      status: 502,
      statusText: "Bad Gateway",
      headers: { "Content-Type": "application/json" },
      body: { error: { code: "SSL_HANDSHAKE_ERROR", message: "Upstream NIC GST certificate chain invalid" } },
      providerErrorCode: "CERT_CHAIN_FAIL",
      providerMessage: "SSL_do_handshake failed: certificate verify failed.",
    },
    tracePath: {
      spans: [
        { name: "Tax Engine Ingress", service: "Tax Sahayogi", durationMs: 20, status: "ok" },
        { name: "Government Proxy Egress", service: "Setu Compliance Proxy", durationMs: 960, status: "error", errorDetail: "SSL handshake failed on nic.gov.in:443" },
      ],
    },
    timeline: [
      { time: "14:15:32", title: "Handshake Rejection", detail: "SSL failure registered for Verma & Associates", type: "error" },
    ],
    relatedObjects: {
      workspaceId: "WS-66190",
      productId: "tax-sahayogi",
      subscriptionPlan: "Tax Sahayogi Early Access",
    },
    safeRepairs: [
      {
        id: "refresh-truststore",
        label: "Reload Truststore Cache",
        description: "Pulls updated Indian Controller of Certifying Authorities (CCA) certificates into egress proxy.",
        riskLevel: "requires_confirmation",
        target: "Compliance Egress Proxy",
        expectedOutcome: "Restores automated verification for 34 affected workspaces.",
        idempotent: true,
      },
    ],
  },
];
