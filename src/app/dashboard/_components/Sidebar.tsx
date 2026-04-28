"use client";

import { Box } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import type { UserRole } from "@/db/schema";
import { Badge } from "../../components/Badge";
import {
  DashboardIcon,
  SettingsIcon,
  TraineesIcon,
  TrainersIcon,
  VideosIcon,
} from "./NavIcons";

interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: { count: number; scheme: "pink" | "cyan" };
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  trainer_manager: "Trainer Manager",
  trainer: "Trainer",
  trainee: "Trainee",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  {
    href: "/dashboard/trainees",
    label: "Trainees",
    Icon: TraineesIcon,
  },
  { href: "/dashboard/videos", label: "Videos", Icon: VideosIcon },
  { href: "/dashboard/trainers", label: "Trainers", Icon: TrainersIcon },
  { href: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
];

function isActive(currentPath: string, href: string) {
  if (href === "/dashboard") return currentPath === "/dashboard";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function closeNav() {
  document.body.classList.remove("crm-nav-open");
}

interface SidebarProps {
  user: { name: string; roles: UserRole[] };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const userInitials = initials(user.name);
  const roleLabel = ROLE_LABELS[user.roles[0]] ?? "Member";

  return (
    <>
      {/* Mobile overlay — dismisses the flyout */}
      <div className="crm-nav-overlay" onClick={closeNav} aria-hidden />

      <Box as="nav" className="crm-sidebar" aria-label="Primary navigation">
        <div className="crm-sidebar-top">
          <div className="crm-profile-ring" aria-hidden>
            <div className="crm-profile-ring-inner">{userInitials}</div>
            <div
              className="crm-profile-status"
              role="status"
              aria-label="Online"
            />
          </div>
          <div>
            <div className="crm-profile-name">{user.name}</div>
            <div className="crm-profile-role">{roleLabel}</div>
          </div>
        </div>

        <div className="crm-nav-section">
          <div className="crm-nav-label">Navigation</div>
          {NAV_ITEMS.map(({ href, label, Icon, badge }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`crm-nav-item${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={closeNav}
              >
                <Icon />
                <span>{label}</span>
                {badge && (
                  <Badge
                    className="crm-nav-item-badge"
                    colorScheme={badge.scheme}
                    variant="solid"
                  >
                    {badge.count}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </Box>
    </>
  );
}
