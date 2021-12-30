import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm/types'
import { createGlobalSettings } from '../../settings/createSettings'
import { PLUGIN_ID } from './constants'

export const currentNonFungibleAssetProviderSettings = createGlobalSettings<NonFungibleAssetProvider>(
    `${PLUGIN_ID}+nonFungibleAssetProvider`,
    NonFungibleAssetProvider.OPENSEA,
    {
        primary: () => '',
    },
)
