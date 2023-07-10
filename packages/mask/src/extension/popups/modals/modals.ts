import { SingletonModal } from '@masknet/shared-base'
import type { ResetWalletModalOpenProps } from './ResetWalletModal/index.js'
import type { DisconnectModalOpenProps, DisconnectModalCloseProps } from './DisconnectModal/index.js'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'

export const DisconnectModal = new SingletonModal<DisconnectModalOpenProps, DisconnectModalCloseProps>()
export const ResetWalletModal = new SingletonModal<ResetWalletModalOpenProps, boolean>()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, boolean>()

export * from './ChooseNetworkModal/index.js'
export * from './ConnectSocialAccountModal/index.js'
export * from './SelectProviderModal/index.js'
