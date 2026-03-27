type ApiErrorShape = {
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

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const target = typeof input === "string" ? `${baseUrl}${input}` : input;

  const response = await fetch(target, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as { data?: T } & ApiErrorShape;

  if (!response.ok || payload.error) {
    const message = payload.error?.message ?? `Request failed with ${response.status}`;
    throw new ApiError(message, response.status, payload.error?.details);
  }

  if (typeof payload.data === "undefined") {
    throw new ApiError("Invalid API response shape.", response.status);
  }

  return payload.data;
}
