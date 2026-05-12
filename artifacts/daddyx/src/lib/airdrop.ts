import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const FAUCET_URL = "https://faucet.solana.com/api/airdrop";

/**
 * Request 1 devnet SOL for the given wallet.
 *
 * Strategy:
 *  1. Try connection.requestAirdrop (works on local validators and uncached nodes)
 *  2. If the RPC returns 429 Too Many Requests, fall back to the Solana web
 *     faucet API which has its own rate limit bucket separate from the RPC.
 *  3. If both fail, throw so callers can show a "use the web faucet" message.
 */
export async function requestDevnetAirdrop(
  connection: Connection,
  publicKey: PublicKey
): Promise<void> {
  try {
    const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    return;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Only fall through to faucet API on rate-limit errors
    if (!msg.includes("429") && !msg.includes("Too Many Requests") && !msg.includes("rate")) {
      throw err;
    }
  }

  // Fallback: Solana web faucet API
  const res = await fetch(FAUCET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pubkey: publicKey.toBase58(),
      lamports: LAMPORTS_PER_SOL,
      network: "devnet-solana",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    // If the faucet also rate-limits (24 h cooldown), surface a clear message
    if (res.status === 429) {
      throw new Error(
        "Devnet faucet rate limit reached. Visit https://faucet.solana.com to top up manually."
      );
    }
    throw new Error(`Faucet error ${res.status}: ${text}`);
  }
}
