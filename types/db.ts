export type PostBlock =
  | { type: "title"; text: string }
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "divider" }
  | { type: "image"; bucket: "post-media" | "post-covers"; path: string; alt?: string }
  | { type: "video"; bucket: "post-media"; path: string };

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: PostBlock[];
  cover_path: string | null;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

export type CommentRow = {
  id: string;
  post_id: string;
  parent_id: string | null;
  display_name: string;
  body: string;
  created_at: string;
};
