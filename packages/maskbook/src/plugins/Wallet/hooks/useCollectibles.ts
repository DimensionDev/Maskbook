import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { ERC721TokenRecordInDatabase } from '../database/types'
import { useAsyncRetry } from 'react-use'
import { WalletRPC, WalletMessages } from '../messages'
import { ERC721TokenToAssetInCard } from '../services/helpers'
import { ERC721TokenArrayComparer } from '../helpers'
import type { AssetProvider } from '../types'

//#region cache service query result
const erc721TokensRef = new ValueRef<ERC721TokenRecordInDatabase[]>([], ERC721TokenArrayComparer)

async function revalidate() {
    // erc20 tokens
    const erc721Tokens = await WalletRPC.getERC721Tokens()
    erc721TokensRef.value = erc721Tokens
}
WalletMessages.events.erc721TokensUpdated.on(revalidate)
revalidate()
//#endregion

export function useCollectiblesFromDB() {
    const records = useValueRef(erc721TokensRef)
    return records.map((x) => ERC721TokenToAssetInCard(x))
}

export function useCollectiblesFromNetwork(address: string, provider: AssetProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return await WalletRPC.getAssetsListNFT('0x265b95a94d0de9643fb06765b7b2a6df9910aca1'.toLowerCase(), provider)
        // return WalletRPC.getAssetsListNFT(address.toLowerCase(), provider)
        // return WalletRPC.getAssetsListNFT(address, provider)
        // return WalletRPC.getAssetsListNFT('0x3c6137504c38215fea30605b3e364a23c1d3e14f'.toLowerCase(), provider)
        // return WalletRPC.getAssetsListNFT('0x65c1b9ae4e4d8dcccfd3dc41b940840fe8570f2a'.toLowerCase(), provider)
        // return WalletRPC.getAssetsListNFT('0xa357a589a37cf7b6edb31b707e8ed3219c8249ac'.toLowerCase(), provider)
    }, [address, provider])
}
