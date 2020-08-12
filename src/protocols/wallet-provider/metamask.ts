import createMetaMaskProvider from 'metamask-extension-provider'
import w3 from 'web3'
import { AsyncCall, EventBasedChannel } from 'async-call-rpc/full'
import { EventEmitter } from 'events'
import type { AbstractProvider } from 'web3-core'
import type { WalletProvider, EthereumAPI } from './index'
import { timeout } from '../../utils/utils'
import { updateExoticWalletsFromSource } from '../../plugins/Wallet/wallet'
import type { ExoticWalletRecord } from '../../plugins/Wallet/database/types'

const web3 = new w3()
export const metamaskProvider = createMetaMaskProvider()
class EthereumJSONRpcChannel implements EventBasedChannel {
    private e = new EventEmitter()
    constructor(public currentProvider: AbstractProvider) {}
    send(data: any): void {
        this.currentProvider.sendAsync(data, (error, result: unknown) => this.e.emit('message', result))
    }
    on(eventListener: (data: unknown) => void) {
        this.e.on('m', eventListener)
        return () => void this.e.off('m', eventListener)
    }
}
export const MetamaskJSONRpc = AsyncCall<EthereumAPI>(
    {},
    {
        channel: new EthereumJSONRpcChannel(metamaskProvider),
        strict: false,
        log: { remoteError: true },
        key: 'Metamask',
    },
)
web3.setProvider(metamaskProvider)

export const provider: WalletProvider = {
    async checkAvailability() {
        try {
            await timeout(MetamaskJSONRpc.eth_getBalance('0', 'latest'), 2000)
            return true
        } catch {
            return false
        }
    },
    async requestAccounts() {
        const list = await timeout(MetamaskJSONRpc.eth_requestAccounts(), 2000)
        const map = new Map<string, Partial<ExoticWalletRecord>>()
        for (const address of list) map.set(address, { address })
        await updateExoticWalletsFromSource('metamask', map)
        return list
    },
}
