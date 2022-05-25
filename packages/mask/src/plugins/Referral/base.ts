import { type Plugin, PluginId } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'

import { META_KEY } from './constants'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.Referral,
    name: { fallback: 'Referral Farms', i18nKey: '__plugin_name' },
    description: {
        fallback: 'Referral Farming distributes yield farming alike returns for successful referrals.',
        i18nKey: '__plugin_description',
    },
    publisher: { name: { fallback: 'Attrace Protocol' }, link: 'http://attrace.com/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'beta',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet, ChainId.Rinkeby],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    contribution: { metadataKeys: new Set([META_KEY]) },
    i18n: languages,
}
