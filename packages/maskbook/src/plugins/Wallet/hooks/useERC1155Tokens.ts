import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import { ERC1155TokenDetailed, EthereumTokenType, useWallet } from '@masknet/web3-shared-evm'
import type { ERC1155TokenRecord } from '../database/types'
import { ERC1155TokenArrayComparer } from '../helpers'
import { WalletMessages, WalletRPC } from '../messages'

//#region cache service query result
const erc1155TokensRef = new ValueRef<ERC1155TokenRecord[]>([], ERC1155TokenArrayComparer)

async function revalidate() {
    // erc1155 tokens
    const erc1155Tokens = await WalletRPC.getERC1155Tokens()
    erc1155TokensRef.value = erc1155Tokens
}
WalletMessages.events.erc1155TokensUpdated.on(revalidate)
revalidate()
//#endregion

/**
 * Fetch all ERC1155 tokens from DB
 */
export function useERC1155TokensFromDB(): ERC1155TokenDetailed[] {
    const records = useValueRef(erc1155TokensRef)
    return records.map((x) => ({
        type: EthereumTokenType.ERC1155,
        ...x,
    }))
}

/**
 * Fetch all trusted ERC1155 tokens from DB
 * @param address
 */
export function useTrustedERC1155TokensFromDB() {
    const wallet = useWallet()
    const tokens = useERC1155TokensFromDB()

    if (!wallet) return []
    return tokens.filter(
        (x) => wallet.erc1155_token_whitelist.has(x.address) && !wallet.erc1155_token_blacklist.has(x.address),
    )
}
