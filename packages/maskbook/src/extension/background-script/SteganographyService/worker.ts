import { AsyncCall, AsyncCallOptions } from 'async-call-rpc/full'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { serialization } from '../../../utils/type-transform/Serialization'
import * as implementation from './worker-implementation'

const options: AsyncCallOptions = {
    channel: new WorkerChannel(),
    serializer: serialization,
}

AsyncCall(implementation, options)
