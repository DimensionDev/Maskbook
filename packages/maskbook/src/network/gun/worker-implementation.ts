import { OnlyRunInWebWorker } from '../../utils/assert-worker'
OnlyRunInWebWorker()

export { queryVersion1PostAESKey, getVersion1PostByHash } from './version.1'
export { publishPostAESKeyOnGun2, queryPersonFromGun2, queryPostKeysOnGun2 } from './version.2'
