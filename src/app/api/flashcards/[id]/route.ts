import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UpdateFlashcardDTO } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const flashcardId = parseInt(id, 10);

  if (isNaN(flashcardId)) {
    return NextResponse.json(
      { error: "Invalid flashcard ID" },
      { status: 400 }
    );
  }

  let body: UpdateFlashcardDTO;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (
    !body.front ||
    typeof body.front !== "string" ||
    body.front.length < 1 ||
    body.front.length > 200
  ) {
    return NextResponse.json(
      { error: "Front must be between 1 and 200 characters" },
      { status: 400 }
    );
  }

  if (
    !body.back ||
    typeof body.back !== "string" ||
    body.back.length < 1 ||
    body.back.length > 500
  ) {
    return NextResponse.json(
      { error: "Back must be between 1 and 500 characters" },
      { status: 400 }
    );
  }

  // First, fetch the existing flashcard to check its current source
  const { data: existing, error: fetchError } = await supabase
    .from("flashcards")
    .select("source")
    .eq("id", flashcardId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Flashcard not found" },
      { status: 404 }
    );
  }

  // If source was 'ai-full', change it to 'ai-edited'
  const newSource =
    existing.source === "ai-full" ? "ai-edited" : existing.source;

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      front: body.front,
      back: body.back,
      source: newSource,
      updated_at: new Date().toISOString(),
    })
    .eq("id", flashcardId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to update flashcard" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const flashcardId = parseInt(id, 10);

  if (isNaN(flashcardId)) {
    return NextResponse.json(
      { error: "Invalid flashcard ID" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", flashcardId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete flashcard" },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
