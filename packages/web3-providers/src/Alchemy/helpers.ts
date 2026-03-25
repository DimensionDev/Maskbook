import { isHex } from 'viem'

export function formatAlchemyTokenId(tokenId: string) {
    return isHex(tokenId) ? Number(tokenId).toString() : tokenId
}

export function formatAlchemyTokenAddress(address: string, identifier: string) {
    return `A.${address.replace(/^0x/u, '')}.${identifier}`
}
