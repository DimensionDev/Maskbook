import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { base } from '../base'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal) {
        console.debug('Example plugin installed on the background')
        signal.addEventListener('abort', () => console.debug('Example plugin stopped'))
    },
}
export default worker
