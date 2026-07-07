// Netlify Function: proxies movie search + detail lookups to TMDB.
// Keeps TMDB_API_KEY server-side only (read from Netlify env vars).

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE_SMALL = 'https://image.tmdb.org/t/p/w342';
const POSTER_BASE_FULL = 'https://image.tmdb.org/t/p/w780';

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  };
}

async function tmdbFetch(path, apiKey) {
  const url = `${TMDB_BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    const status = res.status === 429 ? 429 : res.status >= 500 ? 502 : res.status;
    const message =
      res.status === 429
        ? 'TMDB rate limit exceeded. Please wait a moment and try again.'
        : res.status === 401
        ? 'TMDB rejected the API key. Check TMDB_API_KEY in Netlify env vars.'
        : `TMDB API error (status ${res.status}).`;
    const err = new Error(message);
    err.statusCode = status;
    throw err;
  }
  return res.json();
}

async function searchMovies(query, apiKey) {
  const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}`, apiKey);
  const results = (data.results || []).slice(0, 12).map((movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.slice(0, 4) : null,
    posterPath: movie.poster_path ? `${POSTER_BASE_SMALL}${movie.poster_path}` : null,
  }));
  return { results };
}

async function getMovieDetails(movieId, apiKey) {
  const data = await tmdbFetch(`/movie/${encodeURIComponent(movieId)}?append_to_response=credits`, apiKey);

  const crew = (data.credits && data.credits.crew) || [];
  const cast = (data.credits && data.credits.cast) || [];
  const directorEntry = crew.find((person) => person.job === 'Director');
  const topCast = cast.slice(0, 5).map((person) => person.name);

  return {
    id: data.id,
    title: data.title,
    year: data.release_date ? data.release_date.slice(0, 4) : null,
    poster: data.poster_path ? `${POSTER_BASE_FULL}${data.poster_path}` : null,
    director: directorEntry ? directorEntry.name : '',
    cast: topCast,
  };
}

export async function handler(event) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'TMDB_API_KEY is not configured in this environment.' });
  }

  const params = event.queryStringParameters || {};
  const query = (params.query || '').trim();
  const movieId = (params.movieId || '').trim();

  try {
    if (movieId) {
      const details = await getMovieDetails(movieId, apiKey);
      return jsonResponse(200, details);
    }

    if (query) {
      const results = await searchMovies(query, apiKey);
      return jsonResponse(200, results);
    }

    return jsonResponse(400, { error: "Provide a 'query' (search) or 'movieId' (details) parameter." });
  } catch (err) {
    const statusCode = err.statusCode || 502;
    return jsonResponse(statusCode, { error: err.message || 'Unexpected error contacting TMDB.' });
  }
}
