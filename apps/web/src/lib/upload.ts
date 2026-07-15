import { API_URL, ApiError, getToken } from "@/lib/api";

export type UploadType = "logo" | "cover" | "menu" | "general";

/** Upload an image to the API (Cloudinary or local fallback) and return its URL. */
export async function uploadImage(file: File, type: UploadType = "general"): Promise<string> {
  const token = getToken();
  const body = new FormData();
  body.append("file", file);
  body.append("type", type);

  const res = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    // NB: no Content-Type — the browser sets the multipart boundary itself.
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, payload?.message ?? "Téléversement échoué.", payload?.errors);
  }

  return payload.url as string;
}
