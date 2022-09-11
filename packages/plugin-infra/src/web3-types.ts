import type {
    BalanceNotifierState,
    BlockNumberNotifierState,
    NetworkDescriptor,
    ProviderDescriptor,
    AddressBookState,
    NameServiceState,
    RiskWarningState,
    SettingsState,
    TokenState,
    TransactionState,
    TransactionFormatterState,
    TransactionWatcherState,
    ConnectionState,
    ProviderState,
    WalletState,
    OthersState,
    IdentityServiceState,
    HubState,
    Web3StorageServiceState,
} from '@masknet/web3-shared-base'
import type { Plugin } from './types.js'

export declare namespace Web3Plugin {
    export namespace ObjectCapabilities {
        export interface Capabilities<
            ChainId,
            SchemaType,
            ProviderType,
            NetworkType,
            Signature,
            GasOption,
            Block,
            Operation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            TransactionParameter,
            Web3,
            Web3Provider,
        > {
            AddressBook?: AddressBookState<ChainId>
            BalanceNotifier?: BalanceNotifierState<ChainId>
            BlockNumberNotifier?: BlockNumberNotifierState<ChainId>
            Hub?: HubState<ChainId, SchemaType, GasOption>
            IdentityService?: IdentityServiceState
            NameService?: NameServiceState<ChainId>
            RiskWarning?: RiskWarningState
            Settings?: SettingsState
            Token?: TokenState<ChainId, SchemaType>
            Transaction?: TransactionState<ChainId, Transaction>
            TransactionFormatter?: TransactionFormatterState<ChainId, TransactionParameter, Transaction>
            TransactionWatcher?: TransactionWatcherState<ChainId, Transaction>
            Connection?: ConnectionState<
                ChainId,
                SchemaType,
                ProviderType,
                Signature,
                Block,
                Operation,
                Transaction,
                TransactionReceipt,
                TransactionDetailed,
                TransactionSignature,
                Web3,
                Web3Provider
            >
            Provider?: ProviderState<ChainId, ProviderType, NetworkType>
            Wallet?: WalletState
            Others?: OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction>
            Storage?: Web3StorageServiceState
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
