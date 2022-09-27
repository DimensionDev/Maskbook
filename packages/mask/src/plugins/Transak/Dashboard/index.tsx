import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { BuyTokenDialog } from '../SNSAdaptor/BuyTokenDialog.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <BuyTokenDialog />
    },
}

export default dashboard
