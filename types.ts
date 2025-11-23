
export interface Ingredient {
  name: string;
  amount: string;
}

export interface RoadmapStep {
  step: number;
  title: string;
  instruction: string;
}

export interface DessertConcept {
  title: string;
  description: string;
  imagePromptEn: string; // Specific prompt for the image generator in English
  ingredients: Ingredient[];
  roadmap: RoadmapStep[];
  estimatedCost: string;
  recommendedPrice: string;
}

export interface GenerationState {
  status: 'idle' | 'checking_key' | 'generating_text' | 'generating_image' | 'completed' | 'error';
  error?: string;
  data?: DessertConcept;
  imageUrl?: string;
  imageError?: string;
}
