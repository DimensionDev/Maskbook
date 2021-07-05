import { startPluginWorker } from '@masknet/plugin-infra'
import { createPluginHost } from '../../../plugin-infra/host'
export default function (signal: AbortSignal) {
    startPluginWorker(createPluginHost(signal))
}
