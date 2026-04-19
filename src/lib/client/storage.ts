"use client";

import {
  presentationModelSchema,
  sermonDocumentSchema,
  type PresentationModel,
  type SermonDocument,
} from "@/lib/domain";

const SERMON_KEY = "sermon-studio.document.v1";
const PRESENTATION_KEY = "sermon-studio.presentation.v1";
export const PP_BASE_URL_KEY = "sermon-studio.ppBaseUrl";
export const PP_PRESENTATION_ID_KEY = "sermon-studio.ppPresentationId";

export function loadSermon(): SermonDocument | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(SERMON_KEY);
    if (!raw) {
      return null;
    }
    return sermonDocumentSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSermon(doc: SermonDocument): void {
  localStorage.setItem(SERMON_KEY, JSON.stringify(doc));
}

export function loadPresentation(): PresentationModel | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(PRESENTATION_KEY);
    if (!raw) {
      return null;
    }
    return presentationModelSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePresentation(model: PresentationModel): void {
  localStorage.setItem(PRESENTATION_KEY, JSON.stringify(model));
}

export function loadPpBaseUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(PP_BASE_URL_KEY);
}

export function savePpBaseUrl(url: string): void {
  localStorage.setItem(PP_BASE_URL_KEY, url);
}

export function loadPpPresentationId(): string {
  if (typeof window === "undefined") {
    return "pres-sermon";
  }
  return localStorage.getItem(PP_PRESENTATION_ID_KEY) ?? "pres-sermon";
}

export function savePpPresentationId(id: string): void {
  localStorage.setItem(PP_PRESENTATION_ID_KEY, id);
}
