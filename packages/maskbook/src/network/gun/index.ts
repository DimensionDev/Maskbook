import { AsyncCall, AsyncCallOptions, AsyncGeneratorCall } from 'async-call-rpc/full'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { serializer } from '@masknet/shared-base'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'

export let GunWorker: OnDemandWorker | undefined
if (process.env.architecture) {
    GunWorker = new OnDemandWorker(new URL('./worker.ts', import.meta.url), { name: 'Gun' })
    // we're in webpack bundle
}
const options: AsyncCallOptions = {
    channel: new WorkerChannel(GunWorker),
    serializer,
}
export const GunAPI = AsyncCall<typeof import('./worker-implementation')>({}, options)
export const GunAPISubscribe = AsyncGeneratorCall<typeof import('./worker-implementation-subscribe')>({}, options)
