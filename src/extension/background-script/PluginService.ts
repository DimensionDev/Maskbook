import * as RedPacket from '../../plugins/Wallet/red-packet-fsm'
import * as Wallet from '../../plugins/Wallet/wallet'
import * as Gitcoin from '../../plugins/Gitcoin/Services'
import type BigNumber from 'bignumber.js'
import type { ERC20TokenRecord, ManagedWalletRecord, ExoticWalletRecord } from '../../plugins/Wallet/database/types'

const Plugins = {
    'maskbook.red_packet': RedPacket,
    'maskbook.wallet': Wallet,
    'co.gitcoin': Gitcoin,
} as const
type Plugins = typeof Plugins
export async function invokePlugin<K extends keyof Plugins, M extends keyof Plugins[K], P extends Plugins[K][M]>(
    key: K,
    method: M,
    ...args: Parameters<P extends (...args: any) => any ? P : never>
): Promise<P extends (...args: any) => Promise<infer R> ? R : never> {
    // @ts-ignore
    return Plugins[key][method](...args)
}

export type WalletDetails = ManagedWalletRecord | ExoticWalletRecord
export type ERC20TokenDetails = Pick<ERC20TokenRecord, 'address' | 'decimals' | 'name' | 'network' | 'symbol'>
export async function getWallets(): Promise<{ wallets: WalletDetails[]; tokens: ERC20TokenDetails[] }> {
    // TODO: support Metamask
    const { tokens, wallets: managedList } = await Wallet.getManagedWallets()
    const wallets = managedList
        .sort((x) => (x._wallet_is_default ? 1 : 0))
        .map<WalletDetails>((x) => ({
            ...x,
            type: x.type || 'managed',
        }))

    console.log(`DEBUG: getManagedWallet`)
    console.log(wallets.map((wallet) => wallet?.erc20_token_balance.keys()))

    return { wallets, tokens }
}
export async function getManagedWallet(address: string) {
    const { wallets } = await Wallet.getManagedWallets()
    const wallet = wallets.find((x) => x.address === address)

    console.log(`DEBUG: getManagedWallet`)
    console.log(`DEBUG: address: ${address}`)
    console.log(wallet?.erc20_token_balance.keys())

    return wallet
}
