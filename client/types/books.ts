export interface Book {
  id: number;
  title: string;
  cover: string;
  collection: number;
  collection_title?: string;
  collection_id?: number;
  header_color?: string;
  background_end_color?: string;
  button_text_border_color?: string;
  button_circle_color?: string;
}

export interface Collection {
  id: number;
  title: string;
  created_at: string;
  parent?: number | null;
}
