export type ProPresenterConnectionConfig = {
  baseUrl: string;
  password?: string;
};

export type ProPresenterPresentationSummary = {
  id: string;
  name: string;
};

export type ProPresenterStatus = {
  connected: boolean;
  activePresentationId?: string;
  activeSlideIndex?: number;
};

/**
 * Abstraction over ProPresenter local HTTP API. UI must never call fetch directly — use API routes + this interface.
 */
export interface ProPresenterClient {
  connect(config: ProPresenterConnectionConfig): Promise<void>;
  getStatus(): Promise<ProPresenterStatus>;
  listPresentations(): Promise<ProPresenterPresentationSummary[]>;
  triggerPresentation(id: string): Promise<void>;
  triggerSlide(presentationId: string, slideIndex: number): Promise<void>;
  nextSlide(): Promise<void>;
  previousSlide(): Promise<void>;
  showStageMessage(text: string): Promise<void>;
}
