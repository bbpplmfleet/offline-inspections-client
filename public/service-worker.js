const cacheName = "pwapoc";
const version = "0.1.16";
const DBName = "plm_poc";
const DBVersion = 9;
const contentToCache = [
  "/",
  "/icon-192x192.png",
  "/icon-256x256.png",
  "/icons-384x384.png",
  "/icon-512x512.png",
];
const serverUrl = "https://offline-inspections-server.vercel.app";
const clientUrl = "https://offline-inspections-client.vercel.app";

// set up and upgrade
self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(async () => {
    const cache = await caches.open(cacheName + "_" + version);
    console.log("[Service Worker] Caching all: app shell and content");
    await cache.addAll(contentToCache);
  });
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    Promise.resolve().then(async () => {
      const keys = await caches.keys();

      const promises = keys
        .filter((key) => key.indexOf(version) !== 0)
        .map((key) => caches.delete(key));

      await Promise.all(promises);

      console.log("Finished removing old content");
    })
  );
});
function handleVersionChange(db) {
  db.onversionchange = (event) => {
    db.close();
    console.log(
      "A new version of this page is ready. Please reload or close this tab!"
    );
  };
}
async function initDB() {
  return new Promise((resolve, reject) => {
    const openReq = indexedDB.open(DBName, DBVersion);

    openReq.onblocked = (event) => {
      console.log("Please close all other tabs with this site open!");
    };

    openReq.onupgradeneeded = (event) => {
      let db = event.target.result;

      if (!db.objectStoreNames.contains("posts")) {
        const objectStore = db.createObjectStore("posts", { keyPath: "id" });
        objectStore.createIndex("caption", "caption", { unique: false });
        objectStore.createIndex("createdAt", "createdAt", { unique: false });
        objectStore.createIndex("localUrl", "localUrl", { unique: false });
        objectStore.createIndex("encodedUrl", "encodedUrl", { unique: false });
        objectStore.createIndex("altText", "altText", { unique: false });
      }
    };

    openReq.onsuccess = (event) => {
      let db = event.target.result;
      handleVersionChange(db);
      resolve(db); // return the db instance
    };

    openReq.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
async function handleUpload(posts) {
  let response;
  try {
    response = await fetch(`${serverUrl}/photos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ posts }),
    });
    console.log("upload post request response", response);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    throw new Error(`HTTP error! Error: ${err}`);
  }
  return JSON.stringify(response);
}
function handleNotification({ title, description, action, cta, destination }) {
  self.registration.showNotification(title, {
    icon: "/icon-192x192.png",
    body: description,
    actions: [
      {
        action,
        title: cta,
        url: destination,
      },
    ],
  });
}

async function getAllPostsFromIDB(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("posts", "readonly");
    const objectStore = transaction.objectStore("posts");
    const getAllRequest = objectStore.getAll();

    getAllRequest.onerror = () => {
      console.log("Error retrieving posts from IndexedDB");
      resolve([]); // Resolve with an empty array in case of an error
    };

    getAllRequest.onsuccess = () => {
      const posts = getAllRequest.result;
      console.log(`Retrieved ${posts.length} posts from IDB`);
      resolve(posts);
    };
  });
}
async function savePost(db, data) {
  try {
    const transaction = db.transaction(["posts"], "readwrite");
    // create an object store on the transaction
    const objectStore = transaction.objectStore("posts");

    // add our newItem object to the object store
    const objectStoreRequest = objectStore.add(data);

    objectStoreRequest.onsuccess = (event) => {
      // report the success of the request (this does not mean the item
      // has been stored successfully in the DB - for that you need transaction.onsuccess)
      console.log("data saved successful");
    };
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = reject;
    });

    console.log("data saved successful");
  } catch (error) {
    console.log("error saving data");
    throw error;
  }
}

async function deletePost(db, id) {
  const transaction = db.transaction("posts", "readwrite");
  const objectStore = transaction.objectStore("posts");

  try {
    await objectStore.delete(id);
    console.log(`Post with id ${id} deleted`);
  } catch (error) {
    console.error(`Error deleting post with id ${id}`, error);
  }
}

// caching requests
self.addEventListener("fetch", (e) => {
  if (e.request.url.indexOf("chrome-extension") !== -1) {
    console.log("a chrome extension request was fetched, but ignored");
    return;
  }
  if (e.request.url === serverUrl) {
    console.log("fetching server ping route - don't cache");
    return;
  }
  e.respondWith(
    (async () => {
      if (e.request.method !== "POST") {
        const r = await caches.match(e.request);
        if (r) {
          return r;
        }
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName + "_" + version);
        console.log(`[Service Worker] Fetched New Resource ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      }
    })()
  );
});
function formatPostForIDB(post) {
  // formats a single post for the iDB
  const formattedPost = {
    id: post.id,
    caption: post.caption,
    createdAt: post.createdAt,
    localUrl: post.photo.url,
    encodedUrl: post.photo.encoded,
    altText: post.photo.name,
  };
  return formattedPost;
}
function formatPostsForServerDB(posts) {
  // accepts a list of posts from IDB and returns the server db schema
  let formattedPosts = [];
  posts.forEach((post) => {
    let newPhoto = {
      url: post.localUrl,
      encoded: post.encodedUrl,
      name: post.altText,
    };
    let newPost = {
      id: post.id,
      caption: post.caption,
      createdAt: post.createdAt,
      photo: newPhoto,
    };
    formattedPosts.push(newPost);
  });
  return formattedPosts;
}
// SYNC
// Network is back up, we're being awaken, let's do the requests we were trying to do before if any.
self.addEventListener("sync", async (event) => {
  if (event.tag === "retry-failed-posts") {
    const db = await initDB();
    let posts = await getAllPostsFromIDB(db);
    if (posts.length > 0) {
      let formattedPosts = formatPostsForServerDB(posts);
      try {
        const response = await handleUpload(formattedPosts);
        if (response.message === "success") {
          // Remove posts from IndexedDB
          for (let post of posts) {
            await deletePost(db, post.id);
          }

          // Notify the user their data was successfully saved
          handleNotification({
            title: "Your pending posts have been uploaded!",
            description: "You can view them here",
            action: "view-results",
            cta: "Open App",
            destination: `${clientUrl}/photos`,
          });
        } else {
          // Notify the user they posts were not automatically uploaded
          handleNotification({
            title: "Your locally saved data wasn't uploaded",
            description: "We detected connectivity but couldn't upload them",
            action: "retry-uploads",
            cta: "Open App",
            destination: `${clientUrl}`,
          });
        }
      } catch (error) {
        // Handle network errors or fetch-related issues
        console.error("Error uploading", error);
        // Perform other actions as needed
      }
    }
  }
});
function requestBackgroundSync() {
  if (!self.registration.sync) {
    return;
  }
  // We're offline.
  // Register a Background Sync to do the query again later when online.
  self.registration.sync.register("retry-failed-posts");
}

// WORKBOX 2-WAY MESSAGING
self.addEventListener("message", async (e) => {
  let data = e.data;
  console.log("Message Event Accessed");
  const db = await initDB();

  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
    e.ports[0].postMessage("hasNew");
  }

  if (data && data.type === "UPLOAD_TO_DB") {
    try {
      const response = await handleUpload(e.data.posts);
      console.log("upload to db res: ", response);
      e.ports[0].postMessage(response);
    } catch (err) {
      console.log("something failed uploading to db");
      requestBackgroundSync();
      e.ports[0].postMessage("failure");
    }
  }

  // ADD POST ===============================
  if (data && data.type === "CACHE_POST") {
    const formattedPost = formatPostForIDB(e.data.post);
    try {
      await savePost(db, formattedPost);
      e.ports[0].postMessage("Posts successfully cached");
    } catch (err) {
      e.ports[0].postMessage("error saving post", err);
    }
  }
  // GET ALL ================================
  if (e.data && e.data.type === "GET_ALL_POSTS") {
    let posts = await getAllPostsFromIDB(db);
    if (posts.length > 0) {
      e.ports[0].postMessage({ type: "GET_ALL_POSTS", posts });
    } else {
      e.ports[0].postMessage({
        type: "ERROR",
        message: "Error retrieving posts",
      });
    }
  }
  // REMOVE POST
  if (e.data && e.data.type === "REMOVE_POST") {
    const id = e.data.postId;
    await deletePost(db, id);
    e.ports[0].postMessage({ type: "POST_REMOVED" });
  }
});
