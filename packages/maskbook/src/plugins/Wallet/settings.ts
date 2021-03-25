import { createGlobalSettings } from '../../settings/createSettings'
import { i18n } from '../../utils/i18n-next'
import { ProviderType } from '../../web3/types'
import { PLUGIN_IDENTIFIER } from './constants'
import { PortfolioProvider } from './types'

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
 * Is Metamask Locked
 */
export const currentIsMetamaskLockedSettings = createGlobalSettings<boolean>(
    `${PLUGIN_IDENTIFIER}+isMetamaskLocked`,
    true,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * The default portfolio data provider
 */
export const currentPortfolioDataProviderSettings = createGlobalSettings<PortfolioProvider>(
    `${PLUGIN_IDENTIFIER}+portfolioProvider`,
    PortfolioProvider.ZERION,
    {
        primary: () => i18n.t('plugin_wallet_settings_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_data_source_secondary'),
    },
)
