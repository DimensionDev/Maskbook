import { createGlobalSettings } from '../../settings/createSettings'
import { PLUGIN_IDENTIFIER } from './constants'
import { CollectibleProvider } from './types'

export const currentCollectibleProviderSettings = createGlobalSettings<CollectibleProvider>(
    `${PLUGIN_IDENTIFIER}+tradeProvider`,
    CollectibleProvider.OPENSEA,
    {
        primary: () => '',
    },
)
