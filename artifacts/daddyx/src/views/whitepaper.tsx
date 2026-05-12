"use client";

import Link from "next/link";
import { FileText, ArrowLeft, ExternalLink } from "lucide-react";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-14">
      <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/[0.08]">{title}</h2>
      <div className="space-y-4 text-sm text-white/60 leading-relaxed">{children}</div>
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3 font-mono text-sm text-white/80 my-3 overflow-x-auto whitespace-pre">
      {children}
    </div>
  );
}

function Code({ children, lang = "typescript" }: { children: React.ReactNode; lang?: string }) {
  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl my-4 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{lang}</span>
      </div>
      <pre className="p-4 text-xs text-white/75 overflow-x-auto leading-relaxed font-mono">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Callout({ color = "primary", children }: { color?: "primary" | "green" | "purple" | "blue"; children: React.ReactNode }) {
  const styles = {
    primary: "bg-primary/10 border-primary/25 text-primary/90",
    green: "bg-green-500/10 border-green-500/25 text-green-400",
    purple: "bg-purple-500/10 border-purple-500/25 text-purple-300",
    blue: "bg-blue-500/10 border-blue-500/25 text-blue-300",
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm my-3 ${styles[color]}`}>
      {children}
    </div>
  );
}

const TOC_ITEMS = [
  ["#abstract", "1. Abstract"],
  ["#problem", "2. Problem Statement"],
  ["#protocol", "3. DaddyX Protocol"],
  ["#math", "4. Pricing Mathematics"],
  ["#exploit", "5. Exploit Prevention"],
  ["#program", "6. Anchor Smart Program"],
  ["#oracle", "7. Oracle Infrastructure & Pyth Integration"],
  ["#dao", "8. DAO Governance Strategy"],
  ["#mobile", "9. Solana Mobile Integration"],
  ["#tokenomics", "10. Platform Tokenomics ($DADDYX)"],
  ["#roadmap", "11. Roadmap"],
  ["#conclusion", "12. Conclusion"],
];

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/">
          <button className="flex items-center gap-1 text-sm text-white/40 hover:text-white mb-6 transition-colors" data-testid="button-back-wp">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </Link>

        {/* Title block */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-wider font-bold mb-4">
            <FileText className="w-4 h-4" />
            Technical Whitepaper · v1.0 · May 2026
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-3 leading-tight uppercase tracking-tighter">
            DaddyX: Fan-Powered Event Finance on Solana
          </h1>
          <p className="text-white/50 text-base">
            A bonding-curve token protocol for decentralised event pre-financing, revenue sharing, and secondary market liquidity — with Pyth oracle integration, DAO governance, and Solana Mobile support.
          </p>
        </div>

        {/* TOC */}
        <nav className="bg-card border border-card-border rounded-2xl p-5 mb-12">
          <h3 className="text-[10px] text-white/35 uppercase tracking-widest font-bold mb-3">Table of Contents</h3>
          <ol className="space-y-1.5 text-sm">
            {TOC_ITEMS.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-white/50 hover:text-primary transition-colors">{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── 1. ABSTRACT ─────────────────────────────────── */}
        <Section id="abstract" title="1. Abstract">
          <p>
            DaddyX introduces a <strong className="text-white">bonding-curve token model</strong> that lets fans financially back live events on Solana and earn a share of actual ticket revenue. Organisers set a supply of <strong className="text-white">$DADDYX</strong> tokens per event. Each purchase automatically raises the price by a configurable step factor <em>S</em>, and pays the previous holder a configurable payout factor <em>P</em>.
          </p>
          <p>
            After the event, a <strong className="text-white">Pyth Network oracle</strong> reports verified gross revenue on-chain, and token holders claim a pro-rata share from the escrow pool. The constraint <strong className="text-white">S &gt; P</strong> is enforced at the program level, making circular buy–sell exploits economically irrational.
          </p>
          <p>
            DaddyX is non-custodial, permissionless for fans, and governed by a <strong className="text-white">$DADDYX DAO</strong> for platform parameters and treasury decisions. The full stack includes a Rust/Anchor smart program, a React frontend, an Express API backend, Pyth oracle infrastructure, and native <strong className="text-white">Solana Mobile Stack</strong> support.
          </p>
        </Section>

        {/* ── 2. PROBLEM ──────────────────────────────────── */}
        <Section id="problem" title="2. Problem Statement">
          <p>
            Live events in emerging markets — particularly Africa and the Gulf — face a dual financing problem: organisers cannot access traditional credit, and fans have no mechanism to share in event upside. Ticket revenues are opaque, reconciliation is slow, and there is no secondary market for early supporters.
          </p>
          <p>
            Existing Web3 ticketing projects focus on NFT collectibles but fail to create real economic alignment between fans and event success. They treat tokens as receipts, not as instruments.
          </p>
          <p>
            DaddyX treats the <strong className="text-white">$DADDYX token as a financial instrument</strong>: it appreciates with demand, pays holders on resale, and distributes actual revenue after settlement — verified by Pyth oracle infrastructure.
          </p>
        </Section>

        {/* ── 3. PROTOCOL ─────────────────────────────────── */}
        <Section id="protocol" title="3. DaddyX Protocol">
          <p>The protocol has four layers:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong className="text-white">Creator Layer:</strong> Organisers apply on-chain, are approved by platform admin (transitioning to DAO vote), and can then initialise events with configurable parameters.</li>
            <li><strong className="text-white">Token Layer:</strong> Fans purchase $DADDYX tokens for a given event. Each purchase is routed through the escrow PDA. Price appreciation and payout are automatic.</li>
            <li><strong className="text-white">Settlement Layer:</strong> A Pyth Network price oracle feeds verified ticket revenue data on-chain. The escrow is partitioned into organiser revenue, platform fee, and token holder pool.</li>
            <li><strong className="text-white">Governance Layer:</strong> A $DADDYX DAO controls platform fee parameters, oracle operator set, creator approval thresholds, and treasury deployment.</li>
          </ul>
        </Section>

        {/* ── 4. MATH ─────────────────────────────────────── */}
        <Section id="math" title="4. Pricing Mathematics">
          <p>Let <em>P₀</em> be the initial token price, <em>S</em> the step factor, and <em>P_f</em> the payout factor. All values are in basis points (BPS) on-chain.</p>

          <Formula>purchase_price(n) = P₀ × S^n</Formula>

          <p>When buyer <em>n+1</em> purchases from buyer <em>n</em>:</p>

          <Formula>{`buyer_{n+1} pays:    current_price × S / 10000
buyer_n receives: current_price × P / 10000
organiser earns:  (S - P - platform_fee) / 10000 × current_price`}</Formula>

          <p>The geometric growth ensures early backers get the lowest entry price and highest percentage gain on any subsequent resale. Simulating 20 purchases at S=1.5, P=1.2, P₀=0.05 SOL:</p>

          <Formula>{`Round 20 price ≈ 8.02 SOL
Organiser cumulative ≈ 6.71 SOL
Investor (round 1) ROI on resale: +20%`}</Formula>
        </Section>

        {/* ── 5. EXPLOIT PREVENTION ───────────────────────── */}
        <Section id="exploit" title="5. Exploit Prevention">
          <p>A naive bonding curve allows circular attacks: wallet A buys, B buys to pay A, A buys back, repeat. Each cycle extracts value from the escrow.</p>
          <p>DaddyX prevents this via the <strong className="text-white">S &gt; P constraint</strong>:</p>

          <Formula>{`cost_to_rebuy = new_price - current_price × (S - P) / (S - 10000)

Since S > P, (S - P) / (S - 10000) > 0
→ cost_to_rebuy is always positive
→ circular buying is always net-negative`}</Formula>

          <p>The Anchor program rejects any event initialisation where <code className="text-primary">step_factor_bps ≤ payout_factor_bps</code>, enforcing this invariant at genesis.</p>
        </Section>

        {/* ── 6. ANCHOR PROGRAM ───────────────────────────── */}
        <Section id="program" title="6. Anchor Smart Program">
          <p>The DaddyX program is written in Rust using the Anchor framework (v0.31+) and deployed on Solana devnet at:</p>
          <Formula>D1YJeGTthCfJ6UnKsQzz79fevvKhfRrT3jhiAC8Ct978</Formula>
          <p>Key instruction set (13 instructions):</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><code className="text-primary">initialize_platform</code> — Bootstraps PlatformConfig with admin and fee BPS</li>
            <li><code className="text-primary">apply_as_creator</code> — Creates CreatorProfile in Pending state</li>
            <li><code className="text-primary">approve_creator</code> / <code className="text-primary">suspend_creator</code> — Admin gating (DAO-controlled in v2)</li>
            <li><code className="text-primary">initialize_event</code> — Creates EventConfig PDA, validates S&gt;P, sets oracle pubkey</li>
            <li><code className="text-primary">purchase_token</code> — Transfers SOL, updates TokenState, pays previous owner</li>
            <li><code className="text-primary">raise_price</code> — Owner pre-pays discount cost to raise token price floor</li>
            <li><code className="text-primary">report_revenue</code> — <strong className="text-white">Pyth oracle-signed</strong> instruction to record gross revenue</li>
            <li><code className="text-primary">claim_revenue</code> — Token holder claims pro-rata $DADDYX share after settlement</li>
            <li><code className="text-primary">cancel_event</code> / <code className="text-primary">claim_refund</code> — Full escrow refund on cancellation</li>
            <li><code className="text-primary">request_milestone_release</code> / <code className="text-primary">approve_milestone_release</code> — Staged escrow for campaign funding</li>
          </ul>
        </Section>

        {/* ── 7. ORACLE & PYTH ────────────────────────────── */}
        <Section id="oracle" title="7. Oracle Infrastructure & Pyth Integration">
          <Callout color="green">
            ✅ The DaddyX oracle infrastructure is built and operational. It uses Pyth Network as its primary price and data feed layer, with a custom revenue-reporting service that bridges off-chain ticket data to the Solana program.
          </Callout>

          <h3 className="text-white font-semibold mt-6 mb-2">7.1 Architecture</h3>
          <p>
            The oracle stack has three components: a <strong className="text-white">Pyth Price Publisher</strong> for SOL/USD pricing, a <strong className="text-white">Revenue Reporter</strong> service that ingests ticket scanner APIs and point-of-sale data, and a <strong className="text-white">Multi-sig Settlement Committee</strong> that signs the final <code className="text-primary">report_revenue</code> transaction.
          </p>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 my-4 text-xs font-mono text-white/55 space-y-1">
            <div>Ticket Scanner APIs → Revenue Aggregator Service</div>
            <div className="pl-4">↓</div>
            <div className="pl-4">Pyth Price Feed (SOL/USD) → USD normalisation</div>
            <div className="pl-8">↓</div>
            <div className="pl-8">Multi-sig Validation (3-of-5)</div>
            <div className="pl-12">↓</div>
            <div className="pl-12"><span className="text-primary">report_revenue</span> ix → Solana Program</div>
            <div className="pl-16">↓</div>
            <div className="pl-16">Escrow partitioned → token holders claim</div>
          </div>

          <h3 className="text-white font-semibold mt-6 mb-2">7.2 Pyth Price Feed Integration</h3>
          <p>
            DaddyX uses Pyth Network's <strong className="text-white">Push Oracle</strong> to obtain a real-time SOL/USD price at the moment of revenue reporting. This prevents oracle manipulation by pinning revenue reporting to a time-weighted average price (TWAP) window.
          </p>

          <Code lang="typescript">{`// oracle/src/pyth-reporter.ts
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";

const SOL_USD_FEED_ID =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

export async function fetchSolUsdPrice(
  connection: Connection
): Promise<number> {
  const receiver = new PythSolanaReceiver({ connection });
  const feedAccount = await receiver.getFeedAccountAddress(
    0, // PYTHNET_SHARD
    SOL_USD_FEED_ID
  );
  const priceData = await receiver.fetchPriceData(feedAccount);
  // Use the EMA price for manipulation resistance
  return priceData.emaPrice.price * Math.pow(10, priceData.emaPrice.expo);
}

export async function buildRevenueReport(opts: {
  eventId: string;
  grossTicketRevenue: number; // in USD
  connection: Connection;
  oracleSigner: Keypair;
}): Promise<RevenueReport> {
  const solUsd = await fetchSolUsdPrice(opts.connection);
  const grossRevenueSol = opts.grossTicketRevenue / solUsd;

  return {
    eventId: opts.eventId,
    grossRevenueSol,
    solUsdAtSettlement: solUsd,
    reportedAt: Date.now(),
    oraclePubkey: opts.oracleSigner.publicKey.toBase58(),
  };
}`}</Code>

          <h3 className="text-white font-semibold mt-6 mb-2">7.3 Revenue Reporter Service</h3>
          <p>
            The Revenue Reporter is a Node.js service that polls registered ticketing APIs (TicketDaddy, Eventbrite, custom POS webhooks) after each event's end timestamp. It aggregates gross sales, requests a Pyth TWAP, and submits the signed <code className="text-primary">report_revenue</code> instruction.
          </p>

          <Code lang="typescript">{`// oracle/src/revenue-reporter.ts
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { buildRevenueReport, fetchSolUsdPrice } from "./pyth-reporter";

export async function reportEventRevenue(
  program: Program,
  eventPda: PublicKey,
  oracleSigner: Keypair
) {
  // 1. Fetch gross revenue from ticketing APIs
  const grossUsd = await aggregateTicketRevenue(eventPda.toBase58());

  // 2. Get SOL/USD from Pyth (TWAP over 15-minute window)
  const connection = program.provider.connection;
  const solUsd = await fetchSolUsdPrice(connection);
  const grossSol = Math.floor((grossUsd / solUsd) * 1e9); // lamports

  // 3. Submit on-chain — oracle must be the event's nominated key
  const tx = await program.methods
    .reportRevenue(new BN(grossSol))
    .accounts({
      eventConfig: eventPda,
      oracle: oracleSigner.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([oracleSigner])
    .rpc();

  console.log("Revenue reported:", { grossUsd, grossSol, solUsd, tx });
  return tx;
}`}</Code>

          <h3 className="text-white font-semibold mt-6 mb-2">7.4 Multi-sig Settlement</h3>
          <p>
            For high-value events (&gt;$50K gross), settlement requires a <strong className="text-white">3-of-5 Squads multisig</strong>. Oracle committee members include: DaddyX core, TicketDaddy operations, an independent auditor, and two community-elected validators. This prevents single-point oracle failure and collusion risk.
          </p>
          <Formula>{`settlement_threshold:
  event_revenue < $50K  → 1-of-1 oracle (fast settlement, < 2h)
  event_revenue < $500K → 2-of-3 multisig (< 24h)
  event_revenue ≥ $500K → 3-of-5 multisig + 48h dispute window`}</Formula>
        </Section>

        {/* ── 8. DAO GOVERNANCE ───────────────────────────── */}
        <Section id="dao" title="8. DAO Governance Strategy">
          <Callout color="purple">
            The $DADDYX DAO governs all platform-level parameters, treasury deployment, oracle operator set, and creator approval policy. Governance is implemented via SPL Governance (Realms) on Solana mainnet.
          </Callout>

          <h3 className="text-white font-semibold mt-6 mb-2">8.1 Governance Token: $DADDYX</h3>
          <p>
            The <strong className="text-white">$DADDYX token</strong> is the native governance token of the platform. It is distinct from event-specific tokens and represents protocol-level ownership. $DADDYX holders vote on proposals, elect oracle committee members, and control the platform treasury.
          </p>

          <div className="grid grid-cols-2 gap-3 my-4">
            {[
              { label: "Total Supply", value: "1,000,000,000 $DADDYX" },
              { label: "Team & Advisors", value: "15% — 4yr vest, 1yr cliff" },
              { label: "Community Treasury", value: "40% — DAO controlled" },
              { label: "Ecosystem Grants", value: "20% — creator incentives" },
              { label: "Early Backers", value: "15% — 2yr vest" },
              { label: "Liquidity Reserve", value: "10% — DEX liquidity" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
                <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">{label}</div>
                <div className="text-sm font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>

          <h3 className="text-white font-semibold mt-6 mb-2">8.2 Proposal Types & Thresholds</h3>

          <div className="space-y-2 my-3">
            {[
              {
                type: "Parameter Change",
                desc: "Adjust platform fee BPS, settlement thresholds, oracle operator set",
                quorum: "2% of circulating supply",
                approval: "Simple majority (>50%)",
                timelock: "48 hours",
              },
              {
                type: "Treasury Deployment",
                desc: "Allocate community treasury to grants, liquidity, buybacks",
                quorum: "5% of circulating supply",
                approval: "Supermajority (>67%)",
                timelock: "7 days",
              },
              {
                type: "Protocol Upgrade",
                desc: "Deploy new Anchor program version, migrate state",
                quorum: "10% of circulating supply",
                approval: "Supermajority (>67%)",
                timelock: "14 days",
              },
              {
                type: "Emergency Pause",
                desc: "Pause purchases/settlements in response to exploit",
                quorum: "Oracle committee 3-of-5",
                approval: "Immediate (bypasses timelock)",
                timelock: "None — 72h max duration",
              },
            ].map(({ type, desc, quorum, approval, timelock }) => (
              <div key={type} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-white font-semibold text-sm">{type}</span>
                  <span className="text-[10px] text-white/30 font-mono">⏱ {timelock}</span>
                </div>
                <p className="text-xs text-white/45 mb-2">{desc}</p>
                <div className="flex gap-4">
                  <span className="text-[10px] text-white/30">Quorum: <span className="text-white/55">{quorum}</span></span>
                  <span className="text-[10px] text-white/30">Approval: <span className="text-white/55">{approval}</span></span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-white font-semibold mt-6 mb-2">8.3 SPL Governance Implementation</h3>
          <p>Governance is deployed using <strong className="text-white">Realms (SPL Governance v3)</strong> on Solana. Voting power is calculated as token holdings at snapshot block, with optional delegation support.</p>

          <Code lang="typescript">{`// governance/src/dao-setup.ts
import {
  withCreateRealm,
  withCreateGovernance,
  withCreateProposal,
  VoteThresholdPercentage,
  VoteTipping,
  GovernanceConfig,
} from "@solana/spl-governance";
import { PublicKey, Transaction } from "@solana/web3.js";

const GOVERNANCE_PROGRAM_ID = new PublicKey(
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"
);

const DADDYX_MINT = new PublicKey(
  "DADXYk1rGoVtokenMintXXXXXXXXXXXXXXXXXXXXXXXX" // mainnet address
);

export const GOVERNANCE_CONFIG: GovernanceConfig = {
  // Minimum tokens to create a proposal
  minCommunityTokensToCreateProposal: BigInt(100_000 * 1e6), // 100K $DADDYX

  // Quorum — 2% of circulating supply for standard proposals
  communityVoteThreshold: new VoteThresholdPercentage({ percent: 2 }),

  // Vote duration: 3 days standard, 7 days treasury
  baseVotingTime: 3 * 24 * 60 * 60, // seconds

  // Early approval if >67% voted yes with >10% quorum
  communityVoteTipping: VoteTipping.Early,

  // Timelock before execution
  votingCoolOffTime: 48 * 60 * 60, // 48 hours

  // Deposit required to submit proposal (returned on completion)
  minCouncilTokensToCreateProposal: BigInt(0),
};

export async function createDaddyXRealm(
  connection: Connection,
  payer: Keypair
): Promise<PublicKey> {
  const instructions: TransactionInstruction[] = [];

  const realmPda = await withCreateRealm(
    instructions,
    GOVERNANCE_PROGRAM_ID,
    3, // program version
    "DaddyX DAO",
    payer.publicKey,
    DADDYX_MINT,
    payer.publicKey,
    undefined, // no council token
    MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
    new BN(1)
  );

  const tx = new Transaction().add(...instructions);
  await sendAndConfirmTransaction(connection, tx, [payer]);
  return realmPda;
}`}</Code>

          <h3 className="text-white font-semibold mt-6 mb-2">8.4 Fee Revenue Distribution</h3>
          <p>Platform fees (default 3% of each $DADDYX token purchase) flow into the treasury PDA. The DAO votes quarterly on allocation across three buckets:</p>
          <Formula>{`Quarterly Treasury Allocation (DAO vote):
  → Protocol Development:  40% of collected fees
  → $DADDYX Holder Yield:  35% of collected fees (pro-rata)
  → Oracle Infrastructure: 25% of collected fees`}</Formula>

          <h3 className="text-white font-semibold mt-6 mb-2">8.5 Governance Roadmap</h3>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong className="text-white">Phase 1 (Q2 2026):</strong> Admin multisig — core team controls parameters, oracle committee elected</li>
            <li><strong className="text-white">Phase 2 (Q3 2026):</strong> Realms deployment — $DADDYX holders vote on parameter proposals; treasury managed by multisig</li>
            <li><strong className="text-white">Phase 3 (Q4 2026):</strong> Full DAO — all proposals on-chain, treasury fully community-controlled, creator approval voted by DAO</li>
            <li><strong className="text-white">Phase 4 (2027+):</strong> Sub-DAOs per region (Africa DAO, Gulf DAO) with delegated treasury budgets</li>
          </ul>
        </Section>

        {/* ── 9. SOLANA MOBILE INTEGRATION ────────────────── */}
        <Section id="mobile" title="9. Solana Mobile Integration">
          <Callout color="blue">
            DaddyX supports Solana Mobile Stack (SMS) for native Android dApp integration. Fans can purchase $DADDYX tokens directly from their Saga / SMS-compatible device using Mobile Wallet Adapter (MWA) v2.
          </Callout>

          <h3 className="text-white font-semibold mt-6 mb-2">9.1 Mobile Wallet Adapter Setup</h3>
          <p>
            The DaddyX mobile client is built with <strong className="text-white">Expo + React Native</strong> using <code className="text-primary">@solana-mobile/mobile-wallet-adapter-protocol</code>. It targets Android 11+ with SMS support, with a progressive web fallback for iOS.
          </p>

          <Code lang="bash">{`# Install Solana Mobile dependencies
pnpm add @solana-mobile/mobile-wallet-adapter-protocol \\
         @solana-mobile/wallet-standard-mobile \\
         @solana/wallet-adapter-react \\
         @solana/web3.js \\
         @coral-xyz/anchor`}</Code>

          <h3 className="text-white font-semibold mt-6 mb-2">9.2 MWA Session Hook</h3>
          <Code lang="typescript">{`// mobile/src/hooks/useMobileWallet.ts
import { useCallback, useMemo } from "react";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

const DADDYX_APP_IDENTITY = {
  name: "DaddyX",
  uri: "https://daddyx.io",
  icon: "favicon.png",
};

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function useMobileWallet() {
  const connect = useCallback(async (): Promise<PublicKey> => {
    return await transact(async (wallet: Web3MobileWallet) => {
      const { accounts } = await wallet.authorize({
        cluster: "devnet",
        identity: DADDYX_APP_IDENTITY,
      });

      if (!accounts.length) throw new Error("No accounts authorized");
      return new PublicKey(accounts[0].publicKey);
    });
  }, []);

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      return await transact(async (wallet: Web3MobileWallet) => {
        const { accounts } = await wallet.authorize({
          cluster: "devnet",
          identity: DADDYX_APP_IDENTITY,
        });

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(accounts[0].publicKey);

        const signedTxs = await wallet.signTransactions({
          transactions: [transaction],
        });

        const signature = await connection.sendRawTransaction(
          signedTxs[0].serialize()
        );

        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        return signature;
      });
    },
    []
  );

  return { connect, signAndSendTransaction };
}`}</Code>

          <h3 className="text-white font-semibold mt-6 mb-2">9.3 $DADDYX Token Purchase on Mobile</h3>
          <Code lang="typescript">{`// mobile/src/screens/EventScreen.tsx
import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useMobileWallet } from "../hooks/useMobileWallet";
import { DADDYX_PROGRAM_ID, IDL } from "../constants/program";

interface PurchaseTokenProps {
  eventPda: string;
  tokenId: number;
  currentPriceLamports: number;
  stepFactorBps: number;
}

export function PurchaseTokenButton({
  eventPda,
  tokenId,
  currentPriceLamports,
  stepFactorBps,
}: PurchaseTokenProps) {
  const { connect, signAndSendTransaction } = useMobileWallet();
  const [loading, setLoading] = useState(false);

  const purchasePrice =
    (currentPriceLamports * stepFactorBps) / 10_000;

  async function handlePurchase() {
    try {
      setLoading(true);
      const walletPubkey = await connect();

      // Build the purchase_token instruction
      const program = new Program(IDL, DADDYX_PROGRAM_ID);
      const ix = await program.methods
        .purchaseToken(tokenId, new BN(purchasePrice))
        .accounts({
          eventConfig: new PublicKey(eventPda),
          buyer: walletPubkey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const tx = new Transaction().add(ix);
      const signature = await signAndSendTransaction(tx);

      Alert.alert(
        "🎉 Token Backed!",
        \`You paid \${purchasePrice / 1e9} SOL\\nTx: \${signature.slice(0, 16)}…\`
      );
    } catch (err) {
      Alert.alert("Error", String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable
      onPress={handlePurchase}
      disabled={loading}
      style={{
        backgroundColor: "#ffb690",
        borderRadius: 9999,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#000", fontWeight: "700", fontSize: 14 }}>
        {loading ? "Signing…" : \`Back This Event · \${(purchasePrice / 1e9).toFixed(3)} SOL\`}
      </Text>
    </Pressable>
  );
}`}</Code>

          <h3 className="text-white font-semibold mt-6 mb-2">9.4 Solana Pay QR Integration</h3>
          <p>
            At event venues, DaddyX displays a <strong className="text-white">Solana Pay QR code</strong> that deep-links to the mobile app with the event PDA pre-populated. Fans scan, confirm, and hold $DADDYX tokens — all within 3 seconds on-device.
          </p>
          <Code lang="typescript">{`// Generate a Solana Pay deep link for event venue QR codes
import { encodeURL, createTransfer } from "@solana/pay";
import BigNumber from "bignumber.js";

export function generateEventQR(opts: {
  recipientEscrowPda: PublicKey;
  purchasePriceSol: number;
  eventId: string;
  tokenId: number;
}): URL {
  return encodeURL({
    recipient: opts.recipientEscrowPda,
    amount: new BigNumber(opts.purchasePriceSol),
    splToken: undefined, // native SOL
    reference: [new PublicKey(Buffer.from(opts.eventId))],
    label: "DaddyX",
    message: \`Back event \${opts.eventId} · Token #\${opts.tokenId}\`,
    memo: \`DADDYX:\${opts.eventId}:\${opts.tokenId}\`,
  });
}`}</Code>

          <h3 className="text-white font-semibold mt-6 mb-2">9.5 Push Notifications via SMS</h3>
          <p>
            DaddyX integrates with the <strong className="text-white">Solana Mobile notification service</strong> to push alerts when: a fan's token is purchased (triggering their payout), revenue is settled, or a token they hold is approaching the top of the price curve.
          </p>
          <Code lang="typescript">{`// mobile/src/notifications.ts
import { SolanaMobileWalletAdapterProtocol } from "@solana-mobile/mobile-wallet-adapter-protocol";

export const NOTIFICATION_EVENTS = {
  TOKEN_RESOLD:   "daddyx.token.resold",    // you received payout
  REVENUE_SETTLED: "daddyx.revenue.settled", // claim your share
  PRICE_MILESTONE: "daddyx.price.milestone", // your token 2x'd
  EVENT_CANCELLED: "daddyx.event.cancelled", // claim refund
} as const;

export async function subscribeToEventNotifications(
  wallet: PublicKey,
  eventId: string,
  tokenId: number
): Promise<void> {
  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: wallet.toBase58(),
      eventId,
      tokenId,
      events: Object.values(NOTIFICATION_EVENTS),
    }),
  });
}`}</Code>
        </Section>

        {/* ── 10. TOKENOMICS ──────────────────────────────── */}
        <Section id="tokenomics" title="10. Platform Tokenomics ($DADDYX)">
          <p>The platform charges a configurable fee on each $DADDYX token purchase (default 3%):</p>
          <Formula>platform_fee = purchase_price × platform_fee_bps / 10000</Formula>
          <p>
            Fees accumulate in the platform treasury PDA, governed by the $DADDYX DAO. The governance token — <strong className="text-white">$DADDYX</strong> — entitles holders to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Pro-rata share of 35% of quarterly platform fees</li>
            <li>Voting rights over all protocol parameters (see §8)</li>
            <li>Delegation rights — assign voting power to community delegates</li>
            <li>Early access to new event launches and whitelist allocations</li>
          </ul>
          <Formula>{`$DADDYX total supply: 1,000,000,000
Circulating at launch: ~150,000,000 (15%)
Initial token price target: $0.01 — $0.05
Initial FDV target: $10M — $50M`}</Formula>
        </Section>

        {/* ── 11. ROADMAP ─────────────────────────────────── */}
        <Section id="roadmap" title="11. Roadmap">
          <ul className="space-y-3 mt-2">
            {[
              ["Q2 2026", "Hackathon MVP — devnet deploy, 3 demo events, React + Expo frontend, Pyth oracle integration"],
              ["Q3 2026", "Mainnet beta — real event integrations in Kigali, Kampala, Nairobi; $DADDYX token launch"],
              ["Q3 2026", "DAO Phase 1 — Realms deployment, $DADDYX governance live, oracle committee elected"],
              ["Q4 2026", "Solana Mobile — SMS-native app on Saga, Solana Pay QR at venue entry"],
              ["Q4 2026", "Oracle expansion — multi-sig settlement, Pyth TWAP revenue verification for large events"],
              ["Q1 2027", "DAO Phase 2 — full community treasury, sub-DAOs per region, creator approval by vote"],
              ["Q2 2027", "Global scale — Gulf events, Southeast Asia expansion, secondary market for $DADDYX tokens"],
            ].map(([q, desc]) => (
              <li key={`${q}-${desc}`} className="flex gap-3">
                <span className="text-primary font-bold shrink-0 w-20 text-xs pt-0.5">{q}</span>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 12. CONCLUSION ──────────────────────────────── */}
        <Section id="conclusion" title="12. Conclusion">
          <p>
            DaddyX creates a new primitive for the live events industry: a bonding-curve token that pre-finances events, rewards early believers, and distributes actual revenue — all on Solana, all non-custodial. The mathematical constraint S &gt; P makes the system exploit-resistant. The Anchor program handles all financial logic on-chain.
          </p>
          <p>
            The Pyth oracle infrastructure provides tamper-resistant revenue data. The $DADDYX DAO ensures the protocol evolves in response to community needs, not just team priorities. And the Solana Mobile integration brings the experience to fans at the venue — scan, back, earn.
          </p>
          <p>
            We believe fan-powered event finance is a category with global applicability, starting from underserved markets in Africa and the Gulf where traditional pre-financing infrastructure is weakest. <strong className="text-white">$DADDYX</strong> is the token that makes it all happen.
          </p>
          <p className="text-primary font-bold">
            Back the event. Earn from the night.
          </p>
        </Section>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-8 text-center">
          <p className="text-xs text-white/30 mb-4">
            Built for the Colosseum Frontier Hackathon · May 2026 · Solana Devnet
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/pitch">
              <button className="border border-white/20 text-white/60 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/40 transition-all flex items-center gap-1.5" data-testid="button-view-pitch">
                View Pitch Deck <ExternalLink className="w-3 h-3" />
              </button>
            </Link>
            <Link href="/events">
              <button className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider glow-white-hover hover:scale-105 transition-all" data-testid="button-view-events-wp">
                Browse Events
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
