import * as RedPacket from '../../plugins/Wallet/red-packet-fsm'
import * as Wallet from '../../plugins/Wallet/wallet'
import * as Gitcoin from '../../plugins/Gitcoin/Services'
import * as FileService from '../../plugins/FileService/service'
import type { ERC20TokenRecord, ManagedWalletRecord, ExoticWalletRecord } from '../../plugins/Wallet/database/types'
import BigNumber from 'bignumber.js'
import { metamask } from '../../protocols/wallet-provider/metamask-provider'

const Plugins = {
    'maskbook.red_packet': RedPacket,
    'maskbook.wallet': Wallet,
    'maskbook.fileservice': FileService,
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
    const walletAddress = await metamask.eth_requestAccounts()
    const wallets = await Promise.all(
        walletAddress.map<Promise<ExoticWalletRecord>>(async (address, index) => ({
            name: 'Metamask ' + index,
            address,
            eth_balance: new BigNumber(await metamask.eth_getBalance(address, 'latest')),
            erc20_token_balance: new Map(),
            erc20_token_blacklist: new Set(),
            erc20_token_whitelist: new Set(),
            createdAt: new Date(),
            updatedAt: new Date(),
            provider: 'metamask',
            type: 'exotic',
        })),
    )
    return { wallets, tokens: [] }
}
export async function getManagedWallet(address: string) {
    const { wallets } = await Wallet.getManagedWallets()
    return wallets.find((x) => x.address === address)
}
