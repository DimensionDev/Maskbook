import type { Web3Helper } from '@masknet/web3-helpers'
import { leftShift } from '@masknet/web3-shared-base'

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
