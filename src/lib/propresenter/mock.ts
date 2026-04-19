import type {
  ProPresenterClient,
  ProPresenterConnectionConfig,
  ProPresenterPresentationSummary,
  ProPresenterStatus,
} from "./types";

let connected = false;
let activePresentationId: string | undefined;
let activeSlideIndex = 0;

const demoPresentations: ProPresenterPresentationSummary[] = [
  { id: "pres-sermon", name: "Sermon Deck (Demo)" },
  { id: "pres-worship", name: "Sunday Morning (Demo)" },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockProPresenterClient: ProPresenterClient = {
  async connect(config: ProPresenterConnectionConfig) {
    void config;
    await delay(80);
    connected = true;
    activePresentationId ??= demoPresentations[0]?.id;
    activeSlideIndex = 0;
  },

  async getStatus(): Promise<ProPresenterStatus> {
    await delay(40);
    return {
      connected,
      activePresentationId,
      activeSlideIndex,
    };
  },

  async listPresentations(): Promise<ProPresenterPresentationSummary[]> {
    await delay(60);
    return [...demoPresentations];
  },

  async triggerPresentation(id: string) {
    await delay(70);
    activePresentationId = id;
    activeSlideIndex = 0;
  },

  async triggerSlide(presentationId: string, slideIndex: number) {
    await delay(70);
    activePresentationId = presentationId;
    activeSlideIndex = slideIndex;
  },

  async nextSlide() {
    await delay(50);
    activeSlideIndex += 1;
  },

  async previousSlide() {
    await delay(50);
    activeSlideIndex = Math.max(0, activeSlideIndex - 1);
  },

  async showStageMessage(text: string) {
    void text;
    await delay(40);
    /* Mock: echo is a no-op; real client would POST to stage display API. */
  },
};
