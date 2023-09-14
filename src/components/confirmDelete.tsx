import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
  MenuItem,
} from "@chakra-ui/react";
import { Delete } from "@styled-icons/fluentui-system-filled/Delete";

export default function ConfirmDelete({
  handleDelete,
}: {
  handleDelete: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<any>();

  return (
    <>
      <MenuItem onClick={() => onOpen()}>
        <Delete size={"18px"} className="mr-2 -mt-1 text-red-400" />
        Delete
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bgColor={"gray.800"}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={"white"}>
              Delete Post
            </AlertDialogHeader>

            <AlertDialogBody color={"white"}>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant={"outline"}
                color={"blue.400"}
                colorScheme="blue"
              >
                Cancel
              </Button>
              <Button
                variant={"solid"}
                colorScheme="red"
                className={"text-red-600 hover:text-white"}
                onClick={() => {
                  handleDelete();
                  onClose();
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
