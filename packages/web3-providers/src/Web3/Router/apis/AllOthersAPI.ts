import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { OthersAPI } from '../../EVM/apis/OthersAPI.js'
import { FlowOthersAPI } from '../../Flow/apis/OthersAPI.js'
import { SolanaOthersAPI } from '../../Solana/apis/OthersAPI.js'
import type { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'

export class AllOthersAPI {
    private creators = {
        [NetworkPluginID.PLUGIN_EVM]: new OthersAPI(),
        [NetworkPluginID.PLUGIN_FLOW]: new FlowOthersAPI(),
        [NetworkPluginID.PLUGIN_SOLANA]: new SolanaOthersAPI(),
        [NetworkPluginID.PLUGIN_BITCOIN]: new SolanaOthersAPI(),
    }

    use<T extends NetworkPluginID>(pluginID: T) {
        return this.creators[pluginID] as OthersAPI_Base<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['SchemaType'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['NetworkType'],
            Web3Helper.Definition[T]['Transaction']
        >
    }
}
