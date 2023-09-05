import { SingletonModal } from '@masknet/shared-base'
import type { DisconnectModalOpenProps, DisconnectModalCloseProps } from './DisconnectModal/index.js'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { ConfirmDialogOpenProps } from './ConfirmDialog/index.js'
import type { AddContactModalOpenProps } from './AddContactModal/index.js'
import type { EditContactModalOpenProps } from './EditContactModal/index.js'
import type { WalletRenameModalOpenProps } from './WalletRenameModal/index.js'
import type { WalletRemoveModalOpenProps } from './WalletRemoveModal/index.js'
import type { DeleteContactModalOpenProps } from './DeleteContactModal/index.js'
import type { WalletAutoLockSettingModalOpenProps } from './WalletAutoLockSettingModal/index.js'
import type { GasSettingModalCloseProps, GasSettingModalOpenProps } from './GasSettingModal/index.js'
import type { ChangePaymentPasswordOpenProps } from './ChangePaymentPasswordModal/index.js'
import type { ShowPrivateKeyModalOpenProps } from './ShowPrivateKeyModal/index.js'
import type { ChooseTokenModalCloseProps, ChooseTokenModalOpenProps } from './ChooseToken/index.js'

export const DisconnectModal = new SingletonModal<DisconnectModalOpenProps, DisconnectModalCloseProps>()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, boolean>()
export const ConfirmDialog = new SingletonModal<ConfirmDialogOpenProps, boolean>()
export const AddContactModal = new SingletonModal<AddContactModalOpenProps, boolean>()
export const EditContactModal = new SingletonModal<EditContactModalOpenProps, boolean>()
export const WalletRenameModal = new SingletonModal<WalletRenameModalOpenProps, boolean>()
export const WalletRemoveModal = new SingletonModal<WalletRemoveModalOpenProps, boolean>()
export const DeleteContactModal = new SingletonModal<DeleteContactModalOpenProps, boolean>()
export const WalletAutoLockSettingModal = new SingletonModal<WalletAutoLockSettingModalOpenProps, boolean>()
export const GasSettingModal = new SingletonModal<GasSettingModalOpenProps, GasSettingModalCloseProps>()
export const ChangePaymentPasswordModal = new SingletonModal<ChangePaymentPasswordOpenProps, boolean>()
export const ShowPrivateKeyModal = new SingletonModal<ShowPrivateKeyModalOpenProps, boolean>()
export const ChooseTokenModal = new SingletonModal<ChooseTokenModalOpenProps, ChooseTokenModalCloseProps>()

export * from './ChooseCurrencyModal/index.js'
export * from './ChooseNetworkModal/index.js'
export * from './ConnectSocialAccountModal/index.js'
export * from './SelectProviderModal/index.js'
export * from './SwitchPersonaModal/index.js'
export * from './PersonaSettingModal/index.js'
export * from './PersonaRenameModal/index.js'
export * from './SetBackupPasswordModal/index.js'
export * from './VerifyBackupPasswordModal/index.js'
export * from './WalletGroupModal/index.js'
