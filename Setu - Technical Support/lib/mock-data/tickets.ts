export type TicketType =
  | "user_request"
  | "technical_case"
  | "platform_incident"
  | "integration_failure"
  | "provisioning_failure"
  | "access_security"
  | "billing_commercial"
  | "compliance";

export type TicketPriority = "critical" | "high" | "medium" | "low";

export type TicketStatus =
  | "open"
  | "investigating"
  | "in_progress"
  | "waiting_customer"
  | "waiting_provider"
  | "mitigating"
  | "resolved"
  | "closed"
  | "retrying"
  | "approval_pending"
  | "partially_resolved";

export type TechnicalChainNode = {
  step: "workspace" | "product" | "service" | "integration" | "event" | "error" | "ticket";
  title: string;
  subtitle: string;
  type: string;
  iconType: "workspace" | "product" | "service" | "integration" | "event" | "error" | "ticket";
  productSlug?: string;
  integrationSlug?: string;
  isError?: boolean;
};

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  actor: string;
  actorRole?: string;
  actorType: "system" | "engineer" | "customer";
  statusVariant?: "critical" | "warning" | "info" | "success" | "neutral";
};

export type DiagnosticContext = {
  product: string;
  productSlug: string;
  service: string;
  integration: string;
  integrationSlug: string;
  environment: "Production" | "Staging";
  endpoint?: string;
  error: string;
  correlationId: string;
  traceId: string;
  firstDetected: string;
  lastSuccessful: string;
};

export type AffectedScope = {
  workspaceId: string;
  workspaceName: string;
  organisation: string;
  subscriptionPlan: string;
  usersAffected: number;
  relatedIncidentId?: string;
};

export type RelatedLinks = {
  workspace360: string;
  product360: string;
  subscription360: string;
  integration360: string;
  incident360?: string;
  logsTraceId?: string;
  bossCaseRef: string;
};

export type ContextAction = {
  id: string;
  label: string;
  actionType: "diagnostic" | "retry" | "revalidate" | "link" | "approve" | "resolve" | "security";
  isHighRisk?: boolean;
  requiresApproval?: boolean;
  description: string;
};

export type Ticket = {
  id: string;
  title: string;
  type: TicketType;
  product: string;
  productSlug: string;
  service: string;
  integration: string;
  workspaceId: string;
  workspaceName: string;
  priority: TicketPriority;
  status: TicketStatus;
  needsAction: boolean;
  category: string;
  description: string;
  assignee: {
    name: string;
    role: string;
    initials: string;
    email: string;
  };
  reporter: {
    name: string;
    email: string;
    type: "Customer" | "Support Agent" | "System Alert";
  };
  createdAt: string;
  updatedAt: string;
  environment: "Production" | "Staging";
  diagnosticContext: DiagnosticContext;
  affectedScope: AffectedScope;
  technicalChain: TechnicalChainNode[];
  timeline: TimelineEvent[];
  relatedLinks: RelatedLinks;
  availableActions: ContextAction[];
  tags: string[];
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TK-9011",
    title: "HMAC signature verification rejecting Meta WhatsApp webhooks",
    type: "technical_case",
    product: "Chat with Sahayogi",
    productSlug: "chat-with-sahayogi",
    service: "Webhook Delivery",
    integration: "Meta WhatsApp Business Platform",
    workspaceId: "WS-94812",
    workspaceName: "Sharma Traders",
    priority: "critical",
    status: "open",
    needsAction: true,
    category: "Webhook Delivery",
    description:
      "Meta WABA webhook deliveries are failing with 401 HMAC mismatch.\nEgress tokens need rotation and re-verification against the Meta app secret.",
    assignee: {
      name: "Dhruv Singla",
      role: "Senior Support Engineer",
      initials: "DS",
      email: "dhruv.singla@setu.co",
    },
    reporter: {
      name: "System Monitor (AlertBot)",
      email: "alerts@setu.co",
      type: "System Alert",
    },
    createdAt: "10 mins ago",
    updatedAt: "Just now",
    environment: "Production",
    diagnosticContext: {
      product: "Chat with Sahayogi",
      productSlug: "chat-with-sahayogi",
      service: "Webhook Delivery",
      integration: "Meta WhatsApp Business Platform",
      integrationSlug: "meta-waba",
      environment: "Production",
      endpoint: "/v2/whatsapp/messages/webhook",
      error: "401 HMAC mismatch",
      correlationId: "evt_8F29a7c1b3e",
      traceId: "trc_94812_01j8m4k",
      firstDetected: "10:14 AM, 30 Sep 2026",
      lastSuccessful: "09:51 AM, 30 Sep 2026",
    },
    affectedScope: {
      workspaceId: "WS-94812",
      workspaceName: "Sharma Traders",
      organisation: "Sharma Traders Pvt. Ltd.",
      subscriptionPlan: "Chat with Sahayogi — Growth Plan",
      usersAffected: 14,
      relatedIncidentId: "INC-2041",
    },
    technicalChain: [
      {
        step: "workspace",
        title: "Sharma Traders",
        subtitle: "Workspace (WS-94812)",
        type: "Workspace",
        iconType: "workspace",
      },
      {
        step: "product",
        title: "Chat with Sahayogi",
        subtitle: "Product",
        type: "Product",
        iconType: "product",
        productSlug: "chat-with-sahayogi",
      },
      {
        step: "service",
        title: "Webhook Delivery",
        subtitle: "Service",
        type: "Service",
        iconType: "service",
      },
      {
        step: "integration",
        title: "Meta WABA",
        subtitle: "Integration",
        type: "Integration",
        iconType: "integration",
        integrationSlug: "meta-waba",
      },
      {
        step: "event",
        title: "Webhook Event",
        subtitle: "Event",
        type: "Event",
        iconType: "event",
      },
      {
        step: "error",
        title: "401 HMAC mismatch",
        subtitle: "Error",
        type: "Error",
        iconType: "error",
        isError: true,
      },
      {
        step: "ticket",
        title: "TK-9011",
        subtitle: "Ticket",
        type: "Ticket",
        iconType: "ticket",
      },
    ],
    timeline: [
      {
        id: "tl-1",
        time: "10:14 AM",
        title: "Webhook delivery failed",
        detail: "401 HMAC mismatch encountered on inbound ingress worker ip-10-0-2-14",
        actor: "Ingress Gateway",
        actorType: "system",
        statusVariant: "critical",
      },
      {
        id: "tl-2",
        time: "10:15 AM",
        title: "Automatic retry attempted",
        detail: "Idempotent backoff attempt failed with 401 Unauthorized",
        actor: "Retry Scheduler",
        actorType: "system",
        statusVariant: "warning",
      },
      {
        id: "tl-3",
        time: "10:17 AM",
        title: "Technical case created",
        detail: "Auto-routed from SRE anomaly monitor with correlation evt_8F29a7c1b3e",
        actor: "System Monitor",
        actorType: "system",
        statusVariant: "info",
      },
      {
        id: "tl-4",
        time: "10:19 AM",
        title: "Assigned to Dhruv Singla",
        detail: "Tier-2 SRE on-call rotation assigned",
        actor: "Dispatcher",
        actorType: "system",
        statusVariant: "neutral",
      },
      {
        id: "tl-5",
        time: "10:22 AM",
        title: "Diagnostic check executed",
        detail: "Meta credential state checked: token checksum invalidated post app-secret rollover",
        actor: "Dhruv Singla",
        actorRole: "Senior Support Engineer",
        actorType: "engineer",
        statusVariant: "info",
      },
      {
        id: "tl-6",
        time: "10:25 AM",
        title: "Awaiting token re-verification",
        detail: "Awaiting secret rotation and webhook handshake validation",
        actor: "Dhruv Singla",
        actorRole: "Senior Support Engineer",
        actorType: "engineer",
        statusVariant: "warning",
      },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-94812",
      product360: "/technical-support/dashboard?product=chat-with-sahayogi",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-94812",
      integration360: "/technical-support/integrations?id=INT-WABA-01",
      incident360: "/technical-support/incidents?id=INC-2041",
      logsTraceId: "trc_94812_01j8m4k",
      bossCaseRef: "CUS-89211",
    },
    availableActions: [
      {
        id: "run-diag",
        label: "Run Diagnostic",
        actionType: "diagnostic",
        description: "Executes automated webhook endpoint and HMAC secret verification probe.",
      },
      {
        id: "retry-webhook",
        label: "Retry Webhook",
        actionType: "retry",
        description: "Re-dispatches the queued webhook delivery payload with current HMAC headers.",
      },
      {
        id: "revalidate-conn",
        label: "Revalidate Connection",
        actionType: "revalidate",
        description: "Performs live handshake test against Meta WhatsApp Cloud API endpoint.",
      },
      {
        id: "rotate-secret",
        label: "Rotate Webhook Secret",
        actionType: "security",
        isHighRisk: true,
        requiresApproval: true,
        description: "Regenerates and synchronizes the webhook verification token. Requires Maker-Checker signoff.",
      },
    ],
    tags: ["whatsapp", "waba", "hmac", "webhook", "meta"],
  },

  {
    id: "TK-4821",
    title: "GSTIN verification failing during new onboarding step",
    type: "user_request",
    product: "BoSS",
    productSlug: "boss",
    service: "Compliance & Onboarding",
    integration: "GSTN / NIC Portal",
    workspaceId: "WS-76211",
    workspaceName: "Sharma Traders",
    priority: "high",
    status: "open",
    needsAction: true,
    category: "Compliance",
    description:
      "Customer attempted to onboard secondary entity 'Sharma Logistics' but portal throws 'GSTIN syntax validation failed' despite valid 15-digit code in BoSS Compliance module.",
    assignee: {
      name: "Priyanka Rao",
      role: "Support Specialist",
      initials: "PR",
      email: "priyanka.rao@setu.co",
    },
    reporter: {
      name: "Ramesh Sharma",
      email: "ramesh@sharmatraders.in",
      type: "Customer",
    },
    createdAt: "25 mins ago",
    updatedAt: "10 mins ago",
    environment: "Production",
    diagnosticContext: {
      product: "BoSS",
      productSlug: "boss",
      service: "Compliance",
      integration: "GSTN Common Portal",
      integrationSlug: "nic-gst",
      environment: "Production",
      endpoint: "/v1/boss/compliance/gstin/verify",
      error: "422 Unprocessable Entity (SYNTAX_CHECKSUM_MISMATCH)",
      correlationId: "evt_5D19c8f2a1a",
      traceId: "trc_76211_02m8n5k",
      firstDetected: "09:50 AM, 30 Sep 2026",
      lastSuccessful: "09:12 AM, 30 Sep 2026",
    },
    affectedScope: {
      workspaceId: "WS-76211",
      workspaceName: "Sharma Traders",
      organisation: "Sharma Traders Pvt. Ltd.",
      subscriptionPlan: "BoSS Enterprise Suite",
      usersAffected: 4,
    },
    technicalChain: [
      { step: "workspace", title: "Sharma Traders", subtitle: "Workspace (WS-76211)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "BoSS", subtitle: "Product", type: "Product", iconType: "product", productSlug: "boss" },
      { step: "service", title: "Compliance", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "GSTN Common Portal", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "nic-gst" },
      { step: "event", title: "GSTIN Verification", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "422 Checksum Mismatch", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-4821", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-201", time: "09:50 AM", title: "GSTIN Verification Failed", detail: "Syntax check algorithm rejected 15-character string checksum", actor: "BoSS Onboarding", actorType: "system", statusVariant: "critical" },
      { id: "tl-202", time: "09:52 AM", title: "Customer Raised Ticket", detail: "Ticket submitted via BoSS Support Desk interface", actor: "Ramesh Sharma", actorType: "customer", statusVariant: "info" },
      { id: "tl-203", time: "09:55 AM", title: "Assigned to Priyanka Rao", detail: "Assigned to Compliance Support queue", actor: "Dispatcher", actorType: "system", statusVariant: "neutral" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-76211",
      product360: "/technical-support/dashboard?product=boss",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-76211",
      integration360: "/technical-support/integrations?id=INT-GSTN-01",
      logsTraceId: "trc_76211_02m8n5k",
      bossCaseRef: "CUS-88412",
    },
    availableActions: [
      { id: "check-entitlement", label: "Check Entitlement", actionType: "diagnostic", description: "Verifies secondary company onboarding quota on BoSS Enterprise license." },
      { id: "run-syntax-probe", label: "Run GSTIN Probe", actionType: "diagnostic", description: "Executes authoritative lookup against government GST portal." },
      { id: "retry-step", label: "Retry Onboarding Step", actionType: "retry", description: "Bypasses cached regex cache and retries verification step." },
    ],
    tags: ["kyc", "gstin", "compliance", "boss"],
  },

  {
    id: "TK-9014",
    title: "Upstream 504 Gateway Timeout on Razorpay callback handler",
    type: "technical_case",
    product: "Sahayogi Cloud",
    productSlug: "sahayogi-cloud",
    service: "Payment Gateway",
    integration: "Razorpay Core Gateway",
    workspaceId: "WS-66104",
    workspaceName: "Bharat Agro",
    priority: "high",
    status: "in_progress",
    needsAction: false,
    category: "Payment Gateway",
    description:
      "Payment aggregator webhook ingress took 1,240ms causing proxy timeout on ingress cluster node. Webhook retry mechanism queued 3 retry batches.",
    assignee: {
      name: "Dhruv Singla",
      role: "Senior Support Engineer",
      initials: "DS",
      email: "dhruv.singla@setu.co",
    },
    reporter: {
      name: "SRE Health Watchdog",
      email: "sre-alerts@setu.co",
      type: "System Alert",
    },
    createdAt: "45 mins ago",
    updatedAt: "15 mins ago",
    environment: "Production",
    diagnosticContext: {
      product: "Sahayogi Cloud",
      productSlug: "sahayogi-cloud",
      service: "Payment Gateway",
      integration: "Razorpay Core Gateway",
      integrationSlug: "razorpay",
      environment: "Production",
      endpoint: "/v1/payments/razorpay/callback",
      error: "504 Gateway Timeout",
      correlationId: "evt_3A90b1e4c7d",
      traceId: "trc_66104_03k9p1x",
      firstDetected: "09:30 AM, 30 Sep 2026",
      lastSuccessful: "09:15 AM, 30 Sep 2026",
    },
    affectedScope: {
      workspaceId: "WS-66104",
      workspaceName: "Bharat Agro",
      organisation: "Bharat Agro Foods Ltd.",
      subscriptionPlan: "Sahayogi Cloud — Tally Dedicated",
      usersAffected: 28,
    },
    technicalChain: [
      { step: "workspace", title: "Bharat Agro", subtitle: "Workspace (WS-66104)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "Sahayogi Cloud", subtitle: "Product", type: "Product", iconType: "product", productSlug: "sahayogi-cloud" },
      { step: "service", title: "Payment Gateway", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "Razorpay Core", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "razorpay" },
      { step: "event", title: "Payment Callback Ingress", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "504 Gateway Timeout", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-9014", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-301", time: "09:30 AM", title: "Gateway Timeout (504)", detail: "HTTP response timed out after 1,240ms threshold", actor: "API Gateway", actorType: "system", statusVariant: "critical" },
      { id: "tl-302", time: "09:32 AM", title: "Diagnostic Executed", detail: "Checked connection pool latency on cloud backend: normal", actor: "Dhruv Singla", actorType: "engineer", statusVariant: "info" },
      { id: "tl-303", time: "09:40 AM", title: "Under Investigation", detail: "Monitoring Razorpay payment status webhook replay", actor: "Dhruv Singla", actorType: "engineer", statusVariant: "warning" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-66104",
      product360: "/technical-support/dashboard?product=sahayogi-cloud",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-66104",
      integration360: "/technical-support/integrations?id=INT-RZP-01",
      logsTraceId: "trc_66104_03k9p1x",
      bossCaseRef: "CUS-88102",
    },
    availableActions: [
      { id: "view-logs", label: "View API Logs", actionType: "link", description: "Opens filtered API logs for trace trc_66104_03k9p1x." },
      { id: "retry-batch", label: "Retry Queued Callbacks", actionType: "retry", description: "Triggers redelivery of stalled callback queue." },
    ],
    tags: ["razorpay", "timeout", "payments", "cloud"],
  },

  {
    id: "TK-4822",
    title: "Microsoft 365 user provisioning stuck in pending state",
    type: "integration_failure",
    product: "Sahayogi One",
    productSlug: "sahayogi-one",
    service: "User Provisioning",
    integration: "Microsoft Graph / 365 API",
    workspaceId: "WS-55321",
    workspaceName: "Kalyan Logistics",
    priority: "medium",
    status: "in_progress",
    needsAction: false,
    category: "User Provisioning",
    description:
      "Synchronizing 12 newly invited staff members to Microsoft 365 tenant stalled in Waiting External status due to Microsoft Graph rate quota.",
    assignee: {
      name: "Amit Kumar",
      role: "Systems Specialist",
      initials: "AK",
      email: "amit.kumar@setu.co",
    },
    reporter: {
      name: "Anil Kalyan",
      email: "anil@kalyanlogistics.in",
      type: "Customer",
    },
    createdAt: "1 hour ago",
    updatedAt: "30 mins ago",
    environment: "Production",
    diagnosticContext: {
      product: "Sahayogi One",
      productSlug: "sahayogi-one",
      service: "User Provisioning",
      integration: "Microsoft Graph / 365 API",
      integrationSlug: "microsoft-365",
      environment: "Production",
      endpoint: "/v1.0/users/delta",
      error: "429 Too Many Requests (GRAPH_QUOTA_EXCEEDED)",
      correlationId: "evt_7E44d2b9f0c",
      traceId: "trc_55321_04p9q2r",
      firstDetected: "09:15 AM, 30 Sep 2026",
      lastSuccessful: "08:45 AM, 30 Sep 2026",
    },
    affectedScope: {
      workspaceId: "WS-55321",
      workspaceName: "Kalyan Logistics",
      organisation: "Kalyan Logistics Cargo Pvt. Ltd.",
      subscriptionPlan: "Sahayogi One — Enterprise Workspace",
      usersAffected: 12,
    },
    technicalChain: [
      { step: "workspace", title: "Kalyan Logistics", subtitle: "Workspace (WS-55321)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "Sahayogi One", subtitle: "Product", type: "Product", iconType: "product", productSlug: "sahayogi-one" },
      { step: "service", title: "User Provisioning", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "Microsoft Graph API", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "microsoft-365" },
      { step: "event", title: "Batch Member Sync", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "429 Graph Quota Exceeded", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-4822", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-401", time: "09:15 AM", title: "Rate Quota Exceeded", detail: "Microsoft Graph API returned HTTP 429 with retry-after header", actor: "Identity Sync Worker", actorType: "system", statusVariant: "warning" },
      { id: "tl-402", time: "09:30 AM", title: "Assigned to Amit Kumar", detail: "Ticket routed to Workspace Identity team", actor: "Dispatcher", actorType: "system", statusVariant: "neutral" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-55321",
      product360: "/technical-support/dashboard?product=sahayogi-one",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-55321",
      integration360: "/technical-support/integrations?id=INT-MS365-01",
      logsTraceId: "trc_55321_04p9q2r",
      bossCaseRef: "CUS-87992",
    },
    availableActions: [
      { id: "check-identity", label: "View Identity Profile", actionType: "diagnostic", description: "Inspects Azure Active Directory sync status for Kalyan Logistics." },
      { id: "retry-provisioning", label: "Retry Provisioning", actionType: "retry", description: "Queues pending user sync batch after rate window reset." },
    ],
    tags: ["microsoft-365", "identity", "provisioning", "sahayogi-one"],
  },

  {
    id: "TK-4820",
    title: "Income tax filing status not updating after successful submission",
    type: "user_request",
    product: "Tax Sahayogi",
    productSlug: "tax-sahayogi",
    service: "Filing Workflow",
    integration: "Income Tax e-Filing 2.0",
    workspaceId: "WS-77432",
    workspaceName: "Rajdhani Fleet",
    priority: "medium",
    status: "open",
    needsAction: true,
    category: "Filing Workflow",
    description:
      "Client completed ITR-6 acknowledgment upload with valid digital signature token. Portal status remains in 'Validation Pending' after upstream acknowledgement webhook dropped.",
    assignee: {
      name: "Riya Patel",
      role: "Tax Support Specialist",
      initials: "RP",
      email: "riya.patel@setu.co",
    },
    reporter: {
      name: "Vikas Rajdhani",
      email: "vikas@rajdhanifleet.com",
      type: "Customer",
    },
    createdAt: "2 hours ago",
    updatedAt: "1 hour ago",
    environment: "Production",
    diagnosticContext: {
      product: "Tax Sahayogi",
      productSlug: "tax-sahayogi",
      service: "Filing Workflow",
      integration: "Income Tax e-Filing 2.0",
      integrationSlug: "nic-gst",
      environment: "Production",
      endpoint: "/v2/tax/itr6/ack",
      error: "202 Acknowledged (POLL_TIMEOUT)",
      correlationId: "evt_1C82d5a3b9e",
      traceId: "trc_77432_05k1r9t",
      firstDetected: "08:15 AM, 30 Sep 2026",
      lastSuccessful: "07:30 AM, 30 Sep 2026",
    },
    affectedScope: {
      workspaceId: "WS-77432",
      workspaceName: "Rajdhani Fleet",
      organisation: "Rajdhani Fleet Logistics Pvt. Ltd.",
      subscriptionPlan: "Tax Sahayogi — Corporate Compliance",
      usersAffected: 2,
    },
    technicalChain: [
      { step: "workspace", title: "Rajdhani Fleet", subtitle: "Workspace (WS-77432)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "Tax Sahayogi", subtitle: "Product", type: "Product", iconType: "product", productSlug: "tax-sahayogi" },
      { step: "service", title: "Filing Workflow", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "Income Tax e-Filing", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "nic-gst" },
      { step: "event", title: "ITR-6 Ack Poll", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "Poll Timeout", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-4820", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-501", time: "08:15 AM", title: "Ack Poll Timeout", detail: "Government e-filing portal acknowledgement response delayed > 300s", actor: "Tax Filing Engine", actorType: "system", statusVariant: "warning" },
      { id: "tl-502", time: "08:30 AM", title: "Assigned to Riya Patel", detail: "Assigned to Regulatory Review queue", actor: "Dispatcher", actorType: "system", statusVariant: "neutral" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-77432",
      product360: "/technical-support/dashboard?product=tax-sahayogi",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-77432",
      integration360: "/technical-support/integrations?id=INT-TAX-01",
      logsTraceId: "trc_77432_05k1r9t",
      bossCaseRef: "CUS-87654",
    },
    availableActions: [
      { id: "recheck-status", label: "Re-check Filing Status", actionType: "diagnostic", description: "Performs real-time status poll against Income Tax portal." },
      { id: "verify-dsc", label: "Verify Digital Signature", actionType: "diagnostic", description: "Inspects DSC cryptographic token validity and thumbprint." },
    ],
    tags: ["tax", "itr", "compliance", "tax-sahayogi"],
  },

  {
    id: "TK-4819",
    title: "Mutual fund statement sync failing",
    type: "user_request",
    product: "Investor Sahayogi",
    productSlug: "investor-sahayogi",
    service: "Data Sync",
    integration: "CAMS / KFintech Statement Feed",
    workspaceId: "WS-66104",
    workspaceName: "Deccan Retail",
    priority: "low",
    status: "open",
    needsAction: false,
    category: "Data Sync",
    description:
      "Periodic CAS statement fetch returned corrupted XML parser error for account ARN-355152 portfolio mapping.",
    assignee: {
      name: "Neeraj Sharma",
      role: "Wealth Operations Analyst",
      initials: "NS",
      email: "neeraj.sharma@setu.co",
    },
    reporter: {
      name: "Meera Reddy",
      email: "meera@deccanretail.com",
      type: "Customer",
    },
    createdAt: "3 hours ago",
    updatedAt: "2 hours ago",
    environment: "Production",
    diagnosticContext: {
      product: "Investor Sahayogi",
      productSlug: "investor-sahayogi",
      service: "Data Sync",
      integration: "CAMS / KFintech Statement Feed",
      integrationSlug: "cams",
      environment: "Production",
      endpoint: "/v1/cams/feed/sync",
      error: "400 Bad Request (XML_PARSE_FAULT)",
      correlationId: "evt_9A31c2d4f8b",
      traceId: "trc_66104_06m2q4w",
      firstDetected: "07:10 AM, 30 Sep 2026",
      lastSuccessful: "Yesterday, 07:10 AM",
    },
    affectedScope: {
      workspaceId: "WS-66104",
      workspaceName: "Deccan Retail",
      organisation: "Deccan Retail Chains Ltd.",
      subscriptionPlan: "Investor Sahayogi — Wealth Advisory",
      usersAffected: 1,
    },
    technicalChain: [
      { step: "workspace", title: "Deccan Retail", subtitle: "Workspace (WS-66104)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "Investor Sahayogi", subtitle: "Product", type: "Product", iconType: "product", productSlug: "investor-sahayogi" },
      { step: "service", title: "Data Sync", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "CAMS / KFintech", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "cams" },
      { step: "event", title: "CAS Statement Ingestion", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "XML Parse Fault", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-4819", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-601", time: "07:10 AM", title: "XML Parse Error", detail: "Special character in nominee field triggered strict schema parser failure", actor: "CAS Ingestion Worker", actorType: "system", statusVariant: "warning" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-66104",
      product360: "/technical-support/dashboard?product=investor-sahayogi",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-66104",
      integration360: "/technical-support/integrations?id=INT-CAMS-01",
      logsTraceId: "trc_66104_06m2q4w",
      bossCaseRef: "CUS-86410",
    },
    availableActions: [
      { id: "sanitize-cas", label: "Sanitize & Re-ingest CAS", actionType: "retry", description: "Normalizes XML feed encoding and re-triggers parsing pipeline." },
    ],
    tags: ["mutual-funds", "cams", "wealth", "investor-sahayogi"],
  },

  {
    id: "TK-4818",
    title: "AI image generation job stuck in processing",
    type: "technical_case",
    product: "Studio Sahayogi",
    productSlug: "studio-sahayogi",
    service: "AI Generation",
    integration: "Midjourney / GPU Cluster",
    workspaceId: "WS-88217",
    workspaceName: "Zenith Media",
    priority: "medium",
    status: "investigating",
    needsAction: false,
    category: "AI Generation",
    description:
      "GPU cluster node ip-10-0-4-88 failed health probe mid-render for 4K catalog generation job. Job queue marked orphaned.",
    assignee: {
      name: "Dhruv Singla",
      role: "Senior Support Engineer",
      initials: "DS",
      email: "dhruv.singla@setu.co",
    },
    reporter: {
      name: "Karan Malhotra",
      email: "karan@zenithmedia.in",
      type: "Customer",
    },
    createdAt: "5 hours ago",
    updatedAt: "1 hour ago",
    environment: "Production",
    diagnosticContext: {
      product: "Studio Sahayogi",
      productSlug: "studio-sahayogi",
      service: "AI Generation",
      integration: "GPU Cluster / Midjourney",
      integrationSlug: "midjourney",
      environment: "Production",
      endpoint: "/v2/studio/generate/async",
      error: "500 Internal Error (GPU_NODE_EVICTION)",
      correlationId: "evt_2B88e9f1a4c",
      traceId: "trc_88217_07n3p8v",
      firstDetected: "05:00 AM, 30 Sep 2026",
      lastSuccessful: "04:30 AM, 30 Sep 2026",
    },
    affectedScope: {
      workspaceId: "WS-88217",
      workspaceName: "Zenith Media",
      organisation: "Zenith Creative Media LLP",
      subscriptionPlan: "Studio Sahayogi — Creator Pro",
      usersAffected: 6,
    },
    technicalChain: [
      { step: "workspace", title: "Zenith Media", subtitle: "Workspace (WS-88217)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "Studio Sahayogi", subtitle: "Product", type: "Product", iconType: "product", productSlug: "studio-sahayogi" },
      { step: "service", title: "AI Generation", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "GPU Cluster", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "midjourney" },
      { step: "event", title: "Render Job Execution", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "GPU Node Eviction", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-4818", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-701", time: "05:00 AM", title: "GPU Spot Eviction", detail: "Cluster node terminated by cloud provider spot reclamation", actor: "Cluster Manager", actorType: "system", statusVariant: "critical" },
      { id: "tl-702", time: "06:30 AM", title: "Reassigned to Warm Node", detail: "Job re-queued for on-demand GPU instance", actor: "Dhruv Singla", actorType: "engineer", statusVariant: "info" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-88217",
      product360: "/technical-support/dashboard?product=studio-sahayogi",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-88217",
      integration360: "/technical-support/integrations?id=INT-GPU-01",
      logsTraceId: "trc_88217_07n3p8v",
      bossCaseRef: "CUS-85119",
    },
    availableActions: [
      { id: "requeue-job", label: "Re-queue On-Demand Job", actionType: "retry", description: "Dispatches the orphaned prompt job to dedicated on-demand GPU pool." },
    ],
    tags: ["studio", "ai-generation", "gpu", "creative"],
  },

  {
    id: "TK-4817",
    title: "User unable to access My Sahayogi after workspace switch",
    type: "access_security",
    product: "My Sahayogi",
    productSlug: "my-sahayogi",
    service: "Personal Vault",
    integration: "Setu Account Aggregator",
    workspaceId: "WS-33910",
    workspaceName: "Vanguard Labs",
    priority: "low",
    status: "waiting_customer",
    needsAction: false,
    category: "Personal Vault",
    description:
      "Employee personal vault session token invalidation triggered upon tenant role elevation. Requires user to re-authenticate biometric key.",
    assignee: {
      name: "Priyanka Rao",
      role: "Support Specialist",
      initials: "PR",
      email: "priyanka.rao@setu.co",
    },
    reporter: {
      name: "Tanya Sen",
      email: "tanya@vanguardlabs.com",
      type: "Customer",
    },
    createdAt: "6 hours ago",
    updatedAt: "4 hours ago",
    environment: "Production",
    diagnosticContext: {
      product: "My Sahayogi",
      productSlug: "my-sahayogi",
      service: "Personal Vault",
      integration: "Setu Account Aggregator",
      integrationSlug: "setu-aa",
      environment: "Production",
      endpoint: "/v1/my/vault/session",
      error: "403 Forbidden (REAUTH_REQUIRED)",
      correlationId: "evt_6C22a7f8b1d",
      traceId: "trc_33910_08m4q7z",
      firstDetected: "04:10 AM, 30 Sep 2026",
      lastSuccessful: "Yesterday, 06:00 PM",
    },
    affectedScope: {
      workspaceId: "WS-33910",
      workspaceName: "Vanguard Labs",
      organisation: "Vanguard Life Sciences Ltd.",
      subscriptionPlan: "My Sahayogi — Personal Finance Suite",
      usersAffected: 1,
    },
    technicalChain: [
      { step: "workspace", title: "Vanguard Labs", subtitle: "Workspace (WS-33910)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "My Sahayogi", subtitle: "Product", type: "Product", iconType: "product", productSlug: "my-sahayogi" },
      { step: "service", title: "Personal Vault", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "Setu AA", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "setu-aa" },
      { step: "event", title: "Vault Decryption", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "403 Re-auth Required", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-4817", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-801", time: "04:10 AM", title: "Session Expired", detail: "Tenant role upgrade triggered mandatory cryptographic key refresh", actor: "Security Gateway", actorType: "system", statusVariant: "neutral" },
      { id: "tl-802", time: "05:00 AM", title: "Notice Dispatched", detail: "Sent biometric re-auth push prompt to user device", actor: "Priyanka Rao", actorType: "engineer", statusVariant: "info" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-33910",
      product360: "/technical-support/dashboard?product=my-sahayogi",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-33910",
      integration360: "/technical-support/integrations?id=INT-AA-01",
      logsTraceId: "trc_33910_08m4q7z",
      bossCaseRef: "CUS-84902",
    },
    availableActions: [
      { id: "send-reauth-sms", label: "Resend Re-auth Link", actionType: "retry", description: "Dispatches fresh one-time verification link to registered phone." },
    ],
    tags: ["my-sahayogi", "personal-finance", "vault", "security"],
  },

  {
    id: "TK-9025",
    title: "Process blueprint generation failed during enterprise diagnostic",
    type: "platform_incident",
    product: "Office Sahayogi",
    productSlug: "office-sahayogi",
    service: "Process Blueprint",
    integration: "SOP Engine / LLM Worker",
    workspaceId: "WS-10842",
    workspaceName: "Apex Engineering",
    priority: "high",
    status: "mitigating",
    needsAction: true,
    category: "Process Blueprint",
    description:
      "Consulting diagnosis engine ran out of context tokens during multi-department RACI generation matrix for 200+ employee manufacturing plant.",
    assignee: {
      name: "Amit Kumar",
      role: "Systems Specialist",
      initials: "AK",
      email: "amit.kumar@setu.co",
    },
    reporter: {
      name: "Consulting Operations",
      email: "consulting@sahayogi.in",
      type: "Support Agent",
    },
    createdAt: "8 hours ago",
    updatedAt: "2 hours ago",
    environment: "Production",
    diagnosticContext: {
      product: "Office Sahayogi",
      productSlug: "office-sahayogi",
      service: "Process Blueprint",
      integration: "SOP Engine / LLM Worker",
      integrationSlug: "sop-engine",
      environment: "Production",
      endpoint: "/v1/office/raci/synthesize",
      error: "413 Payload Too Large (TOKEN_LIMIT_EXCEEDED)",
      correlationId: "evt_4D99b2e1f7a",
      traceId: "trc_10842_09p5r1x",
      firstDetected: "02:15 AM, 30 Sep 2026",
      lastSuccessful: "Yesterday, 11:30 PM",
    },
    affectedScope: {
      workspaceId: "WS-10842",
      workspaceName: "Apex Engineering",
      organisation: "Apex Engineering Works Ltd.",
      subscriptionPlan: "Office Sahayogi — Enterprise Consulting",
      usersAffected: 18,
      relatedIncidentId: "INC-2038",
    },
    technicalChain: [
      { step: "workspace", title: "Apex Engineering", subtitle: "Workspace (WS-10842)", type: "Workspace", iconType: "workspace" },
      { step: "product", title: "Office Sahayogi", subtitle: "Product", type: "Product", iconType: "product", productSlug: "office-sahayogi" },
      { step: "service", title: "Process Blueprint", subtitle: "Service", type: "Service", iconType: "service" },
      { step: "integration", title: "SOP Engine", subtitle: "Integration", type: "Integration", iconType: "integration", integrationSlug: "sop-engine" },
      { step: "event", title: "RACI Matrix Synthesis", subtitle: "Event", type: "Event", iconType: "event" },
      { step: "error", title: "Token Limit Exceeded", subtitle: "Error", type: "Error", iconType: "error", isError: true },
      { step: "ticket", title: "TK-9025", subtitle: "Ticket", type: "Ticket", iconType: "ticket" },
    ],
    timeline: [
      { id: "tl-901", time: "02:15 AM", title: "Synthesis Overflow", detail: "Batch context exceeded 128k prompt tokens; chunker failed to partition hierarchy", actor: "SOP Engine", actorType: "system", statusVariant: "critical" },
      { id: "tl-902", time: "04:00 AM", title: "Correlated to INC-2038", detail: "Linked to Platform Incident INC-2038 (LLM Context Limiter)", actor: "Amit Kumar", actorType: "engineer", statusVariant: "info" },
    ],
    relatedLinks: {
      workspace360: "/technical-support/workspaces?id=WS-10842",
      product360: "/technical-support/dashboard?product=office-sahayogi",
      subscription360: "/technical-support/workspaces?tab=subscriptions&id=WS-10842",
      integration360: "/technical-support/integrations?id=INT-SOP-01",
      incident360: "/technical-support/incidents?id=INC-2038",
      logsTraceId: "trc_10842_09p5r1x",
      bossCaseRef: "CUS-83210",
    },
    availableActions: [
      { id: "split-chunking", label: "Partition & Re-synthesize", actionType: "retry", description: "Enables recursive map-reduce chunking for department trees." },
    ],
    tags: ["office-sahayogi", "sop", "raci", "consulting"],
  },
];
