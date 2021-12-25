import { createGlobalSettings } from '../../settings/createSettings'
import { PLUGIN_ID } from './constants'
import { CollectibleProvider } from './types'

export const currentCollectibleProviderSettings = createGlobalSettings<CollectibleProvider>(
    `${PLUGIN_ID}+tradeProvider`,
    CollectibleProvider.OPENSEA,
    {
        primary: () => '',
    },
)
