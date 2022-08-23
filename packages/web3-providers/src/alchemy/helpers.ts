import { hexToNumberString, isHex } from "web3-utils";

export function formatAlchemyTokenId(tokenId: string) {
    return isHex(tokenId) && tokenId.startsWith('0x') ? hexToNumberString(tokenId) : tokenId
}
