import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { findCreatorProfilePda, findPlatformConfigPda } from "@/lib/anchor";

/**
 * Calls the on-chain `approve_creator` instruction.
 * Admin must have their wallet connected and be the platform authority.
 * After calling this, the caller should also PATCH the DB via /api/admin/creators/approve.
 */
export function useAdminApproveOnChain() {
  const { program } = useAnchorProgram();
  const wallet = useWallet();

  const approveOnChain = async (creatorWallet: string): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Connect your admin wallet first");
    }
    if (!program) {
      throw new Error("Program not initialised — wallet may not be connected");
    }

    const creatorPubkey = new PublicKey(creatorWallet);
    const [creatorProfilePda] = await findCreatorProfilePda(creatorPubkey);
    const [platformConfigPda] = await findPlatformConfigPda();

    const sig = await program.methods
      .approveCreator()
      .accounts({
        creatorProfile: creatorProfilePda,
        platformConfig: platformConfigPda,
        admin: wallet.publicKey,
      })
      .rpc();

    return sig;
  };

  const suspendOnChain = async (creatorWallet: string): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Connect your admin wallet first");
    }
    if (!program) {
      throw new Error("Program not initialised — wallet may not be connected");
    }

    const creatorPubkey = new PublicKey(creatorWallet);
    const [creatorProfilePda] = await findCreatorProfilePda(creatorPubkey);
    const [platformConfigPda] = await findPlatformConfigPda();

    const sig = await program.methods
      .suspendCreator()
      .accounts({
        creatorProfile: creatorProfilePda,
        platformConfig: platformConfigPda,
        admin: wallet.publicKey,
      })
      .rpc();

    return sig;
  };

  return {
    approveOnChain,
    suspendOnChain,
    connected: !!wallet.publicKey,
    publicKey: wallet.publicKey,
  };
}
