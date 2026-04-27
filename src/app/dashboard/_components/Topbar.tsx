"use client";

import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { LuMenu } from "react-icons/lu";
import { IconButton } from "../../components/IconButton";
import { Input } from "../../components/Input";
import { BellIcon, SearchIcon } from "./NavIcons";

const CURRENT_USER = { initials: "JE" };

export function Topbar() {
  const [query, setQuery] = useState("");
  const [hasUnread] = useState(true);

  function openNav() {
    document.body.classList.add("crm-nav-open");
  }

  return (
    <Box as="header" className="crm-topbar">
      <button className="crm-hamburger" onClick={openNav} aria-label="Open navigation">
        <LuMenu size={18} />
      </button>
      <div className="crm-topbar-title">
        TBD<span className="crm-topbar-title-accent">Fit</span>
      </div>

      <div className="crm-topbar-search">
        <div className="crm-topbar-search-icon">
          <SearchIcon />
        </div>
        <Input
          size="sm"
          placeholder="Search trainees, videos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
      </div>

      <div className="crm-topbar-actions">
        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            variant="outline"
            colorScheme="pink"
            bg="var(--neon-surface)"
            borderColor="var(--neon-border)"
            color="rgba(255,255,255,0.5)"
            boxShadow="none"
            _hover={{
              borderColor: "rgba(253,109,187,0.33)",
              color: "#fff",
              boxShadow: "none",
            }}
          >
            <BellIcon />
          </IconButton>
          {hasUnread && <div className="crm-notif-dot" />}
        </Box>
        <div
          className="crm-profile-ring"
          style={{ width: 36, height: 36 }}
          aria-hidden
        >
          <div
            className="crm-profile-ring-inner"
            style={{ fontSize: "13px" }}
          >
            {CURRENT_USER.initials}
          </div>
        </div>
      </div>
    </Box>
  );
}
