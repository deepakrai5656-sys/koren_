(function () {
  "use strict";

  const cfg = window.MOVIESEXPLAIN_ADS || {};
  const publisherId = String(cfg.PUBLISHER_ID || "").trim();

  // Do not load an invalid/placeholder AdSense client.
  if (!/^ca-pub-\d{10,30}$/.test(publisherId)) {
    return;
  }

  if (cfg.AUTO_ADS === false) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(publisherId);
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  script.addEventListener("load", function () {
    document.documentElement.classList.add("adsense-ready");
  });
})();
