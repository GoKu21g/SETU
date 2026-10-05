export type IncidentSeverity = "P1 · Critical" | "P2 · High" | "P3 · Moderate" | "P4 · Low";

export type IncidentStatus =
  | "Detected"
  | "Investigating"
  | "Mitigating"
  | "Monitoring"
  | "Resolved"
  | "Closed";

export type AffectedWorkspaceItem = {
  id: string;
  name: string;
  product: string;
  status: "Degraded" | "Down" | "Impacted";
  impact: string;
  firstSeen: string;
  latestError: string;
};

export type IncidentTimelineEvent = {
  time: string;
  actor: string;
  event: string;
  result: string;
  relatedObject?: string;
  type: "detection" | "creation" | "provider" | "mitigation" | "case" | "status";
};

export type IncidentLogTrace = {
  errorCode: string;
  method: string;
  endpoint: string;
  traceId: string;
  service: string;
  provider: string;
  workspaceName: string;
  latency: string;
  timestamp: string;
};

export type IncidentDiagnosticAction = {
  name: string;
  risk: "SAFE" | "APPROVAL REQUIRED";
  status: "Passed" | "Failed" | "Untested" | "Pending";
  description: string;
};

export type IncidentRelatedTicket = {
  id: string;
  type: "Customer Case" | "Technical Case";
  title: string;
  workspace: string;
  product: string;
  priority: "Urgent" | "High" | "Medium";
  status: "Open" | "In Progress" | "Resolved";
};

export type IncidentChangeRelease = {
  version: string;
  service: string;
  deployedAt: string;
  status: "Healthy" | "Investigating";
  changeDescription: string;
};

export type IncidentAuditEntry = {
  time: string;
  actor: string;
  action: string;
  reason?: string;
  detail: string;
  result: "Success" | "Failed";
};

export type IncidentItem = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  product: string;
  productSlug: string;
  service: string;
  integration: string;
  integrationSlug: string;
  environment: "Production" | "Staging";
  workspaceCount: number;
  errorSnippet: string;
  startedAt: string;
  startedRelative: string;
  duration?: string;
  lastUpdated: string;
  updatedBy: string;
  commander: string;
  technicalOwner: string;
  supportOwner: string;
  description: string;
  currentMitigation: string;
  mitigationDetail: {
    title: string;
    previousPolicy: string;
    currentPolicy: string;
    status: "Active" | "Monitoring" | "Completed";
    operator: string;
    startedAt: string;
    expectedEffect: string;
  };
  customerImpact: string;
  supportGuidance: string;
  classification: "Provider / Dependency" | "Customer Configuration" | "Platform" | "Release" | "Unknown";
  confidence: "High" | "Medium" | "Low";
  rootCause: string;
  evidence: string[];
  metrics: {
    errorRate: number; // e.g. 2.1%
    errorRateChange: string; // e.g. "↑ 180%"
    responseTimeP95: number; // e.g. 840 ms
    responseTimeChange: string; // e.g. "↑ 220%"
    requestVolume: string; // e.g. "1.2K req/min"
    requestVolumeChange: string; // e.g. "↓ 15%"
    errorTrend: Array<{ time: string; rate: number }>;
    latencyTrend: Array<{ time: string; p95: number }>;
    volumeTrend: Array<{ time: string; volume: number }>;
  };
  blastRadius: {
    workspaces: AffectedWorkspaceItem[];
    affectedProducts: string[];
    affectedServices: string[];
    affectedRegions: string[];
    customerCasesCount: number;
  };
  timeline: IncidentTimelineEvent[];
  logsTraces: IncidentLogTrace[];
  diagnostics: IncidentDiagnosticAction[];
  dependencies: Array<{
    name: string;
    status: "Healthy" | "Degraded" | "Down";
    type: "Internal" | "External Provider" | "Infrastructure" | "Database";
  }>;
  relatedTickets: IncidentRelatedTicket[];
  relatedReleases: IncidentChangeRelease[];
  auditTrail: IncidentAuditEntry[];
};

export const MOCK_INCIDENTS: IncidentItem[] = [
  // 1. INC-1045: WhatsApp Webhook Authentication Failures (P1 · Critical) — Selected in Screenshot
  {
    id: "INC-1045",
    title: "WhatsApp Webhook Authentication Failures",
    severity: "P1 · Critical",
    status: "Investigating",
    product: "Chat with Sahayogi",
    productSlug: "chat-with-sahayogi",
    service: "WhatsApp Gateway",
    integration: "Meta WhatsApp (WABA)",
    integrationSlug: "meta-waba",
    environment: "Production",
    workspaceCount: 3,
    errorSnippet: "401 errors",
    startedAt: "Today, 10:24 AM",
    startedRelative: "14 mins ago",
    lastUpdated: "10:38 AM (2 mins ago)",
    updatedBy: "Dhruv S.",
    commander: "Dhruv S. (Tier-2 Support)",
    technicalOwner: "Aman K. (Platform SRE)",
    supportOwner: "Dhruv S. (Tier-2 Support)",
    description:
      "Incoming WhatsApp webhooks are failing HMAC signature verification. Requests are being rejected with 401 errors due to invalid or expired app-secret configuration.",
    currentMitigation: "Validating provider credentials",
    mitigationDetail: {
      title: "Credential Keystore Re-verification",
      previousPolicy: "Automatic signature caching (60-min TTL)",
      currentPolicy: "Direct Meta Graph verification & re-registration",
      status: "Active",
      operator: "Dhruv S.",
      startedAt: "10:30 AM",
      expectedEffect: "Bypass cached stale app-secret hash and restore valid HMAC validation.",
    },
    customerImpact: "Messages may be delayed or rejected",
    supportGuidance:
      "Advise affected merchants that inbound WhatsApp messages may experience temporary delivery retries while Meta webhook tokens are being validated.",
    classification: "Customer Configuration",
    confidence: "High",
    rootCause:
      "Meta WABA app-secret hash expired and rotated in Meta Business Manager without updating the Setu Integration Keystore.",
    evidence: [
      "X-Hub-Signature-256 mismatch detected across 3 distinct enterprise tenants",
      "Internal gateway and message queues operate at 100% nominal health",
      "First failure detected at 10:24 AM following Meta 60-day token rotation event",
      "No recent code deployment correlated with the signature rejection",
    ],
    metrics: {
      errorRate: 2.1,
      errorRateChange: "↑ 180%",
      responseTimeP95: 840,
      responseTimeChange: "↑ 220%",
      requestVolume: "1.2K req/min",
      requestVolumeChange: "↓ 15%",
      errorTrend: [
        { time: "09:30", rate: 0.02 },
        { time: "09:45", rate: 0.04 },
        { time: "10:00", rate: 0.05 },
        { time: "10:15", rate: 1.8 },
        { time: "10:30", rate: 2.1 },
      ],
      latencyTrend: [
        { time: "09:30", p95: 280 },
        { time: "09:45", p95: 310 },
        { time: "10:00", p95: 340 },
        { time: "10:15", p95: 780 },
        { time: "10:30", p95: 840 },
      ],
      volumeTrend: [
        { time: "09:30", volume: 1400 },
        { time: "09:45", volume: 1350 },
        { time: "10:00", volume: 1380 },
        { time: "10:15", volume: 1220 },
        { time: "10:30", volume: 1200 },
      ],
    },
    blastRadius: {
      workspaces: [
        {
          id: "WS-94812",
          name: "Sharma Traders Operations",
          product: "Chat with Sahayogi",
          status: "Degraded",
          impact: "401 HMAC Mismatch",
          firstSeen: "10:24 AM",
          latestError: "10:38 AM",
        },
        {
          id: "WS-64019",
          name: "QuickPay Retail Network",
          product: "Chat with Sahayogi",
          status: "Degraded",
          impact: "401 HMAC Mismatch",
          firstSeen: "10:26 AM",
          latestError: "10:37 AM",
        },
        {
          id: "WS-81920",
          name: "Vanguard Global Mart",
          product: "Chat with Sahayogi",
          status: "Impacted",
          impact: "Webhook Timeout / Retry",
          firstSeen: "10:29 AM",
          latestError: "10:36 AM",
        },
      ],
      affectedProducts: ["Chat with Sahayogi"],
      affectedServices: ["WhatsApp Webhook", "Message Dispatch"],
      affectedRegions: ["India (Mumbai)"],
      customerCasesCount: 5,
    },
    timeline: [
      {
        time: "10:24 AM",
        actor: "System Ingress",
        event: "First 401 HMAC signature failure detected",
        result: "Alert triggered",
        relatedObject: "trc_94812_01j8m4k",
        type: "detection",
      },
      {
        time: "10:26 AM",
        actor: "Automated SRE Engine",
        event: "P1 Incident created (INC-1045)",
        result: "Commander assigned: Dhruv S.",
        relatedObject: "INC-1045",
        type: "creation",
      },
      {
        time: "10:29 AM",
        actor: "Dhruv S.",
        event: "Diagnostic probe executed: HMAC Signature Check",
        result: "FAIL: Hash mismatch against tenant secret",
        relatedObject: "prb_auto_WS-94812",
        type: "provider",
      },
      {
        time: "10:30 AM",
        actor: "Dhruv S.",
        event: "Mitigation applied: Credential Keystore Re-verification",
        result: "Active",
        type: "mitigation",
      },
      {
        time: "10:35 AM",
        actor: "BoSS Bridge",
        event: "Customer cases linked: TK-9011, TK-9018",
        result: "5 cases correlated",
        relatedObject: "TK-9011",
        type: "case",
      },
      {
        time: "10:38 AM",
        actor: "Dhruv S.",
        event: "Incident status confirmed as Investigating",
        result: "Customer communication dispatched",
        type: "status",
      },
    ],
    logsTraces: [
      {
        errorCode: "401 Unauthorized",
        method: "POST",
        endpoint: "/v2/whatsapp/messages/webhook",
        traceId: "trc_94812_01j8m4k",
        service: "WhatsApp Gateway",
        provider: "Meta WhatsApp",
        workspaceName: "Sharma Traders",
        latency: "342 ms",
        timestamp: "10:24:18 AM",
      },
      {
        errorCode: "401 Unauthorized",
        method: "POST",
        endpoint: "/v2/whatsapp/messages/webhook",
        traceId: "trc_64019_91a82b",
        service: "WhatsApp Gateway",
        provider: "Meta WhatsApp",
        workspaceName: "QuickPay Retail",
        latency: "318 ms",
        timestamp: "10:26:40 AM",
      },
    ],
    diagnostics: [
      {
        name: "HMAC Signature Check",
        risk: "SAFE",
        status: "Failed",
        description: "Compares secret hash agreement against recent webhook payload signature",
      },
      {
        name: "Webhook Ping & ACK",
        risk: "SAFE",
        status: "Failed",
        description: "Tests end-to-end webhook handshake & delivery acknowledgment",
      },
      {
        name: "Integration Credential Validation",
        risk: "APPROVAL REQUIRED",
        status: "Pending",
        description: "Re-checks WABA system token handshake against Meta Graph API",
      },
      {
        name: "Verify SSL/TLS Certificate",
        risk: "SAFE",
        status: "Passed",
        description: "Validates endpoint TLS chain, SAN entries, and expiry dates",
      },
    ],
    dependencies: [
      { name: "Meta WhatsApp Business Platform", status: "Degraded", type: "External Provider" },
      { name: "Webhook Dispatch Ingress", status: "Healthy", type: "Internal" },
      { name: "Message Queue (Kafka)", status: "Healthy", type: "Infrastructure" },
      { name: "Credential Keystore Vault", status: "Degraded", type: "Internal" },
    ],
    relatedTickets: [
      {
        id: "TK-9011",
        type: "Technical Case",
        title: "Sharma Traders - WhatsApp webhook failure",
        workspace: "Sharma Traders",
        product: "Chat with Sahayogi",
        priority: "Urgent",
        status: "In Progress",
      },
      {
        id: "TK-9018",
        type: "Customer Case",
        title: "QuickPay - Inbound customer message delivery delayed",
        workspace: "QuickPay Retail",
        product: "Chat with Sahayogi",
        priority: "High",
        status: "Open",
      },
      {
        id: "TK-9022",
        type: "Technical Case",
        title: "Vanguard - Token authentication mismatch alert",
        workspace: "Vanguard Global",
        product: "Chat with Sahayogi",
        priority: "Medium",
        status: "Open",
      },
    ],
    relatedReleases: [
      {
        version: "Release 2026.09.27.3",
        service: "WhatsApp Gateway",
        deployedAt: "Yesterday, 06:15 PM",
        status: "Healthy",
        changeDescription: "Signature verification hardening and replay defense",
      },
    ],
    auditTrail: [
      {
        time: "10:24 AM",
        actor: "system",
        action: "INCIDENT_DETECTED",
        detail: "Error rate exceeded 1.0% threshold on WhatsApp webhook endpoint",
        result: "Success",
      },
      {
        time: "10:26 AM",
        actor: "system",
        action: "INCIDENT_CREATED",
        detail: "INC-1045 initialized with severity P1 · Critical",
        result: "Success",
      },
      {
        time: "10:30 AM",
        actor: "dhruv.singla@setu.co",
        action: "MITIGATION_APPLIED",
        detail: "Direct Meta Graph token validation engaged",
        result: "Success",
      },
      {
        time: "10:38 AM",
        actor: "dhruv.singla@setu.co",
        action: "INCIDENT_STATUS_UPDATED",
        detail: "Status confirmed as Investigating",
        result: "Success",
      },
    ],
  },

  // 2. INC-1042: GST Portal Gateway Latency & Upstream 504 Timeouts (P2 · High)
  {
    id: "INC-1042",
    title: "GST Portal Gateway Latency & Upstream 504 Timeouts",
    severity: "P2 · High",
    status: "Investigating",
    product: "Tax Sahayogi",
    productSlug: "tax-sahayogi",
    service: "GSTN Integration & E-Way",
    integration: "NIC / GST Portal",
    integrationSlug: "nic-gst",
    environment: "Production",
    workspaceCount: 48,
    errorSnippet: "p95 1.8s",
    startedAt: "Today, 10:15 AM",
    startedRelative: "2 hours ago",
    lastUpdated: "10:42 AM",
    updatedBy: "Kabir S.",
    commander: "Kabir S. (Staff SRE)",
    technicalOwner: "Aman K. (Tax Platform SRE)",
    supportOwner: "Dhruv S. (Tier-2 Support)",
    description:
      "NIC upstream server is returning intermittent 504 responses. Requests are being retried with exponential backoff and jitter.",
    currentMitigation: "Retries enabled with exponential backoff",
    mitigationDetail: {
      title: "Exponential Backoff & Retries",
      previousPolicy: "3 retry attempts with linear 500ms delay",
      currentPolicy: "5 retry attempts with exponential backoff + jitter",
      status: "Active",
      operator: "Kabir S.",
      startedAt: "10:25 AM",
      expectedEffect: "Reduce customer-visible failures during intermittent provider 504 responses.",
    },
    customerImpact: "GST-related requests may experience delayed processing",
    supportGuidance:
      "Advise affected customers that GST submission requests may be delayed while upstream provider latency is being investigated.",
    classification: "Provider / Dependency",
    confidence: "High",
    rootCause: "Intermittent 504 responses from NIC upstream gateway during month-end e-way bill volume surge.",
    evidence: [
      "Increased provider 504 rate (> 18%)",
      "Internal services and Redis queues remain healthy (0.01% error rate)",
      "48 distinct enterprise workspaces affected across Tax Sahayogi",
      "Same upstream endpoint failing (/v1/gst/submit)",
      "No recent internal deployment correlated with latency surge",
    ],
    metrics: {
      errorRate: 18.6,
      errorRateChange: "↑ 240%",
      responseTimeP95: 1820,
      responseTimeChange: "↑ 310%",
      requestVolume: "4.6K req/min",
      requestVolumeChange: "↓ 8%",
      errorTrend: [
        { time: "09:30", rate: 0.1 },
        { time: "09:45", rate: 0.2 },
        { time: "10:00", rate: 4.8 },
        { time: "10:15", rate: 18.6 },
        { time: "10:30", rate: 16.2 },
      ],
      latencyTrend: [
        { time: "09:30", p95: 42 },
        { time: "09:45", p95: 58 },
        { time: "10:00", p95: 640 },
        { time: "10:15", p95: 1820 },
        { time: "10:30", p95: 1680 },
      ],
      volumeTrend: [
        { time: "09:30", volume: 4800 },
        { time: "09:45", volume: 4900 },
        { time: "10:00", volume: 4700 },
        { time: "10:15", volume: 4500 },
        { time: "10:30", volume: 4600 },
      ],
    },
    blastRadius: {
      workspaces: [
        {
          id: "WS-94812",
          name: "Sharma Traders",
          product: "Tax Sahayogi",
          status: "Degraded",
          impact: "504 Gateway Timeout",
          firstSeen: "10:17 AM",
          latestError: "10:42 AM",
        },
        {
          id: "WS-51928",
          name: "Bharat Agro",
          product: "Tax Sahayogi",
          status: "Degraded",
          impact: "504 Gateway Timeout",
          firstSeen: "10:19 AM",
          latestError: "10:41 AM",
        },
        {
          id: "WS-73194",
          name: "Kalyan Logistics",
          product: "Tax Sahayogi",
          status: "Degraded",
          impact: "504 Gateway Timeout",
          firstSeen: "10:21 AM",
          latestError: "10:39 AM",
        },
      ],
      affectedProducts: ["Tax Sahayogi"],
      affectedServices: ["GSTN Ingestion & E-Way"],
      affectedRegions: ["India (National)"],
      customerCasesCount: 12,
    },
    timeline: [
      {
        time: "10:15 AM",
        actor: "System Watchdog",
        event: "GSTN Ingestion error rate exceeded threshold",
        result: "Threshold breached",
        type: "detection",
      },
      {
        time: "10:16 AM",
        actor: "Kabir S.",
        event: "Incident created (INC-1042)",
        result: "Severity P2 assigned",
        type: "creation",
      },
      {
        time: "10:18 AM",
        actor: "Ingress Gateway",
        event: "First 504 from NIC provider endpoint",
        result: "504 Timeout",
        relatedObject: "trc_92831_01",
        type: "provider",
      },
      {
        time: "10:20 AM",
        actor: "System Correlator",
        event: "Blast radius expanded from 12 to 48 workspaces",
        result: "Updated",
        type: "detection",
      },
      {
        time: "10:25 AM",
        actor: "Kabir S.",
        event: "Retries increased: Exponential backoff + jitter",
        result: "Active",
        type: "mitigation",
      },
      {
        time: "10:31 AM",
        actor: "BoSS Bridge",
        event: "Support cases correlated: 12 BoSS customer cases linked",
        result: "Correlated",
        type: "case",
      },
      {
        time: "10:42 AM",
        actor: "Kabir S.",
        event: "Incident status confirmed as Investigating",
        result: "Upstream NIC liaison in progress",
        type: "status",
      },
    ],
    logsTraces: [
      {
        errorCode: "504 Gateway Timeout",
        method: "POST",
        endpoint: "/v1/gst/submit",
        traceId: "trc_92831_01",
        service: "GSTN Ingestion",
        provider: "NIC",
        workspaceName: "Sharma Traders",
        latency: "8.42s",
        timestamp: "10:18:22 AM",
      },
    ],
    diagnostics: [
      {
        name: "GSTN Provider Health Check",
        risk: "SAFE",
        status: "Failed",
        description: "Checks NIC gateway response and HTTP connection handshakes",
      },
      {
        name: "Dependency Health Check",
        risk: "SAFE",
        status: "Passed",
        description: "Checks internal Kafka queue, Redis cache, and Postgres DB",
      },
      {
        name: "DNS & Edge Validation",
        risk: "SAFE",
        status: "Passed",
        description: "Validates Anycast routing and Edge CDN resolution",
      },
      {
        name: "Recent Event Replay Check",
        risk: "APPROVAL REQUIRED",
        status: "Untested",
        description: "Replays sanitized failed GSTN payload into sandbox proxy",
      },
    ],
    dependencies: [
      { name: "Tax Sahayogi Core Engine", status: "Healthy", type: "Internal" },
      { name: "GSTN Ingestion Gateway", status: "Degraded", type: "Internal" },
      { name: "NIC / GST Portal Public Endpoint", status: "Degraded", type: "External Provider" },
      { name: "Database (Postgres Cluster)", status: "Healthy", type: "Database" },
    ],
    relatedTickets: [
      {
        id: "TK-9020",
        type: "Customer Case",
        title: "Bharat Agro - E-Way Bill generation timing out",
        workspace: "Bharat Agro",
        product: "Tax Sahayogi",
        priority: "Urgent",
        status: "In Progress",
      },
      {
        id: "TK-9024",
        type: "Technical Case",
        title: "Kalyan Logistics - GSTR-1 bulk upload failure",
        workspace: "Kalyan Logistics",
        product: "Tax Sahayogi",
        priority: "High",
        status: "Open",
      },
    ],
    relatedReleases: [
      {
        version: "Release 2026.09.28.2",
        service: "GSTN Ingestion",
        deployedAt: "Today, 09:42 AM",
        status: "Healthy",
        changeDescription: "GST API retry policy update and connection pool expansion",
      },
    ],
    auditTrail: [
      {
        time: "10:16 AM",
        actor: "system",
        action: "INCIDENT_CREATED",
        detail: "INC-1042 created with P2 · High severity",
        result: "Success",
      },
      {
        time: "10:25 AM",
        actor: "kabir.s@setu.co",
        action: "MITIGATION_APPLIED",
        detail: "Retry policy increased to 5 attempts with jitter",
        result: "Success",
      },
    ],
  },

  // 3. INC-1039: Tally on Cloud Provisioning Delays (P2 · High)
  {
    id: "INC-1039",
    title: "Tally on Cloud Provisioning Delays",
    severity: "P2 · High",
    status: "Mitigating",
    product: "Sahayogi Cloud",
    productSlug: "sahayogi-cloud",
    service: "Provisioning Service",
    integration: "Tally on Cloud",
    integrationSlug: "tally",
    environment: "Production",
    workspaceCount: 7,
    errorSnippet: "5xx errors",
    startedAt: "Today, 06:30 AM",
    startedRelative: "4 hours ago",
    lastUpdated: "09:45 AM",
    updatedBy: "Aman K.",
    commander: "Aman K. (Platform SRE)",
    technicalOwner: "Aman K. (Platform SRE)",
    supportOwner: "Rohan P. (Tier-1 Support)",
    description:
      "Tally Prime automated VM creation jobs experiencing storage volume attachment timeouts on isolated tenant containers.",
    currentMitigation: "Failover volume pool provisioned",
    mitigationDetail: {
      title: "Storage Volume Pool Failover",
      previousPolicy: "Primary EBS volume allocation",
      currentPolicy: "Secondary high-IOPS gp3 allocation pool",
      status: "Active",
      operator: "Aman K.",
      startedAt: "08:15 AM",
      expectedEffect: "Unblock pending VM attachments and restore provisioning under 3 minutes.",
    },
    customerImpact: "New workspace onboarding delayed by up to 25 minutes",
    supportGuidance: "Inform customers that cloud accounting instances are queued and will automatically launch.",
    classification: "Provider / Dependency",
    confidence: "High",
    rootCause: "AWS Mumbai ap-south-1a EBS burst latency degradation during morning node spin-up.",
    evidence: ["EBS volume attach timeout (> 120s)", "Virtual container hypervisors nominal"],
    metrics: {
      errorRate: 4.8,
      errorRateChange: "↓ 40%",
      responseTimeP95: 3100,
      responseTimeChange: "↓ 25%",
      requestVolume: "420 req/min",
      requestVolumeChange: "↑ 5%",
      errorTrend: [
        { time: "06:30", rate: 8.4 },
        { time: "07:30", rate: 7.2 },
        { time: "08:30", rate: 6.1 },
        { time: "09:30", rate: 4.8 },
      ],
      latencyTrend: [
        { time: "06:30", p95: 4200 },
        { time: "07:30", p95: 3800 },
        { time: "08:30", p95: 3400 },
        { time: "09:30", p95: 3100 },
      ],
      volumeTrend: [
        { time: "06:30", volume: 400 },
        { time: "07:30", volume: 420 },
        { time: "08:30", volume: 410 },
        { time: "09:30", volume: 420 },
      ],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["Sahayogi Cloud"],
      affectedServices: ["Provisioning Engine"],
      affectedRegions: ["ap-south-1a"],
      customerCasesCount: 4,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 4. INC-1038: Payment Provider Callback Webhook Latency Spike (P3 · Moderate)
  {
    id: "INC-1038",
    title: "Payment Provider Callback Webhook Latency Spike",
    severity: "P3 · Moderate",
    status: "Resolved",
    product: "BoSS",
    productSlug: "boss",
    service: "Payment Integration",
    integration: "Razorpay Core Gateway",
    integrationSlug: "razorpay",
    environment: "Production",
    workspaceCount: 14,
    errorSnippet: "Latency spike",
    startedAt: "Yesterday, 4:30 PM",
    startedRelative: "Started yesterday",
    lastUpdated: "Yesterday, 6:15 PM",
    updatedBy: "Dev M.",
    commander: "Dev M. (Platform Ops Lead)",
    technicalOwner: "Dev M. (Platform Ops Lead)",
    supportOwner: "Priya K. (Tier-2 Support)",
    description: "Inbound Razorpay payment confirmation webhook processing queue experienced queue backing.",
    currentMitigation: "Consumer replicas scaled from 4 to 12",
    mitigationDetail: {
      title: "Queue Consumer Horizontal Autoscaling",
      previousPolicy: "4 consumer pods",
      currentPolicy: "12 consumer pods",
      status: "Completed",
      operator: "Dev M.",
      startedAt: "Yesterday, 5:10 PM",
      expectedEffect: "Queue fully drained and normalized at 64ms delivery latency.",
    },
    customerImpact: "Payment status receipts delayed by 4-6 minutes",
    supportGuidance: "All payments processed successfully; reconciliation statements verified.",
    classification: "Platform",
    confidence: "High",
    rootCause: "Surge in festival flash sale transactions backed up the single partition consumer group.",
    evidence: ["Consumer lag rose to 14,000 events", "Zero dropped packets"],
    metrics: {
      errorRate: 0.01,
      errorRateChange: "↓ 95%",
      responseTimeP95: 64,
      responseTimeChange: "↓ 85%",
      requestVolume: "8.2K req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [
        { time: "16:00", rate: 0.01 },
        { time: "16:30", rate: 1.4 },
        { time: "17:00", rate: 0.8 },
        { time: "17:30", rate: 0.05 },
        { time: "18:00", rate: 0.01 },
      ],
      latencyTrend: [
        { time: "16:00", p95: 48 },
        { time: "16:30", p95: 620 },
        { time: "17:00", p95: 240 },
        { time: "17:30", p95: 95 },
        { time: "18:00", p95: 64 },
      ],
      volumeTrend: [
        { time: "16:00", volume: 6000 },
        { time: "16:30", volume: 14000 },
        { time: "17:00", volume: 11000 },
        { time: "17:30", volume: 8500 },
        { time: "18:00", volume: 8200 },
      ],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["BoSS"],
      affectedServices: ["Payment Integration"],
      affectedRegions: ["India (National)"],
      customerCasesCount: 8,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 5. INC-1037: Razorpay UPI Transaction Failures (P3 · Moderate)
  {
    id: "INC-1037",
    title: "Razorpay UPI Transaction Failures",
    severity: "P3 · Moderate",
    status: "Monitoring",
    product: "BoSS",
    productSlug: "boss",
    service: "UPI Payment Switch",
    integration: "NPCI Core / Razorpay",
    integrationSlug: "razorpay",
    environment: "Production",
    workspaceCount: 6,
    errorSnippet: "2.1% errors",
    startedAt: "Yesterday, 2:12 PM",
    startedRelative: "Started yesterday",
    lastUpdated: "Yesterday, 4:00 PM",
    updatedBy: "Priya K.",
    commander: "Priya K. (Tier-2 SRE)",
    technicalOwner: "Dev M.",
    supportOwner: "Priya K.",
    description: "UPI QR payment generation failures on select cooperative bank handles.",
    currentMitigation: "Traffic dynamically routed away from degraded bank handle switch",
    mitigationDetail: {
      title: "Bank Handle Routing Shift",
      previousPolicy: "Round-robin handle dispatch",
      currentPolicy: "Exclude degraded cooperative bank VPA routes",
      status: "Active",
      operator: "Priya K.",
      startedAt: "Yesterday, 2:40 PM",
      expectedEffect: "Bypass failing handle and restore 99.9% QR generation rate.",
    },
    customerImpact: "Certain bank customers unable to scan dynamic UPI QR",
    supportGuidance: "Advise merchants to prompt customers to pay via netbanking or alternative bank VPA.",
    classification: "Provider / Dependency",
    confidence: "High",
    rootCause: "Cooperative bank core banking switch offline for unannounced maintenance.",
    evidence: ["UPI error code U16 (Risk threshold exceeded)", "Razorpay health advisory received"],
    metrics: {
      errorRate: 0.1,
      errorRateChange: "↓ 90%",
      responseTimeP95: 28,
      responseTimeChange: "Nominal",
      requestVolume: "14.2K req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["BoSS"],
      affectedServices: ["UPI Switch"],
      affectedRegions: ["India (National)"],
      customerCasesCount: 6,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 6. INC-1036: Studio Asset Upload Failures (P4 · Low)
  {
    id: "INC-1036",
    title: "Studio Asset Upload Failures",
    severity: "P4 · Low",
    status: "Closed",
    product: "Studio Sahayogi",
    productSlug: "studio-sahayogi",
    service: "Upload Service",
    integration: "GPU Cluster / Midjourney",
    integrationSlug: "midjourney",
    environment: "Production",
    workspaceCount: 2,
    errorSnippet: "500 errors",
    startedAt: "2 days ago",
    startedRelative: "Started 2 days ago",
    lastUpdated: "Yesterday, 11:00 AM",
    updatedBy: "Rohan P.",
    commander: "Rohan P. (Tier-1 Support)",
    technicalOwner: "Studio Lead",
    supportOwner: "Rohan P.",
    description: "S3 multipart presigned upload validation failing for raw PSD files over 500MB.",
    currentMitigation: "Multipart chunk size increased to 25MB",
    mitigationDetail: {
      title: "Chunk Size Configuration",
      previousPolicy: "5MB chunks",
      currentPolicy: "25MB chunks",
      status: "Completed",
      operator: "Rohan P.",
      startedAt: "2 days ago",
      expectedEffect: "Prevent signature expiration during large asset transfer.",
    },
    customerImpact: "High-resolution graphic assets above 500MB failed to upload",
    supportGuidance: "Advise designers to re-upload large files using the updated uploader.",
    classification: "Platform",
    confidence: "High",
    rootCause: "Client presigned URL expiration threshold too short for slow broadband uploads.",
    evidence: ["S3 signature expired 403 on chunk 85+"],
    metrics: {
      errorRate: 0.0,
      errorRateChange: "0%",
      responseTimeP95: 140,
      responseTimeChange: "Nominal",
      requestVolume: "320 req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["Studio Sahayogi"],
      affectedServices: ["Upload Engine"],
      affectedRegions: ["India (Mumbai)"],
      customerCasesCount: 2,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 7. INC-1035: Office Sahayogi Deep Link Verification Failure (P3 · Moderate)
  {
    id: "INC-1035",
    title: "Office Sahayogi Deep Link Verification Failure",
    severity: "P3 · Moderate",
    status: "Resolved",
    product: "Office Sahayogi",
    productSlug: "office-sahayogi",
    service: "Deep Link Service",
    integration: "Microsoft Graph / 365 API",
    integrationSlug: "microsoft-365",
    environment: "Production",
    workspaceCount: 5,
    errorSnippet: "JWT validation",
    startedAt: "3 days ago",
    startedRelative: "3 days ago",
    lastUpdated: "2 days ago",
    updatedBy: "Dev M.",
    commander: "Dev M.",
    technicalOwner: "Dev M.",
    supportOwner: "Dev M.",
    description: "Azure AD signing key cache expired causing deep link redirects to fail.",
    currentMitigation: "JWKS public key cache refreshed",
    mitigationDetail: {
      title: "JWKS In-Memory Refresh",
      previousPolicy: "Cached key",
      currentPolicy: "Auto-refreshing cache with 15-min TTL",
      status: "Completed",
      operator: "Dev M.",
      startedAt: "3 days ago",
      expectedEffect: "Instant resolution of valid M365 document sharing tokens.",
    },
    customerImpact: "Collaborative document preview links prompted repeated sign-in",
    supportGuidance: "Inform users that single sign-on deep linking is restored.",
    classification: "Provider / Dependency",
    confidence: "High",
    rootCause: "Microsoft rotated Azure AD tenant signing keys ahead of schedule.",
    evidence: ["Invalid signature kid mismatch in JWT header"],
    metrics: {
      errorRate: 0.0,
      errorRateChange: "0%",
      responseTimeP95: 48,
      responseTimeChange: "Nominal",
      requestVolume: "2.1K req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["Office Sahayogi"],
      affectedServices: ["Deep Link Resolver"],
      affectedRegions: ["India (National)"],
      customerCasesCount: 3,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 8. INC-1034: Investor Sahayogi Market Data Rate Limiting (P2 · High)
  {
    id: "INC-1034",
    title: "Investor Sahayogi Market Data Rate Limiting",
    severity: "P2 · High",
    status: "Resolved",
    product: "Investor Sahayogi",
    productSlug: "investor-sahayogi",
    service: "Market Data Feed",
    integration: "CAMS / KFintech Statement Feed",
    integrationSlug: "cams",
    environment: "Production",
    workspaceCount: 18,
    errorSnippet: "429 Rate Limited",
    startedAt: "4 days ago",
    startedRelative: "4 days ago",
    lastUpdated: "3 days ago",
    updatedBy: "Kabir S.",
    commander: "Kabir S.",
    technicalOwner: "Kabir S.",
    supportOwner: "Kabir S.",
    description: "RTA quote requests throttled at 120 calls/min threshold during market close.",
    currentMitigation: "Secondary failover pool enabled and cache TTL doubled to 300s",
    mitigationDetail: {
      title: "Failover Quote Aggregator",
      previousPolicy: "Direct single-RTA query",
      currentPolicy: "Dual-RTA failover pool with local Redis cache",
      status: "Completed",
      operator: "Kabir S.",
      startedAt: "4 days ago",
      expectedEffect: "Eliminate rate limiting and smooth portfolio valuations.",
    },
    customerImpact: "Portfolio daily NAV update delayed by 35 minutes",
    supportGuidance: "All holdings valuations recalculated and reconciled with RTAs.",
    classification: "Provider / Dependency",
    confidence: "High",
    rootCause: "Upstream RTA quota tier exceeded during synchronized portfolio sweep.",
    evidence: ["HTTP 429 Too Many Requests returned from CAMS gateway"],
    metrics: {
      errorRate: 0.0,
      errorRateChange: "0%",
      responseTimeP95: 180,
      responseTimeChange: "Nominal",
      requestVolume: "940 req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["Investor Sahayogi"],
      affectedServices: ["Market Data Service"],
      affectedRegions: ["India (National)"],
      customerCasesCount: 7,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 9. INC-1033: My Sahayogi Payslip Encryption Key Drift (P3 · Moderate)
  {
    id: "INC-1033",
    title: "My Sahayogi Payslip Encryption Key Drift",
    severity: "P3 · Moderate",
    status: "Closed",
    product: "My Sahayogi",
    productSlug: "my-sahayogi",
    service: "Payslip Sync",
    integration: "Setu Account Aggregator",
    integrationSlug: "setu-aa",
    environment: "Production",
    workspaceCount: 4,
    errorSnippet: "KMS Drift",
    startedAt: "5 days ago",
    startedRelative: "5 days ago",
    lastUpdated: "4 days ago",
    updatedBy: "Dhruv S.",
    commander: "Dhruv S.",
    technicalOwner: "Aman K.",
    supportOwner: "Dhruv S.",
    description: "KMS envelope encryption key policy permission mismatch during month-end dispatch.",
    currentMitigation: "IAM KMS Key Policy updated with automated batch decrypt permissions",
    mitigationDetail: {
      title: "KMS IAM Policy Alignment",
      previousPolicy: "Restricted role",
      currentPolicy: "Service-linked automated batch decryption permission",
      status: "Completed",
      operator: "Dhruv S.",
      startedAt: "5 days ago",
      expectedEffect: "Instant decryption and dispatch of salary slips.",
    },
    customerImpact: "Monthly payslips queued in pending state for 4 tenant organizations",
    supportGuidance: "All pending payslips re-signed and delivered to employees.",
    classification: "Platform",
    confidence: "High",
    rootCause: "AWS IAM role boundary updated without payroll worker service ARN.",
    evidence: ["KMS:AccessDeniedException on payslip payload encryption"],
    metrics: {
      errorRate: 0.0,
      errorRateChange: "0%",
      responseTimeP95: 55,
      responseTimeChange: "Nominal",
      requestVolume: "1.4K req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["My Sahayogi"],
      affectedServices: ["Payroll Sync"],
      affectedRegions: ["India (Mumbai)"],
      customerCasesCount: 2,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 10. INC-1032: Sahayogi One SSO SAML Metadata Expiry (P2 · High)
  {
    id: "INC-1032",
    title: "Sahayogi One SSO SAML Metadata Expiry",
    severity: "P2 · High",
    status: "Closed",
    product: "Sahayogi One",
    productSlug: "sahayogi-one",
    service: "Identity & SSO Gateway",
    integration: "Setu Integration Core",
    integrationSlug: "setu-aa",
    environment: "Production",
    workspaceCount: 9,
    errorSnippet: "SAML assertion",
    startedAt: "6 days ago",
    startedRelative: "6 days ago",
    lastUpdated: "5 days ago",
    updatedBy: "Kabir S.",
    commander: "Kabir S.",
    technicalOwner: "Aman K.",
    supportOwner: "Kabir S.",
    description: "Corporate IdP X.509 signing certificates expired on enterprise SAML connections.",
    currentMitigation: "Certificate rotation workflow executed with customer IT teams",
    mitigationDetail: {
      title: "Enterprise IdP Cert Renewal",
      previousPolicy: "Expired cert",
      currentPolicy: "Valid X.509 SHA-256 DigiCert cert",
      status: "Completed",
      operator: "Kabir S.",
      startedAt: "6 days ago",
      expectedEffect: "Instant corporate single sign-on restored.",
    },
    customerImpact: "Enterprise employees experienced login redirects back to sign-in page",
    supportGuidance: "All SAML federation metadata renewed and verified nominal.",
    classification: "Customer Configuration",
    confidence: "High",
    rootCause: "Customer enterprise IT Okta tenant certificate expired without automated webhook alert.",
    evidence: ["SAML signature verification failed: certificate not in valid date range"],
    metrics: {
      errorRate: 0.0,
      errorRateChange: "0%",
      responseTimeP95: 38,
      responseTimeChange: "Nominal",
      requestVolume: "3.4K req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["Sahayogi One"],
      affectedServices: ["SSO Gateway"],
      affectedRegions: ["India (National)"],
      customerCasesCount: 4,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 11. INC-1031: Studio Sahayogi GPU Diffusion Queue Overload (P3 · Moderate)
  {
    id: "INC-1031",
    title: "Studio Sahayogi GPU Diffusion Queue Overload",
    severity: "P3 · Moderate",
    status: "Closed",
    product: "Studio Sahayogi",
    productSlug: "studio-sahayogi",
    service: "AI Diffusion Service",
    integration: "GPU Cluster / Midjourney",
    integrationSlug: "midjourney",
    environment: "Production",
    workspaceCount: 3,
    errorSnippet: "VRAM limit",
    startedAt: "1 week ago",
    startedRelative: "1 week ago",
    lastUpdated: "6 days ago",
    updatedBy: "Dev M.",
    commander: "Dev M.",
    technicalOwner: "Dev M.",
    supportOwner: "Dev M.",
    description: "Tensor inference queue delayed image generation by 45 seconds during campaign upload.",
    currentMitigation: "Added 4 additional NVIDIA H100 worker nodes to cluster",
    mitigationDetail: {
      title: "Cluster Headroom Expansion",
      previousPolicy: "8 nodes",
      currentPolicy: "12 nodes",
      status: "Completed",
      operator: "Dev M.",
      startedAt: "1 week ago",
      expectedEffect: "Latency normalized at 1.02s per generation.",
    },
    customerImpact: "Image rendering time exceeded SLA threshold",
    supportGuidance: "Creative asset rendering queue cleared and nominal.",
    classification: "Platform",
    confidence: "High",
    rootCause: "Unusually high concurrent batch generation requested during promotional launch.",
    evidence: ["GPU memory capacity exceeded 95% threshold"],
    metrics: {
      errorRate: 0.0,
      errorRateChange: "0%",
      responseTimeP95: 1020,
      responseTimeChange: "Nominal",
      requestVolume: "620 req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["Studio Sahayogi"],
      affectedServices: ["Diffusion Engine"],
      affectedRegions: ["India (Mumbai)"],
      customerCasesCount: 3,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },

  // 12. INC-1030: Sahayogi AI Shared Intelligence Model Latency Spike (P3 · Moderate)
  {
    id: "INC-1030",
    title: "Sahayogi AI Shared Intelligence Model Latency Spike",
    severity: "P3 · Moderate",
    status: "Closed",
    product: "Sahayogi AI (Shared Layer)",
    productSlug: "chat-with-sahayogi",
    service: "Shared Copilot Gateway",
    integration: "Google Gemini 2.5 Flash Cluster",
    integrationSlug: "meta-waba",
    environment: "Production",
    workspaceCount: 11,
    errorSnippet: "Model latency",
    startedAt: "1 week ago",
    startedRelative: "1 week ago",
    lastUpdated: "6 days ago",
    updatedBy: "Kabir S.",
    commander: "Kabir S.",
    technicalOwner: "Aman K.",
    supportOwner: "Kabir S.",
    description: "Shared LLM copilot responses experienced regional cross-zone network routing latency.",
    currentMitigation: "Switched to local Mumbai Vertex AI endpoint",
    mitigationDetail: {
      title: "Direct Regional Model Egress",
      previousPolicy: "Cross-region US-East routing",
      currentPolicy: "Direct Mumbai regional Vertex AI deployment",
      status: "Completed",
      operator: "Kabir S.",
      startedAt: "1 week ago",
      expectedEffect: "Reduced copilot round-trip latency from 1.4s to 380ms.",
    },
    customerImpact: "Smart copilot response completion took 2-3 seconds longer than usual",
    supportGuidance: "Model inference routed regionally with sub-400ms turnaround.",
    classification: "Platform",
    confidence: "High",
    rootCause: "Undersea cable maintenance increased transit latency to US-East model cluster.",
    evidence: ["Round-trip latency elevated across all shared copilot inference spans"],
    metrics: {
      errorRate: 0.0,
      errorRateChange: "0%",
      responseTimeP95: 380,
      responseTimeChange: "Nominal",
      requestVolume: "5.8K req/min",
      requestVolumeChange: "Nominal",
      errorTrend: [],
      latencyTrend: [],
      volumeTrend: [],
    },
    blastRadius: {
      workspaces: [],
      affectedProducts: ["Sahayogi AI (Shared Layer)"],
      affectedServices: ["Copilot Gateway"],
      affectedRegions: ["India (National)"],
      customerCasesCount: 5,
    },
    timeline: [],
    logsTraces: [],
    diagnostics: [],
    dependencies: [],
    relatedTickets: [],
    relatedReleases: [],
    auditTrail: [],
  },
];
