import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { AddContactModalOpenProps } from './AddContactModal/index.js'
import type { EditContactModalOpenProps } from './EditContactModal/index.js'
import type { DeleteContactModalOpenProps } from './DeleteContactModal/index.js'
import type { GasSettingModalCloseProps, GasSettingModalOpenProps } from './GasSettingModal/index.js'
import type { ChooseTokenModalCloseProps, ChooseTokenModalOpenProps } from './ChooseToken/index.js'

export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, boolean>()
export const AddContactModal = new SingletonModal<AddContactModalOpenProps, boolean>()
export const EditContactModal = new SingletonModal<EditContactModalOpenProps, boolean>()
export const DeleteContactModal = new SingletonModal<DeleteContactModalOpenProps, boolean>()
export const GasSettingModal = new SingletonModal<GasSettingModalCloseProps, GasSettingModalOpenProps>()
export const ChooseTokenModal = new SingletonModal<ChooseTokenModalCloseProps, ChooseTokenModalOpenProps>()
