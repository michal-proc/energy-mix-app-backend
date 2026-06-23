export interface GenerationMixEntry {
  fuel: string;
  perc: number;
}

export interface GenerationInterval {
  from: string;
  to: string;
  generationmix: GenerationMixEntry[];
}

export interface GenerationRangeResponse {
  data: GenerationInterval[];
}
