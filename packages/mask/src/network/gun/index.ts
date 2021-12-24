import { AsyncCall, AsyncCallOptions, AsyncGeneratorCall } from 'async-call-rpc/full'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { serializer } from '@masknet/shared-base'
import { OnDemandWorker } from '../../../utils-pure'
import type { _AsyncVersionOf, _AsyncGeneratorVersionOf } from 'async-call-rpc/full'

export let GunWorker: OnDemandWorker | undefined
if (process.env.architecture) {
    GunWorker = new OnDemandWorker(new URL('./worker.ts', import.meta.url), { name: 'Gun' })
    // we're in webpack bundle
}
const options: AsyncCallOptions = {
    channel: new WorkerChannel(GunWorker),
    serializer,
}
export const GunAPI: _AsyncVersionOf<typeof import('./worker-implementation')> = AsyncCall({}, options)
export const GunAPISubscribe: _AsyncGeneratorVersionOf<typeof import('./worker-implementation-subscribe')> =
    AsyncGeneratorCall({}, options)
