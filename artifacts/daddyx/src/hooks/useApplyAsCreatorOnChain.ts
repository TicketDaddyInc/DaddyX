import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { findCreatorProfilePda } from "@/lib/anchor";

/**
 * Calls the on-chain `apply_as_creator` instruction.
 * Returns a function that, when called, submits the creator application
 * to the Solana program and returns the transaction signature.
 *
 * The caller must also POST to /api/creator/apply to mirror the data in the DB.
 */
export function useApplyAsCreatorOnChain() {
  const { program } = useAnchorProgram();
  const wallet = useWallet();

  const applyOnChain = async (params: {
    name: string;
    country: string;
    email: string;
  }): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Connect your wallet first");
    }
    if (!program) {
      throw new Error("Program not initialised — wallet may not be connected");
    }

    // Hash the email using browser-native SubtleCrypto (no extra dependency)
    const emailBytes = new TextEncoder().encode(params.email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", emailBytes);
    const emailHash = Array.from(new Uint8Array(hashBuffer));

    const [creatorProfilePda] = await findCreatorProfilePda(wallet.publicKey);

    const sig = await program.methods
      .applyAsCreator(params.name, params.country, emailHash)
      .accounts({
        creatorProfile: creatorProfilePda,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return sig;
  };

  return {
    applyOnChain,
    connected: !!wallet.publicKey,
    publicKey: wallet.publicKey,
  };
}
