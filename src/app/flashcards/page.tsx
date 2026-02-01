"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { Flashcard, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FlashcardList from "@/components/FlashcardList";
import FlashcardForm from "@/components/FlashcardForm";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null
  );

  const totalPages = Math.ceil(total / limit);

  const fetchFlashcards = useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/flashcards?page=${targetPage}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Nie udało się pobrać fiszek");
        }

        const data: PaginatedResponse<Flashcard> = await response.json();
        setFlashcards(data.data);
        setTotal(data.total);
        setPage(data.page);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Wystąpił błąd"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchFlashcards(page);
  }, [fetchFlashcards, page]);

  function handleAddClick() {
    setEditingFlashcard(null);
    setFormOpen(true);
  }

  function handleEdit(flashcard: Flashcard) {
    setEditingFlashcard(flashcard);
    setFormOpen(true);
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć fiszki");
      }

      toast.success("Fiszka została usunięta");
      fetchFlashcards(page);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd"
      );
    }
  }

  function handleSaved() {
    fetchFlashcards(page);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moje fiszki</h1>
          {!isLoading && (
            <p className="mt-1 text-sm text-muted-foreground">
              Łącznie: {total} {total === 1 ? "fiszka" : total < 5 ? "fiszki" : "fiszek"}
            </p>
          )}
        </div>
        <Button onClick={handleAddClick}>Dodaj fiszkę</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-6">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : flashcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="mb-4 text-lg text-muted-foreground">
            Nie masz jeszcze żadnych fiszek
          </p>
          <Button onClick={handleAddClick}>Dodaj pierwszą fiszkę</Button>
        </div>
      ) : (
        <>
          <FlashcardList
            flashcards={flashcards}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Poprzednia
              </Button>
              <span className="text-sm text-muted-foreground">
                Strona {page} z {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Następna
              </Button>
            </div>
          )}
        </>
      )}

      <FlashcardForm
        open={formOpen}
        onOpenChange={setFormOpen}
        flashcard={editingFlashcard}
        onSaved={handleSaved}
      />
    </div>
  );
}
