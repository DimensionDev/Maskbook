import type { Web3Helper } from '@masknet/web3-helpers'

import { NetworkPluginID } from '@masknet/shared-base'

export interface EVM_Hub extends Web3Helper.Web3Hub<NetworkPluginID.PLUGIN_EVM> {}
