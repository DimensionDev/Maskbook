import { SingletonModal } from '@masknet/shared-base'
import type { ConnectWalletModalCloseProps, ConnectWalletModalOpenProps } from './ConnectWalletModal/index.js'
import type { SelectNonFungibleContractModalOpenProps } from './SelectNonFungibleContractModal/index.js'
import type { SelectProviderModalCloseProps, SelectProviderModalOpenProps } from './SelectProviderModal/index.js'
import type { WalletRiskWarningModalOpenProps } from './WalletRiskWarningModal/index.js'
import type {
    SelectGasSettingsModalCloseProps,
    SelectGasSettingsModalOpenProps,
} from './SelectAdvancedSettingsDialog/index.js'
import type {
    SelectFungibleTokenModalCloseProps,
    SelectFungibleTokenModalOpenProps,
} from './SelectFungibleTokenModal/index.js'
import type { TransactionConfirmModalOpenProps } from './TokenTransactionConfirmModal/index.js'

export const SelectProviderModal = new SingletonModal<SelectProviderModalOpenProps, SelectProviderModalCloseProps>()
export const WalletStatusModal = new SingletonModal()
export const WalletRiskWarningModal = new SingletonModal<WalletRiskWarningModalOpenProps>()
export const ConnectWalletModal = new SingletonModal<ConnectWalletModalOpenProps, ConnectWalletModalCloseProps>()
export const TransactionSnackbar = new SingletonModal()
export const TransactionConfirmModal = new SingletonModal<TransactionConfirmModalOpenProps>()
export const SelectGasSettingsModal = new SingletonModal<
    SelectGasSettingsModalOpenProps,
    SelectGasSettingsModalCloseProps
>()
export const SelectFungibleTokenModal = new SingletonModal<
    SelectFungibleTokenModalOpenProps,
    SelectFungibleTokenModalCloseProps
>()
export const SelectNonFungibleContractModal = new SingletonModal<SelectNonFungibleContractModalOpenProps>()
