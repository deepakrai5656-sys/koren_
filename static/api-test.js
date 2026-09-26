async function runKDramaApiTest() {
  const health = await checkKDramaApi();
  console.log("API HEALTH:", health);

  const results = await searchKDrama("Squid Game");
  console.log("SEARCH RESULTS:", results);

  return { health, results };
}
