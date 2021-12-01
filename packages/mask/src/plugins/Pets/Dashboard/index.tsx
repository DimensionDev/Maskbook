import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { PetDialog } from '../SNSAdaptor/PetDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return <PetDialog />
    },
}

export default dashboard
