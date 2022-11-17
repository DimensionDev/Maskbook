import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { setupContext } from './context.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
}

export default dashboard
