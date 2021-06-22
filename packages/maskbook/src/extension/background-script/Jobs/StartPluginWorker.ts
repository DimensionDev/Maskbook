import { startPluginWorker } from '@masknet/plugin-infra'
import { createPluginHost } from '../../../plugin-infra/host'
export default function () {
    const ac = new AbortController()
    startPluginWorker(createPluginHost(ac.signal))
    return () => ac.abort()
}
