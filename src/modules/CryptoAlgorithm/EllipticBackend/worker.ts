import { AsyncCall } from 'async-call-rpc'
import type methods from './methods'
import { WorkerMessage } from './WorkerChannel'

const worker: typeof methods =
    process.env.NODE_ENV === 'test' || process.env.STORYBOOK === true
        ? // In the test env run it in main thread
          require('./methods').default
        : AsyncCall<typeof methods>(typeof document === 'object' ? {} : require('./methods').default, {
              messageChannel: new WorkerMessage(),
              strict: { methodNotFound: true, unknownMessage: true },
          })
export default worker
