import { PluginId } from '@masknet/plugin-infra'

/* cspell:disable-next-line */
const ALCHEMY_API_KEY = 'hn5njqihbzvvn88n2e1swp6hdta9wmdn'

export const ALCHEMY_URL_MAPPINGS: Record<string, string> = {
    [`${PluginId.Flow}_flow`]: `https://flow-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/`,
    [`${PluginId.EVM}_ethereum`]: `https://eth-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/`,
    [`${PluginId.EVM}_arbitrum`]: `https://arb-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/`,
    [`${PluginId.EVM}_polygon`]: `https://polygon-mainnet.g.alchemy.com/${ALCHEMY_API_KEY}/`,
}
