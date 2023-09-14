import {
  handleUploadPostsForSync,
  removeFromCache,
} from "../serviceWorkerConnector";
import { PostType } from "../types";
import { toastHelper } from "./utils";
import { Button, Progress, Text } from "@chakra-ui/react";

export default function UploadingStatus({
  data,
  dispatch,
}: {
  data: any;
  dispatch: (args: any) => void;
}) {
  const uploadFiles = async (posts: PostType[]) => {
    dispatch({ type: "SET_UPLOADING", uploading: true });
    // use the SW to upload so we can more easily register a bg sync
    console.log("starting upload");
    let posted = await handleUploadPostsForSync(posts);
    console.log("posted", posted);
    if (posted) {
      toastHelper({
        message: "Post Uploaded Successfully!",
        type: "success",
      });
      posts.forEach(async (post) => {
        // todo: refactor these to accept a list;
        dispatch({ type: "REMOVE_FILE_FROM_LIST", id: post.id });
        dispatch({ type: "REMOVE_FILE_FROM_FAILED_LIST", id: post.id });
        await removeFromCache(post);
      });
    } else {
      dispatch({ type: "HANDLE_FAILED_REQUEST", failures: posts });
      toastHelper({
        message: "Error uploading - your data has been saved",
        type: "error",
      });
    }
    dispatch({ type: "SET_UPLOADING", uploading: false });
  };

  return (
    <>
      <div className="overflow-hidden relative flex py-3 px-6 bg-gray-800 rounded-lg my-4 flex-row justify-between items-center w-full">
        {data.uploading ? (
          <div className="h-1 absolute w-full inset-x-0 bottom-0">
            <Progress isIndeterminate />
          </div>
        ) : (
          <></>
        )}

        <div>
          <Text className="text-white">
            {data.postList.length} File{data.postList.length === 1 ? "" : "s"}{" "}
            Ready to Upload
          </Text>
          {data.failedRequestList.length > 0 ? (
            <div className="flex flex-row items-center">
              <Text className="text-white">
                {data.failedRequestList.length} File
                {data.failedRequestList.length === 1 ? "" : "s"} Failed to
                Upload
              </Text>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className={"flex flex-row gap-2"}>
          {data.failedRequestList.length !== 0 && (
            <Button
              variant={"contained"}
              colorScheme="red"
              disabled={data.uploading}
              className={"text-red-800 bg-red-200 px-3"}
              onClick={() => uploadFiles(data.failedRequestList)}
            >
              Try Again
            </Button>
          )}
          {data.postList.length !== 0 && (
            <Button
              disabled={data.uploading || data.postList.length === 0}
              variant="contained"
              className={"text-green-800 bg-green-200 px-3 "}
              onClick={() => uploadFiles(data.postList)}
            >
              Upload New Posts
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
