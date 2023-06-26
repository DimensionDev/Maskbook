import { SingletonModal } from '@masknet/shared-base'
import type { SelectProviderModalOpenProps } from './SelectProviderModal/index.js'
import type { WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeModal/index.js'
import type { WalletRiskWarningModalOpenProps } from './WalletRiskWarningModal/index.js'
import type { ConnectWalletModalOpenProps } from './ConnectWalletModal/index.js'
import type { LeavePageConfirmModalOpenProps } from './LeavePageConfirmModal/index.js'
import type { ApplicationBoardModalOpenProps } from './ApplicationBoardModal/index.js'
import type { GasSettingModalOpenOrCloseProps } from './GasSettingModal/index.js'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { TransactionConfirmModalOpenProps } from './TokenTransactionConfirmModal/index.js'
import type { SelectNonFungibleContractModalOpenProps } from './SelectNonFungibleContractModal/index.js'
import type {
    SelectFungibleTokenModalCloseProps,
    SelectFungibleTokenModalOpenProps,
} from './SelectFungibleTokenModal/index.js'

export const WalletConnectQRCodeModal = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderModal = new SingletonModal<SelectProviderModalOpenProps>()
export const WalletStatusModal = new SingletonModal()
export const WalletRiskWarningModal = new SingletonModal<WalletRiskWarningModalOpenProps>()
export const ConnectWalletModal = new SingletonModal<ConnectWalletModalOpenProps>()
export const LeavePageConfirmModal = new SingletonModal<LeavePageConfirmModalOpenProps>()
export const ApplicationBoardModal = new SingletonModal<ApplicationBoardModalOpenProps>()
export const GasSettingModal = new SingletonModal<GasSettingModalOpenOrCloseProps, GasSettingModalOpenOrCloseProps>()
export const TransactionConfirmModal = new SingletonModal<TransactionConfirmModalOpenProps>()
export const TransactionSnackbar = new SingletonModal()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps>()
export const SelectNonFungibleContractModal = new SingletonModal<SelectNonFungibleContractModalOpenProps>()
export const SelectFungibleTokenModal = new SingletonModal<
    SelectFungibleTokenModalOpenProps,
    SelectFungibleTokenModalCloseProps
>()
