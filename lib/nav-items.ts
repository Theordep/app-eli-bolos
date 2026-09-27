import {
  Box,
  ClipboardList,
  Home,
  List,
  Settings,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/produtos", label: "Produtos", icon: ShoppingBag },
  { href: "/insumos", label: "Insumos", icon: Box },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/lista-compras", label: "Lista de Compras", icon: List },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
