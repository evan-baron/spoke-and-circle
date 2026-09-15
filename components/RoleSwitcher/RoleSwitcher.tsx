"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { type Role, useAuth } from "@/lib/auth-context";

export function RoleSwitcher() {
  const { role, setRole } = useAuth();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setRole(event.target.value as Role);
  }

  return (
    <div>
      {role === "admin" && (
        <Link href="/teams/new">
          + Add a team
        </Link>
      )}
      {role === "member" && (
        <Link href="/teams/new">
          + Submit a team
        </Link>
      )}
      <label>
        <span>Viewing as</span>
        <select value={role} onChange={handleChange}>
          <option value="guest">Guest</option>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
    </div>
  );
}
