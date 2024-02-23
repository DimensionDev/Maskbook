import {
    createMaskSDKChannel,
    type BridgeAPI,
    type UserScriptAPI,
    encoder,
    type InitInformation,
} from '../shared/index.js'
import { AsyncCall } from 'async-call-rpc/base.min'
import { ethereum } from './wallet.js'

const self: UserScriptAPI = {
    request_init: null!,
    async eth_message(message) {
        ethereum.dispatchEvent(new CustomEvent('message', { detail: message }))
    },
}
export const readyPromise = new Promise<InitInformation>((resolve) => {
    self.request_init = async (init) => resolve(init)
})
export const contentScript: BridgeAPI = AsyncCall<BridgeAPI>(self, {
    channel: createMaskSDKChannel('user'),
    encoder,
    log: false,
})
