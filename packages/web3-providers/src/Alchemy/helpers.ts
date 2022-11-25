import { hexToNumberString, isHex } from 'web3-utils'

export function formatAlchemyTokenId(tokenId: string) {
    return isHex(tokenId) && tokenId.startsWith('0x') ? hexToNumberString(tokenId) : tokenId
}

export function formatAlchemyTokenAddress(address: string, identifier: string) {
    return `A.${address.replace(/^0x/, '')}.${identifier}`
}
