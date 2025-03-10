/**
 * Local storage utilities for bitmap configurations
 */

import { generateUniqueId } from '../common';
import { STORAGE_KEY } from '../constants';

/**
 * Interface to represent a saved bitmap configuration
 */
export interface SavedBitmap {
  id: string;
  name: string;
  data: string; // Bitmap data as comma-separated string
  createdAt: number;
}

/**
 * Saves a new bitmap configuration to localStorage
 * @param name Configuration name
 * @param data Bitmap data as comma-separated string
 * @returns The saved configuration
 */
export function saveBitmapConfig(name: string, data: string): SavedBitmap {
  // Generate a unique ID
  const id = generateUniqueId();
  
  // Create the configuration object
  const config: SavedBitmap = {
    id,
    name,
    data,
    createdAt: Date.now()
  };
  
  // Get existing configurations
  const existingConfigs = getSavedBitmapConfigs();
  
  // Add the new configuration
  const updatedConfigs = [...existingConfigs, config];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
  
  return config;
}

/**
 * Gets all saved bitmap configurations
 * @returns Array of saved configurations
 */
export function getSavedBitmapConfigs(): SavedBitmap[] {
  try {
    // Get data from localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    // If there's no data, return an empty array
    if (!storedData) {
      return [];
    }
    
    // Parse the data
    const configs = JSON.parse(storedData);
    
    // Validate that it's an array
    if (!Array.isArray(configs)) {
      return [];
    }
    
    return configs;
  } catch (error) {
    console.error('Error getting saved configurations:', error);
    return [];
  }
}

/**
 * Deletes a bitmap configuration
 * @param id Configuration ID to delete
 * @returns true if deleted successfully, false otherwise
 */
export function deleteBitmapConfig(id: string): boolean {
  try {
    // Get existing configurations
    const existingConfigs = getSavedBitmapConfigs();
    
    // Filter out the configuration to delete
    const updatedConfigs = existingConfigs.filter(config => config.id !== id);
    
    // If no configuration was removed, return false
    if (updatedConfigs.length === existingConfigs.length) {
      return false;
    }
    
    // Save the updated configurations
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
    
    return true;
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return false;
  }
}

/**
 * Formata uma data de timestamp para uma string legível
 * @param timestamp Timestamp em milissegundos
 * @returns String formatada da data
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
} 