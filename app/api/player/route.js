const BUNDESLIGA_ID = 78;
const DEFAULT_SEASON = 2024;

export async function GET(request) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return Response.json(
      { error: "API_FOOTBALL_KEY ist nicht gesetzt" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const season = searchParams.get("season") || DEFAULT_SEASON;
  const league = searchParams.get("league") || BUNDESLIGA_ID;

  if (!name || name.length < 3) {
    return Response.json(
      { error: "Bitte ?name=... mit mindestens 3 Zeichen anhängen" },
      { status: 400 }
    );
  }

  const url = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(
    name
  )}&league=${league}&season=${season}`;

  const res = await fetch(url, {
    headers: { "x-apisports-key": key },
    cache: "no-store",
  });

  const data = await res.json();

  return Response.json({
    httpStatus: res.status,
    requestedUrl: url,
    apiResponse: data,
  });
}
