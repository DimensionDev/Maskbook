import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    // GlobalInjection: GlobalComponent,
}

export default dashboard
