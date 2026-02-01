"use client";

import type { Flashcard } from "@/types";
import FlashcardItem from "@/components/FlashcardItem";

interface FlashcardListProps {
  flashcards: Flashcard[];
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (id: number) => void;
}

export default function FlashcardList({
  flashcards,
  onEdit,
  onDelete,
}: FlashcardListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <FlashcardItem
          key={flashcard.id}
          flashcard={flashcard}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
