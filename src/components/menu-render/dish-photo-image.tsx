"use client";

import { useEffect, useRef, useState } from "react";

import { DishPhotoPlaceholder } from "@/components/menu-render/dish-photo-placeholder";

export interface DishPhotoImageProps {
  /** `null`/`undefined` covers 3 of the 4 fallback cases up front — findDishPhoto already collapsed "nothing found" / rate-limited / provider-or-network-error into no URL at all. */
  src: string | null | undefined;
  alt: string;
  categoryName: string;
  className?: string;
}

/**
 * The 4th fallback case — a photo URL that was valid when cached but 404s
 * (or otherwise fails to load) by the time a visitor's browser requests it
 * — is a client-side concern the other 3 cases aren't: it can only be
 * detected by actually trying to load the image. `onError` swaps to the
 * exact same DishPhotoPlaceholder the other 3 cases render.
 *
 * A server-rendered `<img>` starts loading as soon as the browser parses
 * the HTML — before React hydrates and attaches its `onError` listener.
 * The `error` DOM event doesn't bubble and doesn't replay for a listener
 * attached after it already fired, so a photo that's already dead by the
 * time the page loads (verified against a real broken Pexels URL: the
 * native event fired and was silently missed) would otherwise get stuck
 * showing a broken-image icon forever — exactly what this component
 * exists to prevent. The mount-time check below catches that case:
 * `complete && naturalWidth === 0` is the browser's own signature for "this
 * finished loading and failed," true whether the failure happened before
 * or after hydration.
 */
export function DishPhotoImage({ src, alt, categoryName, className }: DishPhotoImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (!src || failed) {
    return <DishPhotoPlaceholder categoryName={categoryName} className={className} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- external hotlinked Pexels/user-upload URL, not a local asset next/image can optimize. */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        style={{ objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    </>
  );
}
