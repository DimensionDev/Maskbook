import { AsyncCall } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import * as Impl from './worker-implementation'
AsyncCall(Impl, { channel: new WorkerChannel() })
