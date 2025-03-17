import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'

import { AnchorProvider } from '@coral-xyz/anchor'
import type { Wallet } from '@coral-xyz/anchor/dist/cjs/provider.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { getConnection } from '@masknet/web3-providers'
import type { Cluster } from '@solana/web3.js'

const SOLANA_ENDPOINT =
    process.env.SOLANA_RPC_ENDPOINT || 'https://solana-mainnet.g.alchemy.com/v2/7ktku04g0dx9l6ijyba3fy99h0ic0xf3'
export async function getSolanaConnection(cluster: Cluster | undefined) {
    const url = !cluster || cluster === 'mainnet-beta' ? SOLANA_ENDPOINT : SolanaWeb3.clusterApiUrl(cluster)
    return new SolanaWeb3.Connection(url, 'confirmed')
}

export async function getSolanaProvider(cluster: Cluster | undefined) {
    const cnt = getConnection(NetworkPluginID.PLUGIN_SOLANA)

    const connection = await getSolanaConnection(cluster)
    const account = await cnt.getAccount()

    const wallet = {
        publicKey: account ? new SolanaWeb3.PublicKey(account) : null,
        signTransaction: cnt.signTransaction.bind(cnt),
        signAllTransactions: cnt.signTransactions.bind(cnt),
    }
    return new AnchorProvider(connection, wallet as Wallet, AnchorProvider.defaultOptions())
}
