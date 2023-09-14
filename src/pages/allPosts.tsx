"use client";
import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import axios from "axios";
import Photo from "../components/photo";
import { PostSchemaType } from "../types";
import AppHeader from "../components/appHeader";
import { serverUrl } from "../App";
export default function AllPosts() {
  const [posts, setPosts] = useState<PostSchemaType[]>();
  const [loading, setLoading] = useState(false);

  async function getPhotos() {
    setLoading(true);
    try {
      let result = await axios.get(`${serverUrl}/photos`);
      console.log(result.data);
      setPosts(result.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    getPhotos();
  }, []);
  return (
    <>
      <AppHeader activeTab="/photos" />
      <div className=" max-w-4xl mx-auto h-full px-6 ">
        <Text fontSize={"3xl"} className={"pt-12 mb-6 text-white"}>
          All Photos
        </Text>
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <>
            {!!posts && posts.length > 0 ? (
              <div className={"flex flex-row flex-wrap gap-2"}>
                {posts.map((post: PostSchemaType) => {
                  return (
                    <div key={post.id}>
                      <Photo post={post} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-white">No posts yet</div>
            )}
          </>
        )}
      </div>
    </>
  );
}
