import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'

import { AnchorProvider } from '@coral-xyz/anchor'
import type { Wallet } from '@coral-xyz/anchor/dist/cjs/provider.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { getConnection } from '@masknet/web3-providers'
import type { Cluster } from '@solana/web3.js'

export async function getSolanaConnection(cluster?: Cluster) {
    return new SolanaWeb3.Connection(SolanaWeb3.clusterApiUrl(cluster ?? 'devnet'), 'confirmed')
}

export async function getSolanaProvider(cluster?: Cluster | undefined) {
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
