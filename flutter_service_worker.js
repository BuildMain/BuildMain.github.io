'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin.json": "563b6136f1c4c2c8f04275255bb1144a",
"assets/AssetManifest.bin": "31ae4e82786336676b9cb04e891455d1",
"assets/assets/images/success.png": "e82b2d3b2ddc9546176cf45d890fed5a",
"assets/assets/images/automate_logo.svg": "6dd7598bf7d65838abaa8e988e2baa96",
"assets/assets/images/automate_logo.png": "c0f34967d67e1d43d842d2e640dbd008",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/fonts/MaterialIcons-Regular.otf": "f22042b275a2e3432a5a65b36e6b65e3",
"assets/NOTICES": "38cf982f9e2ada9ba150e35998591a5f",
"assets/AssetManifest.json": "da47a2c5604e6d663f27ea2be18cbe9b",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"favicon-16x16.png": "a3543a006a8084a302a1d8860a199254",
"flutter.js": "1e28bc80be052b70b1e92d55bea86b2a",
"favicon-96x96.png": "5a91f2072bb3f11b22a4ac69659f94e0",
"README.md": "5b80abb2ec3aed20d4d71e122523d9f7",
"flutter_bootstrap.js": "7870faee12580eee6f31db314a97db45",
"index.html": "48a32b61b7528685c0118efb2e204aec",
"/": "48a32b61b7528685c0118efb2e204aec",
"manifest.json": "926aa561959a805a42f06841144eb0d2",
"favicon-192x192.png": "e1739dbcd007269fb08ef1a924e33439",
"favicon-48x48.png": "b582c2a3f5f6c62aed554b247622d0ae",
"version.json": "72a61da7453d57a77597c7f77cff438e",
"icons/Icon-192.png": "cc6b17573b1225adb7a9f99ea9732748",
"icons/Icon-512.png": "1ecf98debeb13963381b24d99ebbc229",
"icons/Icon-maskable-512.png": "1ecf98debeb13963381b24d99ebbc229",
"icons/Icon-maskable-192.png": "cc6b17573b1225adb7a9f99ea9732748",
"main.dart.js": "4b44d28ae8c19cfc5f33c5915ebaca7f",
"favicon-32x32.png": "24fe287382f9b7c1bed1e5f80fc48401",
"canvaskit/chromium/canvaskit.js.symbols": "df8d59c9c5b939138218728e60fda285",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.wasm": "f53b08798252647c4453cf5c6aac7369",
"canvaskit/skwasm_st.js.symbols": "9e3ded5c33a28acd40a6bf325038b3cf",
"canvaskit/canvaskit.js.symbols": "92118ac9c289955646a0baff4199e361",
"canvaskit/skwasm_st.wasm": "f53ddcaeacd1ccd08530e1d5a0f20f4c",
"canvaskit/skwasm.js": "9c817487f9f24229450747c66b9374a6",
"canvaskit/skwasm.js.symbols": "1ab725c865730c55a05037504aa49e63",
"canvaskit/skwasm.wasm": "6bcbf3d848c812d9db0a501a43a14505",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.wasm": "3b15ffefc3ea26bd4b3d31edd5f2aadc",
"canvaskit/skwasm_st.js": "7df9d8484fef4ca8fff6eb4f419a89f8"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
