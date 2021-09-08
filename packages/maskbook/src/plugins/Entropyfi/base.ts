import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared'
import {
    ENTROPYFI_PLUGIN_ID,
    ENTROPYFI_PLUGIN_ICON,
    ENTROPYFI_PLUGIN_NAME,
    ENTROPYFI_PLUGIN_DESCRIPTION,
} from './constants'

export const base: Plugin.Shared.Definition = {
    ID: ENTROPYFI_PLUGIN_ID,
    icon: ENTROPYFI_PLUGIN_ICON,
    name: { fallback: ENTROPYFI_PLUGIN_NAME },
    description: { fallback: ENTROPYFI_PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'insider',
        web3: {
            operatingSupportedChains: [ChainId.Kovan], // todo load from api?
        },
    },

    // experimentalMark: true,
    // i18n: languages,
}
