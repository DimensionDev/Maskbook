import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {},
}

export default dashboard
