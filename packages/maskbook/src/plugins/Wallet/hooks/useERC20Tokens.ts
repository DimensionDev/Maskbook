import { ValueRef } from '@dimensiondev/holoflows-kit'
import { WalletMessages, WalletRPC } from '../messages'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { ERC20TokenRecord } from '../database/types'
import { ERC20TokenArrayComparer } from '../helpers'
import { useWallet } from './useWallet'
import { ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'

//#region cache service query result
const erc20TokensRef = new ValueRef<ERC20TokenRecord[]>([], ERC20TokenArrayComparer)

async function revalidate() {
    // erc20 tokens
    const erc20Tokens = await WalletRPC.getERC20Tokens()
    erc20TokensRef.value = erc20Tokens
}
WalletMessages.events.erc20TokensUpdated.on(revalidate)
revalidate()
//#endregion

/**
 * Fetch all ERC20 tokens from DB
 */
export function useERC20TokensFromDB(): ERC20TokenDetailed[] {
    const records = useValueRef(erc20TokensRef)
    return records.map((x) => ({
        type: EthereumTokenType.ERC20,
        ...x,
    }))
}

/**
 * Fetch all trusted ERC20 tokens from DB
 * @param address
 */
export function useTrustedERC20TokensFromDB() {
    const wallet = useWallet()
    const tokens = useERC20TokensFromDB()

    if (!wallet) return []
    return tokens.filter(
        (x) => wallet.erc20_token_whitelist.has(x.address) && !wallet.erc20_token_blacklist.has(x.address),
    )
}
