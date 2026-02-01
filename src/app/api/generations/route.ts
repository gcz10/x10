import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateFlashcards } from "@/lib/openrouter";
import type { GenerateRequest, GenerateResponse } from "@/types";

interface UpdateGenerationBody {
  generation_id: number;
  accepted_unedited_count: number;
  accepted_edited_count: number;
}

function hashSourceText(text: string): string {
  return Array.from(text)
    .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
    .toString(16);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const sourceText = body.source_text;

  if (!sourceText || typeof sourceText !== "string") {
    return NextResponse.json(
      { error: "source_text is required and must be a string" },
      { status: 400 }
    );
  }

  if (sourceText.length < 1000 || sourceText.length > 10000) {
    return NextResponse.json(
      {
        error: `source_text must be between 1000 and 10000 characters. Current length: ${sourceText.length}`,
      },
      { status: 400 }
    );
  }

  const sourceTextHash = hashSourceText(sourceText);
  const model = "google/gemini-2.0-flash-001";
  const startTime = Date.now();

  try {
    const flashcards = await generateFlashcards(sourceText);
    const duration = Date.now() - startTime;

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        model,
        generated_count: flashcards.length,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
        generation_duration: duration,
      })
      .select("id")
      .single();

    if (insertError || !generation) {
      console.error("Failed to insert generation record:", insertError);
      return NextResponse.json(
        { error: "Failed to save generation record" },
        { status: 500 }
      );
    }

    const response: GenerateResponse = {
      generation_id: generation.id,
      proposals: flashcards.map((f) => ({
        front: f.front,
        back: f.back,
        accepted: false,
        edited: false,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode =
      error instanceof Error && error.message.includes("OpenRouter API error")
        ? error.message.match(/: (\d+)/)?.[1] ?? "UNKNOWN"
        : "UNKNOWN";

    console.error("Generation failed:", errorMessage);

    // Log error to generation_error_logs table
    await supabase.from("generation_error_logs").insert({
      user_id: user.id,
      model,
      source_text_hash: sourceTextHash,
      source_text_length: sourceText.length,
      error_code: errorCode,
      error_message: errorMessage.slice(0, 1000),
    });

    return NextResponse.json(
      { error: "Failed to generate flashcards. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateGenerationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (
    typeof body.generation_id !== "number" ||
    typeof body.accepted_unedited_count !== "number" ||
    typeof body.accepted_edited_count !== "number"
  ) {
    return NextResponse.json(
      {
        error:
          "generation_id, accepted_unedited_count, and accepted_edited_count are required",
      },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("generations")
    .update({
      accepted_unedited_count: body.accepted_unedited_count,
      accepted_edited_count: body.accepted_edited_count,
    })
    .eq("id", body.generation_id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to update generation:", error);
    return NextResponse.json(
      { error: "Failed to update generation record" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
