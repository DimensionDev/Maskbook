import { isEqual } from 'lodash-unified'
import { createGlobalSettings } from '../../settings/createSettings'
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
)

export const currentMaskWalletChainIdSettings = createGlobalSettings<number>(
    `${PLUGIN_ID}+maskWalletChainId`,
    ChainId.Mainnet,
)

export const currentMaskWalletNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_ID}+selectedMaskWalletNetwork`,
    NetworkType.Ethereum,
)

export const currentMaskWalletLockStatusSettings = createGlobalSettings<LockStatus>(
    `${PLUGIN_ID}+maskWalletLockStatus`,
    LockStatus.INIT,
)

export const currentAccountSettings = createGlobalSettings<string>(`${PLUGIN_ID}+selectedWalletAddress`, '')

export const currentChainIdSettings = createGlobalSettings<ChainId>(`${PLUGIN_ID}+chainId`, ChainId.Mainnet)

export const currentNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_ID}+selectedWalletNetwork`,
    NetworkType.Ethereum,
)

export const currentProviderSettings = createGlobalSettings<ProviderType>(
    `${PLUGIN_ID}+selectedWalletProvider`,
    ProviderType.MaskWallet,
)

export const currentFungibleAssetDataProviderSettings = createGlobalSettings<FungibleAssetProvider>(
    `${PLUGIN_ID}+fungibleAssetProvider`,
    FungibleAssetProvider.DEBANK,
)

export const currentNonFungibleAssetDataProviderSettings = createGlobalSettings<NonFungibleAssetProvider>(
    `${PLUGIN_ID}+nonFungibleAssetProvider`,
    NonFungibleAssetProvider.OPENSEA,
)

export const currentGasOptionsSettings = createGlobalSettings<GasOptions | null>(
    `${PLUGIN_ID}+gasOptions`,
    null,
    isEqual,
)

export const currentTokenPricesSettings = createGlobalSettings<CryptoPrice>(`${PLUGIN_ID}+tokenPrices`, {}, isEqual)
