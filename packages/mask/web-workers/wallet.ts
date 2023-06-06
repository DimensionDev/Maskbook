import './prepare.js'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
// How to interact with this worker:
export type Input = {
    id: number
    data: api.IMWRequest
}
export type Output = {
    id: number
    response: api.MWResponse
}

async function load() {
    return import('@dimensiondev/mask-wallet-core/bundle')
}
const promise = (async () => {
    const { request } = await load()
    const { api } = await import('@dimensiondev/mask-wallet-core/proto')
    return { request, api }
})()

self.addEventListener('message', async (ev: MessageEvent) => {
    const { api, request } = await promise

    const { id, data } = ev.data as Input
    if (!id) return

    try {
        const payload = api.MWRequest.encode(data).finish()
        const wasmResult = request(payload)
        const response = api.MWResponse.decode(wasmResult)
        self.postMessage({ id, response })
    } catch (error) {
        const out: Output = { id, response: { error: { errorMsg: String(error) } } }
        self.postMessage(out)
    }
})
