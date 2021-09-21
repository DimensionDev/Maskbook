import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {
        console.debug('Furucombo plugin has been loaded.')
        signal.addEventListener('abort', () => console.debug('Example plugin has been terminated'))
    },
    // GlobalInjection: GlobalComponent,
}

export default dashboard
