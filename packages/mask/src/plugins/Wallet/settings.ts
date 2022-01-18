import { isEqual } from 'lodash-unified'
import { createGlobalSettings } from '../../settings/createSettings'
import { i18n } from '../../../shared-ui/locales_legacy'
import {
    ChainId,
    NonFungibleAssetProvider,
    CryptoPrice,
    GasOptions,
    NetworkType,
    FungibleAssetProvider,
    ProviderType,
    LockStatus,
} from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants'

export const currentMaskWalletAccountSettings = createGlobalSettings<string>(
    `${PLUGIN_ID}+selectedMaskWalletAddress`,
    '',
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentMaskWalletChainIdSettings = createGlobalSettings<number>(
    `${PLUGIN_ID}+maskWalletChainId`,
    ChainId.Mainnet,
    {
        primary: () => i18n.t('settings_choose_eth_network'),
        secondary: () => 'This only affects the built-in wallet.',
    },
)

export const currentMaskWalletNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_ID}+selectedMaskWalletNetwork`,
    NetworkType.Ethereum,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentMaskWalletLockStatusSettings = createGlobalSettings<LockStatus>(
    `${PLUGIN_ID}+maskWalletLockStatus`,
    LockStatus.INIT,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentAccountSettings = createGlobalSettings<string>(`${PLUGIN_ID}+selectedWalletAddress`, '', {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

export const currentChainIdSettings = createGlobalSettings<ChainId>(`${PLUGIN_ID}+chainId`, ChainId.Mainnet, {
    primary: () => i18n.t('settings_choose_eth_network'),
    secondary: () => 'This only affects the built-in wallet.',
})

export const currentNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_ID}+selectedWalletNetwork`,
    NetworkType.Ethereum,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentProviderSettings = createGlobalSettings<ProviderType>(
    `${PLUGIN_ID}+selectedWalletProvider`,
    ProviderType.MaskWallet,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentFungibleAssetDataProviderSettings = createGlobalSettings<FungibleAssetProvider>(
    `${PLUGIN_ID}+fungibleAssetProvider`,
    FungibleAssetProvider.DEBANK,
    {
        primary: () => i18n.t('plugin_wallet_settings_fungible_asset_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_fungible_asset_data_source_secondary'),
    },
)

export const currentNonFungibleAssetDataProviderSettings = createGlobalSettings<NonFungibleAssetProvider>(
    `${PLUGIN_ID}+nonFungibleAssetProvider`,
    NonFungibleAssetProvider.OPENSEA,
    {
        primary: () => i18n.t('plugin_wallet_settings_non_fungible_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_non_fungible_data_source_secondary'),
    },
)

export const currentGasOptionsSettings = createGlobalSettings<GasOptions | null>(
    `${PLUGIN_ID}+gasOptions`,
    null,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
    (a: GasOptions | null, b: GasOptions | null) => isEqual(a, b),
)

export const currentTokenPricesSettings = createGlobalSettings<CryptoPrice>(
    `${PLUGIN_ID}+tokenPrices`,
    {},
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
    (a, b) => isEqual(a, b),
)
