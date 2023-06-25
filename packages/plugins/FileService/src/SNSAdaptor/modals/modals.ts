import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'

export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps>()
