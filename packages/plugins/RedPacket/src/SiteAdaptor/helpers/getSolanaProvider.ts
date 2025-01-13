import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'

import { AnchorProvider } from '@coral-xyz/anchor'
import { getConnection } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Wallet } from '@coral-xyz/anchor/dist/cjs/provider.js'

export async function getSolanaProvider() {
    const cnt = getConnection(NetworkPluginID.PLUGIN_SOLANA)

    const network = 'devnet' // Change to 'mainnet-beta' for mainnet
    const connection = new SolanaWeb3.Connection(SolanaWeb3.clusterApiUrl(network), 'confirmed')
    const wallet = {
        publicKey: new SolanaWeb3.PublicKey(await cnt.getAccount()),
        signTransaction: cnt.signTransaction.bind(cnt),
        signAllTransactions: cnt.signTransactions.bind(cnt),
    }
    return new AnchorProvider(connection, wallet as Wallet, {})
}
