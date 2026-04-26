import React, { useEffect, useMemo, useState } from "react";
import { Clock3, LocateFixed, MapPin, PackageCheck, UserRound } from "lucide-react";
import { OpenStreetMapPanel } from "../components/OpenStreetMapPanel";
import {
  calculateDistanceKm,
  estimateTravelMinutes,
  useActivePickup,
  useAuthSession,
  useLiveUserLocation,
} from "../lib/appData";

export default function Track() {
  const { user, loading: authLoading } = useAuthSession();
  const { activePickup, loading } = useActivePickup(user?.uid);
  const userLocation = useLiveUserLocation();
  const [startLat, setStartLat] = useState("");
  const [startLng, setStartLng] = useState("");
  const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (userLocation) {
      setStartLat(String(userLocation.lat));
      setStartLng(String(userLocation.lng));
      setManualLocation(userLocation);
    }
  }, [userLocation]);

  const effectiveUserLocation = userLocation ?? manualLocation;

  const travelDetails = useMemo(() => {
    if (!activePickup) return null;

    const collectorToPickupDistance = activePickup.collectorLocation
      ? calculateDistanceKm(activePickup.collectorLocation, activePickup.address)
      : null;
    const userToPickupDistance = effectiveUserLocation
      ? calculateDistanceKm(effectiveUserLocation, activePickup.address)
      : null;

    return {
      collectorToPickupDistance,
      collectorEta: collectorToPickupDistance == null ? null : estimateTravelMinutes(collectorToPickupDistance),
      userToPickupDistance,
      userEta: userToPickupDistance == null ? null : estimateTravelMinutes(userToPickupDistance, 18),
    };
  }, [activePickup, effectiveUserLocation]);

  const applyManualStartPoint = () => {
    const lat = Number(startLat);
    const lng = Number(startLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setManualLocation({ lat, lng });
  };

  if (authLoading || loading) {
    return <div className="px-4 py-6 text-sm text-[#69807a] md:px-6 xl:px-8">Loading live pickup...</div>;
  }

  if (!user) {
    return <div className="px-4 py-6 text-sm text-[#69807a] md:px-6 xl:px-8">Sign in to track your pickup.</div>;
  }

  if (!activePickup) {
    return (
      <div className="min-h-full bg-[#f3f6f4] px-4 py-4 md:px-6 xl:px-8 xl:py-6">
        <div className="rounded-[24px] border border-dashed border-[#dce7e2] bg-white p-8 text-center shadow-[0_12px_32px_rgba(16,36,34,0.04)]">
          <div className="text-xl font-semibold text-[#102422]">No active pickup</div>
          <div className="mt-2 text-sm text-[#69807a]">When a pickup is scheduled, assigned, or on the way, live tracking will appear here.</div>
        </div>
      </div>
    );
  }

  const mapCenter = activePickup.collectorLocation ?? activePickup.address;

  return (
    <div className="min-h-full bg-[#f3f6f4] px-4 py-4 md:px-6 xl:px-8 xl:py-6">
      <section className="rounded-[28px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Track</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102422] md:text-4xl">Live pickup tracking</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#69807a]">
          Track the e-waste pickup in real time with collector location, your current location, and an estimated arrival window.
        </p>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <OpenStreetMapPanel
          center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
          title="Live tracking map"
          subtitle={activePickup.collectorLocation ? "Collector route updates from Firebase" : "Waiting for collector route updates"}
          heightClassName="h-[360px] md:h-[460px]"
          markers={[
            { lat: activePickup.address.lat, lng: activePickup.address.lng, label: "Pickup address" },
            ...(activePickup.collectorLocation
              ? [{ lat: activePickup.collectorLocation.lat, lng: activePickup.collectorLocation.lng, label: "Collector" }]
              : []),
            ...(effectiveUserLocation ? [{ lat: effectiveUserLocation.lat, lng: effectiveUserLocation.lng, label: "You" }] : []),
          ]}
        />

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Current status</div>
                <div className="mt-2 text-2xl font-bold text-[#102422]">{activePickup.status.replace("_", " ")}</div>
              </div>
              <div className="rounded-full bg-[#edf7f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#00695c]">
                {activePickup.category}
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-[#f7faf9] p-4 text-sm text-[#102422]">
                <div className="flex items-center gap-2 font-semibold">
                  <PackageCheck className="h-4 w-4 text-[#00695c]" />
                  {activePickup.item}
                </div>
                <div className="mt-2 text-[#69807a]">{activePickup.quantity} item(s) - {activePickup.pricing.estimated} estimated credits</div>
                <div className="mt-2 text-[#69807a]">Category: {activePickup.category} | Condition: {activePickup.condition || "Pending review"}</div>
              </div>
              <div className="rounded-2xl bg-[#f7faf9] p-4 text-sm text-[#102422]">
                <div className="flex items-center gap-2 font-semibold">
                  <Clock3 className="h-4 w-4 text-[#00695c]" />
                  Estimated arrival
                </div>
                <div className="mt-2 text-[#69807a]">
                  Collector ETA: {travelDetails?.collectorEta != null ? `${travelDetails.collectorEta} min` : "Waiting for collector location"}
                </div>
                <div className="mt-2 text-[#69807a]">
                  Your distance: {travelDetails?.userToPickupDistance != null ? `${travelDetails.userToPickupDistance.toFixed(1)} km` : "Location not set yet"}
                </div>
                <div className="mt-2 text-[#69807a]">
                  Your ETA: {travelDetails?.userEta != null ? `${travelDetails.userEta} min` : "Location not set yet"}
                </div>
              </div>
              <div className="rounded-2xl bg-[#f7faf9] p-4 text-sm text-[#102422]">
                <div className="flex items-center gap-2 font-semibold">
                  <LocateFixed className="h-4 w-4 text-[#00695c]" />
                  Your starting point
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    value={startLat}
                    onChange={(event) => setStartLat(event.target.value)}
                    placeholder="Latitude"
                    className="h-11 rounded-xl border border-[#dce7e2] bg-white px-3 text-sm text-[#102422] outline-none"
                  />
                  <input
                    value={startLng}
                    onChange={(event) => setStartLng(event.target.value)}
                    placeholder="Longitude"
                    className="h-11 rounded-xl border border-[#dce7e2] bg-white px-3 text-sm text-[#102422] outline-none"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={applyManualStartPoint}
                    className="rounded-xl bg-[#00695c] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Use entered point
                  </button>
                  <div className="self-center text-xs text-[#69807a]">
                    {userLocation
                      ? "Live location tracking is active."
                      : effectiveUserLocation
                        ? "Using your entered starting point."
                        : "Allow location access or enter a starting point manually."}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-[#f7faf9] p-4 text-sm text-[#102422]">
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4 text-[#00695c]" />
                  Pickup address
                </div>
                <div className="mt-2 text-[#69807a]">{activePickup.address.label}, {activePickup.address.area}, {activePickup.address.city}</div>
                <div className="mt-2 text-[#69807a]">{activePickup.schedule.date} | {activePickup.schedule.timeSlot}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Collector</div>
            {activePickup.collector ? (
              <div className="mt-4 rounded-2xl bg-[#f7faf9] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#edf7f4] p-3 text-[#00695c]">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#102422]">{activePickup.collector.name}</div>
                    <div className="mt-1 text-sm text-[#69807a]">{activePickup.collector.phone || "Phone unavailable"}</div>
                  </div>
                </div>
                {activePickup.collectorLocation?.updatedAt ? (
                  <div className="mt-3 text-xs text-[#69807a]">Last location update: {new Date(activePickup.collectorLocation.updatedAt).toLocaleString()}</div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#f7faf9] p-4 text-sm text-[#69807a]">Collector details will appear automatically once the backend assigns a pickup partner.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
