import React, { useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { CalendarPlus2, History, Leaf, LogOut, MapPin, Route, User, House } from "lucide-react";
import { signOutIfNoProfile, useAuthSession, useConnectivityStatus, useUserProfile } from "../lib/appData";

const desktopNavItems = [
  { name: "Home", path: "/app", icon: House },
  { name: "Schedule", path: "/app/schedule", icon: CalendarPlus2 },
  { name: "Track", path: "/app/track", icon: Route },
  { name: "Impact", path: "/app/impact", icon: Leaf },
  { name: "History", path: "/app/history", icon: History },
  { name: "Profile", path: "/app/profile", icon: User },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthSession();
  const { profile } = useUserProfile(user?.uid);
  const isOnline = useConnectivityStatus();

  const isActive = (path: string) => (path === "/app" ? location.pathname === "/app" : location.pathname.startsWith(path));

  const handleSignOut = async () => {
    await signOutIfNoProfile();
    navigate("/");
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#102422]">
      <div className="mx-auto min-h-screen max-w-[1600px]">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 pt-4 pb-2 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00695c] text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-[16px] font-bold tracking-tight text-[#102422]">E-waste Collector</div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/app/profile" className="flex h-10 w-10 items-center justify-center rounded-full text-[#102422] transition-colors hover:bg-[#edf7f4] hover:text-[#00695c]">
              <User className="h-5 w-5" />
            </NavLink>
            <button onClick={handleSignOut} className="flex h-10 w-10 items-center justify-center rounded-full text-[#102422] transition-colors hover:bg-[#fff3f3] hover:text-[#b34040]">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block">
          <div className="px-6 pt-5 xl:px-8">
            <div className="flex items-center justify-between gap-5">
              <NavLink to="/app" className="flex items-center gap-4 rounded-[28px] bg-white px-6 py-4 shadow-[0_18px_40px_rgba(16,36,34,0.08)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00695c] text-white">
                  <MapPin className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#5d746e]">Waste pickup network</div>
                  <div className="text-[20px] font-bold tracking-tight text-[#102422]">E-waste Collector</div>
                </div>
              </NavLink>

              <div className="flex flex-1 items-center justify-between rounded-[999px] bg-white px-6 py-3 shadow-[0_18px_40px_rgba(16,36,34,0.08)]">
                <nav className="flex items-center gap-2">
                  {desktopNavItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={`rounded-full px-5 py-3 text-[15px] transition-colors ${isActive(item.path) ? "bg-[#edf7f4] font-semibold text-[#00695c]" : "font-medium text-[#102422] hover:bg-[#f5f8f7]"}`}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </nav>

                <div className="flex items-center gap-3">
                  <div className="hidden rounded-full bg-[#f5f8f7] px-4 py-2 xl:block">
                    <div className="text-xs uppercase tracking-[0.08em] text-[#6a7f7b]">Signed in as</div>
                    <div className="text-sm font-semibold text-[#28433d]">{profile?.name || user?.displayName || "Guest"}</div>
                  </div>
                  <div className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${isOnline ? "bg-[#ecf9ef] text-[#2e7d32]" : "bg-[#fff3f3] text-[#b34040]"}`}>
                    {isOnline ? "Online" : "Offline"}
                  </div>
                  <button onClick={handleSignOut} className="flex h-11 w-11 items-center justify-center rounded-full text-[#102422] transition-colors hover:bg-[#fff3f3] hover:text-[#b34040]">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-screen pb-28 pt-0 lg:pb-0 lg:pt-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] lg:hidden">
        <div className="mx-auto max-w-[430px] rounded-[28px] bg-[#161616] px-3 pb-3 pt-4 shadow-[0_24px_48px_rgba(0,0,0,0.28)]">
          <div className="grid grid-cols-5 items-end">
            {desktopNavItems.filter(item => item.name !== "Profile").map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const center = index === 2;

              if (center) {
                return (
                  <NavLink key={item.name} to={item.path} className="relative flex flex-col items-center justify-end">
                    <div className="absolute -top-10 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#2b2b2b]">
                      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-[#20d33a]" : "bg-[#dfe5e2]"}`}>
                          <Icon className={`h-4 w-4 ${active ? "text-[#0d3214]" : "text-[#72817c]"}`} />
                        </div>
                      </div>
                    </div>
                    <span className="pt-8 text-[10px] font-medium text-white/80">{item.name}</span>
                  </NavLink>
                );
              }

              return (
                <NavLink key={item.name} to={item.path} className="flex flex-col items-center justify-end gap-1 pb-1">
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-[#20d33a]" : "text-white"}`} />
                  <span className={`text-[10px] ${active ? "font-semibold text-[#20d33a]" : "text-white"}`}>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
