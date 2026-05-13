import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ProfileRole = "admin" | "customer_care" | "vendas";

export type FeatureKey =
  | "formacao_carga"
  | "grupos_email"
  | "cadastros"
  | "integracoes"
  | "canhotos_upload"
  | "fiscal_operacional"
  | "revisao_carga"
  | "minutas";

export interface ProfileInfo {
  id: ProfileRole;
  nome: string;
  cargo: string;
  iniciais: string;
  gradiente: string;
}

export interface ProfileCapabilities {
  readOnly: boolean;
  hiddenRoutes: string[];
  canEdit: (feature: FeatureKey) => boolean;
  canView: (feature: FeatureKey) => boolean;
}

interface ProfileContextValue {
  profile: ProfileInfo;
  role: ProfileRole;
  setRole: (role: ProfileRole) => void;
  profiles: Record<ProfileRole, ProfileInfo>;
  capabilities: ProfileCapabilities;
}

const PROFILES: Record<ProfileRole, ProfileInfo> = {
  admin: {
    id: "admin",
    nome: "Rodrigo Silva",
    cargo: "Administrador",
    iniciais: "R",
    gradiente: "from-blue-500 to-blue-700",
  },
  customer_care: {
    id: "customer_care",
    nome: "Ana Costa",
    cargo: "Customer Care",
    iniciais: "A",
    gradiente: "from-emerald-500 to-emerald-700",
  },
  vendas: {
    id: "vendas",
    nome: "Pedro Lima",
    cargo: "Vendas",
    iniciais: "P",
    gradiente: "from-violet-500 to-violet-700",
  },
};

const CAPABILITIES: Record<ProfileRole, { edit: Set<FeatureKey>; view: Set<FeatureKey>; hidden: string[] }> = {
  admin: {
    edit: new Set<FeatureKey>(["formacao_carga", "grupos_email", "cadastros", "integracoes", "canhotos_upload", "fiscal_operacional", "revisao_carga", "minutas"]),
    view: new Set<FeatureKey>(["formacao_carga", "grupos_email", "cadastros", "integracoes", "canhotos_upload", "fiscal_operacional", "revisao_carga", "minutas"]),
    hidden: [],
  },
  customer_care: {
    edit: new Set<FeatureKey>([]),
    view: new Set<FeatureKey>(["canhotos_upload", "fiscal_operacional", "revisao_carga", "minutas"]),
    hidden: ["/formacao-carga", "/grupos-email", "/motoristas", "/veiculos", "/integracoes", "/importar"],
  },
  vendas: {
    edit: new Set<FeatureKey>([]),
    view: new Set<FeatureKey>(["revisao_carga"]),
    hidden: ["/formacao-carga", "/grupos-email", "/motoristas", "/veiculos", "/integracoes", "/importar", "/fiscal/cte", "/fiscal/mdfe", "/fiscal/captura", "/canhotos", "/minutas", "/coletas-rj", "/tecnorisk", "/sugestao-carga", "/emissao-automatica"],
  },
};

const STORAGE_KEY = "zorte:profile";

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<ProfileRole>(() => {
    if (typeof window === "undefined") return "admin";
    const stored = window.localStorage.getItem(STORAGE_KEY) as ProfileRole | null;
    if (stored && stored in PROFILES) return stored;
    return "admin";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  const setRole = (next: ProfileRole) => setRoleState(next);

  const caps = CAPABILITIES[role];
  const capabilities: ProfileCapabilities = {
    readOnly: role !== "admin",
    hiddenRoutes: caps.hidden,
    canEdit: (f) => caps.edit.has(f),
    canView: (f) => caps.view.has(f) || caps.edit.has(f),
  };

  return (
    <ProfileContext.Provider value={{ profile: PROFILES[role], role, setRole, profiles: PROFILES, capabilities }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile deve ser usado dentro de ProfileProvider");
  return ctx;
}
