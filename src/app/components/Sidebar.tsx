
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  { name: "Objetivos", path: "/objetivos", icon: "🎯" },
  { name: "Tarefas", path: "/tarefas", icon: "✅" },
  { name: "Rotinas", path: "/rotinas", icon: "🔁" },
  { name: "Calendário", path: "/calendario", icon: "📅" },
  { name: "Compras", path: "/compras", icon: "🛒" },
  { name: "Treino", path: "/treino", icon: "🏋️" },
  { name: "Alimentação", path: "/alimentacao", icon: "🥗" },
  { name: "Lista de desejos", path: "/desejos", icon: "⭐" },
  { name: "Viagens", path: "/viagens", icon: "✈️" },
  { name: "Finanças", path: "/financas", icon: "💰" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Life Manager</div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const active = pathname === link.path;

          return (
            <Link
              key={link.path}
              href={link.path}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

