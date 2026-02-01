"use client";

import type { Flashcard } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sourceLabels: Record<Flashcard["source"], string> = {
  "ai-full": "AI",
  "ai-edited": "AI (edytowane)",
  manual: "Ręczne",
};

const sourceBadgeStyles: Record<Flashcard["source"], string> = {
  "ai-full":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "ai-edited":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  manual:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

interface FlashcardItemProps {
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (id: number) => void;
}

export default function FlashcardItem({
  flashcard,
  onEdit,
  onDelete,
}: FlashcardItemProps) {
  function handleDelete() {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę fiszkę?"
    );
    if (confirmed) {
      onDelete(flashcard.id);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-base font-semibold">Przód</span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceBadgeStyles[flashcard.source]}`}
          >
            {sourceLabels[flashcard.source]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm whitespace-pre-wrap">{flashcard.front}</p>
        <div>
          <span className="text-base font-semibold">Tył</span>
          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
            {flashcard.back}
          </p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(flashcard)}>
          Edytuj
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Usuń
        </Button>
      </CardFooter>
    </Card>
  );
}
