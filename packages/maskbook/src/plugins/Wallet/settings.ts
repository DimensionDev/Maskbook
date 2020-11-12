import { createGlobalSettings, createInternalSettings } from '../../settings/createSettings'
import { PLUGIN_IDENTIFIER } from './constants'

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
 * Is MetaMask unlocked
 */
export const isMetaMaskUnlocked = createInternalSettings<boolean>('is metaMask unlocked', false)
