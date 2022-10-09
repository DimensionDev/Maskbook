import { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'
import { SourceType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { CollectiblePayload } from '../types.js'

const ZORA_COLLECTION_ADDRESS = '0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7'

const RULES = [
    // opensea
    {
        hosts: ['opensea.io'],
        pathname: /^\/assets\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Mainnet,
        provider: SourceType.OpenSea,
    },
    {
        hosts: ['opensea.io'],
        pathname: /^\/assets\/ethereum\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Mainnet,
        provider: SourceType.OpenSea,
    },
    {
        hosts: ['opensea.io'],
        pathname: /^\/assets\/matic\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Matic,
        provider: SourceType.OpenSea,
    },
    {
        hosts: ['opensea.io'],
        pathname: /^\/assets\/arbitrum\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Arbitrum,
        provider: SourceType.OpenSea,
    },
    {
        hosts: ['opensea.io'],
        pathname: /^\/assets\/optimism\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Optimism,
        provider: SourceType.OpenSea,
    },
    {
        hosts: ['opensea.io'],
        pathname: /^\/assets\/solana\/(\w+)/,
        pluginID: NetworkPluginID.PLUGIN_SOLANA,
        chainId: ChainIdSolana.Mainnet,
        provider: SourceType.OpenSea,
    },

    // rarible
    {
        hosts: ['rarible.com', 'app.rarible.com'],
        pathname: /^\/token\/(0x[\dA-Fa-f]{40}):(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Mainnet,
        provider: SourceType.Rarible,
    },
    {
        hosts: ['rarible.com', 'app.rarible.com'],
        pathname: /^\/token\/polygon\/(0x[\dA-Fa-f]{40}):(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Matic,
        provider: SourceType.Rarible,
    },
    {
        hosts: ['rarible.com', 'app.rarible.com'],
        pathname: /^\/token\/solana\/(\w+)/,
        pluginID: NetworkPluginID.PLUGIN_SOLANA,
        chainId: ChainIdSolana.Mainnet,
        provider: SourceType.Rarible,
    },

    // zora
    {
        hosts: ['zora.co', 'market.zora.co'],
        pathname: /^\/collections\/(zora|0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Mainnet,
        provider: SourceType.Zora,
    },

    // x2y2
    {
        hosts: ['x2y2.io'],
        pathname: /^\/eth\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Mainnet,
        provider: SourceType.X2Y2,
    },

    // looksrare
    {
        hosts: ['looksrare.org'],
        pathname: /^\/collections\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Mainnet,
        provider: SourceType.LooksRare,
    },

    // element
    {
        hosts: ['element.market', 'www.element.market'],
        pathname: /^\/assets\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Mainnet,
        provider: SourceType.Element,
    },
    {
        hosts: ['element.market', 'www.element.market'],
        pathname: /^\/assets\/bsc\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.BSC,
        provider: SourceType.Element,
    },
    {
        hosts: ['element.market', 'www.element.market'],
        pathname: /^\/assets\/polygon\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        pluginID: NetworkPluginID.PLUGIN_EVM,
        chainId: ChainIdEVM.Matic,
        provider: SourceType.Element,
    },

    // magic eden
    {
        hosts: ['magiceden.io'],
        pathname: /^\/item-details\/(\w+)/,
        pluginID: NetworkPluginID.PLUGIN_SOLANA,
        chainId: ChainIdSolana.Mainnet,
        provider: SourceType.MagicEden,
    },

    // solsea
    {
        hosts: ['solsea.io'],
        pathname: /^\/n\/(\w+)/,
        pluginID: NetworkPluginID.PLUGIN_SOLANA,
        chainId: ChainIdSolana.Mainnet,
        provider: SourceType.Solsea,
    },

    // solanart
    {
        hosts: ['solanart.io'],
        pathname: /^\/nft\/(\w+)/,
        pluginID: NetworkPluginID.PLUGIN_SOLANA,
        chainId: ChainIdSolana.Mainnet,
        provider: SourceType.Solanart,
    },
]

export function getPayloadFromURLs(urls: string[]): CollectiblePayload | undefined {
    for (const url of urls) {
        const payload = getPayloadFromURL(url)
        if (payload) return payload
    }
    return
}

export function getPayloadFromURL(url?: string): CollectiblePayload | undefined {
    if (!url) return
    let _url: URL
    try {
        _url = new URL(url)
    } catch {
        return
    }

    for (const rule of RULES) {
        const isHostMatched = rule.hosts.includes(_url.hostname)
        const matched = _url.pathname.match(rule.pathname)

        if (isHostMatched && matched) {
            return {
                pluginID: rule.pluginID,
                chainId: rule.chainId,
                provider: rule.provider,
                address:
                    rule.provider === SourceType.Zora
                        ? matched[1].replace('zora', ZORA_COLLECTION_ADDRESS)
                        : matched[1],
                tokenId: rule.pluginID === NetworkPluginID.PLUGIN_SOLANA ? '' : matched[2],
            }
        }
    }

    return
}
