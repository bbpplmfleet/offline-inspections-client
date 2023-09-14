import React, { useRef, useState } from "react";
import { Text, Button } from "@chakra-ui/react";
import { FileType } from "../types";

// displays a beautiful photo input on desktop devices with drag and drop
// todo: on devices with a camera, render a "take photo button"
export interface ISmartPhotoInput {
  currentPhoto: FileType | undefined;
  setCurrentPhoto: (file: FileType | undefined) => void;
}
export default function SmartPhotoInput({
  currentPhoto,
  setCurrentPhoto,
}: ISmartPhotoInput) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inDropZone, setInDropZone] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const handleDragEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInDropZone(true);
  };

  // onDragLeave sets inDropZone to false
  const handleDragLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setInDropZone(false);
  };

  // onDragOver sets inDropZone to true
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // set dropEffect to copy i.e copy of the source item
    e.dataTransfer.dropEffect = "copy";
    setInDropZone(true);
  };

  // onDrop sets inDropZone to false and adds files to postList
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inDropZone) return;
    // get files from event on the dataTransfer object as an array
    let file = e.dataTransfer.files[0];

    // ensure a file or files are dropped
    if (file) {
      let photo: FileType = await generateFileData(file);
      setCurrentPhoto(photo);
      // reset inDropZone to false
      setInDropZone(false);
    }
  };
  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr);
      fr.onerror = (err) => reject(err);
      URL.createObjectURL(file);
      fr.readAsDataURL(file);
    });

  // handle file selection via input element
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("HERE IN FILE SELECT");
    // get files from event on the input element as an array
    setImageUploading(true);
    // @ts-expect-error
    let file = e.target.files[0];
    console.log("uploaded", file);
    // ensure a file or files are selected
    if (file) {
      let photo: FileType = await generateFileData(file);
      setCurrentPhoto(photo);
      setImageUploading(false);
    }
  };
  async function generateFileData(file: File): Promise<FileType> {
    console.log("reading file", file);
    let url: string = "";
    let encoded: string = "";
    try {
      let encodedReader = await toBase64(file);
      // @ts-expect-error
      encoded = encodedReader.result;
    } catch (e) {
      console.log(e);
    }
    try {
      url = URL.createObjectURL(file);
    } catch (e) {
      console.log(e);
    }
    let newPhoto: FileType = {
      url,
      encoded,
      name: currentPhoto?.name || "",
    };
    setCurrentPhoto(newPhoto);
    return newPhoto;
  }
  return (
    <div className="h-80 w-96 overflow-hidden relative bg-gray-800 rounded flex gap-2 p-0.5 flex-col items-center justify-center">
      {imageUploading ? <>Uploading</> : <></>}
      {currentPhoto ? (
        <div className="h-full w-full relative  ">
          <Button
            onClick={() => setCurrentPhoto(undefined)}
            className={"absolute p-2 bg-red-200 top-1 left-1 z-20"}
            color={"red.600"}
            variant={"unstyled"}
          >
            Remove
          </Button>
          <div className={"h-full flex flex-col items-center justify-center"}>
            <img
              src={currentPhoto.url as string}
              alt={currentPhoto.name}
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      ) : (
        <div
          className={
            "relative h-full w-full p-10 bg-gray-900 rounded flex gap-2 flex-col justify-center items-center"
          }
          onDrop={(e) => handleDrop(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDragEnter={(e) => handleDragEnter(e)}
          onDragLeave={(e) => handleDragLeave(e)}
        >
          <input
            id="fileSelect"
            type="file"
            ref={inputRef}
            onClick={(e) => e.stopPropagation()}
            className="z-100 absolute h-full w-full top-0 opacity-0"
            onChange={async (e) => await handleFileSelect(e)}
          />
          <label htmlFor="fileSelect" className="text-gray-500 z-1">
            <Button
              onClick={() => inputRef.current?.click()}
              colorScheme={"blue"}
              color={"blue.500"}
              variant={"outline"}
            >
              Browse Files
            </Button>
          </label>

          <Text color={"gray.500"} className="text-center">
            or drag &amp; drop your files here
          </Text>
        </div>
      )}
    </div>
  );
}
