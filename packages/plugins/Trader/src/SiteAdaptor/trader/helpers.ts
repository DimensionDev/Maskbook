import type { Web3Helper } from '@masknet/web3-helpers'
import { leftShift, TokenType } from '@masknet/web3-shared-base'
import type { Token } from '../../types/trader.js'
import { SchemaType } from '@masknet/web3-shared-evm'

const MINIMUM_AMOUNT_RE = /(Minimum amount is\s+)(\d+)/
export function fixBridgeMessage(message: string, token?: Web3Helper.FungibleTokenAll) {
    // "Minimum amount is  1136775000000000000"
    if (!message.match(MINIMUM_AMOUNT_RE)) {
        return message
    }
    return message.replace(MINIMUM_AMOUNT_RE, (_, pre, amount: string) => {
        return `${pre} ${leftShift(amount, token?.decimals ?? 0).toFixed()} ${token?.symbol ?? ''}`
    })
}

export function okxTokenToFungibleToken(token: Token): Web3Helper.FungibleTokenAll {
    return {
        id: token.contractAddress,
        chainId: token.chainId,
        type: TokenType.Fungible,
        schema: SchemaType.ERC20,
        address: token.contractAddress,
        name: token.symbol,
        symbol: token.symbol,
        logoURL: token.logo,
        decimals: token.decimals,
    }
}
