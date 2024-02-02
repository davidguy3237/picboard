"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative ml-4">
      <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search" className="w-96 pl-8" type="search" />
    </div>
  );
}
