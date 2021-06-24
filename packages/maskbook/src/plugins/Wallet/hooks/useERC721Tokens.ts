import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import { ERC721TokenDetailed, EthereumTokenType, useChainId } from '@masknet/web3-shared'
import type { ERC721TokenRecord } from '../database/types'
import { ERC721TokenArrayComparer } from '../helpers'
import { WalletMessages, WalletRPC } from '../messages'
import { useWallet } from './useWallet'

//#region cache service query result
const erc721TokensRef = new ValueRef<ERC721TokenRecord[]>([], ERC721TokenArrayComparer)

async function revalidate() {
    // erc721 tokens
    const erc721Tokens = await WalletRPC.getERC721Tokens()
    erc721TokensRef.value = erc721Tokens
}
WalletMessages.events.erc721TokensUpdated.on(revalidate)
revalidate()
//#endregion

/**
 * Fetch all ERC721 tokens from DB
 */
export function useERC721TokensFromDB(): ERC721TokenDetailed[] {
    const records = useValueRef(erc721TokensRef)
    return records.map((x) => ({
        type: EthereumTokenType.ERC721,
        ...x,
    }))
}

/**
 * Fetch all trusted ERC721 tokens from DB
 * @param address
 */
export function useTrustedERC721TokensFromDB() {
    const chainId = useChainId()
    const wallet = useWallet()
    const tokens = useERC721TokensFromDB()

    if (!wallet) return []
    return tokens.filter(
        (x) =>
            x.chainId === chainId &&
            wallet.erc721_token_whitelist.has(x.address) &&
            !wallet.erc721_token_blacklist.has(x.address),
    )
}
