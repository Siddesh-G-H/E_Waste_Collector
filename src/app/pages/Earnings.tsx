import React, { useMemo } from "react";
import { Leaf, Package, Wallet } from "lucide-react";
import { calculateImpact, useAuthSession, useUserPickups } from "../lib/appData";

export default function Impact() {
  const { user } = useAuthSession();
  const { pickups, loading } = useUserPickups(user?.uid);
  const impact = calculateImpact(pickups);

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    impact.completed.forEach((pickup) => {
      totals.set(
        pickup.category || "Uncategorized",
        (totals.get(pickup.category || "Uncategorized") ?? 0) +
          (pickup.pricing.final ?? pickup.pricing.estimated),
      );
    });
    const entries = Array.from(totals.entries());
    const maxValue = Math.max(...entries.map(([, value]) => value), 1);
    return entries.map(([label, value]) => ({
      label,
      value,
      width: `${Math.max(12, Math.round((value / maxValue) * 100))}%`,
    }));
  }, [impact.completed]);

  const recentWork = impact.completed.slice(0, 5);

  return (
    <div className="min-h-full bg-[#f3f6f4] px-4 py-4 md:px-6 xl:px-8 xl:py-6">
      <section className="rounded-[28px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Impact</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102422] md:text-4xl">Earnings and work impact</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#69807a]">
          Earnings, charts, and work summaries are calculated dynamically from your completed jobs in Firebase.
        </p>
      </section>

      {loading ? (
        <div className="mt-5 text-sm text-[#69807a]">Loading impact...</div>
      ) : impact.completed.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#dce7e2] bg-white p-8 text-center shadow-[0_12px_32px_rgba(16,36,34,0.04)]">
          <div className="text-xl font-semibold text-[#102422]">No impact yet</div>
          <div className="mt-2 text-sm text-[#69807a]">Complete a pickup to start seeing earnings and work charts.</div>
        </div>
      ) : (
        <>
          <section className="mt-5 grid gap-5 md:grid-cols-3">
            {[
              { title: "Items recycled", value: impact.totalItems, icon: Package, tone: "bg-[#edf7f4] text-[#00695c]" },
              { title: "Earnings", value: `${impact.totalCredits} credits`, icon: Wallet, tone: "bg-[#fff4e5] text-[#ff8f00]" },
              { title: "CO2 saved", value: `${impact.co2Saved} kg`, icon: Leaf, tone: "bg-[#ecf9ef] text-[#2e7d32]" },
            ].map((card) => (
              <div key={card.title} className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
                <div className={`inline-flex rounded-2xl p-3 ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">{card.title}</div>
                <div className="mt-2 text-3xl font-bold text-[#102422]">{card.value}</div>
              </div>
            ))}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Earnings chart</div>
              <div className="mt-4 space-y-4">
                {categoryBreakdown.map((entry) => (
                  <div key={entry.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-[#102422]">{entry.label}</span>
                      <span className="text-[#69807a]">{entry.value} credits</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#edf2f0]">
                      <div className="h-3 rounded-full bg-[#00695c]" style={{ width: entry.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Recent completed work</div>
              <div className="mt-4 space-y-3">
                {recentWork.map((pickup) => (
                  <div key={pickup.id} className="rounded-[20px] bg-[#f7faf9] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#102422]">{pickup.item}</div>
                        <div className="mt-1 text-sm text-[#69807a]">{pickup.address.area}, {pickup.address.city}</div>
                        <div className="mt-1 text-xs text-[#69807a]">{pickup.schedule.date || "Date pending"} | {pickup.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#00695c]">{pickup.pricing.final ?? pickup.pricing.estimated} credits</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.08em] text-[#69807a]">{pickup.status.replace("_", " ")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
