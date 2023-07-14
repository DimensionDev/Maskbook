import { SingletonModal } from '@masknet/shared-base'
import type { ResetWalletModalOpenProps } from './ResetWalletModal/index.js'
import type { DisconnectModalOpenProps, DisconnectModalCloseProps } from './DisconnectModal/index.js'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { AddContactModalOpenProps } from './AddContactModal/index.js'
import type { EditContactModalOpenProps } from './EditContactModal/index.js'
import type { DeleteContactModalOpenProps } from './DeleteContactModal/index.js'

export const DisconnectModal = new SingletonModal<DisconnectModalOpenProps, DisconnectModalCloseProps>()
export const ResetWalletModal = new SingletonModal<ResetWalletModalOpenProps, boolean>()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, boolean>()
export const AddContactModal = new SingletonModal<AddContactModalOpenProps, boolean>()
export const EditContactModal = new SingletonModal<EditContactModalOpenProps, boolean>()
export const DeleteContactModal = new SingletonModal<DeleteContactModalOpenProps, boolean>()

export * from './ChooseNetworkModal/index.js'
export * from './ConnectSocialAccountModal/index.js'
export * from './SelectProviderModal/index.js'
