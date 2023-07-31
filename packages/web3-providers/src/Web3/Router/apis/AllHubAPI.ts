import { NetworkPluginID, mixin } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { HubCreatorAPI_Base } from '../../Base/apis/HubCreatorAPI.js'
import { FlowHubBaseAPI } from '../../Flow/apis/HubBaseAPI.js'
import { FlowHubFungibleAPI } from '../../Flow/apis/HubFungibleAPI.js'
import { FlowHubNonFungibleAPI } from '../../Flow/apis/HubNonFungibleAPI.js'
import { FlowHubOptionsAPI } from '../../Flow/apis/HubOptionsAPI.js'
import { FlowOthersAPI } from '../../Flow/apis/OthersAPI.js'
import { SolanaHubBaseAPI } from '../../Solana/apis/HubBaseAPI.js'
import { SolanaHubFungibleAPI } from '../../Solana/apis/HubFungibleAPI.js'
import { SolanaHubNonFungibleAPI } from '../../Solana/apis/HubNonFungibleAPI.js'
import { SolanaHubOptionsAPI } from '../../Solana/apis/HubOptionsAPI.js'
import { SolanaOthersAPI } from '../../Solana/apis/OthersAPI.js'
import { HubBaseAPI } from '../../EVM/apis/HubBaseAPI.js'
import { HubFungibleAPI } from '../../EVM/apis/HubFungibleAPI.js'
import { HubNonFungibleAPI } from '../../EVM/apis/HubNonFungibleAPI.js'
import { HubOptionsAPI } from '../../EVM/apis/HubOptionsAPI.js'
import { OthersAPI } from '../../EVM/apis/OthersAPI.js'

export class AllHubAPI {
    private creators = {
        [NetworkPluginID.PLUGIN_EVM]: new HubCreatorAPI_Base<NetworkPluginID.PLUGIN_EVM>(
            (initial) => {
                return mixin(new HubBaseAPI(initial), new HubFungibleAPI(initial), new HubNonFungibleAPI(initial))
            },
            new OthersAPI(),
            new HubOptionsAPI(),
        ),
        [NetworkPluginID.PLUGIN_FLOW]: new HubCreatorAPI_Base<NetworkPluginID.PLUGIN_FLOW>(
            (initial) => {
                return mixin(
                    new FlowHubBaseAPI(initial),
                    new FlowHubFungibleAPI(initial),
                    new FlowHubNonFungibleAPI(initial),
                )
            },
            new FlowOthersAPI(),
            new FlowHubOptionsAPI(),
        ),
        [NetworkPluginID.PLUGIN_SOLANA]: new HubCreatorAPI_Base<NetworkPluginID.PLUGIN_SOLANA>(
            (initial) => {
                return mixin(
                    new SolanaHubBaseAPI(initial),
                    new SolanaHubFungibleAPI(initial),
                    new SolanaHubNonFungibleAPI(initial),
                )
            },
            new SolanaOthersAPI(),
            new SolanaHubOptionsAPI(),
        ),
        [NetworkPluginID.PLUGIN_BITCOIN]: new HubCreatorAPI_Base<NetworkPluginID.PLUGIN_SOLANA>(
            (initial) => {
                return mixin(
                    new SolanaHubBaseAPI(initial),
                    new SolanaHubFungibleAPI(initial),
                    new SolanaHubNonFungibleAPI(initial),
                )
            },
            new SolanaOthersAPI(),
            new SolanaHubOptionsAPI(),
        ),
    }

    use<T extends NetworkPluginID>(pluginID: T, initial?: HubOptions_Base<Web3Helper.Definition[T]['ChainId']>) {
        return (this.creators[pluginID] as unknown as HubCreatorAPI_Base<T>).create(initial)
    }
}
