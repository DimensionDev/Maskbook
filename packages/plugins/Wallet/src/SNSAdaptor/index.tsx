import { Modals } from '@masknet/shared'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'

const sns: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <Modals />
    },
}

export default sns
