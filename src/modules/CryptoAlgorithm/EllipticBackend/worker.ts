import { AsyncCall } from 'async-call-rpc/full'
import { Flags } from '../../../utils/flags'
import type methods from './methods'
import { WorkerMessage } from './WorkerChannel'

const worker: typeof methods = Flags.must_not_start_web_worker
    ? // In the test env run it in main thread
      require('./methods').default
    : AsyncCall<typeof methods>(typeof document === 'object' ? {} : require('./methods').default, {
          channel: new WorkerMessage(),
          log: false,
      })
export default worker
