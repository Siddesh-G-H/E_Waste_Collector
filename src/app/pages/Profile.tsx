import React from "react";
import { useNavigate } from "react-router";
import { MapPin, Phone, UserCircle2, LogOut } from "lucide-react";
import { useAuthSession, useUserPickups, useUserProfile, signOutIfNoProfile } from "../lib/appData";

export default function Profile() {
  const { user } = useAuthSession();
  const { profile, loading } = useUserProfile(user?.uid);
  const { pickups, loading: pickupsLoading } = useUserPickups(user?.uid);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutIfNoProfile();
    navigate("/");
  };

  if (!user) {
    return <div className="px-4 py-6 text-sm text-[#69807a] md:px-6 xl:px-8">Sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-full bg-[#f3f6f4] px-4 py-4 md:px-6 xl:px-8 xl:py-6">
      <section className="rounded-[28px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#edf7f4] text-[#00695c]">
              <UserCircle2 className="h-12 w-12" />
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Profile</div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102422]">{loading ? "Loading..." : profile?.name || "Unnamed user"}</h1>
              <div className="mt-2 text-sm text-[#69807a]">{profile?.language || "EN"}</div>
            </div>
          </div>
          <div className="rounded-[22px] bg-[#f7faf9] px-5 py-4">
            <div className="text-sm text-[#69807a]">Pickup history</div>
            <div className="mt-1 text-lg font-semibold text-[#102422]">{pickupsLoading ? "..." : `${pickups.length} pickups`}</div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">User info</div>
          <div className="mt-5 space-y-4">
            <div className="rounded-[20px] bg-[#f7faf9] p-4">
              <div className="flex items-center gap-3 text-[#102422]">
                <Phone className="h-5 w-5 text-[#00695c]" />
                <div>
                  <div className="text-sm text-[#69807a]">Phone number</div>
                  <div className="mt-1 font-semibold">{profile?.phone || "No phone number found"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Saved addresses</div>
          <div className="mt-5 space-y-3">
            {profile?.savedAddresses?.length ? (
              profile.savedAddresses.map((address, index) => (
                <div key={`${address.label}-${index}`} className="rounded-[20px] bg-[#f7faf9] p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#00695c]" />
                    <div>
                      <div className="font-semibold text-[#102422]">{address.label}</div>
                      <div className="mt-1 text-sm text-[#69807a]">{address.area}, {address.city}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] bg-[#f7faf9] p-4 text-sm text-[#69807a]">No saved addresses found.</div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_32px_rgba(16,36,34,0.06)] md:p-6">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">Pickup history</div>
        <div className="mt-4 space-y-3">
          {pickups.length ? (
            pickups.map((pickup) => (
              <div key={pickup.id} className="rounded-[20px] bg-[#f7faf9] p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[#102422]">{pickup.item}</div>
                      <div className="mt-1 text-sm text-[#69807a]">{pickup.address.area}, {pickup.address.city}</div>
                      <div className="mt-1 text-xs text-[#69807a]">Category: {pickup.category} | Condition: {pickup.condition || "Pending review"} | User ID: {pickup.userId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#00695c]">{pickup.pricing.final ?? pickup.pricing.estimated} credits</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.08em] text-[#69807a]">{pickup.status.replace("_", " ")}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[#69807a]">Schedule: {pickup.schedule.date} | {pickup.schedule.timeSlot}</div>
                  <div className="mt-2 text-xs text-[#69807a]">Images: {pickup.images.length ? pickup.images.length : 0}</div>
                </div>
              ))
          ) : (
            <div className="rounded-[20px] bg-[#f7faf9] p-4 text-sm text-[#69807a]">No pickup history yet.</div>
          )}
        </div>
      </section>

      {/* Logout Button for Mobile/Desktop Profile Page */}
      <section className="mt-5 lg:hidden">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#fff3f3] p-4 font-semibold text-[#b34040] transition-colors hover:bg-[#ffe5e5]"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </section>
    </div>
  );
}
