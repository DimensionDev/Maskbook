import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PetDialog } from '../SNSAdaptor/PetDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init() {},
    GlobalInjection: function Component() {
        return <PetDialog />
    },
}

export default dashboard
