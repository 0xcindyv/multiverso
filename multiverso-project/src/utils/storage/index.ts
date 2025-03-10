/**
 * Storage utilities index
 */

import {
  saveBitmapConfig,
  getSavedBitmapConfigs,
  deleteBitmapConfig
} from './storage';
import type { SavedBitmap } from './storage';

import {
  exportToFile,
  exportToJson,
  importFromFile
} from './fileUtils';

export type { SavedBitmap };
export {
  // Storage functions
  saveBitmapConfig,
  getSavedBitmapConfigs,
  deleteBitmapConfig,
  
  // File operations
  exportToFile,
  exportToJson,
  importFromFile
}; 