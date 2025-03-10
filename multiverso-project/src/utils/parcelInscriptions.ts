/**
 * parcelInscriptions.ts
 * 
 * This file maintains the mapping between parcel IDs and their corresponding
 * Bitcoin inscription IDs. This is used for development and backend purposes
 * and should not be displayed in the frontend UI.
 */

// Interface for the parcel inscription mapping
export interface ParcelInscription {
  parcelId: number;
  inscriptionId: string;
}

/**
 * Map of parcel IDs to their Bitcoin inscription IDs
 * For parcels without specific inscription IDs, we use their numeric ID as a string
 */
export const PARCEL_INSCRIPTIONS: Record<number, string> = {
  // Parcels with specific Bitcoin inscription IDs
  0: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i0",
  1: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i1",
  2: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i2",
  3: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i3",
  4: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i4",
  5: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i5",
  6: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i6",
  7: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i7",
  8: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i8",
  9: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i9",
  10: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i10",
  11: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i11",
  12: "01f92b27da797447d2a0398b1d5deb7bab4d4ac8183f2b756c8c119405ce0415i12",
};

/**
 * Helper function to get the inscription ID for a parcel
 * If no specific inscription ID exists, returns the parcel ID as a string
 * @param parcelId - The numeric ID of the parcel
 * @returns The inscription ID or the parcel ID as a string
 */
export function getInscriptionId(parcelId: number): string {
  return PARCEL_INSCRIPTIONS[parcelId] || parcelId.toString();
}

/**
 * Helper function to find a parcel ID by its inscription ID
 * @param inscriptionId - The inscription ID to search for
 * @returns The parcel ID if found, or null if not found
 */
export function getParcelIdByInscription(inscriptionId: string): number | null {
  for (const [parcelId, inscription] of Object.entries(PARCEL_INSCRIPTIONS)) {
    if (inscription === inscriptionId) {
      return parseInt(parcelId);
    }
  }
  return null;
} 