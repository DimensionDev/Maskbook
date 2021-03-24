import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { ERC721TokenRecordInDatabase } from '../database/types'
import { useAsyncRetry } from 'react-use'
import { WalletRPC, WalletMessages } from '../messages'
import { ERC721TokenRecordToAssetInCard } from '../services/helpers'
import { ERC721TokenArrayComparer } from '../helpers'
import type { AssetProvider } from '../types'

//#region cache service query result
const erc721TokensRef = new ValueRef<ERC721TokenRecordInDatabase[]>([], ERC721TokenArrayComparer)

async function revalidate() {
    // erc721 tokens
    const erc721Tokens = await WalletRPC.getERC721Tokens()
    erc721TokensRef.value = erc721Tokens
}
WalletMessages.events.erc721TokensUpdated.on(revalidate)
revalidate()
//#endregion

export function useCollectiblesFromDB() {
    const records = useValueRef(erc721TokensRef)
    return records.map((x) => ERC721TokenRecordToAssetInCard(x))
}

export function useCollectiblesFromNetwork(address: string, provider: AssetProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return WalletRPC.getAssetsListNFT(address.toLowerCase(), provider)
    }, [address, provider])
}
