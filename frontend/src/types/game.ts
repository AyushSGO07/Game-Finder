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
