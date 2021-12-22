import BigNumber from 'bignumber.js'
import { parseURL } from '@masknet/shared-base'
import {
    openseaHostnames,
    openseaPathnameRegexMatcher,
    raribleHostnames,
    rariblePathnameRegexMatcher,
} from './constants'
import { ChainId, NonFungibleAssetProvider, formatBalance } from '@masknet/web3-shared-evm'
import { WyvernSchemaName } from 'opensea-js/lib/types'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)

    return (
        (openseaHostnames.includes(_url.hostname) && openseaPathnameRegexMatcher.test(_url.pathname)) ||
        (raribleHostnames.includes(_url.hostname) && rariblePathnameRegexMatcher.test(_url.pathname))
    )
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null
    const _url = new URL(url)

    //#region opensea
    const openSeaMatched = _url.pathname.match(openseaPathnameRegexMatcher)
    if (openSeaMatched) {
        return {
            chain_id: _url.host.includes('testnets') ? ChainId.Rinkeby : ChainId.Mainnet,
            address: openSeaMatched[1],
            token_id: openSeaMatched[2],
            provider: NonFungibleAssetProvider.OPENSEA,
        }
    }
    //#endregion

    //#region rarible
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
            provider: NonFungibleAssetProvider.RARIBLE,
        }
    }
    //#endregion

    // nothing matched
    return
}

export function getOrderUnitPrice(currentPrice?: string, decimals?: number, quantity?: string) {
    if (!currentPrice || !decimals || !quantity) return
    const price = formatBalance(currentPrice, decimals)
    const _quantity = formatBalance(quantity, new BigNumber(quantity).toString() !== '1' ? 8 : 0)
    return new BigNumber(price).dividedBy(_quantity).decimalPlaces(4, 1)
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
