// ==========================================
// 🔥 FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyDVZXKdgtgi_khgs5fdAoJD3wxIJAqWE_M",
  authDomain: "moviemasala-6bc36.firebaseapp.com",
  projectId: "moviemasala-6bc36",
  storageBucket: "moviemasala-6bc36.firebasestorage.app",
  messagingSenderId: "1071084756205",
  appId: "1:1071084756205:web:abaa1ab013e311b3d7c0e4",
  measurementId: "G-KRP8B6R47F"
};

async function searchYouTubeMovie(title) {
  const query = String(title || "").trim();
  if (!query) return null;

  // YouTube API key stays server-side in Vercel.
  const apiBase = "https://koren-six.vercel.app";
  const url = `${apiBase}/api/youtube?q=${encodeURIComponent(query + " trailer")}&max_results=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`YouTube API request failed: ${response.status}`);
  const data = await response.json();
  const result = Array.isArray(data.results) ? data.results[0] : null;
  if (!result || !result.videoId) return null;
  return {
    id: { videoId: result.videoId },
    snippet: {
      title: result.title || "",
      description: result.description || "",
      thumbnails: {
        high: { url: result.thumbnail || "" },
        medium: { url: result.thumbnail || "" }
      }
    }
  };
}

async function fetchYouTubeIntoForm() {

    const titleInput = document.getElementById("title");

    console.log("Title input:", titleInput);
    console.log("Title value:", titleInput?.value);

    const title = titleInput?.value?.trim();

    if (!title) {
        alert("Movie title enter karo");
        return;
    }

    const video = await searchYouTubeMovie(title);

    if (!video) {
        alert("YouTube video nahi mila");
        return;
    }

    const youtubeInput = document.getElementById("youtubeId");
    const descriptionInput = document.getElementById("description");

    if (youtubeInput) {
        youtubeInput.value = video.id.videoId;
    }

    // Automatically fill the YouTube description into the movie description field.
    const ytDescription = video.snippet?.description || "";
    if (descriptionInput && ytDescription) {
        descriptionInput.value = ytDescription;
    }

    alert("YouTube data mil gaya 🎬\nTrailer ID + Description auto-filled!");
}

// ==========================================
// 🎬 TMDB CONFIG
// ==========================================

const TMDB_CONFIG = {
  apiKey: "58d0c4b60795d78eef053a247c022f91",
  language: "hi-IN",
  imageBaseUrl: "https://image.tmdb.org/t/p/"
};


// ==========================================
// 🎬 TMDB IMAGE
// ==========================================

function getTMDBImage(path, size = "w500") {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${TMDB_CONFIG.imageBaseUrl}${size}${path}`;
}


// ==========================================
// 🔑 CHECK TMDB KEY
// ==========================================

function hasTMDBKey() {
  return !!(
    TMDB_CONFIG.apiKey &&
    TMDB_CONFIG.apiKey.trim()
  );
}


// ==========================================
// 🌐 TMDB REQUEST
// ==========================================

async function tmdbRequest(endpoint, params = {}) {

  if (!hasTMDBKey()) {
    throw new Error("TMDB API key is not configured.");
  }

  const url = new URL(
    `https://api.themoviedb.org/3/${endpoint}`
  );

  const finalParams = {
    api_key: TMDB_CONFIG.apiKey,
    language: TMDB_CONFIG.language,
    ...params
  };

  Object.entries(finalParams).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(key, value);
      }

    }
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `TMDB request failed: ${response.status}`
    );
  }

  return await response.json();
}


// ==========================================
// 🎬 GET MOVIE BY TMDB ID
// ==========================================

async function getTMDBMovie(tmdbId) {

  return await tmdbRequest(
    `movie/${encodeURIComponent(tmdbId)}`,
    {
      append_to_response: "credits"
    }
  );

}


// ==========================================
// 🔍 SEARCH MOVIE
// ==========================================

async function searchTMDBMovie(title, year = "") {

  return await tmdbRequest(
    "search/movie",
    {
      query: title,
      year: year || undefined,
      include_adult: "false"
    }
  );

}


// ==========================================
// 🎬 APPLY TMDB DATA TO ADMIN FORM
// ==========================================

function applyTMDBMovieToForm(movie) {

  if (!movie) return;

  const tmdbId =
    document.getElementById("tmdbId");

  const title =
    document.getElementById("title");

  const poster =
    document.getElementById("poster");

  const rating =
    document.getElementById("rating");

  const year =
    document.getElementById("year");

  const description =
    document.getElementById("description");


  if (tmdbId) {
    tmdbId.value = movie.id || "";
  }


  if (title && movie.title) {
    title.value = movie.title;
  }


  if (poster && movie.poster_path) {

    poster.value =
      getTMDBImage(
        movie.poster_path,
        "w500"
      );

  }


  if (
    rating &&
    movie.vote_average !== undefined
  ) {

    rating.value =
      Number(movie.vote_average)
        .toFixed(1);

  }


  if (year && movie.release_date) {

    year.value =
      movie.release_date.slice(0, 4);

  }


  if (
    description &&
    movie.overview
  ) {

    description.value =
      movie.overview;

  }

}


// ==========================================
// 🎬 FETCH TMDB INTO ADMIN FORM
// ==========================================

async function fetchTMDBIntoForm() {

  if (!hasTMDBKey()) {

    alert(
      "TMDB API key add karo."
    );

    return;
  }


  const id =
    document
      .getElementById("tmdbId")
      ?.value
      .trim();


  const title =
    document
      .getElementById("title")
      ?.value
      .trim();


  const year =
    document
      .getElementById("year")
      ?.value
      .trim();


  try {

    let movie = null;


    // TMDB ID available
    if (id) {

      movie =
        await getTMDBMovie(id);

    }


    // Otherwise search by title
    else if (title) {

      const data =
        await searchTMDBMovie(
          title,
          year
        );

      movie =
        data.results?.[0];


      if (!movie) {

        throw new Error(
          "TMDB par movie nahi mili."
        );

      }

    }


    else {

      alert(
        "TMDB ID ya Movie Title enter karo."
      );

      return;
    }


    applyTMDBMovieToForm(movie);


    alert(
      "TMDB data form mein fill ho gaya 🎬"
    );

  }

  catch (error) {

    console.error(
      "TMDB Error:",
      error
    );

    alert(
      "TMDB data fetch nahi hua:\n" +
      error.message
    );

  }

}


// ==========================================
// 🔄 FIREBASE MOVIE + TMDB
// ==========================================

async function enrichMovieFromTMDB(movie) {

  if (
    !movie?.tmdbId ||
    !hasTMDBKey()
  ) {
    return movie;
  }


  try {

    const tmdb =
      await getTMDBMovie(
        movie.tmdbId
      );


    return {

      ...movie,

      poster:
        movie.poster ||
        getTMDBImage(
          tmdb.poster_path,
          "w500"
        ),

      backdrop:
        movie.backdrop ||
        getTMDBImage(
          tmdb.backdrop_path,
          "w1280"
        ),

      title:
        movie.title ||
        tmdb.title ||
        "",

      rating:
        movie.rating ||
        (
          tmdb.vote_average !== undefined
            ? Number(
              tmdb.vote_average
            ).toFixed(1)
            : ""
        ),

      year:
        movie.year ||
        (
          tmdb.release_date
            ? tmdb.release_date.slice(0, 4)
            : ""
        ),

      description:
        movie.description ||
        tmdb.overview ||
        ""

    };

  }

  catch (error) {

    console.warn(
      "TMDB enrichment failed:",
      error
    );

    return movie;

  }

}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// ==========================================
// 📌 STATE
// ==========================================

let allMovies = [];
let currentList = [];
let isAdmin = false;
let editingId = null;
let isLoadingMore = false;
let filteredMovies = [];
let visibleMovies = 10;

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ==========================================
// 🔄 LOADER
// ==========================================

function showLoader() {
  const loader = document.getElementById("loader");
  const errorPage = document.getElementById("errorPage");
  const container = document.getElementById("movieContainer");

  if (loader) loader.style.display = "block";
  if (errorPage) errorPage.style.display = "none";
  if (container) container.style.display = "none";
}

function hideLoader() {
  const loader = document.getElementById("loader");
  const container = document.getElementById("movieContainer");

  if (loader) loader.style.display = "none";

  // IMPORTANT: GRID
  if (container) {
    container.style.display = "grid";
  }
}

function showErrorPage() {
  const loader = document.getElementById("loader");
  const errorPage = document.getElementById("errorPage");
  const container = document.getElementById("movieContainer");

  if (loader) loader.style.display = "none";
  if (container) container.style.display = "none";
  if (errorPage) errorPage.style.display = "block";
}

// ==========================================
// 🔐 LOGIN
// ==========================================

function openLogin() {
  const loginBox = document.getElementById("loginBox");

  if (loginBox) {
    loginBox.style.display = "flex";
  }
}

function closeLogin() {
  const loginBox = document.getElementById("loginBox");

  if (loginBox) {
    loginBox.style.display = "none";
  }
}

async function login() {
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPassword");

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Email and Password required.");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(async () => {
      isAdmin = true;
      closeLogin();
      showAdminPanel();
      const seeded = await seedFeaturedMoviesToFirebase();
      if (seeded) {
        await loadMovies();
      } else {
        displayMovies(
          currentList.slice(0, visibleMovies)
        );
      }
      alert(seeded
        ? "Admin Login Successful 🎉 Deadpool & Pirates Firebase mein add ho gaye."
        : "Admin Login Successful 🎉");
    })
    .catch((error) => {
      console.error("Login Error:", error);
      alert("Login Failed:\n" + error.message);
    });
}

function logout() {
  auth.signOut()
    .then(() => {
      isAdmin = false;
      editingId = null;

      const panel = document.getElementById("adminPanel");

      if (panel) {
        panel.style.display = "none";
      }

      resetMovieForm();

      visibleMovies = 10;

      displayMovies(
        allMovies.slice(0, visibleMovies)
      );

      alert("Admin Logged Out 👋");
    })
    .catch((error) => {
      console.error("Logout Error:", error);
    });
}

// ==========================================
// 🔐 AUTH STATE
// ==========================================

auth.onAuthStateChanged((user) => {
  isAdmin = !!user;

  const panel = document.getElementById("adminPanel");

  if (isAdmin) {
    showAdminPanel();
  } else if (panel) {
    panel.style.display = "none";
  }

  displayMovies(
    (currentList.length ? currentList : allMovies)
      .slice(0, visibleMovies)
  );
});

function showAdminPanel() {
  const panel = document.getElementById("adminPanel");

  if (panel) {
    panel.style.display = "block";
  }
}

// ==========================================
// 🎞️ HERO CAROUSEL
// ==========================================
let heroSlidesData = [];
let heroTimer = null;
let heroIndex = 0;

function escapeHtmlSafe(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;"
  })[c]);
}

function formatHeroTitle(title) {
  const safe = escapeHtmlSafe(title || "Movie").trim();
  if (!safe) return "Movie";
  const parts = safe.split(/\s+/);
  if (parts.length === 1) return safe;
  const first = parts.shift();
  return `${first} <span>${parts.join(" ")}</span>`;
}

function renderHeroCopy(index) {
  const item = heroSlidesData[index];
  if (!item) return;

  const tagline = document.getElementById("heroTagline");
  const title = document.getElementById("heroTitle");
  const subtitle = document.getElementById("heroSubtitle");
  const description = document.getElementById("heroDescription");
  const browse = document.getElementById("heroBrowseBtn");
  const favorite = document.getElementById("heroFavoriteBtn");

  const genres = Array.isArray(item.genres)
    ? item.genres.slice(0, 3).join(" • ")
    : String(item.genre || "Action • Drama • Thriller");

  if (tagline) tagline.textContent = item.local ? "FEATURED • ACTION • CRIME • THRILLER" : `FEATURED • ${genres}`;
  if (title) title.innerHTML = formatHeroTitle(item.title);
  if (subtitle) subtitle.textContent = item.local ? "Baba Yaga is back." : `${item.year ? item.year + " • " : ""}Now featured on MoviesExplain`;
  if (description) description.textContent = item.description || item.overview || `Explore ${item.title || "this movie"} with its story, review and explanation on MoviesExplain.`;
  if (browse) browse.onclick = () => document.getElementById("movieContainer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (favorite) {
    if (item.id) {
      const isFav = favorites.includes(String(item.id));
      favorite.textContent = isFav ? "❤️ Liked" : "🤍 Like";
      favorite.onclick = (event) => toggleFavorite(String(item.id), event);
    } else {
      favorite.textContent = "❤️ My Favorites";
      favorite.onclick = () => showFavorites();
    }
  }
}

function initHeroCarousel(movies) {
  const slidesRoot = document.getElementById("heroSlides");
  const dotsRoot = document.getElementById("heroDots");
  if (!slidesRoot || !dotsRoot) return;

  const candidates = Array.isArray(movies) ? movies.filter(m => m && m.poster) : [];
  const johnSource = candidates.find(m => String(m.title || "").trim().toLowerCase() === "john wick") || {};
  const john = { ...johnSource, title: "John Wick", poster: "john-wick-feature.webp", backdrop: "john-wick-hero.webp", local: true };
  const seen = new Set(["john wick"]);
  heroSlidesData = [john];

  for (const movie of candidates) {
    const title = String(movie.title || "Movie").trim();
    const key = title.toLowerCase();
    if (!title || seen.has(key)) continue;
    seen.add(key);
    heroSlidesData.push({ ...movie, title, poster: movie.poster, backdrop: movie.backdrop || movie.poster });
    if (heroSlidesData.length >= 6) break;
  }

  slidesRoot.innerHTML = heroSlidesData.map((item, i) => {
    const posterSrc = escapeHtmlSafe(item.poster || item.backdrop);
    const backdropSrc = escapeHtmlSafe(item.backdrop || item.poster);
    const alt = escapeHtmlSafe(item.title);
    return `<div class="hero-slide ${i === 0 ? "is-active" : ""}" data-index="${i}" data-title="${alt}">
      <img src="${backdropSrc}" alt="" class="hero-slide-backdrop" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      <div class="hero-slide-poster-wrap">
        <img src="${posterSrc}" alt="${alt} poster" class="hero-slide-poster" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      </div>
    </div>`;
  }).join("");

  dotsRoot.innerHTML = heroSlidesData.map((item, i) => `
    <button class="hero-dot ${i === 0 ? "is-active" : ""}" type="button" aria-label="Show ${escapeHtmlSafe(item.title)}" onclick="goToHeroSlide(${i})"></button>
  `).join("");

  heroIndex = 0;
  renderHeroCopy(0);
  clearInterval(heroTimer);
  if (heroSlidesData.length > 1) {
    heroTimer = setInterval(() => goToHeroSlide((heroIndex + 1) % heroSlidesData.length), 3000);
  }
}

function goToHeroSlide(index) {
  const slides = document.querySelectorAll("#heroSlides .hero-slide");
  const dots = document.querySelectorAll("#heroDots .hero-dot");
  if (!slides.length) return;
  heroIndex = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((el, i) => el.classList.toggle("is-active", i === heroIndex));
  dots.forEach((el, i) => el.classList.toggle("is-active", i === heroIndex));
  renderHeroCopy(heroIndex);
}

// 📥 LOAD MOVIES
// ==========================================


// ==========================================
// 🎬 FIREBASE MOVIE LOADING
// ==========================================
const blockedMovieTitles = new Set([]);

// ==========================================
// ▶️ AUTO LATEST TRAILERS (YOUTUBE)
// ==========================================
// Trailers are fetched live from the existing server-side YouTube proxy.
// Discovered trailers are persisted in this browser so they remain available
// across refreshes/days. Site-wide Firestore persistence requires a protected
// server/cron writer and is intentionally not enabled from the public browser.
let latestTrailerMovies = [];
let latestTrailersLoadedAt = 0;
let latestTrailersLoading = null;
const TRAILER_CACHE_MS = 30 * 60 * 1000;
const TRAILER_STORAGE_KEY = "moviesexplain_auto_trailers_v2";
const TRAILER_MAX_STORED = 200;

function loadStoredAutoTrailers() {
  try {
    const raw = localStorage.getItem(TRAILER_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Saved trailers could not be loaded:", e);
    return [];
  }
}

function saveAutoTrailers(items) {
  try {
    const map = new Map();
    for (const item of items) {
      const id = String(item?.youtubeId || "").trim();
      if (id) map.set(id, item);
    }
    const saved = [...map.values()]
      .sort((a, b) => Number(b.discoveredAt || 0) - Number(a.discoveredAt || 0))
      .slice(0, TRAILER_MAX_STORED);
    localStorage.setItem(TRAILER_STORAGE_KEY, JSON.stringify(saved));
    return saved;
  } catch (e) {
    console.warn("Trailers could not be saved:", e);
    return items;
  }
}

function getPersistentAutoTrailers() {
  return loadStoredAutoTrailers().map(m => ({ ...m, localOnly: true, autoTrailer: true }));
}

async function fetchLatestTrailers(force = false) {
  const now = Date.now();
  if (!force && latestTrailerMovies.length && (now - latestTrailersLoadedAt) < TRAILER_CACHE_MS) {
    return latestTrailerMovies;
  }
  if (latestTrailersLoading) return latestTrailersLoading;

  const apiBase = "https://koren-six.vercel.app";
  const queries = [
    "new Bollywood movie trailer",
    "new Hindi movie trailer",
    "new Hollywood movie trailer"
  ];

  latestTrailersLoading = (async () => {
    try {
      const responses = await Promise.all(
        queries.map(async (query) => {
          const url = `${apiBase}/api/youtube?q=${encodeURIComponent(query)}&max_results=8`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Trailer API ${response.status}`);
          const data = await response.json();
          return Array.isArray(data.results) ? data.results : [];
        })
      );

      const seen = new Set();
      const combined = [];

      responses.flat().forEach((item) => {
        const videoId = String(item.videoId || item.id?.videoId || "").trim();
        const title = String(item.title || item.snippet?.title || "").trim();
        if (!videoId || !title || seen.has(videoId)) return;

        const lower = title.toLowerCase();
        // Keep actual trailer/teaser results and avoid obvious songs/reviews.
        const looksLikeTrailer = /trailer|teaser|official/i.test(title);
        const looksLikeNoise = /song|lyric|reaction|review|explained|shorts/i.test(lower);
        if (!looksLikeTrailer || looksLikeNoise) return;

        seen.add(videoId);
        combined.push({
          id: `auto-yt-${videoId}`,
          title,
          year: new Date().getFullYear().toString(),
          category: "Trailers",
          duration: "YouTube",
          rating: "N/A",
          description: String(item.description || item.snippet?.description || "Latest trailer from YouTube."),
          poster: String(item.thumbnail || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`),
          youtubeId: videoId,
          localOnly: true,
          autoTrailer: true
        });
      });

      const stored = getPersistentAutoTrailers();
      const mergedById = new Map();
      [...stored, ...combined].forEach((movie) => {
        const id = String(movie.youtubeId || "").trim();
        if (!id) return;
        mergedById.set(id, {
          ...movie,
          discoveredAt: movie.discoveredAt || Date.now()
        });
      });

      const persisted = saveAutoTrailers([...mergedById.values()]);
      latestTrailerMovies = persisted;
      latestTrailersLoadedAt = Date.now();
      return latestTrailerMovies;
    } catch (error) {
      console.warn("Latest trailers could not be loaded:", error);
      return latestTrailerMovies;
    } finally {
      latestTrailersLoading = null;
    }
  })();

  return latestTrailersLoading;
}

async function loadLatestTrailersIntoCategory() {
  const trailers = await fetchLatestTrailers();
  if (!trailers.length) return;

  // Merge only for the live Trailers category; do not duplicate Firestore records.
  const firestoreTrailerIds = new Set(
    allMovies
      .filter(m => movieMatchesCategory(m, "Trailers"))
      .map(m => String(m.youtubeId || "").trim())
      .filter(Boolean)
  );

  const liveTrailers = trailers.filter(m => !firestoreTrailerIds.has(String(m.youtubeId || "").trim()));
  allMovies = [
    ...allMovies.filter(m => !m.autoTrailer),
    ...liveTrailers
  ];

  if (normalizeMovieText(window.__activeMovieCategory) === "trailer" || normalizeMovieText(window.__activeMovieCategory) === "trailers") {
    applyMovieFilters(false);
  }
}


function isBlockedMovie(movie) {
  const title = String(movie?.title || "").toLowerCase().trim();
  return [...blockedMovieTitles].some(name => title === name || title.startsWith(name + ":") || title.startsWith(name + " "));
}

// These are seeded into Firestore once by an authenticated admin.
// After that, the website reads them exactly like every other Firebase movie.
const firebaseFeaturedMovies = [
  {
    title: "Deadpool",
    year: "2016",
    category: "Action",
    duration: "1h 48m",
    rating: "8.0",
    description: "A wisecracking mercenary gets a second chance at life and sets out on a violent mission for revenge.",
    poster: "/deadpool.webp",
    youtubeId: ""
  },
  {
    title: "Pirates of the Caribbean: The Curse of the Black Pearl",
    year: "2003",
    category: "Adventure",
    duration: "2h 23m",
    rating: "8.1",
    description: "A pirate captain and a young blacksmith team up to rescue Elizabeth and break an ancient curse.",
    poster: "/pirates.webp",
    youtubeId: ""
  }
];

async function seedFeaturedMoviesToFirebase() {
  if (!isAdmin) return false;

  let changed = false;
  try {
    for (const movie of firebaseFeaturedMovies) {
      const snap = await db.collection("movies")
        .where("title", "==", movie.title)
        .limit(1)
        .get();

      if (snap.empty) {
        await db.collection("movies").add(movie);
        changed = true;
      }
    }
  } catch (error) {
    console.warn("Featured Firebase seed skipped:", error);
  }
  return changed;
}

async function loadMovies() {
  showLoader();

  try {
    // Deadpool and Pirates are NOT hardcoded into the movie list.
    // They must exist in Firestore, just like John Wick and all other movies.
    allMovies = [];
    const snap = await db.collection("movies").get();

    snap.forEach((doc) => {
      allMovies.push({
        ...doc.data(),
        id: String(doc.id)
      });
    });

    allMovies = allMovies.filter(movie => !isBlockedMovie(movie));

    const seen = new Set();
    allMovies = allMovies.filter((movie) => {
      const titleKey = normalizeMovieText(
        movie.title || movie.movieTitle || movie.movieName || movie.name || movie.original_title || ""
      );
      const yearKey = String(movie.year || "").trim();
      const key =
        movie.tmdbId ? `tmdb:${String(movie.tmdbId).trim()}` :
          movie.youtubeId ? `yt:${String(movie.youtubeId).trim()}` :
            `title:${titleKey}|year:${yearKey}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    filteredMovies = [...allMovies];
    visibleMovies = Math.min(10, filteredMovies.length);

    initHeroCarousel(allMovies);
    hideLoader();

    displayMovies(filteredMovies.slice(0, visibleMovies));

    // Warm the trailer cache in the background so the Trailers category opens fast.
    fetchLatestTrailers();

  } catch (error) {
    console.error(error);
    showErrorPage();
  }
}
// ==========================================
// 🎬 DISPLAY MOVIES
// ==========================================
// ==========================================
// 🎬 DISPLAY MOVIES - OPTIMIZED
// ==========================================

async function displayMovies(list, append = false) {

  const container = document.getElementById("movieContainer");

  if (!container) return;

  // Keep the FULL active list. When append=true, only render the new page.
  // The old code replaced currentList with nextMovies, which broke search,
  // favorites and later renders.
  if (!append) {
    currentList = Array.isArray(list) ? list : [];
  }

  const renderList = append
    ? (Array.isArray(list) ? list : [])
    : currentList;

  // Sirf new render par container clear hoga
  if (!append) {
    container.innerHTML = "";
  }

  container.style.display = "grid";

  if (renderList.length === 0) {
    container.innerHTML = `
      <h2 style="
        text-align:center;
        width:100%;
        color:white;
        grid-column:1 / -1;
      ">
        No Movies Found 🎬
      </h2>
    `;
    return;
  }

  const renderToken = Date.now();
  window.__movieRenderToken = renderToken;

  // TMDB request ONLY when important data missing
  const movies = await Promise.all(
    renderList.map(async (movie) => {

      // Agar Firebase mein poster/title already hai,
      // unnecessary TMDB request mat karo.
      if (movie.poster && movie.title) {
        return movie;
      }

      return await enrichMovieFromTMDB(movie);
    })
  );

  if (window.__movieRenderToken !== renderToken) return;

  movies.forEach((movie) => {

    const div = document.createElement("div");
    div.className = "movie-card";

    const isFav = favorites.includes(movie.id);

    // TMDB image ko w342 rakho - mobile ke liye lighter
    let posterUrl = movie.poster || "";

    if (posterUrl.includes("/w500/")) {
      posterUrl = posterUrl.replace("/w500/", "/w342/");
    }

    const movieUrl = `/movie/${encodeURIComponent(movieSlug(movie.title))}`;

    div.innerHTML = `
      <a class="movie-seo-link" href="${movieUrl}" aria-label="${escapeHtml(movie.title || "Movie")} explained in Hindi">
        <img
          src="${posterUrl}"
          alt="${escapeHtml(movie.title || "Movie")} movie poster"
          class="movie-poster"
          loading="lazy"
          fetchpriority="low"
          decoding="async"
          width="342"
          height="513"
          onerror="this.style.display='none'"
        >
      </a>

      <div class="movie-info">

        <h3>${movie.title || "Untitled"}</h3>

        <button
          class="fav-btn"
          onclick="toggleFavorite('${movie.id}', event)"
        >
          ${isFav ? "❤️" : "🤍"}
        </button>

        <p class="rating">
          ⭐ ${movie.rating || "N/A"}
        </p>

        <p>
          📅 ${movie.year || "N/A"}
        </p>

        <span class="category">
          ${movie.category || "Movie"}
        </span>

        <p>
          ⏱ ${movie.duration || "N/A"}
        </p>

        <p class="description description-3line">
          ${movie.description || ""}
        </p>

      </div>
    `;

    const poster = div.querySelector(".movie-poster");
    const title = div.querySelector("h3");
    const description = div.querySelector(".description");

    [poster, title, description].forEach((element) => {
      if (!element) return;
      element.style.cursor = "pointer";
      element.onclick = (event) => {
        event.preventDefault();
        openMoviePage(movie);
      };
    });

    // Make the title an actual crawlable link for Google.
    if (title) {
      const titleLink = document.createElement("a");
      titleLink.href = movieUrl;
      titleLink.textContent = movie.title || "Untitled";
      titleLink.setAttribute("aria-label", `${movie.title || "Movie"} explained in Hindi`);
      titleLink.className = "movie-title-link";
      title.replaceChildren(titleLink);
    }

    // ADMIN BUTTONS
    if (isAdmin && !movie.localOnly) {

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.innerText = "✏️ Edit";

      editBtn.onclick = (e) => {
        e.stopPropagation();
        editMovie(movie);
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerText = "🗑 Delete";

      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteMovie(movie.id);
      };

      div.appendChild(editBtn);
      div.appendChild(deleteBtn);
    }

    container.appendChild(div);
  });
}


// ==========================================
// 📜 INFINITE SCROLL - OPTIMIZED
// ==========================================

async function loadMoreMovies() {

  if (isLoadingMore) return;

  if (visibleMovies >= filteredMovies.length) return;

  isLoadingMore = true;

  const loader =
    document.getElementById("scrollLoader");

  if (loader) {
    loader.style.display = "flex";
  }

  // Next 10 movies only
  const nextVisibleMovies =
    Math.min(
      visibleMovies + 10,
      filteredMovies.length
    );

  const nextMovies =
    filteredMovies.slice(
      visibleMovies,
      nextVisibleMovies
    );

  visibleMovies = nextVisibleMovies;

  // IMPORTANT:
  // append=true means old movies remove nahi hongi
  await displayMovies(
    nextMovies,
    true
  );

  if (loader) {
    loader.style.display = "none";
  }

  isLoadingMore = false;
}
// ==========================================
// ❤️ FAVORITES
// ==========================================

function toggleFavorite(id, event) {

  if (event) {
    event.stopPropagation();
  }

  if (favorites.includes(id)) {

    favorites = favorites.filter(
      (item) => item !== id
    );

  } else {

    favorites.push(id);
  }

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  displayMovies(
    currentList.slice(0, visibleMovies)
  );
}
function showFavorites() {

  visibleMovies = 10;

  filteredMovies = allMovies.filter(movie =>
    favorites.includes(movie.id)
  );

  currentList = filteredMovies;

  displayMovies(
    filteredMovies.slice(0, visibleMovies)
  );
}
// ==========================================
// ➕ ADD / UPDATE MOVIE
// ==========================================

async function addMovie() {

  if (!isAdmin) {
    alert("Please login as Admin first.");
    return;
  }

  const title = document.getElementById("title")?.value.trim();

  const tmdbId =
    document.getElementById("tmdbId")?.value.trim();

  const poster =
    document.getElementById("poster")?.value.trim();

  const youtubeId =
    document.getElementById("youtubeId")?.value.trim();

  const rating =
    document.getElementById("rating")?.value.trim();

  const year =
    document.getElementById("year")?.value.trim();

  const category =
    document.getElementById("category")?.value;

  const duration =
    document.getElementById("duration")?.value.trim();

  const description =
    document.getElementById("description")?.value.trim();

  if (!title) {
    return alert("Movie title required.");
  }

  if (!poster && !tmdbId) {
    return alert("Poster URL or TMDB Movie ID required.");
  }

  if (!youtubeId) {
    return alert("YouTube Video ID required.");
  }

  const movieData = {
    title,
    tmdbId,
    poster,
    youtubeId,
    rating,
    year,
    category,
    duration,
    description
  };

  try {

    if (editingId) {

  const docId = String(editingId);

  await db
    .collection("movies")
    .doc(docId)
    .update(movieData);

  alert("Movie Updated Successfully 🎉");

} else {

  await db
    .collection("movies")
    .add(movieData);

  alert("Movie Added Successfully 🎉");
}

    resetMovieForm();

    // Reset pagination/search state after add/update so the fresh Firebase
    // data is rendered from the beginning.
    visibleMovies = 10;
    isLoadingMore = false;
    await loadMovies();

  } catch (error) {

    console.error("Save Movie Error:", error);

    alert(
      "Unable to save movie:\n" +
      error.message
    );
  }
}

// ==========================================
// ✏️ EDIT MOVIE
// ==========================================

function editMovie(movie) {

  const tmdbIdField =
    document.getElementById("tmdbId");

  if (tmdbIdField) {
    tmdbIdField.value = movie.tmdbId || "";
  }

  document.getElementById("title").value =
    movie.title || "";

  document.getElementById("poster").value =
    movie.poster || "";

  document.getElementById("youtubeId").value =
    movie.youtubeId || "";

  document.getElementById("rating").value =
    movie.rating || "";

  document.getElementById("year").value =
    movie.year || "";

  document.getElementById("category").value =
    movie.category || "";

  document.getElementById("duration").value =
    movie.duration || "";

  document.getElementById("description").value =
    movie.description || "";

 editingId = String(movie.id);

  const saveBtn =
    document.getElementById("saveBtn");

  if (saveBtn) {
    saveBtn.innerText = "✏️ Update Movie";
  }

  const panel =
    document.getElementById("adminPanel");

  if (panel) {
    panel.scrollIntoView({
      behavior: "smooth"
    });
  }
}

// ==========================================
// 🧹 RESET FORM
// ==========================================

function resetMovieForm() {

  const fields = [
    "title",
    "tmdbId",
    "poster",
    "youtubeId",
    "rating",
    "year",
    "duration",
    "description"
  ];

  fields.forEach((id) => {

    const el = document.getElementById(id);

    if (el) {
      el.value = "";
    }
  });

  const category =
    document.getElementById("category");

  if (category) {
    category.value = "";
  }

  editingId = null;

  const saveBtn =
    document.getElementById("saveBtn");

  if (saveBtn) {
    saveBtn.innerText = "➕ Add Movie";
  }
}

// ==========================================
// 🗑 DELETE MOVIE
// ==========================================

async function deleteMovie(id) {

  if (!isAdmin) {
    return alert("Admin login required.");
  }

  if (!confirm("Delete this movie?")) {
    return;
  }

  try {

    await db
      .collection("movies")
      .doc(id)
      .delete();

    alert("Movie Deleted 🗑️");

    await loadMovies();

  } catch (error) {

    console.error("Delete Error:", error);

    alert(
      "Delete failed:\n" +
      error.message
    );
  }
}


// ==========================================
// 🔎 SEO MOVIE PAGE
// ==========================================
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function movieSlug(title) {
  return String(title || "")
    .toLowerCase().trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function openMoviePage(movie) {
  if (!movie || !movie.title) return;
  const slug = movieSlug(movie.title);
  if (!slug) return;
  window.location.href = `/movie/${slug}`;
}

window.openMoviePage = openMoviePage;

// ==========================================
// ▶️ YOUTUBE VIDEO
// ==========================================

function openVideo(id) {

  if (!id) {
    alert("YouTube video is not available.");
    return;
  }

  let videoId = id.trim();

  if (videoId.includes("v=")) {

    videoId =
      videoId
        .split("v=")[1]
        .split("&")[0];

  } else if (videoId.includes("youtu.be/")) {

    videoId =
      videoId
        .split("youtu.be/")[1]
        .split("?")[0];
  }

  const modal =
    document.getElementById("videoModal");

  const player =
    document.getElementById("youtubePlayer");

  if (!modal || !player) return;

  modal.style.display = "flex";

  player.src =
    `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

function closeVideo() {

  const modal =
    document.getElementById("videoModal");

  const player =
    document.getElementById("youtubePlayer");

  if (modal) {
    modal.style.display = "none";
  }

  if (player) {
    player.src = "";
  }
}

// ==========================================
// 🚀 START
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadMovies();
  }
);


/* =========================================================
   MOVIESEXPLAIN - MOBILE NAVBAR
========================================================= */

function toggleMobileMenu() {
  const menu = document.getElementById("navbarMenu");

  if (!menu) return;

  menu.classList.toggle("mobile-open");
}


function closeMobileMenu() {
  const menu = document.getElementById("navbarMenu");

  if (!menu) return;

  menu.classList.remove("mobile-open");
}


/* =========================================================
   CATEGORY DROPDOWN
========================================================= */

function toggleCategoryMenu(event) {

  event.stopPropagation();

  const dropdown =
    document.getElementById("categoryDropdown");

  if (!dropdown) return;

  dropdown.classList.toggle("show");
}


function closeCategoryMenu() {

  const dropdown =
    document.getElementById("categoryDropdown");

  if (!dropdown) return;

  dropdown.classList.remove("show");
}


/* Dropdown ke bahar click */

document.addEventListener("click", function (event) {

  if (!event.target.closest(".nav-dropdown")) {

    closeCategoryMenu();

  }

});


/* Desktop par resize hone par mobile menu close */

window.addEventListener("resize", function () {

  if (window.innerWidth > 850) {

    closeMobileMenu();

  }

});

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================

const scrollTopBtn =
  document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {

  if (!scrollTopBtn) return;

  if (window.scrollY > 400) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }

});

if (scrollTopBtn) {

  scrollTopBtn.addEventListener("click", () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

}
window.addEventListener("scroll", () => {

  if (isLoadingMore) return;

  const scrollPosition =
    window.innerHeight + window.scrollY;

  const pageHeight =
    document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 500) {
    loadMoreMovies();
  }

});

// ==========================================
// 🔄 UPDATE ALL EXISTING MOVIES FROM TMDB
// ==========================================

async function updateAllMoviesFromTMDB() {

  if (!isAdmin) {
    alert("Please login as Admin first.");
    return;
  }

  if (!hasTMDBKey()) {
    alert("TMDB API key is not configured.");
    return;
  }

  if (!Array.isArray(allMovies) || allMovies.length === 0) {
    alert("No movies loaded from Firebase.");
    return;
  }

  if (!confirm(
    `TMDB will search ${allMovies.length} existing movies by title and update poster, rating, year and description.\n\nContinue?`
  )) {
    return;
  }

  const button = document.getElementById("updateAllTMDBBtn");
  const status = document.getElementById("tmdbUpdateStatus");

  if (button) {
    button.disabled = true;
    button.innerText = "⏳ Updating...";
  }

  if (status) {
    status.style.display = "block";
    status.innerText = `Starting... 0/${allMovies.length}`;
  }

  let updated = 0;
  let notFound = 0;
  let failed = 0;

  for (let i = 0; i < allMovies.length; i++) {

    const movie = allMovies[i];
    const title = (movie.title || "").trim();

    try {

      if (!title) {
        notFound++;
        continue;
      }

      const data = await searchTMDBMovie(
        title,
        movie.year || ""
      );

      const results = Array.isArray(data.results)
        ? data.results
        : [];

      if (!results.length) {
        notFound++;

        if (status) {
          status.innerText =
            `⚠️ ${i + 1}/${allMovies.length} — Not found: ${title}`;
        }

        continue;
      }

      const normalizedTitle =
        title.toLowerCase().trim();

      const match =
        results.find(item =>
          (item.title || "")
            .toLowerCase()
            .trim() === normalizedTitle
        ) || results[0];

      const updateData = {
        tmdbId: String(match.id),

        poster: match.poster_path
          ? getTMDBImage(match.poster_path, "w500")
          : (movie.poster || ""),

        rating: match.vote_average != null
          ? Number(match.vote_average).toFixed(1)
          : (movie.rating || ""),

        year: match.release_date
          ? match.release_date.slice(0, 4)
          : (movie.year || ""),

        description:
          match.overview ||
          movie.description ||
          ""
      };

      await db
        .collection("movies")
        .doc(movie.id)
        .update(updateData);

      Object.assign(movie, updateData);

      updated++;

      if (status) {
        status.innerText =
          `✅ ${i + 1}/${allMovies.length} — Updated: ${title}`;
      }

    } catch (error) {

      console.error(
        `TMDB update failed for "${title}"`,
        error
      );

      failed++;

      if (status) {
        status.innerText =
          `❌ ${i + 1}/${allMovies.length} — Failed: ${title}`;
      }
    }

    // Small delay between requests.
    await new Promise(
      resolve => setTimeout(resolve, 250)
    );
  }

  await loadMovies();

  if (status) {
    status.innerText =
      `Finished ✅ Updated: ${updated} | Not found: ${notFound} | Failed: ${failed}`;
  }

  if (button) {
    button.disabled = false;
    button.innerText =
      "🔄 Update All Movies from TMDB";
  }

  alert(
    `TMDB update complete!\n\n` +
    `Updated: ${updated}\n` +
    `Not found: ${notFound}\n` +
    `Failed: ${failed}`
  );
}


// ==========================================
// 🔐 SECRET ADMIN LOGIN — 5 LOGO CLICKS
// Prevent the logo link from reloading index.html so the click counter
// is not reset on every click. Five clicks within 3 seconds opens login.
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const brand = document.querySelector(".professional-navbar .brand, .navbar .brand, .brand");
  if (!brand) return;

  let logoClicks = 0;
  let logoClickTimer = null;

  brand.addEventListener("click", function (e) {
    // Stay on the page while counting clicks.
    e.preventDefault();

    logoClicks++;

    if (logoClickTimer) clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => {
      logoClicks = 0;
    }, 3000);

    if (logoClicks >= 5) {
      clearTimeout(logoClickTimer);
      logoClickTimer = null;
      logoClicks = 0;
      openLogin();
    }
  });
});
// ==========================================
// 🔎 WEBSITE SEARCH + CATEGORY FILTER
// ==========================================

function normalizeMovieText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\\u2013\\u2014]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMovieCategory(movie) {
  return normalizeMovieText(
    movie?.category || movie?.type || movie?.contentType || "Movie"
  );
}

function movieMatchesCategory(movie, selected) {
  const wanted = normalizeMovieText(selected || "All");
  if (!wanted || wanted === "all" || wanted === "movies") return true;

  const category = getMovieCategory(movie);

  // Trailer category: show ONLY movies explicitly saved from Admin with
  // category "Trailers" (or the legacy singular "Trailer").
  // Having a YouTube ID alone is not enough.
  if (wanted === "trailer" || wanted === "trailers") {
    return category === "trailer" || category === "trailers";
  }

  if (wanted === "bollywood") {
    return category === "bollywood" || category === "hindi" || category.includes("bollywood") || category.includes("hindi cinema");
  }

  if (wanted === "south") {
    return category === "south" || category.includes("south") || category.includes("south indian");
  }

  if (wanted === "series" || wanted === "web series" || wanted === "web-series") {
    return category === "series" ||
      category === "web series" ||
      category === "web-series" ||
      category.includes("series");
  }

  return category === wanted || category.includes(wanted);
}

function movieMatchesSearch(movie, query) {
  const q = normalizeMovieText(query);
  if (!q) return true;

  const searchableFields = [
    movie?.title,
    movie?.movieTitle,
    movie?.movieName,
    movie?.name,
    movie?.original_title,
    movie?.originalTitle,
    movie?.description,
    movie?.overview,
    movie?.category,
    movie?.type,
    movie?.contentType,
    movie?.year,
    ...(Array.isArray(movie?.genre) ? movie.genre : [movie?.genre])
  ];

  const haystack = searchableFields
    .map(normalizeMovieText)
    .filter(Boolean)
    .join(' ');

  // Match the complete search phrase OR every search word.
  // This handles searches such as "john wick", "leprechaun 4" and partial titles.
  if (haystack.includes(q)) return true;

  const words = q.split(' ').filter(Boolean);
  return words.length > 0 && words.every(word => haystack.includes(word));
}

function applyMovieFilters(loadLiveTrailers = true) {
  const input = document.getElementById("searchInput");
  const query = normalizeMovieText(input?.value);
  const selected = window.__activeMovieCategory || "All";

  filteredMovies = Array.isArray(allMovies)
    ? allMovies.filter((movie) =>
        movieMatchesCategory(movie, selected) &&
        movieMatchesSearch(movie, query)
      )
    : [];

  visibleMovies = Math.min(10, filteredMovies.length);
  currentList = [...filteredMovies];

  displayMovies(filteredMovies.slice(0, visibleMovies));

  if (loadLiveTrailers && (selected === "Trailer" || selected === "Trailers" || normalizeMovieText(selected) === "trailer" || normalizeMovieText(selected) === "trailers")) {
    loadLatestTrailersIntoCategory();
  }
}

function searchMovies(value) {
  const input = document.getElementById("searchInput");
  if (input && value !== undefined && typeof value === "string") {
    input.value = value;
  }

  applyMovieFilters();

}

function clearSearch() {
  const input = document.getElementById("searchInput");
  if (input) input.value = "";
  window.__searchAutoScrolled = false;
  applyMovieFilters();
}

function scrollToMoviesSection() {
  const moviesSection = document.getElementById("moviesSection");
  if (!moviesSection) return;

  const nav = document.querySelector(".professional-navbar, .navbar, header, nav");
  const offset = nav ? nav.getBoundingClientRect().height : 72;
  const rect = moviesSection.getBoundingClientRect();
  const top = Math.max(0, rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0) - offset - 8);

  window.scrollTo({ top, behavior: "smooth" });
}

function filterCategory(category) {
  window.__activeMovieCategory = String(category || "All").trim() || "All";
  applyMovieFilters();

  if (typeof closeCategoryMenu === "function") closeCategoryMenu();
  if (typeof closeMobileMenu === "function") closeMobileMenu();

  // Filter/render complete hone ke baad section par smooth scroll.
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToMoviesSection);
  });
}

// HTML inline handlers / other scripts
window.filterCategory = filterCategory;
window.clearSearch = clearSearch;
window.searchMovies = searchMovies;
window.clearMovieSearch = clearSearch;
window.applyMovieFilters = applyMovieFilters;
window.scrollToMoviesSection = scrollToMoviesSection;

// ==========================================
// 🎯 NAVBAR EXPORTS
// ==========================================
window.filterCategory = filterCategory;
window.clearSearch = clearSearch;
window.searchMovies = searchMovies;
