import type { Plugin } from '@masknet/plugin-infra'
import { Modals } from '@masknet/shared'
import { base } from '../base.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <Modals />
    },
}

export default dashboard
