"use client";

import { Box } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
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

// TODO: replace with authenticated user once auth is wired up
const CURRENT_USER = {
  name: "Jordan Ellis",
  initials: "JE",
  role: "Head Trainer",
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  {
    href: "/dashboard/trainees",
    label: "Trainees",
    Icon: TraineesIcon,
    badge: { count: 12, scheme: "pink" },
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

export function Sidebar() {
  const pathname = usePathname() ?? "";

  return (
    <>
      {/* Mobile overlay — dismisses the flyout */}
      <div className="crm-nav-overlay" onClick={closeNav} aria-hidden />

    <Box as="nav" className="crm-sidebar" aria-label="Primary navigation">
      <div className="crm-sidebar-top">
        <div className="crm-profile-ring" aria-hidden>
          <div className="crm-profile-ring-inner">{CURRENT_USER.initials}</div>
          <div
            className="crm-profile-status"
            role="status"
            aria-label="Online"
          />
        </div>
        <div>
          <div className="crm-profile-name">{CURRENT_USER.name}</div>
          <div className="crm-profile-role">{CURRENT_USER.role}</div>
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
