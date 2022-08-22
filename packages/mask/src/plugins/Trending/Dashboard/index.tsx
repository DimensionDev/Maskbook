import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import type { ChainId } from '@masknet/web3-shared-evm'

const dashboard: Plugin.Dashboard.Definition<ChainId> = {
    ...base,
    init(signal) {},
}

export default dashboard
