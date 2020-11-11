'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "9d44c8255e31ca2c0ed79d8ea05e66f4",
"assets/assets/resources/100%2525.png": "9139bc01813e851eb2229179f2e44add",
"assets/assets/resources/4390105.jpg": "3831131c5c2870074f6c355eb612d197",
"assets/assets/resources/add-user.png": "51f9da33e773101c66d905f5c30f92f8",
"assets/assets/resources/attendance.png": "cdd81f1fbe88fbf692a2dc2db1e22fc8",
"assets/assets/resources/avatar.png": "a5e81f19cf2c587876fd1bb08ae0249f",
"assets/assets/resources/calenderL.png": "d42fdeeb4e28a0d596736cb6a330fa46",
"assets/assets/resources/card.png": "5a3584fb171012d4c56c0c4efccc0700",
"assets/assets/resources/company.png": "d8e6dbe072df372948b6a2e4247b636d",
"assets/assets/resources/Date.jpg": "3ff1a717b5cddffe272bde065a81bde4",
"assets/assets/resources/department.png": "85a33d2c9e48a8ed7aaca36b359d4b95",
"assets/assets/resources/employee.png": "535713b8276dd48de88a32aaba232ace",
"assets/assets/resources/exit.png": "2c9d9b37b2e380c82a7ddb51984ae86b",
"assets/assets/resources/file.png": "27a539ffab02b2b7492510ffbe1185bd",
"assets/assets/resources/help.png": "1f38e34a97d56d412c13c3a378e70846",
"assets/assets/resources/home.png": "c2585e1832bab44dd25caec89d216369",
"assets/assets/resources/logo.png": "592ba7ecfaf3e39f92a99a1643370302",
"assets/assets/resources/notification.png": "18a2495ca85b1349d0b23c25f8042a28",
"assets/assets/resources/Oct%2520Calender.png": "3fc65d9e5dd1512bd598763ae3878ea9",
"assets/assets/resources/pencil.png": "ee8b7c1058038a66bc2930ce3456fb60",
"assets/assets/resources/printer.png": "1c504a4e9a259c7a9256d120268ace53",
"assets/assets/resources/register.jpg": "4c50bdf3beaf739ea371f823ce4665db",
"assets/assets/resources/search.png": "050e383013ee0376828f450d7ae52089",
"assets/assets/resources/Timesheet.png": "d36828d3a6978688e6e13e6cc1cf2073",
"assets/assets/resources/user-add-icon.png": "07d04ca7294f196cede39a43d5c20b7a",
"assets/assets/resources/user.png": "02723a8b181c646ad15095dd4786dac1",
"assets/assets/resources/view.png": "b4e37515c097d277870113f7659b0888",
"assets/assets/resources/wages.jpg": "efc1de8e6c5a989dbd7a7bf31bf65e19",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"assets/NOTICES": "ce32d25fd2d8b7ab9852ef32ca52d442",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"favicon.png": "5a66d411eebfbd9065cc6c755790e914",
"icons/Icon-192.png": "76d3b74aca70cbb4badd43b97cdd2613",
"icons/Icon-512.png": "ff62081d2f2b8dcc16dc073115f06487",
"index.html": "f8ebe9559430ae43d3dd504334fd3efb",
"/": "f8ebe9559430ae43d3dd504334fd3efb",
"main.dart.js": "bb7ad273428c9cbd4eb21f7e12369a36",
"manifest.json": "6b05c0938683b615ce9bfd342a6f3247",
"version.json": "5512e547f163ede48c48ace013c3387e"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
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
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
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
  for (var resourceKey in Object.keys(RESOURCES)) {
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
