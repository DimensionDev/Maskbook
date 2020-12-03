import { AsyncGeneratorCall, AsyncCall, AsyncCallOptions } from 'async-call-rpc/full'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import serialization from '../../utils/type-transform/Serialization'
import * as Impl from './worker-implementation'
import * as Impl2 from './worker-implementation-subscribe'
const options: AsyncCallOptions = {
    channel: new WorkerChannel(),
    strict: { methodNotFound: false },
    serializer: serialization,
}
AsyncCall(Impl, options)
AsyncGeneratorCall(Impl2, options)
