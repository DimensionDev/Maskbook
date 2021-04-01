import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { ERC721TokenRecordInDatabase } from '../database/types'
import { useAsyncRetry } from 'react-use'
import { WalletRPC, WalletMessages } from '../messages'
import { ERC721TokenRecordToCollectible } from '../services/helpers'
import { ERC721TokenArrayComparer } from '../helpers'
import type { Collectible, CollectibleProvider } from '../types'
import { useRef } from 'react'
import { uniqWith } from 'lodash-es'

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
    return records.map((x) => ERC721TokenRecordToCollectible(x))
}

export function useCollectiblesFromNetwork(address: string, provider: CollectibleProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []

        // a list of mock data address:
        // 0x3c6137504c38215fea30605b3e364a23c1d3e14f
        // 0x65c1b9ae4e4d8dcccfd3dc41b940840fe8570f2a
        // 0xa357a589a37cf7b6edb31b707e8ed3219c8249ac
        return WalletRPC.getAssetsListNFT(address.toLowerCase(), provider)
    }, [address, provider])
}

export function useCollectibles(address: string, provider: CollectibleProvider, page: number) {
    const values = useRef<Collectible[]>([])
    return useAsyncRetry(async () => {
        if (page === 1) values.current = []

        if (!address) return []
        const result = await WalletRPC.getAssetsListNFT(address.toLowerCase(), provider, page)
        const erc721Tokens = await WalletRPC.getERC721TokensPaged(page, 50)

        values.current.push(
            ...uniqWith([...result, ...erc721Tokens.map(ERC721TokenRecordToCollectible)], (a, b) => {
                return a.asset_contract.address === b.asset_contract.address && a.token_id === b.token_id
            }),
        )
        return values.current
    }, [address, provider, page])
}
