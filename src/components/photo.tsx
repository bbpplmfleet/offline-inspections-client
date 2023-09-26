import { PostSchemaType } from "../types";
import { Text, Link } from "@chakra-ui/react";

export default function Photo({ post }: { post: PostSchemaType }) {
  console.log(post);
  console.log(post.imageUrl);
  return (
    <div className="bg-gray-800 flex flex-col p-2 pb-4 rounded-lg gap-2 h-full w-full">
      <Link
        href={post.imageUrl}
        isExternal
        className={"border-blue-600 border-2 text-white-900"}
      >
        Link
      </Link>
      <div className="w-56 relative h-60 overflow-hidden rounded-lg flex flex-col justify-start items-start bg-slate-900 z-1">
        <img
          //@ts-expect-error
          src={post.image_url}
          alt={post.imageAlt}
          style={{ objectFit: "contain" }}
          className="rounded-md h-48"
        />
      </div>
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
