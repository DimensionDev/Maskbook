import type { Web3Helper } from '@masknet/web3-helpers'
import { formatCompact, leftShift, TokenType, trimZero } from '@masknet/web3-shared-base'
import type { Token } from '../../types/trader.js'
import { SchemaType } from '@masknet/web3-shared-evm'
import type { OKXBridgeQuote } from '@masknet/web3-providers/types'
import { BigNumber } from 'bignumber.js'

const MINIMUM_AMOUNT_RE = /((?:Minimum|Maximum) amount is\s+)(\d+)/u
export function fixBridgeMessage(message: string, token?: Web3Helper.FungibleTokenAll) {
    // "Minimum amount is  1136775000000000000"
    // "Maximum amount is  1136775000000000000"
    if (!MINIMUM_AMOUNT_RE.test(message)) {
        return message
    }
    return message.replace(MINIMUM_AMOUNT_RE, (_, pre, amount: string) => {
        return `${pre.trim()} ${leftShift(amount, token?.decimals ?? 0).toFixed()} ${token?.symbol ?? ''}`
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

// The v6 bridge quote API no longer exposes per-segment dex route details,
// so the side tokens are derived from the quote tokens directly.
export function getBridgeLeftSideToken(quote: OKXBridgeQuote | undefined) {
    if (!quote?.fromToken) return
    return { ...quote.fromToken, chainId: quote.fromChainIndex }
}

export function getBridgeRightSideToken(quote: OKXBridgeQuote | undefined) {
    if (!quote?.toToken) return
    return { ...quote.toToken, chainId: quote.toChainIndex }
}

export function formatTokenBalance(raw: BigNumber.Value, decimals = 0) {
    const balance = leftShift(raw, decimals).toNumber()
    return formatCompact(balance, {
        minimumFractionDigits: 2,
        maximumFractionDigits:
            balance < 100 ? 4
            : balance < 1000 ? 2
            : 2,
    })
}

export function formatInput(input: string) {
    if (!input) return input
    const bn = new BigNumber(input)
    return bn.isNaN() ? input : trimZero(bn.toFixed(12, 1))
}
