import { OnlyRunInWebWorker } from '../../utils/assert-worker'
OnlyRunInWebWorker()

export { queryVersion1PostAESKey, getVersion1PostByHash } from './version.1'
