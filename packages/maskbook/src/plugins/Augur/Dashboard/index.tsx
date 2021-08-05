import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { BuyDialog } from '../SNSAdaptor/BuyDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return <BuyDialog />
    },
}

export default dashboard
