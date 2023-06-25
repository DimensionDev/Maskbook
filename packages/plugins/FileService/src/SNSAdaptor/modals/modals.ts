import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmModalOpenProps } from './Confirm/index.js'

export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps>()
