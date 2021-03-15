import { getNetworkWorker, NetworkWorkerQuery } from '../worker'
export async function encodePublicKeyWorker(query: NetworkWorkerQuery): Promise<(text: string) => string> {
    const f = (await getNetworkWorker(query)).utils.publicKeyEncoding?.encoder
    return (x) => f?.(x) || x
}
export async function decodePublicKeyWorker(query: NetworkWorkerQuery): Promise<(text: string) => string[]> {
    const f = (await getNetworkWorker(query)).utils.publicKeyEncoding?.decoder
    if (f) return (x) => f(x).concat(x)
    return (x) => [x]
}
export async function encodeTextPayloadWorker(query: NetworkWorkerQuery): Promise<(text: string) => string> {
    const f = (await getNetworkWorker(query)).utils.textPayloadPostProcessor?.encoder
    return (x) => f?.(x) || x
}
export async function decodeTextPayloadWorker(query: NetworkWorkerQuery): Promise<(text: string) => string[]> {
    const f = (await getNetworkWorker(query)).utils.textPayloadPostProcessor?.decoder
    if (f) return (x) => f(x).concat(x)
    return (x) => [x]
}
