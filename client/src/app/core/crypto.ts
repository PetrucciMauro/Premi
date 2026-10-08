/** SHA-1 esadecimale di una stringa: è il formato con cui le password sono salvate sul server. */
export async function sha1(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface TokenPayload {
  user: string;
  exp?: number;
}

/** Decodifica la parte centrale di un token JWT (senza verificarne la firma). */
export function decodeToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}
