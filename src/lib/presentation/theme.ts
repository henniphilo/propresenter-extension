/**
 * Presentation theme — used by PPTX export and future Keynote / stage formatting.
 * Not the source of truth for sermon content (that remains JSON blocks/slides).
 */
export type PresentationTheme = {
  id: string;
  fonts: {
    titleFace: string;
    bodyFace: string;
    verseFace: string;
  };
  sizes: {
    titlePt: number;
    bodyPt: number;
    versePt: number;
    quotePt: number;
  };
  spacing: {
    line: number;
    paragraph: number;
    slidePaddingIn: number;
  };
  alignment: {
    title: "left" | "center";
    body: "left" | "center";
  };
  margins: {
    xIn: number;
    yIn: number;
  };
};

/** Matches fonts shipped in `context/ProPresenter Configuration & Settings/` (install CMG Sans OS-wide for best PPTX fidelity). */
export const DEFAULT_THEME_ID = "hb-cmg-sans";

export const defaultPresentationTheme: PresentationTheme = {
  id: DEFAULT_THEME_ID,
  fonts: {
    titleFace: "CMG Sans",
    bodyFace: "CMG Sans",
    verseFace: "CMG Sans",
  },
  sizes: {
    titlePt: 44,
    bodyPt: 32,
    versePt: 30,
    quotePt: 28,
  },
  spacing: {
    line: 1.25,
    paragraph: 0.12,
    slidePaddingIn: 0.55,
  },
  alignment: {
    title: "center",
    body: "center",
  },
  margins: {
    xIn: 0.55,
    yIn: 0.45,
  },
};
