import { flags as defaultFlags } from './flags/index.js'
import { createRemoteFlag } from './flags/remoteFlag.js'

export const [Flags, startFetchRemoteFlag] = createRemoteFlag(defaultFlags)
export type { IO as RemoteFlagIO } from './flags/remoteFlag.js'
export { env, type BuildInfoFile } from './flags/buildInfo.js'

if (process.env.NODE_ENV === 'development') {
    console.debug('[mask] flags:', Flags)
}
