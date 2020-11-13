import { AsyncCall } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'

let worker: OnDemandWorker | undefined
if (process.env.architecture) {
    worker = new OnDemandWorker(new URL('./worker.ts', import.meta.url))
    // we're in webpack bundle
}
export const GunAPI = AsyncCall<typeof import('./worker-implementation')>({}, { channel: new WorkerChannel(worker) })
