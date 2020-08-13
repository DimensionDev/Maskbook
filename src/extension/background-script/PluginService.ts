import * as RedPacket from '../../plugins/Wallet/red-packet-fsm'
import * as Wallet from '../../plugins/Wallet/wallet'
import * as Gitcoin from '../../plugins/Gitcoin/Services'
import * as FileService from '../../plugins/FileService/service'
import type { ERC20TokenRecord, ManagedWalletRecord, ExoticWalletRecord } from '../../plugins/Wallet/database/types'
import { EthereumNetwork } from '../../plugins/Wallet/database/types'
import { getWalletProvider, web3 } from '../../plugins/Wallet/web3'
import type { WalletProviderType } from '../../plugins/shared/findOutProvider'

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
export { getTokens, getWallets } from '../../plugins/Wallet/wallet'
export async function connectExoticWallet(kind: WalletProviderType) {
    await getWalletProvider(kind).requestAccounts()
}
export async function getCurrentEthChain() {
    const x = await web3.eth.getChainId()
    if (x === 1) return EthereumNetwork.Mainnet
    if (x === 3) return EthereumNetwork.Ropsten
    if (x === 4) return EthereumNetwork.Rinkeby
    throw new Error('Unsupported EthNetwork')
}
export async function getManagedWallet(address: string) {
    const { wallets } = await Wallet.getManagedWallets()
    return wallets.find((x) => x.address === address)
}
