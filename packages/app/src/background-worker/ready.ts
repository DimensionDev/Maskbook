import { defer } from '@masknet/kit'

export const [pluginWorkerReadyPromise, setPluginWorkerReady] = defer<void>()
