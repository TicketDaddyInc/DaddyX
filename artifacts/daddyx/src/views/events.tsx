"use client";

import { useState } from "react";
import { Search, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useListEvents } from "@workspace/api-client-react";
import EventCard from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";

type FilterMode = "all" | "daddyx" | "standard";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const events = useListEvents();

  const filtered = (events.data ?? []).filter((e: any) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.venueName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "daddyx" && e.daddyxEnabled) ||
      (filter === "standard" && !e.daddyxEnabled);
    return matchesSearch && matchesFilter;
  });

  const daddyxCount = (events.data ?? []).filter((e: any) => e.daddyxEnabled).length;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-bold text-4xl text-white uppercase tracking-tighter">Events</h1>
            <span className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              {daddyxCount} DaddyX
            </span>
          </div>
          <p className="text-white/45 text-sm">
            Browse live events — back a DaddyX campaign to earn from the night.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              type="search"
              placeholder="Search events or venues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 h-10 rounded-full"
              data-testid="input-search-events"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "daddyx", "standard"] as FilterMode[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-white/15 text-white/55 hover:text-white hover:border-white/30"
                }`}
                data-testid={`button-filter-${f}`}
              >
                {f === "all" ? "All" : f === "daddyx" ? "⚡ DaddyX" : "Standard"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {events.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <Skeleton className="h-44 w-full bg-white/5" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-3 w-1/2 bg-white/5" />
                  <Skeleton className="h-8 w-full bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!events.isLoading && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Coins className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/35 text-sm">No events found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((event: any) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
