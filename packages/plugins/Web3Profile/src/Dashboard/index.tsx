import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { setupContext } from './context'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
}

export default dashboard
