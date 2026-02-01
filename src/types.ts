export interface Flashcard {
  id: number;
  front: string;
  back: string;
  source: "ai-full" | "ai-edited" | "manual";
  generation_id: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: number;
  user_id: string;
  model: string;
  generated_count: number;
  accepted_unedited_count: number;
  accepted_edited_count: number;
  source_text_hash: string;
  source_text_length: number;
  generation_duration: number;
  created_at: string;
  updated_at: string;
}

export interface GenerationErrorLog {
  id: number;
  user_id: string;
  model: string;
  source_text_hash: string;
  source_text_length: number;
  error_code: string;
  error_message: string;
  created_at: string;
}

// DTOs

export interface CreateFlashcardDTO {
  front: string;
  back: string;
  source: "ai-full" | "ai-edited" | "manual";
  generation_id?: number | null;
}

export interface UpdateFlashcardDTO {
  front: string;
  back: string;
}

export interface FlashcardProposal {
  front: string;
  back: string;
  accepted: boolean;
  edited: boolean;
}

export interface GenerateRequest {
  source_text: string;
}

export interface GenerateResponse {
  generation_id: number;
  proposals: FlashcardProposal[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
