import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { TraderDialog } from '../SNSAdaptor/trader/TraderDialog.js'
import type { ChainId } from '@masknet/web3-shared-evm'

const dashboard: Plugin.Dashboard.Definition<ChainId> = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <TraderDialog />
            </>
        )
    },
}

export default dashboard
