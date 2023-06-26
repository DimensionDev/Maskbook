import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'
import type { RenameModalCloseProps, RenameModalOpenProps } from './RenameModal/index.js'

export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps>()
export const RenameModal = new SingletonModal<RenameModalOpenProps, RenameModalCloseProps>()
