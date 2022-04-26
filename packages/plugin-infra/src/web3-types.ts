import type {
    NetworkDescriptor,
    ProviderDescriptor,
    AddressBookState,
    NameServiceState,
    RiskWarningState,
    SettingsState,
    GasOptionState,
    TokenState,
    TokenPriceState,
    TokenListState,
    TransactionState,
    TransactionFormatterState,
    TransactionWatcherState,
    ProtocolState,
    ProviderState,
    ExplorerState,
    WalletState,
    OthersState,
    IdentityServiceState,
} from '@masknet/web3-shared-base'
import type { Plugin } from './types'
import type { AssetState } from './web3-state'

export declare namespace Web3Plugin {
    export namespace ObjectCapabilities {
        export interface Capabilities<
            ChainId,
            SchemaType,
            ProviderType,
            NetworkType,
            Signature,
            Transaction,
            TransactionDetailed,
            TransactionSignature,
            TransactionParameter,
            Web3,
        > {
            AddressBook?: AddressBookState<ChainId>
            Asset?: AssetState<ChainId, SchemaType>
            IdentityService?: IdentityServiceState
            NameService?: NameServiceState<ChainId>
            RiskWarning?: RiskWarningState
            Settings?: SettingsState
            GasOption?: GasOptionState<ChainId>
            Token?: TokenState<ChainId, SchemaType>
            TokenPrice?: TokenPriceState<ChainId>
            TokenList?: TokenListState<ChainId, SchemaType>
            Transaction?: TransactionState<ChainId, Transaction>
            TransactionFormatter?: TransactionFormatterState<ChainId, TransactionParameter, Transaction>
            TransactionWatcher?: TransactionWatcherState<ChainId, Transaction>
            Protocol?: ProtocolState<
                ChainId,
                SchemaType,
                ProviderType,
                Signature,
                Transaction,
                TransactionDetailed,
                TransactionSignature,
                Web3
            >
            Provider?: ProviderState<ChainId, ProviderType, NetworkType>
            Explorer?: ExplorerState<ChainId, Transaction>
            Wallet?: WalletState
            Others?: OthersState<ChainId, SchemaType, ProviderType, NetworkType>
        }
    }
    export namespace UI {
        export interface NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType> {
            network: NetworkDescriptor<ChainId, NetworkType>
            provider?: ProviderDescriptor<ChainId, ProviderType>
            children?: React.ReactNode
            onClick?: (
                network: NetworkDescriptor<ChainId, NetworkType>,
                provider?: ProviderDescriptor<ChainId, ProviderType>,
            ) => void
        }
        export interface ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType> {
            network: NetworkDescriptor<ChainId, NetworkType>
            provider: ProviderDescriptor<ChainId, ProviderType>
            children?: React.ReactNode
            onClick?: (
                network: NetworkDescriptor<ChainId, NetworkType>,
                provider: ProviderDescriptor<ChainId, ProviderType>,
            ) => void
        }
        export interface AddressFormatterProps {
            address: string
            size?: number
        }
        export interface UI<ChainId, ProviderType, NetworkType> {
            SelectNetworkMenu?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<
                    UI.NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>
                >
            }
            SelectProviderDialog?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<
                    UI.NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>
                >
                /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
                ProviderIconClickBait?: Plugin.InjectUIReact<
                    UI.ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>
                >
            }
        }
    }
}
