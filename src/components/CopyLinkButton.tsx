"use client";

import { useState } from "react";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable -- nothing to fall back to silently, so no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="field-value w-full rounded-lg border border-divider px-4 py-3 text-ink"
    >
      {copied ? "הקישור הועתק" : "העתק קישור"}
    </button>
  );
}
