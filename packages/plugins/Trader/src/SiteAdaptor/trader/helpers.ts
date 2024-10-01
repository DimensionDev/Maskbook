import type { Web3Helper } from '@masknet/web3-helpers'
import { formatCompact, leftShift, TokenType } from '@masknet/web3-shared-base'
import type { Token } from '../../types/trader.js'
import { SchemaType } from '@masknet/web3-shared-evm'
import type { RouterListItem } from '@masknet/web3-providers/types'
import { type BigNumber } from 'bignumber.js'

const MINIMUM_AMOUNT_RE = /((?:Minimum|Maximum) amount is\s+)(\d+)/
export function fixBridgeMessage(message: string, token?: Web3Helper.FungibleTokenAll) {
    // "Minimum amount is  1136775000000000000"
    // "Maximum amount is  1136775000000000000"
    if (!message.match(MINIMUM_AMOUNT_RE)) {
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

export function getBridgeLeftSideToken(bridge: RouterListItem) {
    return bridge.fromDexRouterList.at(-1)?.subRouterList.at(-1)?.toToken
}

export function getBridgeRightSideToken(bridge: RouterListItem) {
    return bridge.toDexRouterList[0]?.subRouterList[0]?.toToken
}

export function formatTokenBalance(raw: BigNumber.Value, decimals = 0) {
    const balance = leftShift(raw, decimals).toNumber()
    return formatCompact(balance, {
        minimumSignificantDigits: 2,
        maximumSignificantDigits:
            balance < 100 ? 4
            : balance < 1000 ? 2
            : 2,
    })
}
