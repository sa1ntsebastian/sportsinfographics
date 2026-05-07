"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState(2024);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/player?name=${encodeURIComponent(query)}&season=${season}`
        );
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setResults([]);
        } else if (data.apiResponse?.errors?.plan) {
          setError(`API: ${data.apiResponse.errors.plan}`);
          setResults([]);
        } else {
          setResults(data.apiResponse?.response || []);
        }
        setHasSearched(true);
      } catch (e) {
        setError("Fehler beim Abrufen");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, season]);

  return (
    <main>
      <h1>Sports Infographics</h1>
      <p className="subtitle">Bundesliga-Spieler suchen, Stats ansehen.</p>

      <div className="controls">
        <input
          type="text"
          placeholder="Spielername (mind. 3 Buchstaben)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <select
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
        >
          <option value={2024}>Saison 2024/25</option>
          <option value={2023}>Saison 2023/24</option>
          <option value={2022}>Saison 2022/23</option>
        </select>
      </div>

      {loading && <p className="status">Lade…</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && hasSearched && results.length === 0 && !error && (
        <p className="status">Keine Treffer.</p>
      )}

      <div className="results">
        {results.map((entry) => (
          <PlayerCard
            key={entry.player.id}
            player={entry.player}
            stats={entry.statistics?.[0]}
          />
        ))}
      </div>
    </main>
  );
}

function PlayerCard({ player, stats }) {
  if (!stats) return null;

  const minutes = stats.games?.minutes || 0;
  const per90 = (val) =>
    minutes > 0 && val != null ? ((val / minutes) * 90).toFixed(2) : "–";

  const duelsTotal = stats.duels?.total || 0;
  const duelsWon = stats.duels?.won || 0;
  const duelsPct = duelsTotal > 0 ? Math.round((duelsWon / duelsTotal) * 100) : null;

  const dribblesAttempts = stats.dribbles?.attempts || 0;
  const dribblesSuccess = stats.dribbles?.success || 0;

  return (
    <div className="card">
      <div className="card-header">
        {player.photo && <img src={player.photo} alt={player.name} />}
        <div>
          <h2>
            {player.firstname} {player.lastname}
          </h2>
          <p>
            {stats.team?.name} · {stats.league?.name} {stats.league?.season}/
            {String(stats.league?.season + 1).slice(-2)}
          </p>
          <p>
            {stats.games?.position || "–"} · {player.age} Jahre ·{" "}
            {player.nationality}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <StatGroup title="Einsatz">
          <Stat label="Spiele" value={stats.games?.appearences} />
          <Stat label="Startelf" value={stats.games?.lineups} />
          <Stat label="Minuten" value={minutes} />
          <Stat
            label="Note"
            value={
              stats.games?.rating
                ? Number(stats.games.rating).toFixed(2)
                : "–"
            }
          />
        </StatGroup>

        <StatGroup title="Offensiv">
          <Stat
            label="Tore"
            value={stats.goals?.total ?? 0}
            sub={`${per90(stats.goals?.total)}/90`}
          />
          <Stat
            label="Assists"
            value={stats.goals?.assists ?? 0}
            sub={`${per90(stats.goals?.assists)}/90`}
          />
          <Stat
            label="Schüsse"
            value={stats.shots?.total ?? 0}
            sub={`${stats.shots?.on ?? 0} aufs Tor`}
          />
          <Stat
            label="Schlüsselpässe"
            value={stats.passes?.key ?? 0}
            sub={`${per90(stats.passes?.key)}/90`}
          />
        </StatGroup>

        <StatGroup title="Pässe">
          <Stat label="Pässe gesamt" value={stats.passes?.total ?? 0} />
          <Stat
            label="Genauigkeit"
            value={
              stats.passes?.accuracy != null
                ? `${stats.passes.accuracy}%`
                : "–"
            }
          />
          <Stat label="Pässe/90" value={per90(stats.passes?.total)} />
        </StatGroup>

        <StatGroup title="Defensiv & Duelle">
          <Stat label="Tackles" value={stats.tackles?.total ?? 0} />
          <Stat
            label="Interceptions"
            value={stats.tackles?.interceptions ?? 0}
          />
          <Stat
            label="Duelle gewonnen"
            value={`${duelsWon}/${duelsTotal}`}
            sub={duelsPct != null ? `${duelsPct}%` : null}
          />
          <Stat
            label="Dribblings"
            value={`${dribblesSuccess}/${dribblesAttempts}`}
          />
          <Stat
            label="Karten"
            value={`${stats.cards?.yellow ?? 0}🟨 ${stats.cards?.red ?? 0}🟥`}
          />
        </StatGroup>
      </div>
    </div>
  );
}

function StatGroup({ title, children }) {
  return (
    <div className="stat-group">
      <h3>{title}</h3>
      <div className="stat-list">{children}</div>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <div className="stat-values">
        <span className="stat-value">{value ?? "–"}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}
