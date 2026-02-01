interface OpenRouterFlashcard {
  front: string;
  back: string;
}

export async function generateFlashcards(
  sourceText: string
): Promise<OpenRouterFlashcard[]> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `You are a flashcard generator. Given a text, create educational flashcards.
Each flashcard has a "front" (question, max 200 characters) and a "back" (answer, max 500 characters).
Generate between 3-10 flashcards depending on the text length and content density.
Return ONLY a JSON array of objects with "front" and "back" fields. No other text.
Example: [{"front": "What is X?", "back": "X is..."}]`,
          },
          {
            role: "user",
            content: sourceText,
          },
        ],
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenRouter response");
  }

  // Parse the JSON response - handle both array and object with array property
  const parsed = JSON.parse(content);
  const flashcards: OpenRouterFlashcard[] = Array.isArray(parsed)
    ? parsed
    : parsed.flashcards ||
      parsed.cards ||
      (Object.values(parsed).find(Array.isArray) as
        | OpenRouterFlashcard[]
        | undefined) ||
      [];

  // Validate and truncate
  return flashcards
    .filter((f) => f.front && f.back)
    .map((f) => ({
      front: String(f.front).slice(0, 200),
      back: String(f.back).slice(0, 500),
    }));
}
