import type { Chain } from 'viem'
import {
    arbitrum,
    astar,
    aurora,
    auroraTestnet,
    avalanche,
    avalancheFuji,
    base,
    bsc,
    bscTestnet,
    celo,
    confluxESpace,
    fantom,
    gnosis,
    goerli,
    mainnet,
    metis,
    optimism,
    polygon,
    polygonMumbai,
    scroll,
    sei,
    xLayer,
    xLayerTestnet,
} from 'viem/chains'
import { ChainId } from '../types/index.js'

// Named imports (instead of scanning viem/chains by chain id) so that
// dead testnets keep their dead endpoints and Kovan (42) never resolves
// to the unrelated LUKSO chain reusing the same id.
//
// Base_Goerli and Optimism_Goerli are deliberately absent: both testnets
// are sunset and every known endpoint is gone.
const VIEM_CHAINS: Partial<Record<ChainId, Chain>> = {
    [ChainId.Mainnet]: mainnet,
    [ChainId.Gorli]: goerli,
    [ChainId.BSC]: bsc,
    [ChainId.BSCT]: bscTestnet,
    [ChainId.Base]: base,
    [ChainId.Polygon]: polygon,
    [ChainId.Mumbai]: polygonMumbai,
    [ChainId.Arbitrum]: arbitrum,
    [ChainId.xDai]: gnosis,
    [ChainId.Optimism]: optimism,
    [ChainId.Avalanche]: avalanche,
    [ChainId.Avalanche_Fuji]: avalancheFuji,
    [ChainId.Celo]: celo,
    [ChainId.Fantom]: fantom,
    [ChainId.Aurora]: aurora,
    [ChainId.Aurora_Testnet]: auroraTestnet,
    [ChainId.Conflux]: confluxESpace,
    [ChainId.Astar]: astar,
    [ChainId.Scroll]: scroll,
    [ChainId.Metis]: metis,
    [ChainId.Sei]: sei,
    [ChainId.XLayer]: xLayer,
    [ChainId.XLayer_Testnet]: xLayerTestnet,
}

// The extension calls readonly RPCs directly from browser contexts (the MV3
// manifest has no host_permissions), so every endpoint must send CORS headers.
// These lists replace viem's preset when it includes dead or browser-unfriendly
// endpoints, or covers a chain viem has no preset for.
const RPC_URL_OVERRIDES: Partial<Record<ChainId, string[]>> = {
    // viem 2.45's preset (eth.merkle.io) persistently 429s anonymous traffic
    [ChainId.Mainnet]: [
        'https://ethereum-rpc.publicnode.com',
        'https://eth.drpc.org',
        'https://cloudflare-eth.com',
    ],
    // viem 2.45's preset (polygon-rpc.com) rejects anonymous traffic (401/403)
    [ChainId.Polygon]: [
        'https://polygon-bor-rpc.publicnode.com',
        'https://polygon.drpc.org',
        'https://1rpc.io/matic',
    ],
    // viem 2.45's preset is a single thirdweb free-tier endpoint
    [ChainId.BSC]: [
        'https://bsc-rpc.publicnode.com',
        'https://bsc-dataseed.bnbchain.org',
        'https://56.rpc.thirdweb.com',
    ],
    [ChainId.Fantom]: ['https://rpc.fantom.network', 'https://fantom.drpc.org', 'https://250.rpc.thirdweb.com'],
    // no viem preset; official endpoint first, then a community mirror
    [ChainId.Robinhood]: ['https://rpc.mainnet.chain.robinhood.com', 'https://robinhood-rpc.publicnode.com'],
    // viem's preset mixes in unreachable (hypersync), quota-exhausted (blockeden)
    // and CORS-less (blastapi) endpoints; keep the browser-working subset.
    // OnFinality dropped: stale blocks, eth_getLogs needs an api key
    [ChainId.Metis]: [
        'https://andromeda.metis.io/?owner=1088',
        'https://metis-pokt.nodies.app',
        'https://metis-andromeda.gateway.tenderly.co',
        'https://metis-andromeda.rpc.thirdweb.com',
    ],
}

export function getPublicRPCUrls(chainId: ChainId): string[] {
    const override = RPC_URL_OVERRIDES[chainId]
    if (override) return override
    const chain = VIEM_CHAINS[chainId]
    if (chain) return [...(chain.rpcUrls.public?.http ?? chain.rpcUrls.default.http)]
    return []
}
