import { useReducer, useEffect } from "react";
import PostForm from "../components/postForm";
import UploadingStatus from "../components/uploadingStatus";
import FileUploadPreview from "../components/fileUploadPreview";
import { PostType, FileType } from "../types";
import { getAllFromCache } from "../serviceWorkerConnector";
import AppHeader from "../components/appHeader";
export default function UploadPosts() {
  // state lifecycle
  // on page load, check if there are any posts in the cache - add these to the failed posts list
  // if there are no cached posts on load do nothing
  // when a new photo is made, add it to the cache to be cautious.
  // when an upload request is made,
  // if the request succeeds, remove posts from post list and remove it from cache
  // if it fails, add them to the failed list (for user validation)
  // when a failed request is retried and succeeds, remove posts from cache
  // so ---- posts are always cached when added to the post list,
  //         posts are only removed from post list if the post request was successful
  //         posts are always removed from cache when removed from failed list
  // @ts-expect-error
  const reducer = (state, action) => {
    switch (action.type) {
      case "ADD_FILE_TO_LIST":
        return { ...state, postList: state.postList.concat(action.post) };
      case "REMOVE_FILE_FROM_LIST":
        return {
          ...state,
          postList: state.postList.filter((post: PostType) => {
            return post.id !== action.id;
          }),
        };
      case "ADD_FILE_TO_FAILED_LIST":
        return {
          ...state,
          failedRequestList: state.failedRequestList.concat(
            action.failures.filter(
              (post: FileType) => state.failedRequestList.indexOf(post) === -1
            )
          ),
        };
      case "REMOVE_FILE_FROM_FAILED_LIST":
        return {
          ...state,
          failedRequestList: state.failedRequestList.filter(
            (post: PostType) => post.id !== action.id
          ),
        };
      case "HANDLE_FAILED_REQUEST":
        return {
          ...state,
          postList: [],
          failedRequestList: state.failedRequestList.concat(
            action.failures.filter(
              (post: FileType) => state.failedRequestList.indexOf(post) === -1
            )
          ),
        };
      case "SET_UPLOADING":
        return { ...state, uploading: action.uploading };
      default:
        return state;
    }
  };
  const [data, dispatch] = useReducer(reducer, {
    postList: [],
    failedRequestList: [],
    uploading: false,
  });

  async function fetchCache() {
    let posts = await getAllFromCache();
    if (!!posts && posts.length > 0) {
      console.log(`${posts.length} posts in cache`);
      dispatch({ type: "ADD_FILE_TO_FAILED_LIST", failures: posts });
    } else {
      console.log("No posts in cache");
    }
  }
  useEffect(() => {
    console.log(navigator);
    if ("serviceWorker" in navigator) {
      console.log("A service worker exists in navigator");
      // navigator.permissions
      //   .query({ name: "periodic-background-sync" })
      //   .then((status) => {
      //     console.log("background-sync permissions:", status);
      //   });
      navigator.serviceWorker.register("/service-worker.js").then(async () => {
        fetchCache();
        // console.log("sync init started");
        // await requestBackgroundSyncForFailedPosts(registration);
        // console.log("sync init finished");
        // registerBackgroundSync();
        // Use type assertion to handle TypeScript error
        // if ("SyncManager" in window && (registration as any).sync) {
        //   (registration as any).sync.register("failed-upload", {
        //     maxRetentionTime: 24 * 60,
        //   });
        //   console.log("Registering: SYNC MANAGER");
        //   console.log(registration);
        // }
      });
    }
  }, []);

  return (
    <>
      <AppHeader activeTab="/" />

      <main
        id="upload-page"
        className="flex min-h-screen flex-col items-start justify-start p-12 bg-black w-full"
      >
        <UploadingStatus data={data} dispatch={dispatch} />
        <div
          id="form-container"
          className={
            "flex flex-row gap-6 w-full overflow-hidden flex-wrap md:flex-nowrap"
          }
        >
          <PostForm dispatch={dispatch} />
          <div id="preview-container" className={"flex-1"}>
            <FileUploadPreview
              fileData={data.postList}
              dispatch={dispatch}
              status={"draft"}
            />
            <FileUploadPreview
              fileData={data.failedRequestList}
              dispatch={dispatch}
              status={"failed"}
            />
          </div>
        </div>
      </main>
    </>
  );
}
