import { createGlobalSettings } from '../../settings/createSettings'
import { ProviderType } from '../../web3/types'
import { PLUGIN_IDENTIFIER } from './constants'

/**
 * The address of the selected wallet
 */
export const currentSelectedWalletAddressSettings = createGlobalSettings<string>(
    `${PLUGIN_IDENTIFIER}+selectedWalletAddress`,
    '',
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * The provider type of the selected wallet
 */
export const currentSelectedWalletProviderSettings = createGlobalSettings<ProviderType>(
    `${PLUGIN_IDENTIFIER}+seelctedWalletProviderType`,
    ProviderType.Maskbook,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)
