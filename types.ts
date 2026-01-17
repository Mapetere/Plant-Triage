
export interface DiaryEntry {
  id: string;
  date: string;
  imageBase64: string;
  healthScore: number;
  insight: string;
}

export interface PlantDiagnosis {
  isPlant: boolean; // New field for validation
  commonName: string;
  scientificName: string;
  healthScore: number;
  diagnosis: string;
  symptoms: string[];
  mathematicalAnalysis: string;
  mathMetrics: {
    label: string;
    value: number;
    unit: string;
    max: number;
  }[];
  careInstructions: {
    action: string;
    frequency: string;
    description: string;
  }[];
  growthProjection: {
    day: number;
    health: number;
    size: number;
  }[];
}

export enum AppView {
  HOME = 'HOME',
  TRIAGE = 'TRIAGE',
  ANALYTICS = 'ANALYTICS',
  DIARY = 'DIARY',
  SETTINGS = 'SETTINGS'
}

export type AppTheme = 'DAY' | 'NIGHT' | 'GIRLY' | 'BOYISH';
