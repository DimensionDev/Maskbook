import init, { request } from './maskwallet/wbg'
// @ts-ignore
import * as index_bg from './index_bg'

init(index_bg)

const self = globalThis as unknown as Worker & WindowOrWorkerGlobalScope
self.addEventListener('message', (ev: MessageEvent) => {
    const input = ev.data as Uint8Array
    self.postMessage(request(input))
})
