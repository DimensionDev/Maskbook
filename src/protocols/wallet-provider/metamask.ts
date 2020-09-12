import createMetaMaskProvider from 'metamask-extension-provider'
import w3 from 'web3'
import { AsyncCall, EventBasedChannel } from 'async-call-rpc/full'
import { EventEmitter } from 'events'
import type { AbstractProvider } from 'web3-core'
import type { EthereumAPI, WalletProvider } from './index'
import { timeout } from '../../utils/utils'
import { updateExoticWalletsFromSource } from '../../plugins/Wallet/wallet'
import type { ExoticWalletRecord } from '../../plugins/Wallet/database/types'
import { WalletProviderType } from '../../plugins/shared/findOutProvider'
import { Result } from 'ts-results'

class EthereumJSONRpcChannel implements EventBasedChannel {
    private e = new EventEmitter()
    constructor(public currentProvider: Result<AbstractProvider, unknown>) {}
    send(data: any): void {
        this.currentProvider.unwrap().sendAsync(data, (error, result: unknown) => this.e.emit('m', result))
    }
    on(eventListener: (data: unknown) => void) {
        this.e.on('m', eventListener)
        return () => void this.e.off('m', eventListener)
    }
}
const MetaMaskWeb3Provider = Result.wrap(createMetaMaskProvider)
const MetamaskJSONRPC = AsyncCall<EthereumAPI>(
    {},
    {
        channel: new EthereumJSONRpcChannel(MetaMaskWeb3Provider),
        strict: false,
        log: { remoteError: true },
        key: 'Metamask',
    },
)

export const MetaMaskProvider: WalletProvider = {
    async checkAvailability() {
        if (MetaMaskWeb3Provider.err) return false
        try {
            await timeout(MetamaskJSONRPC.eth_getBalance('0', 'latest'), 2000)
            return true
        } catch {
            return false
        }
    },
    async requestAccounts() {
        const list = await MetamaskJSONRPC.eth_requestAccounts()
        const map = new Map<string, Partial<ExoticWalletRecord>>()
        for (const address of list) map.set(address, { address })
        await updateExoticWalletsFromSource(WalletProviderType.metamask, map)
        return list
    },
    getWeb3Provider() {
        return MetaMaskWeb3Provider.unwrap()
    },
}
