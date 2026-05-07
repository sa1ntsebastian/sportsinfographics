export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;

  if (!key) {
    return Response.json(
      { error: "API_FOOTBALL_KEY ist nicht gesetzt" },
      { status: 500 }
    );
  }

  const res = await fetch("https://v3.football.api-sports.io/status", {
    headers: { "x-apisports-key": key },
    cache: "no-store",
  });

  const data = await res.json();

  return Response.json({
    httpStatus: res.status,
    apiResponse: data,
  });
}
