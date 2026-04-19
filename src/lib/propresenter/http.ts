import type {
  ProPresenterClient,
  ProPresenterConnectionConfig,
  ProPresenterPresentationSummary,
  ProPresenterStatus,
} from "./types";

/**
 * HTTP client mapped to Renewed Vision’s public REST surface (OpenAPI).
 * Paths may vary by minor ProPresenter version — adjust `paths` against
 * https://openapi.propresenter.com/ for your installation.
 */
const paths = {
  /** Placeholder — replace with exact OpenAPI route for your PP version */
  status: "/v1/status",
  presentations: "/v1/presentations",
  activeSlide: "/v1/slide/active",
  next: "/v1/slide/next",
  previous: "/v1/slide/previous",
  triggerPresentation: "/v1/presentation/active",
  stageMessage: "/v1/stage/message",
} as const;

export class HttpProPresenterClient implements ProPresenterClient {
  private readonly base: string;

  private headers: Record<string, string>;

  constructor(config: { baseUrl: string; apiToken?: string }) {
    this.base = config.baseUrl.replace(/\/+$/, "");
    this.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(config.apiToken ? { Authorization: `Bearer ${config.apiToken}` } : {}),
    };
  }

  async connect(config: ProPresenterConnectionConfig): Promise<void> {
    const token = config.password;
    if (token) {
      this.headers = {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    await this.raw("GET", paths.status);
  }

  async getStatus(): Promise<ProPresenterStatus> {
    try {
      const data = await this.rawJson<{ activePresentation?: string; slideIndex?: number }>(
        "GET",
        paths.status,
      );
      return {
        connected: true,
        activePresentationId: data.activePresentation,
        activeSlideIndex: data.slideIndex,
      };
    } catch {
      return { connected: false };
    }
  }

  async listPresentations(): Promise<ProPresenterPresentationSummary[]> {
    const data = await this.rawJson<{ presentations?: ProPresenterPresentationSummary[] }>(
      "GET",
      paths.presentations,
    );
    return data.presentations ?? [];
  }

  async triggerPresentation(id: string): Promise<void> {
    await this.raw("PUT", paths.triggerPresentation, JSON.stringify({ id }));
  }

  async triggerSlide(presentationId: string, slideIndex: number): Promise<void> {
    await this.raw(
      "PUT",
      paths.activeSlide,
      JSON.stringify({ presentationId, slideIndex }),
    );
  }

  async nextSlide(): Promise<void> {
    await this.raw("POST", paths.next);
  }

  async previousSlide(): Promise<void> {
    await this.raw("POST", paths.previous);
  }

  async showStageMessage(text: string): Promise<void> {
    await this.raw("POST", paths.stageMessage, JSON.stringify({ message: text }));
  }

  private async raw(method: string, path: string, body?: string): Promise<Response> {
    const url = `${this.base}${path}`;
    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: body ?? null,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`ProPresenter HTTP ${method} ${path}: ${res.status}`);
    }
    return res;
  }

  private async rawJson<T>(method: string, path: string, body?: string): Promise<T> {
    const res = await this.raw(method, path, body);
    return (await res.json()) as T;
  }
}
