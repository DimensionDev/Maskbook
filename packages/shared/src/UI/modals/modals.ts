import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmDialogOpenProps } from './ConfirmDialog/index.js'
import type { ConfirmModalCloseProps, ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { ConnectWalletModalCloseProps, ConnectWalletModalOpenProps } from './ConnectWalletModal/index.js'
import type { LeavePageConfirmModalOpenProps } from './LeavePageConfirmModal/index.js'
import type {
    SelectGasSettingsModalCloseProps,
    SelectGasSettingsModalOpenProps,
} from './SelectAdvancedSettingsDialog/index.js'
import type {
    SelectFungibleTokenModalCloseProps,
    SelectFungibleTokenModalOpenProps,
} from './SelectFungibleTokenModal/index.js'
import type { SelectNonFungibleContractModalOpenProps } from './SelectNonFungibleContractModal/index.js'
import type { SelectProviderModalCloseProps, SelectProviderModalOpenProps } from './SelectProviderModal/index.js'
import type { TransactionConfirmModalOpenProps } from './TokenTransactionConfirmModal/index.js'
import type { WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeModal/index.js'
import type { WalletRiskWarningModalOpenProps } from './WalletRiskWarningModal/index.js'

export const WalletConnectQRCodeModal = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderModal = new SingletonModal<SelectProviderModalOpenProps, SelectProviderModalCloseProps>()
export const WalletStatusModal = new SingletonModal()
export const WalletRiskWarningModal = new SingletonModal<WalletRiskWarningModalOpenProps>()
export const ConnectWalletModal = new SingletonModal<ConnectWalletModalOpenProps, ConnectWalletModalCloseProps>()
export const LeavePageConfirmModal = new SingletonModal<LeavePageConfirmModalOpenProps>()
export const TransactionConfirmModal = new SingletonModal<TransactionConfirmModalOpenProps>()
export const TransactionSnackbar = new SingletonModal()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseProps>()
export const ConfirmDialog = new SingletonModal<ConfirmDialogOpenProps, boolean>()
export const SelectNonFungibleContractModal = new SingletonModal<SelectNonFungibleContractModalOpenProps>()
export const SelectGasSettingsModal = new SingletonModal<
    SelectGasSettingsModalOpenProps,
    SelectGasSettingsModalCloseProps
>()
export const SelectFungibleTokenModal = new SingletonModal<
    SelectFungibleTokenModalOpenProps,
    SelectFungibleTokenModalCloseProps
>()
