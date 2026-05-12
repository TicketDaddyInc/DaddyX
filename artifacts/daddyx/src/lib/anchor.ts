import { Connection, PublicKey } from "@solana/web3.js";
import {
  DADDYX_PROGRAM_ID,
  SOLANA_RPC_URL,
  SEED_PLATFORM_CONFIG,
  SEED_CREATOR_PROFILE,
  SEED_EVENT_CONFIG,
  SEED_EVENT_ESCROW,
  SEED_TOKEN_STATE,
} from "./constants";

// ── Connection ─────────────────────────────────────────────
export const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// ── PDA Derivations ────────────────────────────────────────
export async function findPlatformConfigPda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_PLATFORM_CONFIG)],
    DADDYX_PROGRAM_ID
  );
}

export async function findCreatorProfilePda(
  wallet: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CREATOR_PROFILE), wallet.toBuffer()],
    DADDYX_PROGRAM_ID
  );
}

/**
 * Derive the EventConfig PDA.
 * Accepts either a raw string (will be zero-padded to 32 bytes) or an already-
 * padded Uint8Array/Buffer of exactly 32 bytes — matching the on-chain seed
 * which is a fixed [u8; 32] array.
 */
export function findEventConfigPda(eventId: string | Uint8Array): [PublicKey, number] {
  let idBytes: Buffer;
  if (typeof eventId === "string") {
    idBytes = Buffer.alloc(32);
    Buffer.from(eventId).copy(idBytes);
  } else {
    idBytes = Buffer.from(eventId);
  }
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_EVENT_CONFIG), idBytes],
    DADDYX_PROGRAM_ID
  );
}

export function findEventEscrowPda(eventConfigPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_EVENT_ESCROW), eventConfigPda.toBuffer()],
    DADDYX_PROGRAM_ID
  );
}

export function findTokenStatePda(
  eventConfigPda: PublicKey,
  tokenId: number
): [PublicKey, number] {
  const tokenIdBuf = Buffer.alloc(8);
  tokenIdBuf.writeBigUInt64LE(BigInt(tokenId));
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_TOKEN_STATE), eventConfigPda.toBuffer(), tokenIdBuf],
    DADDYX_PROGRAM_ID
  );
}

// ── SOL formatting helpers ─────────────────────────────────
export function lamportsToSol(lamports: number | bigint): number {
  return Number(lamports) / 1_000_000_000;
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * 1_000_000_000));
}
