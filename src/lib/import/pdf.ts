import { PDFParse } from "pdf-parse";

export async function extractPdf(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  try {
    const textResult = await parser.getText();
    const pageCount =
      textResult.pages.length > 0 ? textResult.pages.length : 1;
    return {
      text: textResult.text,
      pageCount,
    };
  } finally {
    await parser.destroy();
  }
}
