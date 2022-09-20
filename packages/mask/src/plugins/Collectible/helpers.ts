import { parseURL } from '@masknet/shared-base'
import {
    openseaHostnames,
    openseaPathnameRegexMatcher,
    raribleHostnames,
    rariblePathnameRegexMatcher,
    ZORA_COLLECTION_ADDRESS,
    zoraHostnames,
    zoraPathnameRegexMatcher,
} from './constants.js'
import { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'
import { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { Asset, WyvernSchemaName } from 'opensea-js/lib/types'
import type { CollectibleToken, CollectiblePayload } from './types.js'

export function toAsset(asset: { tokenId: string; tokenAddress: string; schemaName?: WyvernSchemaName }): Asset {
    return {
        tokenId: asset.tokenId,
        tokenAddress: asset.tokenAddress,
        schemaName: asset.schemaName,
    }
}

export function toTokenIdentifier(token?: CollectibleToken) {
    if (!token) return ''
    return `${token.contractAddress}_${token.tokenId}`
}

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)

    return (
        (openseaHostnames.includes(_url.hostname) && openseaPathnameRegexMatcher.test(_url.pathname)) ||
        (raribleHostnames.includes(_url.hostname) && rariblePathnameRegexMatcher.test(_url.pathname)) ||
        (zoraHostnames.includes(_url.hostname) && zoraPathnameRegexMatcher.test(_url.pathname))
    )
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string): CollectiblePayload | null {
    if (!url) return null
    const _url = new URL(url)

    // #region opensea
    {
        const openSeaMatched = _url.pathname.match(openseaPathnameRegexMatcher)
        const maticMatched = _url.pathname.includes('matic')
        const solanaMatched = _url.pathname.includes('solana')
        if (openSeaMatched) {
            return {
                pluginID: solanaMatched ? NetworkPluginID.PLUGIN_SOLANA : NetworkPluginID.PLUGIN_EVM,
                chainId: maticMatched ? ChainIdEVM.Matic : solanaMatched ? ChainIdSolana.Mainnet : ChainIdEVM.Mainnet,
                address: solanaMatched ? '' : openSeaMatched[1],
                tokenId: solanaMatched ? openSeaMatched[1] : openSeaMatched[2],
                provider: SourceType.OpenSea,
            }
        }
    }
    // #endregion

    // #region rarible
    {
        const raribleMatched = _url.pathname.match(rariblePathnameRegexMatcher)
        const maticMatched = _url.pathname.includes('polygon')
        const solanaMatched = _url.pathname.includes('solana')
        if (raribleMatched) {
            return {
                pluginID: solanaMatched ? NetworkPluginID.PLUGIN_SOLANA : NetworkPluginID.PLUGIN_EVM,
                chainId: maticMatched ? ChainIdEVM.Matic : solanaMatched ? ChainIdSolana.Mainnet : ChainIdEVM.Mainnet,
                address: solanaMatched ? '' : raribleMatched[1],
                tokenId: solanaMatched ? raribleMatched[1] : raribleMatched[2],
                provider: SourceType.Rarible,
            }
        }
    }
    // #endregion

    // #region zora
    {
        const zoraMatched = _url.pathname.match(zoraPathnameRegexMatcher)
        if (zoraMatched) {
            return {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: _url.host.includes('rinkeby') ? ChainIdEVM.Rinkeby : ChainIdEVM.Mainnet,
                address: zoraMatched[1].replace('zora', ZORA_COLLECTION_ADDRESS),
                tokenId: zoraMatched[2],
                provider: SourceType.Zora,
            }
        }
    }
    // #endregion

    // nothing matched
    return null
}

export function isWyvernSchemaName(name: unknown): name is WyvernSchemaName {
    const schemas: unknown[] = [
        WyvernSchemaName.ERC20,
        WyvernSchemaName.ERC721,
        WyvernSchemaName.ERC1155,
        WyvernSchemaName.LegacyEnjin,
        WyvernSchemaName.ENSShortNameAuction,
    ]
    return schemas.includes(name)
}
