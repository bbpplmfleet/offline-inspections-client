import { useState } from "react";
import { Text, Button, Input } from "@chakra-ui/react";
import { FileType, PostType } from "../types";
import { nanoid } from "nanoid";
import { toastHelper } from "./utils";
import SmartPhotoInput from "./smartPhotoInput";
import { addToCache } from "../serviceWorkerConnector";
export default function PostForm({
  dispatch,
}: {
  dispatch: (args: any) => void;
}) {
  const [caption, setCaption] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState<FileType>();

  const handleSubmit = async () => {
    const id = nanoid();

    if (currentPhoto == undefined) {
      toastHelper({ message: "You need to upload a photo", type: "warn" });
      return;
    } else {
      let formattedPost: PostType = {
        id: `plmpoc_${id}`,
        caption,
        photo: currentPhoto,
        createdAt: new Date(),
      };
      console.log(formattedPost);

      let saved: string = await addToCache(formattedPost);
      console.log("saved", saved);
      if (!!saved) {
        setCaption("");
        setCurrentPhoto(undefined);
        dispatch({ type: "ADD_FILE_TO_LIST", post: formattedPost });
        toastHelper({
          type: "info",
          message: "Post Saved With Offline Support",
        });
      } else {
        console.log("not saved", saved);
        toastHelper({ type: "error", message: "We couldn't save your post" });
      }
    }
  };

  return (
    <div>
      <div
        className={
          "flex flex-0 flex-col gap-4 max-h-max p-2 border border-gray-500 bg-gray-950 rounded-md border-solid"
        }
      >
        <Text fontSize={"xl"} color={"gray.600"} as={"b"}>
          Create New Post
        </Text>

        <SmartPhotoInput
          currentPhoto={currentPhoto}
          setCurrentPhoto={setCurrentPhoto}
        />

        <Input
          colorScheme="gray.500"
          placeholder="Caption your photo"
          value={caption}
          className="text-white"
          onChange={(e) => setCaption(e.currentTarget.value)}
        />
        <Button
          variant={"contained"}
          className="bg-blue-600 "
          onClick={() => handleSubmit()}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
