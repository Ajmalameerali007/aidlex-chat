import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    const response = await openai.responses.create({
      prompt: {
        id: "pmpt_6869c27cfbcc8194a9fbdcd2313fb2c50abe7a7543a70057",
        version: "2"
      },
      input: message  // ✅ Fixed: input must be string, not object
    });

    return res.status(200).json({ reply: response.result });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Failed to connect to OpenAI" });
  }
}
