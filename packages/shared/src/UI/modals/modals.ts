import { SingletonModal } from '@masknet/shared-base'
import type { SelectProviderModalOpenProps, SelectProviderModalCloseProps } from './SelectProviderModal/index.js'
import type { WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeModal/index.js'
import type { WalletRiskWarningModalOpenProps } from './WalletRiskWarningModal/index.js'
import type { ConnectWalletModalOpenProps, ConnectWalletModalCloseProps } from './ConnectWalletModal/index.js'
import type { LeavePageConfirmModalOpenProps } from './LeavePageConfirmModal/index.js'
import type {
    ApplicationBoardModalOpenProps,
    ApplicationBoardSettingsModalOpenProps,
} from './ApplicationBoardModal/index.js'
import type { GasSettingModalOpenOrCloseProps } from './GasSettingModal/index.js'
import type { ConfirmModalCloseProps, ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { ConfirmDialogOpenProps } from './ConfirmDialog/index.js'
import type { TransactionConfirmModalOpenProps } from './TokenTransactionConfirmModal/index.js'
import type { SelectNonFungibleContractModalOpenProps } from './SelectNonFungibleContractModal/index.js'
import type {
    SelectFungibleTokenModalOpenProps,
    SelectFungibleTokenModalCloseProps,
} from './SelectFungibleTokenModal/index.js'
import type {
    SelectGasSettingsModalCloseProps,
    SelectGasSettingsModalOpenProps,
} from './SelectAdvancedSettingsDialog/index.js'
import type { AddCollectiblesModalCloseProps, AddCollectiblesModalOpenProps } from './AddCollectiblesModal/index.js'
import type { PersonaSelectPanelModalOpenProps } from './PersonaSelectPanelModal/index.js'
import type { VerifyNextIDDialogCloseProps, VerifyNextIDDialogProps } from '../components/VerifyNextIDDialog/index.js'
import type { ImageEditorModalCloseProps, ImageEditorModalOpenProps } from './ImageEditor/index.js'

export const WalletConnectQRCodeModal = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderModal = new SingletonModal<SelectProviderModalOpenProps, SelectProviderModalCloseProps>()
export const WalletStatusModal = new SingletonModal()
export const WalletRiskWarningModal = new SingletonModal<WalletRiskWarningModalOpenProps>()
export const ConnectWalletModal = new SingletonModal<ConnectWalletModalOpenProps, ConnectWalletModalCloseProps>()
export const LeavePageConfirmModal = new SingletonModal<LeavePageConfirmModalOpenProps>()
export const ApplicationBoardModal = new SingletonModal<ApplicationBoardModalOpenProps>()
export const ApplicationBoardSettingsModal = new SingletonModal<ApplicationBoardSettingsModalOpenProps>()
export const GasSettingModal = new SingletonModal<GasSettingModalOpenOrCloseProps, GasSettingModalOpenOrCloseProps>()
export const TransactionConfirmModal = new SingletonModal<TransactionConfirmModalOpenProps>()
export const TransactionSnackbar = new SingletonModal()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseProps>()
export const ConfirmDialog = new SingletonModal<ConfirmDialogOpenProps, boolean>()
export const SelectNonFungibleContractModal = new SingletonModal<SelectNonFungibleContractModalOpenProps>()
export const SelectGasSettingsModal = new SingletonModal<
    SelectGasSettingsModalOpenProps,
    SelectGasSettingsModalCloseProps
>()
export const AddCollectiblesModal = new SingletonModal<AddCollectiblesModalOpenProps, AddCollectiblesModalCloseProps>()
export const SelectFungibleTokenModal = new SingletonModal<
    SelectFungibleTokenModalOpenProps,
    SelectFungibleTokenModalCloseProps
>()
export const VerifyNextIDModal = new SingletonModal<VerifyNextIDDialogProps, VerifyNextIDDialogCloseProps>()

export const PersonaSelectPanelModal = new SingletonModal<PersonaSelectPanelModalOpenProps>()
export const ImageEditorModal = new SingletonModal<ImageEditorModalOpenProps, ImageEditorModalCloseProps>()

export { ApplicationSettingTabs } from './ApplicationBoardModal/ApplicationBoardDialog.js'
