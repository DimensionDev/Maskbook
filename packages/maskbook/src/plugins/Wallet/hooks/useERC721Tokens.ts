import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import { ERC721TokenDetailed, useChainId, useWallet } from '@masknet/web3-shared'
import { ERC721TokenArrayComparer } from '../helpers'
import { WalletMessages, WalletRPC } from '../messages'

//#region cache service query result
const erc721TokensRef = new ValueRef<ERC721TokenDetailed[]>([], ERC721TokenArrayComparer)

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
    return records
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
            x.contractDetailed.chainId === chainId &&
            wallet.erc721_token_whitelist.has(x.contractDetailed.address) &&
            !wallet.erc721_token_blacklist.has(x.contractDetailed.address),
    )
}
