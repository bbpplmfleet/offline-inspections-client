import { PostSchemaType } from "../types";
import { Text } from "@chakra-ui/react";

export default function Photo({ post }: { post: PostSchemaType }) {
  return (
    <div className="bg-gray-800 flex flex-col p-2 pb-4 rounded-lg gap-2 h-full w-full">
      <a href={post.imageUrl} className={"border-blue border-2"}>
        <Text>link</Text>
      </a>
      {/* <div className="w-56 relative h-60 overflow-hidden rounded-lg flex flex-col justify-start items-start bg-slate-900 z-1">
        <img
          src={post.imageUrl}
          alt={post.imageAlt}
          style={{ objectFit: "contain" }}
          className="rounded-md h-48"
        />

        <p>{post.imageUrl}</p>
      </div> */}
      <Text fontSize={"md"} color={"gray.300"}>
        {post.caption || <i>No Caption</i>}
      </Text>

      <Text>{post.imageUrl}</Text>
      {/* {!!post.createdAt ? (
        <Text>{post.createdAt.toISOString()}</Text>
      ) : (
        <>
          <Text>No Date</Text>
        </>
      )} */}
    </div>
  );
}
