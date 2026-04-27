import React, { useState, useEffect } from "react";
import { CalendarDays, Clock3, MapPin, PackageCheck, RefreshCw } from "lucide-react";
import { fetchAvailablePickups, Pickup, useActivePickup, useAuthSession } from "../lib/appData";

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#dce7e2] bg-white p-8 text-center shadow-[0_12px_32px_rgba(16,36,34,0.04)]">
      <div className="text-xl font-semibold text-[#102422]">{title}</div>
      <div className="mt-2 text-sm leading-6 text-[#69807a]">{body}</div>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuthSession();
  const { activePickup, pickups, loading } = useActivePickup(user?.uid);
  const [availableJobs, setAvailableJobs] = useState<Pickup[]>([]);
  const [refreshingJobs, setRefreshingJobs] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");

  const recent = pickups.slice(0, 5);

  const handleRefreshJobs = async () => {
    try {
      setRefreshingJobs(true);
      setRefreshMessage("");
      const jobs = await fetchAvailablePickups();
      setAvailableJobs(jobs);
      setRefreshMessage(jobs.length ? `${jobs.length} pickup job(s) ready.` : "No scheduled jobs available right now.");
    } catch (error: any) {
      setRefreshMessage(error?.message || "Unable to fetch jobs right now.");
    } finally {
      setRefreshingJobs(false);
    }
  };

  useEffect(() => {
    handleRefreshJobs();
  }, []);

  if (authLoading) {
    return <div className="px-4 py-6 text-sm text-[#69807a] md:px-6 xl:px-8">Loading account...</div>;
  }

  if (!user) {
    return <div className="px-4 py-6 text-sm text-[#69807a] md:px-6 xl:px-8">Sign in to view your pickups.</div>;
  }

  return (
    <div className="min-h-full bg-[#f3f6f4] px-4 py-4 md:px-6 xl:px-8 xl:py-6">
      <section className="rounded-[28px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Home</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102422] md:text-4xl">Your pickup dashboard</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#69807a]">
          See your active pickup and recent activity from Firebase in one place. Everything on this screen updates from the shared pickups collection.
        </p>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#edf7f4] p-3 text-[#00695c]">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Active pickup</div>
                <div className="mt-1 text-xl font-bold text-[#102422]">Live pickup status</div>
              </div>
            </div>
            <button
              onClick={handleRefreshJobs}
              disabled={refreshingJobs}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f5f8f7] px-4 py-2.5 text-sm font-semibold text-[#102422] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingJobs ? "animate-spin" : ""}`} />
              {refreshingJobs ? "Refreshing" : "Refresh jobs"}
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-[#69807a]">Loading active pickup...</div>
          ) : activePickup ? (
            <div className="rounded-[22px] bg-[#f7faf9] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold text-[#102422]">{activePickup.item}</div>
                  <div className="mt-2 inline-flex rounded-full bg-[#edf7f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#00695c]">
                    {activePickup.status.replace("_", " ")}
                  </div>
                </div>
                <div className="text-left sm:text-right text-sm text-[#69807a]">
                  <div>{activePickup.category}</div>
                  <div className="mt-1">{activePickup.quantity} item(s)</div>
                  <div className="mt-1">{activePickup.condition || "Condition pending"}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#102422]">
                    <MapPin className="h-4 w-4 text-[#00695c]" />
                    {activePickup.address.area}, {activePickup.address.city}
                  </div>
                  <div className="mt-2 text-sm text-[#69807a]">{activePickup.address.label}</div>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#102422]">
                    <CalendarDays className="h-4 w-4 text-[#00695c]" />
                    {activePickup.schedule.date}
                  </div>
                  <div className="mt-2 text-sm text-[#69807a]">{activePickup.schedule.timeSlot}</div>
                  <div className="mt-2 text-sm text-[#69807a]">Pricing: {activePickup.pricing.estimated} estimated credits</div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="No active pickup" body="Schedule a new pickup to start tracking it here." />
          )}

          <div className="mt-4 rounded-[22px] bg-[#f7faf9] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Pickup jobs</div>
                <div className="mt-1 text-lg font-bold text-[#102422]">Available to pick up</div>
              </div>
            </div>

            {refreshMessage ? <div className="mt-3 text-sm text-[#69807a]">{refreshMessage}</div> : null}

            {availableJobs.length ? (
              <div className="mt-4 space-y-3">
                {availableJobs.map((job) => (
                  <div key={job.id} className="rounded-2xl bg-white p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[#102422]">{job.item}</div>
                        <div className="mt-1 text-sm text-[#69807a]">{job.address.area}, {job.address.city}</div>
                        <div className="mt-1 text-xs text-[#69807a]">{job.category} - {job.condition || "Condition pending"}</div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-semibold text-[#00695c]">{job.pricing.estimated} credits</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.08em] text-[#69807a]">{job.status.replace("_", " ")}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-[#69807a]">
                      {job.schedule.date || "Date pending"} | {job.schedule.timeSlot || "Time slot pending"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-[#69807a]">Click refresh to fetch the latest jobs from Firebase.</div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-[#fff4e5] p-3 text-[#ff8f00]">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Recent activity</div>
              <div className="mt-1 text-xl font-bold text-[#102422]">Latest pickups</div>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-[#69807a]">Loading recent pickups...</div>
          ) : recent.length ? (
            <div className="space-y-3">
              {recent.map((pickup) => (
                <div key={pickup.id} className="rounded-[20px] bg-[#f7faf9] p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[#102422]">{pickup.item}</div>
                      <div className="mt-1 text-sm text-[#69807a]">{pickup.address.area}, {pickup.address.city}</div>
                      <div className="mt-1 text-xs text-[#69807a]">{pickup.category} • {pickup.condition || "Condition pending"}</div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-semibold text-[#00695c]">{pickup.pricing.final ?? pickup.pricing.estimated} credits</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.08em] text-[#69807a]">{pickup.status.replace("_", " ")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent pickups" body="Your completed and scheduled pickups will appear here automatically." />
          )}
        </div>
      </section>
    </div>
  );
}
