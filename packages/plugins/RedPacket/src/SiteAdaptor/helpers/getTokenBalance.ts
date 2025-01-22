import { type web3 } from '@coral-xyz/anchor'
import type { Cluster } from '@solana/web3.js'
import { getSolanaProvider } from './getSolanaProvider.js'

export async function getTokenBalance(tokenAccount: web3.PublicKey, cluster: Cluster | undefined) {
    const provider = await getSolanaProvider(cluster)
    const response = await provider.connection.getTokenAccountBalance(tokenAccount)
    return response.value
}
