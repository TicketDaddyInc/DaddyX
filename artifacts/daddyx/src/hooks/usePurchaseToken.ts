import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { findEventEscrowPda, findTokenStatePda } from "@/lib/anchor";
import { explorerUrl } from "@/lib/constants";

export function usePurchaseToken() {
  const { program } = useAnchorProgram();
  const wallet = useWallet();

  /**
   * Purchase a numbered fan token for an event.
   *
   * @param eventConfigPda  - On-chain PDA of the EventConfig account
   * @param tokenId         - 0-based token index to purchase
   * @returns transaction signature
   */
  const purchaseToken = async (
    eventConfigPda: PublicKey,
    tokenId: number
  ): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Connect your wallet first");
    }
    if (!program) {
      throw new Error("Program not initialised — wallet may not be connected");
    }

    // Derive PDAs matching the program's seeds exactly:
    //   token_state: ["token", event_config.key, token_id.to_le_bytes()]
    //   event_escrow: ["escrow", event_config.key]
    const [tokenStatePda] = findTokenStatePda(eventConfigPda, tokenId);
    const [eventEscrowPda] = findEventEscrowPda(eventConfigPda);

    // Fetch on-chain accounts to resolve dynamic keys
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenState: any = await (program.account as any).tokenState.fetch(tokenStatePda);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventConfig: any = await (program.account as any).eventConfig.fetch(eventConfigPda);

    const sig = await program.methods
      .purchaseToken(new BN(tokenId))
      .accounts({
        tokenState: tokenStatePda,
        eventConfig: eventConfigPda,
        eventEscrow: eventEscrowPda,
        previousOwner: tokenState.currentOwner as PublicKey,
        organizer: eventConfig.organizer as PublicKey,
        buyer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return sig;
  };

  return {
    purchaseToken,
    connected: !!wallet.publicKey,
    publicKey: wallet.publicKey,
    explorerUrl,
  };
}
