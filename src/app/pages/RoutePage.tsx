import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, ImageIcon, MapPin, Package } from "lucide-react";
import { OpenStreetMapPanel } from "../components/OpenStreetMapPanel";
import { Pickup, useAuthSession, useUserPickups } from "../lib/appData";

export default function Schedule() {
  const { user } = useAuthSession();
  const { pickups, loading } = useUserPickups(user?.uid);
  const upcomingPickups = useMemo(
    () => pickups.filter((pickup) => pickup.status !== "completed"),
    [pickups],
  );
  const [selectedPickupId, setSelectedPickupId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPickupId && upcomingPickups.length) {
      setSelectedPickupId(upcomingPickups[0].id);
    }
    if (selectedPickupId && !upcomingPickups.some((pickup) => pickup.id === selectedPickupId)) {
      setSelectedPickupId(upcomingPickups[0]?.id ?? null);
    }
  }, [selectedPickupId, upcomingPickups]);

  const selectedPickup =
    upcomingPickups.find((pickup) => pickup.id === selectedPickupId) ?? upcomingPickups[0] ?? null;

  if (!user) {
    return <div className="px-4 py-6 text-sm text-[#69807a] md:px-6 xl:px-8">Sign in to view scheduled pickups.</div>;
  }

  return (
    <div className="min-h-full bg-[#f3f6f4] px-4 py-4 md:px-6 xl:px-8 xl:py-6">
      <section className="rounded-[28px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Schedule</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102422] md:text-4xl">Scheduled e-waste pickups</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#69807a]">
          This screen reads pickup data directly from Firebase and shows the scheduled e-waste location on OpenStreetMap with nearby places from Overpass API.
        </p>
      </section>

      {loading ? (
        <div className="mt-5 text-sm text-[#69807a]">Loading scheduled pickups...</div>
      ) : !upcomingPickups.length ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#dce7e2] bg-white p-8 text-center shadow-[0_12px_32px_rgba(16,36,34,0.04)]">
          <div className="text-xl font-semibold text-[#102422]">No scheduled pickups</div>
          <div className="mt-2 text-sm text-[#69807a]">When Firebase receives new pickup jobs, they will appear here automatically.</div>
        </div>
      ) : (
        <section className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            {upcomingPickups.map((pickup) => (
              <PickupCard
                key={pickup.id}
                pickup={pickup}
                active={pickup.id === selectedPickup?.id}
                onClick={() => setSelectedPickupId(pickup.id)}
              />
            ))}
          </div>

          {selectedPickup ? (
            <div className="space-y-5">
              <OpenStreetMapPanel
                center={{ lat: selectedPickup.address.lat, lng: selectedPickup.address.lng }}
                title={selectedPickup.item}
                subtitle={`${selectedPickup.address.area}, ${selectedPickup.address.city}`}
                heightClassName="h-[320px] md:h-[420px]"
                markers={[
                  {
                    lat: selectedPickup.address.lat,
                    lng: selectedPickup.address.lng,
                    label: "E-waste pickup",
                  },
                ]}
              />

              <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailBlock icon={<Package className="h-4 w-4 text-[#00695c]" />} title="Job data" lines={[selectedPickup.item, `${selectedPickup.category} | ${selectedPickup.condition || "Condition pending"}`, `User ID: ${selectedPickup.userId}`]} />
                  <DetailBlock icon={<MapPin className="h-4 w-4 text-[#00695c]" />} title="Address" lines={[selectedPickup.address.label, `${selectedPickup.address.area}, ${selectedPickup.address.city}`, `${selectedPickup.address.lat.toFixed(5)}, ${selectedPickup.address.lng.toFixed(5)}`]} />
                  <DetailBlock icon={<CalendarDays className="h-4 w-4 text-[#00695c]" />} title="Schedule" lines={[selectedPickup.schedule.date || "Date pending", selectedPickup.schedule.timeSlot || "Time slot pending", `Status: ${selectedPickup.status.replace("_", " ")}`]} />
                  <DetailBlock icon={<Clock3 className="h-4 w-4 text-[#00695c]" />} title="Pricing" lines={[`Estimated: ${selectedPickup.pricing.estimated} credits`, `Final: ${selectedPickup.pricing.final ?? "Pending"}`, `Quantity: ${selectedPickup.quantity}`]} />
                </div>

                <div className="mt-5 rounded-[20px] bg-[#f7faf9] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#102422]">
                    <ImageIcon className="h-4 w-4 text-[#00695c]" />
                    Uploaded images
                  </div>
                  {selectedPickup.images.length ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {selectedPickup.images.map((image, index) => (
                        <img
                          key={`${selectedPickup.id}-${index}`}
                          src={image}
                          alt={`${selectedPickup.item} ${index + 1}`}
                          className="h-24 w-full rounded-xl object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-[#69807a]">No images uploaded for this pickup.</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

function PickupCard({
  pickup,
  active,
  onClick,
}: {
  pickup: Pickup;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[24px] border p-5 text-left shadow-[0_12px_32px_rgba(16,36,34,0.06)] transition-colors md:p-6 ${
        active ? "border-[#8fd0c3] bg-[#edf7f4]" : "border-[#dce7e2] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-[#102422]">{pickup.item}</div>
          <div className="mt-2 text-sm text-[#69807a]">{pickup.address.area}, {pickup.address.city}</div>
        </div>
        <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#00695c]">
          {pickup.status.replace("_", " ")}
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-[#69807a]">
        <div>{pickup.category} | {pickup.condition || "Condition pending"}</div>
        <div>{pickup.schedule.date || "Date pending"} | {pickup.schedule.timeSlot || "Time slot pending"}</div>
        <div>{pickup.pricing.final ?? pickup.pricing.estimated} credits</div>
      </div>
    </button>
  );
}

function DetailBlock({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-[20px] bg-[#f7faf9] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#102422]">
        {icon}
        {title}
      </div>
      <div className="mt-2 space-y-1 text-sm text-[#69807a]">
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}
