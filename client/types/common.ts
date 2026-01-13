// Common type definitions for consistent ID handling

export type ID = string | number;

// Utility type for ensuring ID consistency
export type NormalizedID = string;

// Helper type for API responses that might have numeric IDs
export interface ApiEntity {
  id: ID;
  [key: string]: any;
}

// Helper type for navigation params (always strings)
export interface NavigationParams {
  [key: string]: string | undefined;
}

// Helper type for components that work with IDs
export interface WithID {
  id: ID;
}
