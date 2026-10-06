export interface GameCard {
  id: string;
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
