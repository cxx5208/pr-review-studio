import { LLMProviderAdapter, LLMRequestOptions, LLMResponse } from "@/types";

export const openAIAdapter: LLMProviderAdapter = {
  config: {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4",
    models: ["gpt-4", "gpt-3.5-turbo"],
    requiresApiKey: true
  },
  async complete(options: LLMRequestOptions, apiKey: string): Promise<LLMResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2048,
        stream: !!options.stream
      })
    });
    if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
    const data = await response.json();
    // OpenAI returns streaming via HTTP chunked encoding if enabled, but here we mimic non-stream
    return {
      content: data.choices?.[0]?.message?.content || "",
      model: options.model,
      usage: data.usage
    };
  },
  async *stream(options: LLMRequestOptions, apiKey: string): AsyncIterable<string> {
    // Real OpenAI streaming: parse text/event-stream chunks
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2048,
        stream: true
      })
    });

    if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);

    if (!response.body) throw new Error('Streaming not supported: response.body is null');
    const reader = response.body.getReader();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += new TextDecoder().decode(value);
       const lines = buffer.split("\n");
       for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim();
          if (data === "[DONE]") return;
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch { /* ignore bad chunks */ }
        }
      }
      buffer = lines[lines.length - 1]; // Remaining incomplete line
    }
  }
};
