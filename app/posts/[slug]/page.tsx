import { notFound } from "next/navigation";
import PostRenderer from "@/components/PostRenderer";
import Comments from "@/components/Comments";
import { getPostBySlug, getCommentsForPost } from "@/lib/queries/posts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const comments = await getCommentsForPost(post.id);

  return (
    <>
      <PostRenderer blocks={post.content} />
      <Comments postId={post.id} initialComments={comments} />
    </>
  );
}
