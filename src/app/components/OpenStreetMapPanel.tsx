import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, Navigation, RefreshCw } from "lucide-react";

type LatLng = {
  lat: number;
  lng: number;
};

type Marker = LatLng & {
  label: string;
};

type Landmark = {
  id: string;
  name: string;
  type: string;
  distance: number;
};

type OpenStreetMapPanelProps = {
  center: LatLng;
  title: string;
  subtitle?: string;
  markers?: Marker[];
  heightClassName?: string;
  compact?: boolean;
};

function createEmbedUrl({ lat, lng }: LatLng) {
  const deltaLat = 0.018;
  const deltaLng = 0.024;
  const left = lng - deltaLng;
  const right = lng + deltaLng;
  const top = lat + deltaLat;
  const bottom = lat - deltaLat;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function createOpenStreetMapUrl({ lat, lng }: LatLng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
}

function useNearbyLandmarks(center: LatLng) {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      const query = `
        [out:json][timeout:12];
        (
          node(around:900,${center.lat},${center.lng})["amenity"]["name"];
          node(around:900,${center.lat},${center.lng})["shop"]["name"];
          way(around:900,${center.lat},${center.lng})["highway"]["name"];
          way(around:900,${center.lat},${center.lng})["building"]["name"];
        );
        out center 8;
      `;

      try {
        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Overpass request failed with ${response.status}`);
        }

        const payload = await response.json();
        const items = (payload.elements ?? [])
          .map((element: any) => {
            const lat = element.lat ?? element.center?.lat;
            const lng = element.lon ?? element.center?.lon;
            const name = element.tags?.name;

            if (!lat || !lng || !name) return null;

            const type =
              element.tags?.amenity ??
              element.tags?.shop ??
              element.tags?.highway ??
              element.tags?.building ??
              "place";

            const distance = Math.round(
              Math.sqrt(
                Math.pow((lat - center.lat) * 111000, 2) +
                  Math.pow((lng - center.lng) * 111000, 2),
              ),
            );

            return {
              id: `${element.type}-${element.id}`,
              name,
              type,
              distance,
            };
          })
          .filter(Boolean)
          .sort((a: Landmark, b: Landmark) => a.distance - b.distance)
          .slice(0, 4);

        setLandmarks(items);
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load nearby places");
          setLandmarks([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [center.lat, center.lng]);

  return { landmarks, loading, error };
}

export function OpenStreetMapPanel({
  center,
  title,
  subtitle,
  markers = [],
  heightClassName = "h-[280px]",
  compact = false,
}: OpenStreetMapPanelProps) {
  const { landmarks, loading, error } = useNearbyLandmarks(center);
  const embedUrl = useMemo(() => createEmbedUrl(center), [center]);
  const mapUrl = useMemo(() => createOpenStreetMapUrl(center), [center]);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#dce7e2] bg-white shadow-[0_12px_32px_rgba(16,36,34,0.08)]">
      <div className={`relative w-full overflow-hidden ${heightClassName}`}>
        <iframe
          title={title}
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(16,36,34,0.16),transparent)]" />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-4 rounded-2xl bg-white/92 p-4 backdrop-blur">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">OpenStreetMap</div>
            <div className="mt-1 text-base font-semibold text-[#102422]">{title}</div>
            {subtitle ? <div className="mt-1 text-sm text-[#69807a]">{subtitle}</div> : null}
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf7f4] text-[#00695c]"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {markers.length > 0 ? (
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/92 p-3 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {markers.slice(0, compact ? 2 : 3).map((marker) => (
                <div
                  key={`${marker.label}-${marker.lat}-${marker.lng}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f5f8f7] px-3 py-1.5 text-xs font-semibold text-[#20403a]"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#00695c]" />
                  {marker.label}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-[#eef3f1] p-4">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6a7f7b]">
          <Navigation className="h-3.5 w-3.5 text-[#00695c]" />
          Nearby places from Overpass API
        </div>

        {loading ? (
          <div className="inline-flex items-center gap-2 text-sm text-[#69807a]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading nearby places...
          </div>
        ) : error ? (
          <div className="text-sm text-[#9b6b1d]">{error}</div>
        ) : landmarks.length > 0 ? (
          <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
            {landmarks.map((landmark) => (
              <div key={landmark.id} className="rounded-2xl bg-[#f7faf9] p-3">
                <div className="text-sm font-semibold text-[#102422]">{landmark.name}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.08em] text-[#69807a]">
                  {landmark.type} - {landmark.distance} m
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#f7faf9] p-3 text-sm text-[#69807a]">
            No nearby landmarks returned for this location yet.
          </div>
        )}
      </div>
    </div>
  );
}
