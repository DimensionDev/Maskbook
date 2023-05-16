import type { Plugin } from '@masknet/plugin-infra'
import { PetsGlobalInjection } from '../SNSAdaptor/PetsGlobalInjection.js'
import { base } from '../base.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init() {},
    GlobalInjection: PetsGlobalInjection,
}

export default dashboard
