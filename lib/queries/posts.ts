import { supabaseClient } from "@/lib/supabase/client";
import type { PostRow, CommentRow } from "@/types/db";

export async function getPostBySlug(slug: string): Promise<PostRow | null> {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) return null;
  return data as PostRow;
}

export async function getLatestPosts(limit = 6): Promise<PostRow[]> {
  const { data } = await supabaseClient
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as PostRow[];
}

export async function getNewestPost(): Promise<PostRow | null> {
  const posts = await getLatestPosts(1);
  return posts[0] ?? null;
}

export async function getCommentsForPost(postId: string): Promise<CommentRow[]> {
  const { data } = await supabaseClient
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return (data ?? []) as CommentRow[];
}
