import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
// import WalletConnectDialog from '../SNSAdaptor/WalletConnectDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init() {},
    // GlobalInjection: function Component() {
    //     return <WalletConnectDialog />
    // },
}

export default dashboard
