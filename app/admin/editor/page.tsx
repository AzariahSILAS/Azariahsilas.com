import { Suspense } from "react";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EditorPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading editor…</div>}>
      <EditorClient />
    </Suspense>
  );
}
