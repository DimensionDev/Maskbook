import { createGlobalSettings } from '../../settings/createSettings'
import { PLUGIN_IDENTIFIER } from './constants'
import { ProviderType } from '../../web3/types'

/**
 * The address of selected wallet
 */
export const currentSelectedWalletAddressSettings = createGlobalSettings<string>(
    `${PLUGIN_IDENTIFIER}+selectedWalletAddress`,
    '',
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * The provider of selected wallet
 */
export const currentSelectedWalletProviderSettings = createGlobalSettings<ProviderType>(
    `${PLUGIN_IDENTIFIER}+selectedWalletProvider`,
    ProviderType.Maskbook,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * Is MetaMask Unlocked
 */
export const isMetaMaskUnlocked = createGlobalSettings<boolean>('is metaMask unlocked', false, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})
