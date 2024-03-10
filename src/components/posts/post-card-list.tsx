"use client";
import { PostCard } from "@/components/posts/post-card";
import { PostCardListSkeleton } from "@/components/skeletons/skeleton-post-card-list";
import useCurrentUser from "@/hooks/use-current-user";
import usePostsSearch from "@/hooks/use-posts-search";
import { Loader2Icon } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export function PostCardList({
  queryString,
  endpoint,
}: {
  queryString: string;
  endpoint?: string;
}) {
  const [cursor, setCursor] = useState("");

  const user = useCurrentUser();

  const { isLoading, error, posts, hasMore } = usePostsSearch({
    query: queryString,
    cursor,
    endpoint,
  });

  const observer = useRef<IntersectionObserver>();
  const lastPostRef = useCallback(
    (post: HTMLDivElement) => {
      if (isLoading) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCursor(posts[posts.length - 1].id);
        }
      });

      if (post) {
        observer.current.observe(post);
      }
    },
    [isLoading, hasMore, posts],
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return posts.length ? (
    <div className="flex w-full max-w-screen-2xl flex-col items-center justify-center pb-4 md:m-4">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-1">
        {posts.map((post, i) => {
          if (i === posts.length - 1) {
            return (
              <PostCard
                ref={lastPostRef}
                key={post.sourceUrl}
                id={post.id}
                userId={post.userId || ""}
                publicId={post.publicId}
                sourceUrl={post.sourceUrl}
                thumbnailUrl={post.thumbnailUrl}
              />
            );
          }
          return (
            <PostCard
              key={post.sourceUrl}
              id={post.id}
              userId={post.userId || ""}
              publicId={post.publicId}
              sourceUrl={post.sourceUrl}
              thumbnailUrl={post.thumbnailUrl}
            />
          );
        })}
      </div>
      {isLoading && (
        <div>
          <Loader2Icon className="animate-spin" />
        </div>
      )}
    </div>
  ) : posts.length === 0 && !hasMore ? (
    <p className="flex h-full w-full items-center justify-center font-medium italic text-muted-foreground">
      No posts found...
    </p>
  ) : (
    <PostCardListSkeleton />
  );
}
