/**
 * Application constants
 */

/**
 * Default bitmap data string
 * This represents the initial state of the metaverse visualization
 */
export const DEFAULT_BITMAP_STRING = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3,4';

/**
 * Storage key for saved bitmap configurations
 */
export const STORAGE_KEY = 'bitmap_metaverse_saved_configs';

/**
 * Scale factor for 3D visualization
 * Used to scale the layout to appropriate dimensions
 */
export const SCALE_FACTOR = 20;

/**
 * Color palette for blocks based on size
 */
export const SIZE_COLORS = {
  1: '#E57373', // Red
  2: '#FFB74D', // Orange
  3: '#FFF176', // Yellow
  4: '#AED581', // Light Green
  5: '#4FC3F7', // Light Blue
  6: '#7986CB', // Indigo
  7: '#BA68C8', // Purple
  8: '#F06292', // Pink
  default: '#64B5F6' // Default Blue
};

/**
 * Application routes and URLs
 */
export const URLS = {
  GITHUB: 'https://github.com/0xcindyv/multiverso',
  MAIN_SITE: 'https://multiverso.club',
  GITHUB_PAGES: 'https://0xcindyv.github.io/multiverso/'
}; 