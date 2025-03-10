/**
 * parcelData.ts
 * 
 * Utility functions for working with parcel data, including
 * Bitcoin inscription IDs and other parcel-specific information.
 */

import { getInscriptionId, getParcelIdByInscription, PARCEL_INSCRIPTIONS } from './parcelInscriptions';

/**
 * Interface representing a parcel's data
 */
export interface ParcelData {
  id: number;
  inscriptionId: string;
  // Add other parcel properties as needed
  // For example:
  // name?: string;
  // owner?: string;
  // coordinates?: { x: number, y: number };
}

/**
 * Get complete data for a parcel by its ID
 * @param parcelId - The numeric ID of the parcel
 * @returns The parcel data object
 */
export function getParcelData(parcelId: number): ParcelData {
  return {
    id: parcelId,
    inscriptionId: getInscriptionId(parcelId),
    // Add other properties as needed
  };
}

/**
 * Get parcel data by its inscription ID
 * @param inscriptionId - The Bitcoin inscription ID
 * @returns The parcel data or null if not found
 */
export function getParcelDataByInscription(inscriptionId: string): ParcelData | null {
  const parcelId = getParcelIdByInscription(inscriptionId);
  
  if (parcelId === null) {
    return null;
  }
  
  return getParcelData(parcelId);
}

/**
 * Get data for all parcels with specific inscription IDs
 * @returns Array of parcel data objects
 */
export function getAllInscribedParcels(): ParcelData[] {
  return Object.keys(PARCEL_INSCRIPTIONS).map(id => {
    const parcelId = parseInt(id);
    return getParcelData(parcelId);
  });
} 