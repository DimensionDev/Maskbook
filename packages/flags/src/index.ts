import { flags as defaultFlags } from './flags/index.js'
import { RemoteFlags } from './libs/RemoteFlags.js'

const flags = new RemoteFlags('https://mask-flags.r2d2.to/', defaultFlags)

// fetch each time starts the app, updates will be enabled
// flags.fetchAndActive()

export const Flags = flags.accessor
