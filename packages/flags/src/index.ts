import { flags as defaultFlags } from './flags/index.js'
import { RemoteFlags } from './libs/RemoteFlags.js'

const flags = new RemoteFlags('https://mask-flags.r2d2.to/', defaultFlags)
// fetch each time starts the app, updates will be enabled
flags.fetchAndActive()
export const Flags = flags.flags

if (process.env.NODE_ENV === 'development' || process.env.channel !== 'stable') {
    console.log('[Mask] Starts with flags:', Flags)
}
