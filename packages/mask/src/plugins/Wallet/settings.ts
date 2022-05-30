import { createGlobalSettings } from '../../settings/createSettings'
import { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants'
import { LockStatus } from './types'

export const currentMaskWalletAccountSettings = createGlobalSettings(`${PLUGIN_ID}+selectedMaskWalletAddress`, '')

export const currentMaskWalletChainIdSettings = createGlobalSettings(`${PLUGIN_ID}+maskWalletChainId`, ChainId.Mainnet)

export const currentMaskWalletNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_ID}+selectedMaskWalletNetwork`,
    NetworkType.Ethereum,
)

export const currentMaskWalletLockStatusSettings = createGlobalSettings<LockStatus>(
    `${PLUGIN_ID}+maskWalletLockStatus`,
    LockStatus.INIT,
)
