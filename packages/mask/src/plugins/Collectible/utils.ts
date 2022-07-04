import { parseURL } from '@masknet/shared-base'
import {
    openseaHostnames,
    openseaPathnameRegexMatcher,
    raribleHostnames,
    rariblePathnameRegexMatcher,
    zoraHostnames,
    zoraPathnameRegexMatcher,
} from './constants'
import { ChainId } from '@masknet/web3-shared-evm'
import { WyvernSchemaName } from 'opensea-js/lib/types'
import type { CollectibleJSON_Payload } from './types'
import { SourceType } from '@masknet/web3-shared-base'

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

export function getAssetInfoFromURL(url?: string): CollectibleJSON_Payload | null {
    if (!url) return null
    const _url = new URL(url)

    // #region opensea
    const openSeaMatched = _url.pathname.match(openseaPathnameRegexMatcher)
    if (openSeaMatched) {
        return {
            chain_id: _url.host.includes('testnets') ? ChainId.Rinkeby : ChainId.Mainnet,
            address: openSeaMatched[1],
            token_id: openSeaMatched[2],
            provider: SourceType.OpenSea,
        }
    }
    // #endregion

    // #region rarible
    const raribleMatched = _url.pathname.match(rariblePathnameRegexMatcher)
    if (raribleMatched) {
        return {
            chain_id: _url.host.includes('ropsten')
                ? ChainId.Ropsten
                : _url.host.includes('rinkeby')
                ? ChainId.Rinkeby
                : ChainId.Mainnet,
            address: raribleMatched[1],
            token_id: raribleMatched[2],
            provider: SourceType.Rarible,
        }
    }
    // #endregion

    // #region zora
    const zoraMatched = _url.pathname.match(zoraPathnameRegexMatcher)
    if (zoraMatched) {
        return {
            chain_id: _url.host.includes('rinkeby') ? ChainId.Rinkeby : ChainId.Mainnet,
            address: zoraMatched[1],
            token_id: zoraMatched[2],
            provider: SourceType.Zora,
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
