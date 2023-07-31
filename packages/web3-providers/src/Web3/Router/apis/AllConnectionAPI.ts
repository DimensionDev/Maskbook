import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { OthersAPI } from '../../EVM/apis/OthersAPI.js'
import { ConnectionAPI } from '../../EVM/apis/ConnectionAPI.js'
import { ConnectionCreatorAPI_Base } from '../../Base/apis/ConnectionCreatorAPI.js'
import { ConnectionOptionsAPI } from '../../EVM/apis/ConnectionOptionsAPI.js'
import { FlowOthersAPI } from '../../Flow/apis/OthersAPI.js'
import { FlowConnectionAPI } from '../../Flow/apis/ConnectionAPI.js'
import { FlowConnectionOptionsAPI } from '../../Flow/apis/ConnectionOptionsAPI.js'
import { SolanaOthersAPI } from '../../Solana/apis/OthersAPI.js'
import { SolanaConnectionAPI } from '../../Solana/apis/ConnectionAPI.js'
import { SolanaConnectionOptionsAPI } from '../../Solana/apis/ConnectionOptionsAPI.js'
import type { ConnectionOptions_Base } from '../../Base/apis/ConnectionOptionsAPI.js'

const createCreator = <T extends NetworkPluginID>(networkPluginID: T) => {
    switch (networkPluginID) {
        case NetworkPluginID.PLUGIN_EVM:
            return new ConnectionCreatorAPI_Base<NetworkPluginID.PLUGIN_EVM>(
                (initial) => new ConnectionAPI(initial),
                new OthersAPI(),
                new ConnectionOptionsAPI(),
            )
        case NetworkPluginID.PLUGIN_FLOW:
            return new ConnectionCreatorAPI_Base<NetworkPluginID.PLUGIN_FLOW>(
                (initial) => new FlowConnectionAPI(initial),
                new FlowOthersAPI(),
                new FlowConnectionOptionsAPI(),
            )
        case NetworkPluginID.PLUGIN_SOLANA:
            return new ConnectionCreatorAPI_Base<NetworkPluginID.PLUGIN_SOLANA>(
                (initial) => new SolanaConnectionAPI(initial),
                new SolanaOthersAPI(),
                new SolanaConnectionOptionsAPI(),
            )
        case NetworkPluginID.PLUGIN_BITCOIN:
            return new ConnectionCreatorAPI_Base<NetworkPluginID.PLUGIN_BITCOIN>(
                (initial) => new SolanaConnectionAPI(initial),
                new SolanaOthersAPI(),
                new SolanaConnectionOptionsAPI(),
            )
        default:
            throw new Error('Not supported.')
    }
}

export class AllConnectionAPI {
    private creators = {
        [NetworkPluginID.PLUGIN_EVM]: createCreator(NetworkPluginID.PLUGIN_EVM),
        [NetworkPluginID.PLUGIN_FLOW]: createCreator(NetworkPluginID.PLUGIN_FLOW),
        [NetworkPluginID.PLUGIN_SOLANA]: createCreator(NetworkPluginID.PLUGIN_SOLANA),
        [NetworkPluginID.PLUGIN_BITCOIN]: createCreator(NetworkPluginID.PLUGIN_BITCOIN),
    }

    use<T extends NetworkPluginID>(
        pluginID: T,
        initial?: ConnectionOptions_Base<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['Transaction']
        >,
    ) {
        return (this.creators[pluginID] as unknown as ConnectionCreatorAPI_Base<T>).create(initial)
    }
}
