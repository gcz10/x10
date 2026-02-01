"use client";

import { useState } from "react";
import { toast } from "sonner";
import TextInputArea from "@/components/TextInputArea";
import GenerateButton from "@/components/GenerateButton";
import FlashcardProposalList from "@/components/FlashcardProposalList";
import type { FlashcardProposal } from "@/types";

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

export default function GeneratePage() {
  const [sourceText, setSourceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<FlashcardProposal[] | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const textLength = sourceText.length;
  const isValidLength = textLength >= MIN_LENGTH && textLength <= MAX_LENGTH;

  async function handleGenerate() {
    if (!isValidLength) return;

    setLoading(true);
    setProposals(null);
    setGenerationId(null);

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_text: sourceText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ?? `Błąd serwera (${response.status})`
        );
      }

      const data = await response.json();
      setGenerationId(data.generation_id);
      setProposals(data.proposals);
      toast.success(
        `Wygenerowano ${data.proposals.length} propozycji fiszek!`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nie udało się wygenerować fiszek";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleSaved() {
    setProposals(null);
    setGenerationId(null);
    setSourceText("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Generuj fiszki z AI
          </h1>
          <p className="mt-1 text-muted-foreground">
            Wklej tekst, a sztuczna inteligencja wygeneruje dla Ciebie propozycje
            fiszek do nauki.
          </p>
        </div>

        <TextInputArea
          value={sourceText}
          onChange={setSourceText}
          disabled={loading}
        />

        <GenerateButton
          onClick={handleGenerate}
          disabled={!isValidLength}
          loading={loading}
        />

        {proposals && generationId !== null && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">
              Propozycje fiszek
            </h2>
            <FlashcardProposalList
              key={generationId}
              proposals={proposals}
              generationId={generationId}
              onSaved={handleSaved}
            />
          </div>
        )}
      </div>
    </div>
  );
}
