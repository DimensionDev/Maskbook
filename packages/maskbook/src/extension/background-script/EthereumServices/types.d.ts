import type { EventEmitter } from 'events'
import type { AbstractProvider } from 'web3-core'

export class MetamaskInpageProvider extends EventEmitter implements AbstractProvider {
    sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    send?(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    request(args: RequestArguments): Promise<any>
    connected?: boolean
    _metamask?: { isUnlocked: () => Promise<boolean> }
}
