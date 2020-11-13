import { AsyncCall, AsyncCallOptions, AsyncGeneratorCall } from 'async-call-rpc/full'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import serialization from '../../utils/type-transform/Serialization'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'

export let GunWorker: OnDemandWorker | undefined
if (process.env.architecture) {
    GunWorker = new OnDemandWorker(new URL('./worker.ts', import.meta.url))
    // we're in webpack bundle
}
const options: AsyncCallOptions = {
    channel: new WorkerChannel(GunWorker),
    serializer: serialization,
}
export const GunAPI = AsyncCall<typeof import('./worker-implementation')>({}, options)
export const GunAPISubscribe = AsyncGeneratorCall<typeof import('./worker-implementation-subscribe')>({}, options)
