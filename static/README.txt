Movies Explain - K-Drama API Integration

API:
https://koren-git-main-deepakrai5656-sys-projects.vercel.app

Copy kdrama-config.js into your website JavaScript/public folder.

Load it before your main script:
<script src="kdrama-config.js"></script>
<script src="script.js"></script>

Available:
searchKDrama("Squid Game")
getDrama("40257-round-six")
getDramaCast("40257-round-six")
getDramaReviews("40257-round-six")
getDramaRecommendations("40257-round-six")
getDramaEpisodes("40257-round-six")
checkKDramaApi()

api-test.js can be used in the browser console after kdrama-config.js is loaded.

AUTO TRAILERS UPDATE
--------------------
The Trailers category now fetches fresh YouTube trailer results through the existing
server-side Vercel YouTube endpoint (koren-six.vercel.app). Results are displayed live
and cached in the browser for 30 minutes. They are not written to Firestore from the
public website, avoiding public database-write/security issues. Existing Firestore
Trailers remain visible and duplicate YouTube video IDs are skipped.
