import { SingletonModal } from '@masknet/shared-base'
import type { DisconnectModalOpenProps, DisconnectModalCloseProps } from './DisconnectModal/index.js'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { AddContactModalOpenProps } from './AddContactModal/index.js'
import type { EditContactModalOpenProps } from './EditContactModal/index.js'
import type { DeleteContactModalOpenProps } from './DeleteContactModal/index.js'
import type { GasSettingModalCloseProps, GasSettingModalOpenProps } from './GasSettingModal/index.js'
import type { ChooseTokenModalCloseProps, ChooseTokenModalOpenProps } from './ChooseToken/index.js'

export const DisconnectModal = new SingletonModal<DisconnectModalOpenProps, DisconnectModalCloseProps>()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, boolean>()
export const AddContactModal = new SingletonModal<AddContactModalOpenProps, boolean>()
export const EditContactModal = new SingletonModal<EditContactModalOpenProps, boolean>()
export const DeleteContactModal = new SingletonModal<DeleteContactModalOpenProps, boolean>()
export const GasSettingModal = new SingletonModal<GasSettingModalOpenProps, GasSettingModalCloseProps>()
export const ChooseTokenModal = new SingletonModal<ChooseTokenModalOpenProps, ChooseTokenModalCloseProps>()

export * from './ChooseNetworkModal/index.js'
export * from './ConnectSocialAccountModal/index.js'
export * from './SelectProviderModal/index.js'
export * from './SwitchPersonaModal/index.js'
export * from './PersonaSettingModal/index.js'
export * from './PersonaRenameModal/index.js'
export * from './SetBackupPasswordModal/index.js'
export * from './VerifyBackupPasswordModal/index.js'
