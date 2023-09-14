import { Dispatch } from "react";
import {
  Text,
  Tag,
  TagLabel,
  Menu,
  MenuButton,
  MenuList,
} from "@chakra-ui/react";
import { PostType } from "../types";
import { MoreVertical } from "@styled-icons/fluentui-system-filled/MoreVertical";
import ConfirmDelete from "./confirmDelete";
import { toastHelper } from "./utils";
import { removeFromCache } from "../serviceWorkerConnector";
const FileUploadPreview = ({
  fileData,
  dispatch,
  status,
}: {
  fileData: PostType[] | undefined;
  dispatch: Dispatch<any>;
  status: "draft" | "failed";
}) => {
  // const db = useDB();
  // async function removeFromDB(postIds: string[]) {
  //   postIds.forEach(async (post) => {
  //     let exists = await (await db).get("post", post);
  //     if (exists) {
  //       await (await db).delete("post", post);
  //     }
  //   });
  // }
  function getTitle(status: string) {
    if (status === "draft") {
      return "New Posts";
    } else {
      return "Failed Uploads";
    }
  }

  return (
    <div className={"flex flex-col justify-start flex-0 mb-6  w-full "}>
      <div className="flex flex-row justify-between items-center w-full border-b border-b-gray-700">
        <Text fontSize={"xl"} color={"gray.600"} as={"b"}>
          {getTitle(status)}
        </Text>
        {!fileData || fileData?.length === 0 ? (
          <Tag color={"blue.300"} backgroundColor={"blue.900"}>
            <TagLabel>No Posts Yet</TagLabel>
          </Tag>
        ) : (
          <Tag color={"blue.300"} backgroundColor={"blue.900"}>
            <TagLabel>
              {fileData.length} Post{fileData.length !== 1 ? "s" : ""}
            </TagLabel>
          </Tag>
        )}
      </div>
      <ol
        className={"flex flex-row flex-wrap  w-full overflow-x-auto gap-2 mt-4"}
      >
        {fileData?.map((post) => {
          return (
            <li
              key={post.photo.url as string}
              className={
                " flex bg-gray-950 border-2 border-gray-800 pb-4 rounded-xl overflow-hidden"
              }
            >
              <div className="flex flex-col w-full">
                <div className=" w-56 relative h-60 overflow-hidden rounded-lg flex flex-col justify-start items-start bg-slate-800 z-1">
                  {status === "failed" ? (
                    <div className="absolute right-2 top-2 z-20">
                      <Tag color={"red.500"} colorScheme={"red"}>
                        <TagLabel>Upload Failed</TagLabel>
                      </Tag>
                    </div>
                  ) : (
                    <></>
                  )}
                  <img
                    src={post.photo.encoded as string}
                    alt={post.photo.name}
                    style={{ objectFit: "contain" }}
                    className="z-1"
                  />
                </div>
                <div className="flex flex-row flex-nowrap px-4 pt-3 justify-between">
                  <Text
                    color={!!post.caption ? "gray.300" : "gray.500"}
                    as={!!post.caption ? "p" : "i"}
                    className="z-20 flex-0"
                  >
                    {post.caption || "No Caption"}
                  </Text>
                  <Menu colorScheme="blue.800">
                    <MenuButton>
                      <MoreVertical size={"18px"} color="#FFFFFF" />
                    </MenuButton>
                    <MenuList bgColor={"gray.900"}>
                      <ConfirmDelete
                        handleDelete={async () => {
                          dispatch({
                            type:
                              status === "failed"
                                ? "REMOVE_FILE_FROM_FAILED_LIST"
                                : "REMOVE_FILE_FROM_LIST",
                            id: post.id,
                          });
                          await removeFromCache(post);
                          toastHelper({ message: "Post Deleted" });
                        }}
                      />
                    </MenuList>
                  </Menu>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default FileUploadPreview;
