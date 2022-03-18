import { getNetworkWorker, NetworkWorkerQuery } from '../worker'
export async function encodeTextPayloadWorker(query: NetworkWorkerQuery): Promise<(text: string) => string> {
    const f = (await getNetworkWorker(query)).utils.textPayloadPostProcessor?.encoder
    return (x) => f?.(x) || x
}
