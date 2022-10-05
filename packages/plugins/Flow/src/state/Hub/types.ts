import type { Web3Helper } from '@masknet/web3-helpers'

import { NetworkPluginID } from '@masknet/shared-base'

export interface FlowHub extends Web3Helper.Web3Hub<NetworkPluginID.PLUGIN_FLOW> {}
