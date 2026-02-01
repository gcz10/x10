"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Pencil, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FlashcardProposal, CreateFlashcardDTO } from "@/types";

interface FlashcardProposalListProps {
  proposals: FlashcardProposal[];
  generationId: number;
  onSaved: () => void;
}

interface ProposalState extends FlashcardProposal {
  id: number;
  isEditing: boolean;
  editFront: string;
  editBack: string;
  rejected: boolean;
}

export default function FlashcardProposalList({
  proposals,
  generationId,
  onSaved,
}: FlashcardProposalListProps) {
  const [items, setItems] = useState<ProposalState[]>(() =>
    proposals.map((p, i) => ({
      ...p,
      id: i,
      isEditing: false,
      editFront: p.front,
      editBack: p.back,
      rejected: false,
    }))
  );
  const [saving, setSaving] = useState(false);

  const visibleItems = items.filter((item) => !item.rejected);
  const acceptedItems = visibleItems.filter((item) => item.accepted);
  const totalVisible = visibleItems.length;
  const acceptedCount = acceptedItems.length;

  function handleAccept(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, accepted: true } : item
      )
    );
  }

  function handleReject(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, rejected: true, accepted: false, isEditing: false }
          : item
      )
    );
  }

  function handleStartEdit(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isEditing: true, editFront: item.front, editBack: item.back }
          : item
      )
    );
  }

  function handleCancelEdit(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEditing: false } : item
      )
    );
  }

  function handleSaveEdit(id: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const trimmedFront = item.editFront.trim();
        const trimmedBack = item.editBack.trim();
        if (!trimmedFront || !trimmedBack) return item;
        return {
          ...item,
          front: trimmedFront,
          back: trimmedBack,
          edited: true,
          accepted: true,
          isEditing: false,
        };
      })
    );
  }

  function handleEditFrontChange(id: number, value: string) {
    if (value.length > 200) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, editFront: value } : item
      )
    );
  }

  function handleEditBackChange(id: number, value: string) {
    if (value.length > 500) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, editBack: value } : item
      )
    );
  }

  async function handleBulkSave() {
    if (acceptedCount === 0) return;

    setSaving(true);

    try {
      const flashcards: CreateFlashcardDTO[] = acceptedItems.map((item) => ({
        front: item.front,
        back: item.back,
        source: item.edited ? ("ai-edited" as const) : ("ai-full" as const),
        generation_id: generationId,
      }));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcards }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ?? "Nie udało się zapisać fiszek"
        );
      }

      // Update generation record with accepted counts
      const acceptedUneditedCount = acceptedItems.filter(
        (item) => !item.edited
      ).length;
      const acceptedEditedCount = acceptedItems.filter(
        (item) => item.edited
      ).length;

      await fetch("/api/generations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generationId,
          accepted_unedited_count: acceptedUneditedCount,
          accepted_edited_count: acceptedEditedCount,
        }),
      });

      toast.success(`Zapisano ${acceptedCount} fiszek!`);
      onSaved();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Zaakceptowano {acceptedCount} z {totalVisible} fiszek
        </p>
        <Button
          onClick={handleBulkSave}
          disabled={acceptedCount === 0 || saving}
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Zapisz zaakceptowane fiszki
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {visibleItems.map((item) => (
          <Card
            key={item.id}
            className={
              item.accepted
                ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="text-base">
                Fiszka #{item.id + 1}
                {item.accepted && (
                  <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">
                    {item.edited ? "Zaakceptowana (edytowana)" : "Zaakceptowana"}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Przód ({item.editFront.length}/200)
                    </label>
                    <Input
                      value={item.editFront}
                      onChange={(e) =>
                        handleEditFrontChange(item.id, e.target.value)
                      }
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Tył ({item.editBack.length}/500)
                    </label>
                    <Textarea
                      value={item.editBack}
                      onChange={(e) =>
                        handleEditBackChange(item.id, e.target.value)
                      }
                      maxLength={500}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(item.id)}
                      disabled={
                        !item.editFront.trim() || !item.editBack.trim()
                      }
                    >
                      <Save className="size-3" />
                      Zapisz edycję
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelEdit(item.id)}
                    >
                      Anuluj
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Przód
                    </p>
                    <p className="text-sm">{item.front}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Tył
                    </p>
                    <p className="text-sm">{item.back}</p>
                  </div>
                </div>
              )}
            </CardContent>
            {!item.isEditing && (
              <CardFooter className="gap-2">
                <Button
                  size="sm"
                  variant={item.accepted ? "default" : "outline"}
                  onClick={() => handleAccept(item.id)}
                >
                  <Check className="size-3" />
                  Akceptuj
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartEdit(item.id)}
                >
                  <Pencil className="size-3" />
                  Edytuj
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="size-3" />
                  Odrzuć
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {acceptedCount > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleBulkSave}
            disabled={acceptedCount === 0 || saving}
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Zapisz zaakceptowane fiszki ({acceptedCount})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
