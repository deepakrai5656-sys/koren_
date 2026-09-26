// Movies Explain - Live K-Drama API
const KDRAMA_API_BASE = "https://koren-git-main-deepakrai5656-sys-projects.vercel.app";

async function kdramaApi(path) {
  const response = await fetch(`${KDRAMA_API_BASE}${path}`);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
}

async function searchKDrama(query) {
  if (!query || !query.trim()) return { results: [] };
  return kdramaApi(`/api/search/q/${encodeURIComponent(query.trim())}`);
}

async function getDrama(slug) {
  return kdramaApi(`/api/id/${encodeURIComponent(slug)}`);
}

async function getDramaCast(slug) {
  return kdramaApi(`/api/id/${encodeURIComponent(slug)}/cast`);
}

async function getDramaReviews(slug) {
  return kdramaApi(`/api/id/${encodeURIComponent(slug)}/reviews`);
}

async function getDramaRecommendations(slug) {
  return kdramaApi(`/api/id/${encodeURIComponent(slug)}/recs`);
}

async function getDramaEpisodes(slug) {
  return kdramaApi(`/api/id/${encodeURIComponent(slug)}/episodes`);
}

async function checkKDramaApi() {
  return kdramaApi("/api/health");
}
