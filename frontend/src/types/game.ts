export interface GameCard {
  id: string | number;
  steam_appid?: number;
  title: string;
  header_image?: string;
  capsule_image?: string;
  hero_image?: string;
  genres: string[];
  rating?: number;
  release_date?: string;
  developer?: string;
  publisher?: string;
  short_description?: string;
  price?: string;
}

export interface ScreenshotItem {
  id: number;
  path_thumbnail: string;
  path_full: string;
}

export interface MovieItem {
  id: number;
  name: string;
  thumbnail: string;
  mp4_url?: string;
  webm_url?: string;
}

export interface GameDetail {
  id: string | number;
  steam_appid?: number;
  title: string;
  header_image?: string;
  capsule_image?: string;
  hero_image?: string;
  short_description?: string;
  detailed_description?: string;
  about_the_game?: string;
  genres: string[];
  developers: string[];
  publishers: string[];
  release_date?: string;
  rating?: number;
  screenshots: ScreenshotItem[];
  movies: MovieItem[];
  pc_requirements?: Record<string, string>;
  website?: string;
  steam_url?: string;
  platforms?: string[];
  price?: string;
}

export interface HeroSlide {
  id: string;
  steam_appid?: number;
  title: string;
  backdrop_url: string;
  logo_url?: string;
  rating: number;
  genres: string[];
  synopsis: string;
  store_url?: string;
  release_date?: string;
}

export type ShelfCategory =
  | 'featured'
  | 'trending'
  | 'new_releases'
  | 'top_rated'
  | 'hidden_gems';

export interface GenreTile {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  gradient: string;
  description: string;
  accentColor: string;
}

export interface GameSearchResponse {
  total: number;
  games: GameCard[];
  page: number;
  per_page: number;
}

export interface RecommendationRequest {
  genre: string;
  age: string;
  difficulty: string;
  prompt?: string;
}

export interface GameRecommendation {
  name: string;
  match_reason: string;
  attributes: string[];
}

export interface EnrichedRecommendation extends GameRecommendation {
  id?: string | number;
  steam_appid?: number;
  header_image?: string;
  capsule_image?: string;
  hero_image?: string;
  rating?: number;
  release_date?: string;
  store_url?: string;
  price?: string;
}

export interface RecommendationResponse {
  recommendations: GameRecommendation[];
}

export interface WizardPreferences {
  genre: string;
  mood: string;
  difficulty: string;
  age: string;
  prompt: string;
}

export const ALLOWED_GENRES = [
  'Action',
  'RPG',
  'Adventure',
  'Shooter',
  'Horror',
  'Strategy',
  'Simulation',
  'Racing',
  'Sports',
  'Indie',
  'Puzzle',
  'Platformer',
  'Any',
] as const;

export const ALLOWED_DIFFICULTIES = [
  'Casual',
  'Normal',
  'Hard',
  'Punishing',
  'Any',
] as const;

export const ALLOWED_AGE_RATINGS = [
  'Everyone',
  'Everyone 10+',
  'Teen',
  'Mature',
  'Any',
] as const;

export const MOOD_OPTIONS = [
  'Cozy & Chill',
  'High Adrenaline',
  'Deep Story',
  'Mind-Bending',
  'Dark & Gritty',
  'Tactical & Strategic',
  'Pure Fun',
] as const;

export type ShelfStatus = 'wishlist' | 'backlog' | 'playing' | 'completed' | 'dropped';

export interface UserLibraryItem {
  id: string;
  user_id: string;
  game_id: string;
  is_favorite: boolean;
  is_wishlisted: boolean;
  status: ShelfStatus;
  personal_rating?: number | null;
  personal_rank?: number | null;
  playtime_hours: number;
  notes?: string | null;
  game_title?: string;
  game_cover_url?: string;
  game_slug?: string;
  created_at?: string;
  updated_at?: string;
}

