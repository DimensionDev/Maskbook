import * as RedPacket from '../../plugins/Wallet/red-packet-fsm'
import * as Wallet from '../../plugins/Wallet/wallet'
import * as Gitcoin from '../../plugins/Gitcoin/Services'
import type BigNumber from 'bignumber.js'
import type { ERC20TokenRecord } from '../../plugins/Wallet/database/types'

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

export type WalletDetails = {
    walletAddress: string
    /** undefined means "syncing..." */
    ethBalance: BigNumber | undefined
    /** key: address of erc20 token; value: undefined means "syncing..." */
    erc20tokensBalanceMap: Map<string, BigNumber | undefined>
    walletName?: string
}
export type ERC20TokenDetails = Pick<ERC20TokenRecord, 'address' | 'decimals' | 'name' | 'network' | 'symbol'>
export async function getWallets(): Promise<{ wallets: WalletDetails[]; tokens: ERC20TokenDetails[] }> {
    // TODO: support Metamask
    const { tokens, wallets: walletList } = await Wallet.getManagedWallets()
    const wallets = walletList
        .sort((x) => (x._wallet_is_default ? 1 : 0))
        .map<WalletDetails>((x) => ({
            walletAddress: x.address,
            erc20tokensBalanceMap: x.erc20_token_balance,
            ethBalance: x.eth_balance,
            walletName: x.name ?? undefined,
        }))
    return { wallets, tokens }
}
export async function getManagedWalletDetail(address: string) {
    const { wallets } = await Wallet.getManagedWallets()
    const wallet = wallets.find((x) => x.address === address)
    return wallet
}
