import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
}

export default dashboard
