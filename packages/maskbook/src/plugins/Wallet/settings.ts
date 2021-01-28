import { createGlobalSettings } from '../../settings/createSettings'
import { i18n } from '../../utils/i18n-next'
import { GasPriceProviderType, ProviderType } from '../../web3/types'
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
export const currentSelectedGasPriceServerSettings = createGlobalSettings<GasPriceProviderType>(
    `${PLUGIN_IDENTIFIER}+selectedGasPriceServer`,
    GasPriceProviderType.GasNow,
    {
        primary: () => i18n.t('plugin_wallet_settings_gas_price_server_title'),
        secondary: () => i18n.t('plugin_wallet_settings_gas_price_server_description'),
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
