"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Flashcard } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FRONT_MAX = 200;
const BACK_MAX = 500;

interface FlashcardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcard?: Flashcard | null;
  onSaved: () => void;
}

export default function FlashcardForm({
  open,
  onOpenChange,
  flashcard,
  onSaved,
}: FlashcardFormProps) {
  const isEditMode = !!flashcard;

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFront(flashcard?.front ?? "");
      setBack(flashcard?.back ?? "");
    }
  }, [open, flashcard]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    if (trimmedFront.length < 1 || trimmedFront.length > FRONT_MAX) {
      toast.error(`Przód musi mieć od 1 do ${FRONT_MAX} znaków`);
      return;
    }

    if (trimmedBack.length < 1 || trimmedBack.length > BACK_MAX) {
      toast.error(`Tył musi mieć od 1 do ${BACK_MAX} znaków`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        const response = await fetch(`/api/flashcards/${flashcard.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front: trimmedFront, back: trimmedBack }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? "Nie udało się zaktualizować fiszki");
        }

        toast.success("Fiszka została zaktualizowana");
      } else {
        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flashcards: [
              {
                front: trimmedFront,
                back: trimmedBack,
                source: "manual" as const,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? "Nie udało się utworzyć fiszki");
        }

        toast.success("Fiszka została utworzona");
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edytuj fiszkę" : "Dodaj fiszkę"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Zmień treść fiszki i zapisz zmiany."
              : "Wypełnij pola i dodaj nową fiszkę."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="front">Przód</Label>
              <span className="text-xs text-muted-foreground">
                {front.length}/{FRONT_MAX}
              </span>
            </div>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              maxLength={FRONT_MAX}
              placeholder="Wpisz treść przodu fiszki..."
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="back">Tył</Label>
              <span className="text-xs text-muted-foreground">
                {back.length}/{BACK_MAX}
              </span>
            </div>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              maxLength={BACK_MAX}
              placeholder="Wpisz treść tyłu fiszki..."
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
