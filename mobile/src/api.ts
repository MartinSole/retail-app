type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload.error) {
    throw new ApiError(
      payload.error?.message ?? `Request failed with status ${response.status}.`,
      response.status,
      payload.error?.details,
    );
  }

  if (typeof payload.data === "undefined") {
    throw new ApiError("Invalid response payload.", response.status);
  }

  return payload.data;
}
