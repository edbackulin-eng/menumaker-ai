import { fetchJson, postFormData } from "@/lib/api-client/fetch-json";
import type { UpdateProfileInput } from "@/lib/validations/profile";
import type { Tables } from "@/types/database.types";

export type Profile = Tables<"profiles">;

export const profileApi = {
  update(input: UpdateProfileInput): Promise<Profile> {
    return fetchJson<Profile>("/api/profile", { method: "PATCH", body: JSON.stringify(input) });
  },

  uploadAvatar(file: File): Promise<Profile> {
    const form = new FormData();
    form.set("file", file);
    return postFormData<Profile>("/api/profile/avatar", form);
  },

  deleteAccount(): Promise<void> {
    return fetchJson<void>("/api/profile", { method: "DELETE" });
  },
};
