/** Typed transport error. Nothing in the UI ever sees a bare `unknown`. */
export class ApiError extends Error {
  readonly status: number;
  readonly endpoint: string;

  constructor(status: number, endpoint: string, message?: string) {
    super(message ?? `Request to ${endpoint} failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** 0 is our sentinel for "the request never reached the server". */
  get isOffline(): boolean {
    return this.status === 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function describeError(error: unknown): { title: string; detail: string } {
  if (isApiError(error)) {
    if (error.isNotFound) {
      return {
        title: "Not found",
        detail: "That Pokémon doesn’t exist in the National Pokédex.",
      };
    }
    if (error.isOffline) {
      return {
        title: "You appear to be offline",
        detail: "We couldn’t reach the Pokédex. Check your connection and try again.",
      };
    }
    return {
      title: "The Pokédex is having a moment",
      detail: `PokéAPI responded with ${error.status}. This is usually temporary.`,
    };
  }
  return {
    title: "Something went wrong",
    detail: "An unexpected error occurred while loading Pokémon data.",
  };
}
