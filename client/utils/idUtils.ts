import { ID, NormalizedID } from '../types/common';

/**
 * Normalizes an ID to a string for consistent comparison
 * @param id - The ID to normalize
 * @returns A string representation of the ID
 */
export const normalizeId = (id: ID | null | undefined): NormalizedID => {
  if (id === null || id === undefined) return '';
  return String(id);
};

/**
 * Compares two IDs for equality, normalizing both to strings
 * @param id1 - First ID to compare
 * @param id2 - Second ID to compare
 * @returns True if the IDs are equal when normalized to strings
 */
export const compareIds = (id1: ID, id2: ID): boolean => {
  return normalizeId(id1) === normalizeId(id2);
};

/**
 * Checks if an array of IDs contains a specific ID, normalizing all to strings
 * @param idArray - Array of IDs to search in
 * @param targetId - ID to search for
 * @returns True if the target ID is found in the array
 */
export const includesId = (idArray: ID[], targetId: ID): boolean => {
  const normalizedTarget = normalizeId(targetId);
  return idArray.some(id => normalizeId(id) === normalizedTarget);
};

/**
 * Converts navigation params to normalized IDs
 * @param params - Navigation parameters (always strings)
 * @param idKeys - Keys that should be treated as IDs
 * @returns Object with normalized IDs
 */
export const normalizeNavigationParams = <T extends Record<string, any>>(
  params: T,
  idKeys: (keyof T)[]
): T => {
  const result = { ...params };
  idKeys.forEach(key => {
    if (result[key] !== undefined) {
      result[key] = normalizeId(result[key] as string) as T[keyof T];
    }
  });
  return result;
};
