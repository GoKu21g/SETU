export type Persona = "devops-sre" | "technical-support" | "founder" | "engineering-lead" | "compliance-officer";

export type PersonaConfig = {
  id: Persona;
  label: string;
  routeBase: string;
  identity: {
    name: string;
    role: string;
    initials: string;
  };
};

export const PERSONAS: Record<Persona, PersonaConfig> = {
  "devops-sre": {
    id: "devops-sre",
    label: "DevOps / SRE",
    routeBase: "/devops-sre",
    identity: {
      name: "Arjun Mehta",
      role: "Lead Site Reliability Engineer",
      initials: "AM",
    },
  },
  "technical-support": {
    id: "technical-support",
    label: "Technical Support",
    routeBase: "/technical-support",
    identity: {
      name: "Dhruv Singla",
      role: "Senior Technical Support Engineer",
      initials: "DS",
    },
  },
  founder: {
    id: "founder",
    label: "Founder",
    routeBase: "/founder",
    identity: {
      name: "Dhruv Singla",
      role: "Founder",
      initials: "DS",
    },
  },
  "engineering-lead": {
    id: "engineering-lead",
    label: "Engineering Lead",
    routeBase: "/engineering-lead",
    identity: {
      name: "Priyanka Rao",
      role: "Engineering Lead",
      initials: "PR",
    },
  },
  "compliance-officer": {
    id: "compliance-officer",
    label: "Compliance Officer",
    routeBase: "/compliance-officer",
    identity: {
      name: "Neha Kapoor",
      role: "Compliance Officer",
      initials: "NK",
    },
  },
};

export const PERSONA_LIST: PersonaConfig[] = Object.values(PERSONAS);

const DEFAULT_PERSONA: Persona = "devops-sre";

export function personaFromPathname(pathname: string | null | undefined): Persona {
  if (!pathname) return DEFAULT_PERSONA;
  const segment = pathname.split("/")[1];
  if (segment === "devops-sre" || segment === "technical-support" || segment === "engineering-lead" || segment === "compliance-officer") {
    return segment as Persona;
  }
  return DEFAULT_PERSONA;
}

export function personaConfigFromPathname(pathname: string | null | undefined): PersonaConfig {
  return PERSONAS[personaFromPathname(pathname)];
}
