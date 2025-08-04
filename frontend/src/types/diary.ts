export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: "happy" | "sad" | "neutral" | "excited" | "tired";
  location?: string;
  tags: string[];
  expenses?: number;
  images?: string[];
}

export interface DiaryFormData {
  title: string;
  content: string;
  date: string;
  mood: "happy" | "sad" | "neutral" | "excited" | "tired";
  location: string;
  tags: string[];
  expenses: number;
}