import { SingletonModal } from '@masknet/shared-base'
import type { ResetWalletModalOpenProps } from './ResetWalletModal/index.js'
import type { DisconnectModalOpenProps } from './DisconnectModal/index.js'
import type { ConnectSocialAccountModalOpenProps } from './ConnectSocialAccountModal/index.js'
import type { ConfirmModalOpenProps } from './ConfirmModal/index.js'

export const DisconnectModal = new SingletonModal<DisconnectModalOpenProps>()
export const ConnectSocialAccountModal = new SingletonModal<ConnectSocialAccountModalOpenProps>()
export const ResetWalletModal = new SingletonModal<ResetWalletModalOpenProps>()
export const ConfirmModal = new SingletonModal<ConfirmModalOpenProps, boolean>()

export * from './ChooseNetworkModal/index.js'
