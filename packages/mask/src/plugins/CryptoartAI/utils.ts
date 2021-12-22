import { parseURL } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { escapeRegExp } from 'lodash-unified'
import { prefixPath, mainNetwork, testNetwork } from './constants'
import type { Token } from './types'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)
    return [mainNetwork.hostname, testNetwork.hostname].includes(_url.hostname) && _url.pathname.includes(prefixPath)
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null

    const addresses = {
        [ChainId.Kovan]: testNetwork.contractAddress,
        [ChainId.Mainnet]: mainNetwork.contractAddress,
    }

    const { hostname, pathname } = new URL(url)
    const pattern = new RegExp(`^${escapeRegExp(prefixPath)}${/\/([^/]+)\/(\d+)/.source}$`, 'g')
    const matched = pattern.exec(pathname)
    if (!matched) {
        return null // early return
    }

    const chain_id = hostname === testNetwork.hostname ? ChainId.Kovan : ChainId.Mainnet
    const creator = matched[1]
    const token_id = matched[2]
    const contractAddress = addresses[chain_id]
    return { chain_id, creator, token_id, contractAddress }
}

export function toTokenIdentifier(token?: Token) {
    if (!token) return ''
    return `${token.contractAddress}_${token.tokenId}`
}
