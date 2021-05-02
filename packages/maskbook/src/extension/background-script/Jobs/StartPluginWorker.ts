import { startPluginWorker } from '@dimensiondev/mask-plugin-infra'
import { createPluginHost } from '../../../plugin-infra/host'
export default function () {
    const ac = new AbortController()
    startPluginWorker(createPluginHost(ac.signal))
    return () => ac.abort()
}
