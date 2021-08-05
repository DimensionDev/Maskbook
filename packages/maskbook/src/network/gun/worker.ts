import './gun-worker.patch'
import { AsyncGeneratorCall, AsyncCall, AsyncCallOptions } from 'async-call-rpc/full'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { serializer } from '@masknet/shared-base'
import * as Impl from './worker-implementation'
import * as Impl2 from './worker-implementation-subscribe'
const options: AsyncCallOptions = {
    channel: new WorkerChannel(),
    strict: { methodNotFound: false },
    serializer,
}
AsyncCall(Impl, options)
AsyncGeneratorCall(Impl2, options)
