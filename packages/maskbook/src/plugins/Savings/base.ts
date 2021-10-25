import type { Plugin } from '@masknet/plugin-infra'
import { languages } from './locales'
import { PLUGIN_IDENTIFIER } from './constants'
import { ChainId } from '@masknet/web3-shared-evm'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_IDENTIFIER,
    icon: 'Savings',
    name: { fallback: 'MaskSaving' },
    // todo: add description
    description: { fallback: 'Todo::Savings' },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            operatingSupportedChains: [ChainId.Mainnet, ChainId.BSC, ChainId.Matic],
        },
    },
    i18n: languages,
}
