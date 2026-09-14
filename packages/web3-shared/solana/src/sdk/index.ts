import defer * as SolanaWeb3 from '@solana/web3.js'
import { ChainId } from '../types.js'

// Vibe Station is the only public endpoint serving indexed requests (filtered getProgramAccounts),
// which the SPL token list and the SNS domain lookups rely on, so it must stay first.
// The others reject indexed requests and are kept as failover backups for plain calls only.
const Endpoints: Record<ChainId, string[]> = {
    [ChainId.Mainnet]: [
        'https://public.rpc.solanavibestation.com',
        'https://solana-rpc.publicnode.com',
        'https://solana.api.pocket.network',
        'https://solana.leorpc.com/?api_key=FREE',
    ],
    [ChainId.Testnet]: ['https://api.testnet.solana.com'],
    [ChainId.Devnet]: ['https://api.devnet.solana.com'],
    [ChainId.Invalid]: [],
}

export function createClientEndpoints(chainId = ChainId.Mainnet) {
    return Endpoints[chainId]
}

export function createClientEndpoint(chainId = ChainId.Mainnet) {
    return Endpoints[chainId][0] ?? ''
}

export async function fetchWithFailover(chainId: ChainId, init?: RequestInit) {
    let lastError: unknown
    for (const endpoint of createClientEndpoints(chainId)) {
        try {
            const response = await globalThis.fetch(endpoint, init)
            if (response.ok) return response
            lastError = new Error(`Solana RPC ${endpoint} responded with HTTP ${response.status}`)
        } catch (error) {
            lastError = error
        }
    }
    throw lastError instanceof Error ? lastError : new Error('No Solana RPC endpoint is available')
}

export function createClient(chainId = ChainId.Mainnet) {
    return new SolanaWeb3.Connection(createClientEndpoint(chainId), {
        commitment: 'confirmed',
        // replay the request against the backup endpoints when the primary one fails
        fetch: (_info, init) => fetchWithFailover(chainId, init),
    })
}
