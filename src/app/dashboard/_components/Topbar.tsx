"use client";

import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { LuMenu } from "react-icons/lu";
import { Button } from "@/app/components/Button";
import { Input } from "../../components/Input";
import useHandleLogout from "../_hooks/useLogout";
import { SearchIcon } from "./NavIcons";

export function Topbar() {
  const { logout } = useHandleLogout();
  const [query, setQuery] = useState("");
  const [_hasUnread] = useState(true);

  function openNav() {
    document.body.classList.add("crm-nav-open");
  }

  return (
    <Box as="header" className="crm-topbar">
      <button
        type="button"
        className="crm-hamburger"
        onClick={openNav}
        aria-label="Open navigation"
      >
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

      <Button onClick={logout}>Logout</Button>
    </Box>
  );
}
