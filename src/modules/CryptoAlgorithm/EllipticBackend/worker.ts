import { AsyncCall } from 'async-call-rpc'
import type methods from './methods'
import { WorkerMessage } from './WorkerChannel'

const worker = AsyncCall<typeof methods>(typeof document === 'object' ? {} : require('./methods').default, {
    messageChannel: new WorkerMessage(),
    strict: { methodNotFound: true, unknownMessage: true },
})
export default worker
