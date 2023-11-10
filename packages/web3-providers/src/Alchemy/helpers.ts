import * as web3_utils from /* webpackDefer: true */ 'web3-utils'

export function formatAlchemyTokenId(tokenId: string) {
    return web3_utils.isHex(tokenId) && tokenId.startsWith('0x') ? web3_utils.hexToNumberString(tokenId) : tokenId
}

export function formatAlchemyTokenAddress(address: string, identifier: string) {
    return `A.${address.replace(/^0x/, '')}.${identifier}`
}
