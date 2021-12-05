import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm/types'
import { createGlobalSettings } from '../../settings/createSettings'
import { PLUGIN_IDENTIFIER } from './constants'

export const currentCollectibleProviderSettings = createGlobalSettings<NonFungibleAssetProvider>(
    `${PLUGIN_IDENTIFIER}+tradeProvider`,
    NonFungibleAssetProvider.OPENSEA,
    {
        primary: () => '',
    },
)
