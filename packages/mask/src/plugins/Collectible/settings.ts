import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm/types'
import { createGlobalSettings } from '../../settings/createSettings'
import { PLUGIN_IDENTIFIER } from './constants'

export const currentNonFungibleAssetProviderSettings = createGlobalSettings<NonFungibleAssetProvider>(
    `${PLUGIN_IDENTIFIER}+nonFungibleAssetProvider`,
    NonFungibleAssetProvider.OPENSEA,
    {
        primary: () => '',
    },
)
