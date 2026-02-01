import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateFlashcardDTO,
  Flashcard,
  PaginatedResponse,
} from "@/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
  );

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }

  const response: PaginatedResponse<Flashcard> = {
    data: data ?? [],
    page,
    limit,
    total: count ?? 0,
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { flashcards: CreateFlashcardDTO[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.flashcards || !Array.isArray(body.flashcards)) {
    return NextResponse.json(
      { error: "Request body must contain a flashcards array" },
      { status: 400 }
    );
  }

  if (body.flashcards.length === 0) {
    return NextResponse.json(
      { error: "Flashcards array must not be empty" },
      { status: 400 }
    );
  }

  const validSources = ["ai-full", "ai-edited", "manual"] as const;

  for (const flashcard of body.flashcards) {
    if (
      !flashcard.front ||
      typeof flashcard.front !== "string" ||
      flashcard.front.length < 1 ||
      flashcard.front.length > 200
    ) {
      return NextResponse.json(
        { error: "Each flashcard front must be between 1 and 200 characters" },
        { status: 400 }
      );
    }

    if (
      !flashcard.back ||
      typeof flashcard.back !== "string" ||
      flashcard.back.length < 1 ||
      flashcard.back.length > 500
    ) {
      return NextResponse.json(
        { error: "Each flashcard back must be between 1 and 500 characters" },
        { status: 400 }
      );
    }

    if (
      !flashcard.source ||
      !validSources.includes(
        flashcard.source as (typeof validSources)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Each flashcard must have a valid source (ai-full, ai-edited, manual)" },
        { status: 400 }
      );
    }
  }

  const flashcardsToInsert = body.flashcards.map((f) => ({
    front: f.front,
    back: f.back,
    source: f.source,
    generation_id: f.generation_id ?? null,
    user_id: user.id,
  }));

  const { data, error } = await supabase
    .from("flashcards")
    .insert(flashcardsToInsert)
    .select();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create flashcards" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
