import { web3 } from '@coral-xyz/anchor'
import type { Cluster } from '@solana/web3.js'
import { getSolanaProvider } from './getSolanaProvider.js'

async function getTokenAccounts(tokenMint: web3.PublicKey, cluster: Cluster | undefined) {
    const provider = await getSolanaProvider(cluster)
    const accounts = await provider.connection.getTokenAccountsByOwner(provider.publicKey, {
        mint: new web3.PublicKey(tokenMint),
    })

    return accounts.value
}

export async function getTokenAccount(tokenMint: web3.PublicKey, cluster: Cluster | undefined) {
    const accounts = await getTokenAccounts(tokenMint, cluster)
    if (!accounts.length) return null

    return accounts[0].pubkey
}

export async function getTokenProgram(tokenMint: web3.PublicKey, cluster: Cluster | undefined) {
    const accounts = await getTokenAccounts(tokenMint, cluster)
    if (!accounts.length) return null

    return accounts[0].account.owner
}
