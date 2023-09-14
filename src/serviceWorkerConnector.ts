import { Workbox } from "workbox-window";
import { toastHelper } from "./components/utils";
import { DBPostType, FileType, PostType } from "./types";

export async function handleUploadPostsForSync(posts: PostType[]) {
  console.log("in SW connector (uploading)");
  try {
    const wb = new Workbox("/service-worker.js");
    console.log("wb", wb);
    wb.register();
    let message = await wb.messageSW({
      type: "UPLOAD_TO_DB",
      posts: posts,
    });
    if (message === "success") {
      posts.forEach((post) => removeFromCache(post));
      return true;
    }
  } catch (err) {
    console.log("Failed to upload:", err);
    return false;
  }
}
export async function removeFromCache(postToRemove: PostType) {
  try {
    const wb = new Workbox("/service-worker.js");
    wb.register();
    const message = await wb.messageSW({
      type: "REMOVE_POST",
      postId: postToRemove.id,
    });
    console.log("successfully removed post from cache");
    return message;
  } catch (error) {
    console.error(
      "Error sending message to service worker to remove post ",
      error
    );
    toastHelper({
      type: "warn",
      message:
        "We couldn't remove your post locally, you might see a duplicate soon",
    });
  }
}

export async function addToCache(postToCache: PostType) {
  try {
    const wb = new Workbox("/service-worker.js");
    console.log("wb", wb);
    wb.register();
    let message = await wb.messageSW({
      type: "CACHE_POST",
      post: postToCache,
    });
    console.log("Successfully added post to cache");
    return message;
  } catch (err) {
    console.log("failed adding post to cache", err);
    toastHelper({
      type: "error",
      message:
        "Something went wrong saving your post for offline support - don't close the app",
    });
  }
}

export async function getAllFromCache() {
  try {
    const wb = new Workbox("/service-worker.js");
    wb.register();
    let posts = await wb.messageSW({ type: "GET_ALL_POSTS" });
    let formattedPosts: PostType[] = [];
    posts.posts.forEach((post: DBPostType) => {
      let newPhoto: FileType = {
        url: post.localUrl,
        encoded: post.encodedUrl,
        name: post.altText,
      };
      let newPost: PostType = {
        id: post.id,
        caption: post.caption,
        createdAt: post.createdAt,
        photo: newPhoto,
      };
      formattedPosts.push(newPost);
    });
    console.log("successfully got all posts from cache");
    return formattedPosts;
  } catch (err) {
    console.log("error getting all posts from cache", err);
    toastHelper({
      type: "error",
      message: "Something went wrong saving your post for offline support",
    });
    return [];
  }
}
