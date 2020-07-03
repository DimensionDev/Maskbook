import createMetaMaskProvider from 'metamask-extension-provider'
import w3 from 'web3'
import { AsyncCall, EventBasedChannel } from 'async-call-rpc/full'
import { EventEmitter } from 'events'
import type { AbstractProvider } from 'web3-core'

const web3 = new w3()
export const metamaskProvider = createMetaMaskProvider()
class Web3JSONRpcChannel implements EventBasedChannel {
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
export const metamask = AsyncCall<Web3API>(
    {},
    { channel: new Web3JSONRpcChannel(metamaskProvider), parameterStructures: 'by-name', strict: false },
)
web3.setProvider(metamaskProvider)

interface Web3API {
    eth_requestAccounts(): string[]
    eth_getBalance(account: string, type: 'latest' | 'earliest' | 'pending'): string
}
