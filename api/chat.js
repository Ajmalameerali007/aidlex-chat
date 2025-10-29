import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildAttachmentSummary(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return "";
  }

  const lines = attachments.map((attachment, index) => {
    const { name, type, size, preview } = attachment;
    const order = index + 1;
    const readableSize = size ? `${(size / 1024).toFixed(1)} KB` : "unknown size";
    const previewText = preview ? `\nPreview:\n${preview}` : "";
    return `Attachment ${order}: ${name || "unnamed"} (${type || "unknown type"}, ${readableSize})${previewText}`;
  });

  return `\n\nThe user has included the following supporting files:\n${lines.join("\n\n")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, attachments } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "A user message is required." });
    }

    const composedPrompt = `You are Aidlex, a highly skilled, reliable and precise legal assistant for UAE law and policy. Provide thorough, actionable and easy-to-understand answers. Always structure your responses with clear headings, concise paragraphs, and bullet points when listing steps or requirements. Maintain a professional yet supportive tone.

User request:\n${message.trim()}${buildAttachmentSummary(attachments)}`;

    const response = await openai.responses.create({
      model: "pmpt_68f61ae736f48190a0c63ad91c432bfa05a2f1c6b49bf03a",
      input: composedPrompt,
    });

    const reply = response?.output_text
      ?? response?.output?.[0]?.content?.[0]?.text
      ?? "I was unable to generate a response. Please try again.";

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error("OpenAI Error:", error);
    const message = error?.response?.data?.error?.message || error?.message || "Failed to connect to OpenAI";
    return res.status(500).json({ error: message });
  }
}
