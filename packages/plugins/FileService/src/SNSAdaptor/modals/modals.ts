import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmModalCloseProps, ConfirmModalOpenProps } from './ConfirmModal/index.js'

export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, ConfirmModalCloseProps>()
