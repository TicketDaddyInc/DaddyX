import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { findTokenStatePda, findEventEscrowPda } from "@/lib/anchor";
import { explorerUrl } from "@/lib/constants";

/**
 * Calls the on-chain `claim_revenue` instruction for a specific token.
 * The caller should also call the claim API to mirror the state in the DB.
 *
 * @param eventConfigPda  - On-chain PDA of the EventConfig account
 * @param tokenId         - Token ID to claim revenue for
 * @returns transaction signature
 */
export function useClaimRevenue() {
  const { program } = useAnchorProgram();
  const wallet = useWallet();

  const claimRevenue = async (
    eventConfigPda: PublicKey,
    tokenId: number
  ): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Connect your wallet first");
    }
    if (!program) {
      throw new Error("Program not initialised — wallet may not be connected");
    }

    const [tokenStatePda] = findTokenStatePda(eventConfigPda, tokenId);
    const [eventEscrowPda] = findEventEscrowPda(eventConfigPda);

    const sig = await program.methods
      .claimRevenue(new BN(tokenId))
      .accounts({
        tokenState: tokenStatePda,
        eventConfig: eventConfigPda,
        eventEscrow: eventEscrowPda,
        claimer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return sig;
  };

  return {
    claimRevenue,
    connected: !!wallet.publicKey,
    publicKey: wallet.publicKey,
    explorerUrl,
  };
}
