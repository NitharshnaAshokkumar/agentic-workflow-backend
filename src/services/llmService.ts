import axios from "axios";

type LlmResult = {
  content: string;
  tokensUsed?: number;
};

class LLMService {
  private apiKey = process.env.UNBOUND_API_KEY || "";
  private endpoint =
    process.env.UNBOUND_API_URL ||
    "https://api.getunbound.ai/v1/chat/completions";

  async callLLM(model: string, prompt: string): Promise<LlmResult> {
    if (process.env.MOCK_LLM === "true") {
      console.log("⚠️ MOCK LLM ENABLED");
      return {
        content: `SUCCESS\n\n(Mocked response for model: ${model})\nPrompt:\n${prompt}`,
        tokensUsed: 500
      };
  }

    try {
      const resp = await axios.post(
        this.endpoint,
        {
          model,
          input: prompt,   // ✅ IMPORTANT FIX
          temperature: 0.4
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 120000
        }
      );

      // ✅ Unbound returns output directly
      const content =
        resp.data?.output ??
        resp.data?.response ??
        "";

      return { content };
    } catch (err: any) {
      console.error("UNBOUND ERROR STATUS:", err?.response?.status);
      console.error("UNBOUND ERROR DATA:", err?.response?.data);
      throw err;
    }
  }

  estimateCostUSD(tokens?: number) {
  if (!tokens) return 0;

  // Simulated flat pricing (demo-friendly)
  const pricePer1kTokens = 0.002; // $0.002 / 1K tokens
  return (tokens / 1000) * pricePer1kTokens;
}
}

export const llmService = new LLMService();
