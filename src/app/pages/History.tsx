import React from "react";
import { CalendarDays, MapPin, Wallet } from "lucide-react";
import { useAuthSession, useUserPickups } from "../lib/appData";

export default function HistoryPage() {
  const { user } = useAuthSession();
  const { pickups, loading } = useUserPickups(user?.uid);
  const history = pickups.filter((pickup) => pickup.status === "completed");

  if (!user) {
    return <div className="px-4 py-6 text-sm text-[#69807a] md:px-6 xl:px-8">Sign in to view your work history.</div>;
  }

  return (
    <div className="min-h-full bg-[#f3f6f4] px-4 py-4 md:px-6 xl:px-8 xl:py-6">
      <section className="rounded-[28px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">History</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102422] md:text-4xl">Completed pickup history</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#69807a]">
          Review past completed work, earnings, addresses, and schedules from Firebase.
        </p>
      </section>

      {loading ? (
        <div className="mt-5 text-sm text-[#69807a]">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#dce7e2] bg-white p-8 text-center shadow-[0_12px_32px_rgba(16,36,34,0.04)]">
          <div className="text-xl font-semibold text-[#102422]">No completed pickups yet</div>
          <div className="mt-2 text-sm text-[#69807a]">Finished pickup jobs will appear here automatically.</div>
        </div>
      ) : (
        <section className="mt-5 space-y-4">
          {history.map((pickup) => (
            <div key={pickup.id} className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-[#102422]">{pickup.item}</div>
                  <div className="mt-2 text-sm text-[#69807a]">{pickup.category} | {pickup.condition || "Condition pending"}</div>
                </div>
                <div className="rounded-full bg-[#edf7f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#00695c]">
                  {pickup.status.replace("_", " ")}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[20px] bg-[#f7faf9] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#102422]">
                    <MapPin className="h-4 w-4 text-[#00695c]" />
                    Address
                  </div>
                  <div className="mt-2 text-sm text-[#69807a]">{pickup.address.label}</div>
                  <div className="mt-1 text-sm text-[#69807a]">{pickup.address.area}, {pickup.address.city}</div>
                </div>
                <div className="rounded-[20px] bg-[#f7faf9] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#102422]">
                    <CalendarDays className="h-4 w-4 text-[#00695c]" />
                    Schedule
                  </div>
                  <div className="mt-2 text-sm text-[#69807a]">{pickup.schedule.date || "Date pending"}</div>
                  <div className="mt-1 text-sm text-[#69807a]">{pickup.schedule.timeSlot || "Time slot pending"}</div>
                </div>
                <div className="rounded-[20px] bg-[#f7faf9] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#102422]">
                    <Wallet className="h-4 w-4 text-[#00695c]" />
                    Earnings
                  </div>
                  <div className="mt-2 text-sm text-[#69807a]">Estimated: {pickup.pricing.estimated} credits</div>
                  <div className="mt-1 text-sm text-[#69807a]">Final: {pickup.pricing.final ?? "Pending"}</div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
