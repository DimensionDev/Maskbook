import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmModalCloseProps, ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { RenameModalCloseProps, RenameModalOpenProps } from './RenameModal/index.js'

export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseProps>()
export const RenameModal = new SingletonModal<RenameModalOpenProps, RenameModalCloseProps>()
