import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PetDialog } from '../SNSAdaptor/PetDialog.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return <PetDialog />
    },
}

export default dashboard
