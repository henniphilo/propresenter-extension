import { HttpProPresenterClient } from "./http";
import { mockProPresenterClient } from "./mock";
import type { ProPresenterClient } from "./types";

/**
 * Returns HTTP client when `overrideBaseUrl` or `PROPRESENTER_BASE_URL` is set
 * (unless `PROPRESENTER_USE_MOCK=true`); otherwise returns the mock.
 */
export function getProPresenterClient(overrideBaseUrl?: string | null): ProPresenterClient {
  if (process.env.PROPRESENTER_USE_MOCK === "true") {
    return mockProPresenterClient;
  }

  const base =
    overrideBaseUrl?.trim() ||
    (typeof process !== "undefined"
      ? process.env.PROPRESENTER_BASE_URL?.trim()
      : undefined);

  if (base) {
    return new HttpProPresenterClient({
      baseUrl: base,
      apiToken: process.env.PROPRESENTER_TOKEN,
    });
  }

  return mockProPresenterClient;
}
