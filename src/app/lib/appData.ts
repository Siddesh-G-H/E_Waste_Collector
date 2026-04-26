import { useEffect, useMemo, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";

const LOCAL_AUTH_KEY = "wastelink_local_auth";
const LOCAL_PROFILE_KEY = "wastelink_local_profiles";
const LOCAL_PICKUPS_KEY = "wastelink_local_pickups";
const DEMO_PHONE = "+919876543210";
const DEMO_UID = "local-919876543210";

export type LocalSessionUser = {
  uid: string;
  displayName: string;
  phone: string;
};

export type PickupStatus = "scheduled" | "assigned" | "en_route" | "completed";

export type Pickup = {
  id: string;
  userId: string;
  jobData: {
    item: string;
    category: string;
    condition: string;
    quantity: number;
  };
  item: string;
  category: string;
  condition: string;
  quantity: number;
  images: string[];
  pricing: {
    estimated: number;
    final: number | null;
  };
  estimatedCredits: number;
  finalCredits: number | null;
  address: {
    label: string;
    area: string;
    city: string;
    lat: number;
    lng: number;
  };
  schedule: {
    date: string;
    timeSlot: string;
  };
  status: PickupStatus;
  collector: {
    id: string;
    name: string;
    phone: string;
  } | null;
  collectorLocation: {
    lat: number;
    lng: number;
    updatedAt?: string | null;
  } | null;
  createdAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
};

export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  language: string;
  savedAddresses: Array<{
    label: string;
    area: string;
    city: string;
    lat: number;
    lng: number;
  }>;
};

type ScheduleInput = {
  item: string;
  category: string;
  condition: string;
  quantity: number;
  estimatedCredits: number;
  address: {
    label: string;
    area: string;
    city: string;
    lat: number;
    lng: number;
  };
  schedule: {
    date: string;
    timeSlot: string;
  };
  files: File[];
};

type ManualAuthInput = {
  name: string;
  phone: string;
  language: string;
};

function createMockPickup(overrides: Partial<Pickup>): Pickup {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `mock-${Math.random().toString(36).slice(2, 10)}`,
    userId: overrides.userId ?? "",
    jobData: {
      item: overrides.jobData?.item ?? overrides.item ?? "E-waste item",
      category: overrides.jobData?.category ?? overrides.category ?? "Electronics",
      condition: overrides.jobData?.condition ?? overrides.condition ?? "Working",
      quantity: overrides.jobData?.quantity ?? overrides.quantity ?? 1,
    },
    item: overrides.item ?? overrides.jobData?.item ?? "E-waste item",
    category: overrides.category ?? overrides.jobData?.category ?? "Electronics",
    condition: overrides.condition ?? overrides.jobData?.condition ?? "Working",
    quantity: overrides.quantity ?? overrides.jobData?.quantity ?? 1,
    images: overrides.images ?? [],
    pricing: {
      estimated: overrides.pricing?.estimated ?? overrides.estimatedCredits ?? 0,
      final: overrides.pricing?.final ?? overrides.finalCredits ?? null,
    },
    estimatedCredits: overrides.estimatedCredits ?? overrides.pricing?.estimated ?? 0,
    finalCredits: overrides.finalCredits ?? overrides.pricing?.final ?? null,
    address: overrides.address ?? {
      label: "Pickup address",
      area: "Kothnur",
      city: "Bengaluru",
      lat: 12.9716,
      lng: 77.5946,
    },
    schedule: overrides.schedule ?? {
      date: "",
      timeSlot: "",
    },
    status: overrides.status ?? "scheduled",
    collector: overrides.collector ?? null,
    collectorLocation: overrides.collectorLocation ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    completedAt: overrides.completedAt ?? null,
  };
}

function readStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalSessionUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: LocalSessionUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(LOCAL_AUTH_KEY);
    return;
  }
  window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
}

function readStoredProfiles() {
  if (typeof window === "undefined") return {} as Record<string, UserProfile>;
  const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY);
  if (!raw) {
    const defaults = createDefaultLocalProfiles();
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, UserProfile>;
    return Object.keys(parsed).length ? parsed : createDefaultLocalProfiles();
  } catch {
    const defaults = createDefaultLocalProfiles();
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaults));
    return defaults;
  }
}

function writeStoredProfiles(profiles: Record<string, UserProfile>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profiles));
}

function createDefaultLocalProfiles(): Record<string, UserProfile> {
  return {
    [DEMO_UID]: {
      id: DEMO_UID,
      name: "Demo User",
      phone: DEMO_PHONE,
      language: "EN",
      savedAddresses: [
        {
          label: "Home",
          area: "Kothnur",
          city: "Bengaluru",
          lat: 13.0624,
          lng: 77.6421,
        },
        {
          label: "Office",
          area: "JP Nagar",
          city: "Bengaluru",
          lat: 12.9063,
          lng: 77.5857,
        },
      ],
    },
  };
}

function mergeProfiles(
  base: Record<string, UserProfile>,
  incoming: Record<string, UserProfile>,
) {
  return {
    ...base,
    ...incoming,
  };
}

function mergePickups(base: Pickup[], incoming: Pickup[]) {
  const byId = new Map<string, Pickup>();
  [...base, ...incoming].forEach((pickup) => {
    byId.set(pickup.id, pickup);
  });
  return Array.from(byId.values());
}

function createDefaultLocalPickups() {
  return [
    createMockPickup({
      id: "local-job-1",
      userId: DEMO_UID,
      item: "Dell Inspiron 15",
      category: "Laptop",
      condition: "Working",
      pricing: { estimated: 560, final: null },
      estimatedCredits: 560,
      images: ["https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80"],
      address: {
        label: "16th Cross, Kothnur",
        area: "Kothnur",
        city: "Bengaluru",
        lat: 13.0624,
        lng: 77.6421,
      },
      schedule: { date: "2026-04-27", timeSlot: "10:00 AM - 12:00 PM" },
      status: "assigned",
      collector: {
        id: "collector-01",
        name: "Ravi Kumar",
        phone: "+919900112233",
      },
      collectorLocation: {
        lat: 13.0474,
        lng: 77.6291,
        updatedAt: new Date("2026-04-26T10:20:00.000Z").toISOString(),
      },
    }),
    createMockPickup({
      id: "local-job-2",
      userId: DEMO_UID,
      item: "LG 6.5kg Washing Machine",
      category: "Appliance",
      condition: "Needs inspection",
      pricing: { estimated: 1200, final: null },
      estimatedCredits: 1200,
      quantity: 1,
      address: {
        label: "8th Main, JP Nagar",
        area: "JP Nagar",
        city: "Bengaluru",
        lat: 12.9063,
        lng: 77.5857,
      },
      schedule: { date: "2026-04-27", timeSlot: "1:00 PM - 3:00 PM" },
      status: "en_route",
      collector: {
        id: "collector-02",
        name: "Asha N",
        phone: "+919845001122",
      },
      collectorLocation: {
        lat: 12.9148,
        lng: 77.5933,
        updatedAt: new Date("2026-04-26T10:32:00.000Z").toISOString(),
      },
    }),
    createMockPickup({
      id: "local-job-3",
      userId: DEMO_UID,
      item: "Mixed Smartphones x3",
      category: "Mobile",
      condition: "Screen damage",
      pricing: { estimated: 450, final: 420 },
      estimatedCredits: 450,
      finalCredits: 420,
      quantity: 3,
      images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"],
      address: {
        label: "32, 5th Block, Jayanagar",
        area: "Jayanagar",
        city: "Bengaluru",
        lat: 12.9279,
        lng: 77.5937,
      },
      schedule: { date: "2026-04-23", timeSlot: "11:00 AM - 1:00 PM" },
      status: "completed",
      collector: {
        id: "collector-03",
        name: "Imran P",
        phone: "+919880007788",
      },
      completedAt: new Date("2026-04-23T12:10:00.000Z").toISOString(),
    }),
    createMockPickup({
      id: "local-job-4",
      userId: DEMO_UID,
      item: "HP DeskJet Printer",
      category: "Printer",
      condition: "Not working",
      pricing: { estimated: 350, final: 300 },
      estimatedCredits: 350,
      finalCredits: 300,
      quantity: 1,
      address: {
        label: "14th Main Road, HSR Layout",
        area: "HSR Layout",
        city: "Bengaluru",
        lat: 12.9116,
        lng: 77.6474,
      },
      schedule: { date: "2026-04-20", timeSlot: "2:00 PM - 4:00 PM" },
      status: "completed",
      collector: {
        id: "collector-04",
        name: "Megha S",
        phone: "+919741234567",
      },
      completedAt: new Date("2026-04-20T15:22:00.000Z").toISOString(),
    }),
    createMockPickup({
      id: "local-job-5",
      userId: "",
      item: "iPhone 12",
      category: "Mobile",
      condition: "Battery issue",
      pricing: { estimated: 700, final: null },
      estimatedCredits: 700,
      quantity: 1,
      address: {
        label: "3rd Cross, Indiranagar",
        area: "Indiranagar",
        city: "Bengaluru",
        lat: 12.9784,
        lng: 77.6408,
      },
      schedule: { date: "2026-04-27", timeSlot: "4:00 PM - 6:00 PM" },
      status: "scheduled",
    }),
    createMockPickup({
      id: "local-job-6",
      userId: "",
      item: "Acer Monitor 24 inch",
      category: "Monitor",
      condition: "Working",
      pricing: { estimated: 380, final: null },
      estimatedCredits: 380,
      quantity: 1,
      address: {
        label: "Vijayanagar Metro side lane",
        area: "Vijayanagar",
        city: "Bengaluru",
        lat: 12.9719,
        lng: 77.537,
      },
      schedule: { date: "2026-04-28", timeSlot: "9:00 AM - 11:00 AM" },
      status: "scheduled",
    }),
  ];
}

function ensureUserLocalSeedData(uid: string) {
  const profiles = readStoredProfiles();
  if (!profiles[uid]) {
    profiles[uid] = {
      id: uid,
      name: uid === DEMO_UID ? "Demo User" : "Local User",
      phone: uid === DEMO_UID ? DEMO_PHONE : uid.replace("local-", "+"),
      language: "EN",
      savedAddresses: [
        {
          label: "Primary address",
          area: "Kothnur",
          city: "Bengaluru",
          lat: 13.0624,
          lng: 77.6421,
        },
      ],
    };
    writeStoredProfiles(profiles);
  }

  const pickups = readStoredPickups();
  if (!pickups.some((pickup) => pickup.userId === uid)) {
    const seededPickups = [
      createMockPickup({
        id: `seed-${uid}-1`,
        userId: uid,
        item: "Lenovo ThinkPad",
        category: "Laptop",
        condition: "Working",
        pricing: { estimated: 640, final: null },
        estimatedCredits: 640,
        address: {
          label: "Primary address",
          area: "Kothnur",
          city: "Bengaluru",
          lat: 13.0624,
          lng: 77.6421,
        },
        schedule: { date: "2026-04-29", timeSlot: "10:00 AM - 12:00 PM" },
        status: "assigned",
        collector: {
          id: "collector-seed-01",
          name: "Ravi Kumar",
          phone: "+919900112233",
        },
      }),
      createMockPickup({
        id: `seed-${uid}-2`,
        userId: uid,
        item: "Router and cables",
        category: "Accessories",
        condition: "Damaged",
        pricing: { estimated: 180, final: 150 },
        estimatedCredits: 180,
        finalCredits: 150,
        quantity: 4,
        address: {
          label: "Primary address",
          area: "Kothnur",
          city: "Bengaluru",
          lat: 13.0624,
          lng: 77.6421,
        },
        schedule: { date: "2026-04-21", timeSlot: "3:00 PM - 5:00 PM" },
        status: "completed",
      }),
    ];
    writeStoredPickups([...seededPickups, ...pickups]);
  }
}

function ensureDefaultLocalData() {
  const mergedProfiles = mergeProfiles(createDefaultLocalProfiles(), readStoredProfiles());
  writeStoredProfiles(mergedProfiles);

  const mergedPickups = mergePickups(createDefaultLocalPickups(), readStoredPickups());
  writeStoredPickups(mergedPickups);
}

function readStoredPickups() {
  if (typeof window === "undefined") return [] as Pickup[];
  const raw = window.localStorage.getItem(LOCAL_PICKUPS_KEY);
  if (!raw) {
    const defaults = createDefaultLocalPickups();
    window.localStorage.setItem(LOCAL_PICKUPS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    const parsed = JSON.parse(raw) as Pickup[];
    return parsed.length ? parsed : createDefaultLocalPickups();
  } catch {
    const defaults = createDefaultLocalPickups();
    window.localStorage.setItem(LOCAL_PICKUPS_KEY, JSON.stringify(defaults));
    return defaults;
  }
}

function writeStoredPickups(pickups: Pickup[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_PICKUPS_KEY, JSON.stringify(pickups));
}

function buildLocalUid(phone: string) {
  return `local-${phone.replace(/\D/g, "")}`;
}

function timestampToIso(value: unknown) {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return null;
}

function normalizePickup(id: string, data: any): Pickup {
  const item = data.jobData?.item ?? data.item ?? "";
  const category = data.jobData?.category ?? data.category ?? "";
  const condition = data.jobData?.condition ?? data.condition ?? "";
  const quantity = Number(data.jobData?.quantity ?? data.quantity ?? 1);
  const estimatedCredits = Number(data.pricing?.estimated ?? data.estimatedCredits ?? 0);
  const finalCreditsRaw = data.pricing?.final ?? data.finalCredits;

  return {
    id,
    userId: data.userId ?? "",
    jobData: {
      item,
      category,
      condition,
      quantity,
    },
    item,
    category,
    condition,
    quantity,
    images: Array.isArray(data.images) ? data.images : [],
    pricing: {
      estimated: estimatedCredits,
      final: finalCreditsRaw == null ? null : Number(finalCreditsRaw),
    },
    estimatedCredits,
    finalCredits: finalCreditsRaw == null ? null : Number(finalCreditsRaw),
    address: {
      label: data.address?.label ?? "",
      area: data.address?.area ?? "",
      city: data.address?.city ?? "",
      lat: Number(data.address?.lat ?? 0),
      lng: Number(data.address?.lng ?? 0),
    },
    schedule: {
      date: data.schedule?.date ?? "",
      timeSlot: data.schedule?.timeSlot ?? "",
    },
    status: (data.status ?? "scheduled") as PickupStatus,
    collector: data.collector
      ? {
          id: data.collector.id ?? "",
          name: data.collector.name ?? "",
          phone: data.collector.phone ?? "",
        }
      : null,
    collectorLocation: data.collectorLocation
      ? {
          lat: Number(data.collectorLocation.lat ?? 0),
          lng: Number(data.collectorLocation.lng ?? 0),
          updatedAt: timestampToIso(data.collectorLocation.updatedAt),
        }
      : null,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    completedAt: timestampToIso(data.completedAt),
  };
}

function normalizeProfile(id: string, data: any): UserProfile {
  return {
    id,
    name: data.name ?? "",
    phone: data.phone ?? "",
    language: data.language ?? "EN",
    savedAddresses: Array.isArray(data.savedAddresses) ? data.savedAddresses : [],
  };
}

export function useAuthSession() {
  const [user, setUser] = useState<LocalSessionUser | null>(readStoredUser());

  useEffect(() => {
    ensureDefaultLocalData();
    if (user?.uid) {
      ensureUserLocalSeedData(user.uid);
    }
    const sync = () => setUser(readStoredUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [user?.uid]);

  return { user, loading: false, isReady: true };
}

export function useUserProfile(userId?: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (!userId) return null;
    return readStoredProfiles()[userId] ?? null;
  });
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const localProfile = readStoredProfiles()[userId] ?? null;
    setProfile(localProfile);

    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    return onSnapshot(
      doc(db, "users", userId),
      (snapshot) => {
        const nextProfile = snapshot.exists() ? normalizeProfile(snapshot.id, snapshot.data()) : localProfile;
        setProfile(nextProfile);
        if (nextProfile) {
          const profiles = readStoredProfiles();
          profiles[userId] = nextProfile;
          writeStoredProfiles(profiles);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  }, [userId]);

  return { profile, loading };
}

export function useUserPickups(userId?: string | null) {
  const [pickups, setPickups] = useState<Pickup[]>(() => {
    const localPickups = readStoredPickups();
    return userId ? localPickups.filter((pickup) => pickup.userId === userId) : [];
  });
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setPickups([]);
      setLoading(false);
      return;
    }

    const localRows = readStoredPickups().filter((pickup) => pickup.userId === userId);
    setPickups(localRows);

    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const pickupsQuery = query(collection(db, "pickups"), orderBy("createdAt", "desc"));
    return onSnapshot(
      pickupsQuery,
      (snapshot) => {
        const rows = snapshot.docs
          .map((entry) => normalizePickup(entry.id, entry.data()))
          .filter((pickup) => pickup.userId === userId);
        setPickups(rows);
        setLoading(false);
      },
      () => {
        setPickups(localRows);
        setLoading(false);
      },
    );
  }, [userId]);

  return { pickups, loading };
}

export function useActivePickup(userId?: string | null) {
  const { pickups, loading } = useUserPickups(userId);
  const activePickup = useMemo(() => pickups.find((pickup) => pickup.status !== "completed") ?? null, [pickups]);
  return { activePickup, pickups, loading };
}

export async function fetchAvailablePickups() {
  const localPickups = readStoredPickups().filter((pickup) => pickup.status === "scheduled");
  if (!db) return localPickups;

  try {
    const pickupsQuery = query(collection(db, "pickups"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(pickupsQuery);

    return snapshot.docs
      .map((entry) => normalizePickup(entry.id, entry.data()))
      .filter((pickup) => pickup.status === "scheduled");
  } catch {
    return localPickups;
  }
}

export async function signUpUserProfile(input: ManualAuthInput) {
  const uid = buildLocalUid(input.phone);
  const sessionUser: LocalSessionUser = {
    uid,
    displayName: input.name,
    phone: input.phone,
  };

  const profile: UserProfile = {
    id: uid,
    name: input.name,
    phone: input.phone,
    language: input.language,
    savedAddresses: [],
  };

  const profiles = readStoredProfiles();
  profiles[uid] = {
    ...profile,
    savedAddresses: profile.savedAddresses.length
      ? profile.savedAddresses
      : [
          {
            label: "Primary address",
            area: "Kothnur",
            city: "Bengaluru",
            lat: 13.0624,
            lng: 77.6421,
          },
        ],
  };
  writeStoredProfiles(profiles);
  ensureUserLocalSeedData(uid);

  if (db) {
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          name: input.name,
          phone: input.phone,
          language: input.language,
          savedAddresses: [],
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch {
      // Local manual auth should continue even if Firestore rules reject profile writes.
    }
  }

  writeStoredUser(sessionUser);
  return sessionUser;
}

export async function signInUserProfile(input: Pick<ManualAuthInput, "phone">) {
  const uid = buildLocalUid(input.phone);
  ensureUserLocalSeedData(uid);
  const profile = readStoredProfiles()[uid];

  if (!profile) {
    throw new Error("This phone number is not registered yet. Please sign up first.");
  }

  const sessionUser: LocalSessionUser = {
    uid,
    displayName: profile.name || "User",
    phone: profile.phone || input.phone,
  };

  writeStoredUser(sessionUser);
  return sessionUser;
}

export async function signOutIfNoProfile() {
  writeStoredUser(null);
}

async function uploadPickupImages(userId: string, files: File[]) {
  if (!storage || files.length === 0) return [];

  const uploads = files.map(async (file, index) => {
    const path = `pickups/${userId}/${Date.now()}-${index}-${file.name}`;
    const storageRef = ref(storageRefFactory(path));
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  });

  return Promise.all(uploads);
}

function storageRefFactory(path: string) {
  if (!storage) {
    throw new Error("Firebase storage is not configured.");
  }
  return ref(storage, path);
}

export async function createPickup(userId: string, input: ScheduleInput) {
  let imageUrls: string[] = [];
  try {
    imageUrls = storage ? await uploadPickupImages(userId, input.files) : [];
  } catch {
    imageUrls = [];
  }

  const payload = {
    userId,
    jobData: {
      item: input.item,
      category: input.category,
      condition: input.condition,
      quantity: input.quantity,
    },
    item: input.item,
    category: input.category,
    condition: input.condition,
    quantity: input.quantity,
    images: imageUrls,
    pricing: {
      estimated: input.estimatedCredits,
      final: null,
    },
    estimatedCredits: input.estimatedCredits,
    finalCredits: null,
    address: input.address,
    schedule: input.schedule,
    status: "scheduled",
    collector: null,
    collectorLocation: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  };

  const localPickup = createMockPickup({
    userId,
    jobData: payload.jobData,
    item: payload.item,
    category: payload.category,
    condition: payload.condition,
    quantity: payload.quantity,
    images: imageUrls,
    pricing: payload.pricing,
    estimatedCredits: payload.estimatedCredits,
    finalCredits: payload.finalCredits,
    address: payload.address,
    schedule: payload.schedule,
    status: payload.status,
    collector: payload.collector,
    collectorLocation: payload.collectorLocation,
  });

  if (!db) {
    const localPickups = [localPickup, ...readStoredPickups()];
    writeStoredPickups(localPickups);
    return;
  }

  try {
    await addDoc(collection(db, "pickups"), payload);
  } catch {
    const localPickups = [localPickup, ...readStoredPickups()];
    writeStoredPickups(localPickups);
  }
}

export function calculateImpact(pickups: Pickup[]) {
  const completed = pickups.filter((pickup) => pickup.status === "completed");
  const totalItems = completed.reduce((sum, pickup) => sum + pickup.quantity, 0);
  const totalCredits = completed.reduce((sum, pickup) => sum + (pickup.finalCredits ?? pickup.estimatedCredits), 0);
  const co2Saved = Number((totalCredits * 0.35 + totalItems * 0.8).toFixed(1));

  return {
    completed,
    totalItems,
    totalCredits,
    co2Saved,
  };
}

export function useConnectivityStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}

export function useLiveUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocation(null);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
}

export function calculateDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function estimateTravelMinutes(distanceKm: number, speedKmPerHour = 22) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Math.max(1, Math.round((distanceKm / speedKmPerHour) * 60));
}
