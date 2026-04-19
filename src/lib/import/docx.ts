import mammoth from "mammoth";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract plain text and optional title hint from first &lt;h1&gt; in HTML. */
export async function extractDocx(buffer: Buffer): Promise<{
  text: string;
  html: string;
  titleHint?: string;
}> {
  const [htmlResult, textResult] = await Promise.all([
    mammoth.convertToHtml({ buffer }),
    mammoth.extractRawText({ buffer }),
  ]);
  const html = htmlResult.value;
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleHint = h1 ? stripHtml(h1[1]) : undefined;
  return {
    text: textResult.value,
    html,
    titleHint,
  };
}
