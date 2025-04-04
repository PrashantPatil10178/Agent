import GroqSDK from "groq-sdk";

export class GroqAgentManager {
  private static instance: GroqAgentManager;
  private groq: GroqSDK;

  private constructor(apiKey: string) {
    this.groq = new GroqSDK({ apiKey });
  }

  public static getInstance(): GroqAgentManager {
    if (!GroqAgentManager.instance) {
      const apiKey = Bun.env.GroQApi;
      if (!apiKey) {
        throw new Error("GroQ API key is not set in environment variables.");
      }
      GroqAgentManager.instance = new GroqAgentManager(apiKey);
    }
    return GroqAgentManager.instance;
  }

  /**
   * Creates a chat completion with a system prompt and user query.
   * @param agentPrompt - The system prompt that defines agent behavior.
   * @param userQuery - The user question or instruction.
   * @returns Structured JSON or plain object
   */
  public async chatWithAgent(
    agentPrompt: string,
    userQuery: string
  ): Promise<any> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: "deepseek-r1-distill-llama-70b",
        messages: [
          { role: "system", content: agentPrompt },
          { role: "user", content: userQuery },
        ],
      });

      const response = completion.choices[0]?.message?.content ?? "";

      // Try to extract JSON from markdown block
      const jsonMatch = response.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }

      // Fallback: Try parsing as plain JSON
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in GroqAgentManager:", error);
      return { error: "Agent failed to respond correctly." };
    }
  }
}
