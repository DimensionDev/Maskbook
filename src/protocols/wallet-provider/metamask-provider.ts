import createMetaMaskProvider from 'metamask-extension-provider'
import w3 from 'web3'
import { AsyncCall, MessageChannel } from 'async-call-rpc/full'
import { EventEmitter } from 'events'
import type { AbstractProvider } from 'web3-core'

const web3 = new w3()
const provider = createMetaMaskProvider()
class Web3JSONRpcChannel extends EventEmitter implements MessageChannel {
    constructor(public currentProvider: AbstractProvider) {
        super()
    }
    on(event: string, eventListener: (data: unknown) => void) {
        super.on('message', eventListener)
        return this
    }
    emit(event: string, data: any) {
        this.currentProvider.sendAsync(data, (error, result: unknown) => super.emit('message', result))
        console.log('emitting data', data)
        return true
    }
}
const metamask = AsyncCall<Web3API>(
    {},
    { messageChannel: new Web3JSONRpcChannel(provider), parameterStructures: 'by-name', strict: false },
)
web3.setProvider(provider)
console.log(web3, provider)
Object.assign(globalThis, {
    req: () => web3.eth.getAccounts(),
})

interface Web3API {
    eth_accounts(): string[]
}
