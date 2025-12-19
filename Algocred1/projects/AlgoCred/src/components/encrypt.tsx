/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */

// -------------------- Degree Hash Helpers --------------------
export function formatDegreeData(
  studentName: string,
  universityName: string,
  gradYear: string,
  degreeTitle: string,
  seatNumber: string,
  percentage: string,
) {
  return `${studentName.trim().toLowerCase()}|${universityName.trim().toLowerCase()}|${gradYear.trim()}|${degreeTitle.trim().toLowerCase()}|${seatNumber.trim().toLowerCase()}|${percentage}`
}

export async function getDegreeHash(
  studentName: string,
  universityName: string,
  gradYear: string,
  degreeTitle: string,
  seatNumber: string,
  percentage: string,
): Promise<Uint8Array> {
  const formatted = formatDegreeData(studentName, universityName, gradYear, degreeTitle, seatNumber, percentage)
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(formatted))
  return new Uint8Array(hashBuffer)
}

// -------------------- AES-GCM Encryption Helpers --------------------
export async function deriveAesKeyFromSeat(seatNumber: string): Promise<CryptoKey> {
  const material = new TextEncoder().encode(seatNumber.trim())
  const hash = await crypto.subtle.digest('SHA-256', material)
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt'])
}

export function toBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8))
}

/**
 * Encrypt a JSON payload using AES-GCM-256 with key derived from seat number
 */
export async function aesGcmEncryptJSON(
  plainObj: any,
  seatNumber: string,
): Promise<{ ivB64: string; cipherB64: string }> {
  const key = await deriveAesKeyFromSeat(seatNumber)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(plainObj))
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  return { ivB64: toBase64(iv), cipherB64: toBase64(new Uint8Array(cipherBuf)) }
}

/**
 * Compute assetMetadataHash from student/university/semester info
 */
export async function computeAssetMetadataHash(
  studentName: string,
  universityName: string,
  seatNumber: string,
  semester: string,
): Promise<Uint8Array> {
  const hashInput = `${studentName.trim().toLowerCase()}|${universityName.trim().toLowerCase()}|${seatNumber.trim().toLowerCase()}|${semester.trim()}`
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashInput))
  return new Uint8Array(hashBuffer)
}
