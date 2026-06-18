import { NextResponse } from "next/server";

type DistanceRequest = {
  origin?: string;
  destination?: string;
  returnJourney?: boolean;
};

type GoogleRoute = {
  distanceMeters?: number;
  duration?: string;
};

const METERS_PER_MILE = 1609.344;

function mapsUrl(origin: string, destination: string) {
  const from = encodeURIComponent(origin);
  const to = encodeURIComponent(destination);
  return `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}`;
}

function jsonError(message: string, status: number, origin = "", destination = "") {
  return NextResponse.json(
    {
      error: message,
      googleMapsUrl: origin && destination ? mapsUrl(origin, destination) : "https://www.google.com/maps",
    },
    { status },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DistanceRequest;
  const origin = body.origin?.trim() || "";
  const destination = body.destination?.trim() || "";
  const returnJourney = Boolean(body.returnJourney);

  if (!origin || !destination) {
    return jsonError("Add both a start and destination first.", 400, origin, destination);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Automatic distance lookup is not connected yet. Open the route and enter the miles manually for now.",
      503,
      origin,
      destination,
    );
  }

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
      units: "IMPERIAL",
    }),
  });

  if (!response.ok) {
    return jsonError(
      "Google Maps could not calculate that route. Check the addresses or open the route manually.",
      response.status,
      origin,
      destination,
    );
  }

  const data = (await response.json()) as { routes?: GoogleRoute[] };
  const distanceMeters = data.routes?.[0]?.distanceMeters;

  if (!distanceMeters) {
    return jsonError("No route distance came back from Google Maps.", 404, origin, destination);
  }

  const multiplier = returnJourney ? 2 : 1;
  const totalMeters = distanceMeters * multiplier;
  const miles = totalMeters / METERS_PER_MILE;

  return NextResponse.json({
    distanceMeters: totalMeters,
    oneWayDistanceMeters: distanceMeters,
    miles: Number(miles.toFixed(1)),
    oneWayMiles: Number((distanceMeters / METERS_PER_MILE).toFixed(1)),
    returnJourney,
    duration: data.routes?.[0]?.duration || "",
    googleMapsUrl: mapsUrl(origin, destination),
    source: "Google Maps Routes API",
  });
}
