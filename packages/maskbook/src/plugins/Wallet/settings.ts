import { createGlobalSettings } from '../../settings/createSettings'
import { GasPriceServerType, ProviderType } from '../../web3/types'
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
    `${PLUGIN_IDENTIFIER}+selectedWalletProvider`,
    ProviderType.Maskbook,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * The selected gas price server
 */
export const currentSelectedGasPriceServerSettings = createGlobalSettings<GasPriceServerType>(
    `${PLUGIN_IDENTIFIER}+selectedGasPriceServer`,
    GasPriceServerType.GasNow,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * Is Metamask Locked
 */
export const currentIsMetamaskLockedSettings = createGlobalSettings<boolean>(
    `${PLUGIN_IDENTIFIER}+isMetamaskLocked`,
    true,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)
