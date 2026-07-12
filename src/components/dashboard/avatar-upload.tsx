"use client";

import { useRef, useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { profileApi } from "@/lib/api-client/profile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface AvatarUploadProps {
  initialAvatarUrl: string | null;
  name: string;
}

export function AvatarUpload({ initialAvatarUrl, name }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const profile = await profileApi.uploadAvatar(file);
      setAvatarUrl(profile.avatar_url);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не вдалося завантажити аватар.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={avatarUrl} name={name} size="lg" />
      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          Змінити фото
        </Button>
        <p className="text-caption text-foreground-tertiary">JPG, PNG або WebP, до 2MB</p>
        {error && <p className="text-caption text-error-600">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => void handleFileChange(event)}
        />
      </div>
    </div>
  );
}
