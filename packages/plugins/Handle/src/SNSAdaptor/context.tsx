import { createContext, type PropsWithChildren } from 'react'
import { useAsync } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import type { SearchResultType, EOAResult } from '@masknet/web3-shared-base'
import { type BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { resolveNonFungibleTokenIdFromEnsDomain, type ChainId } from '@masknet/web3-shared-evm'

interface ENSContextProps {
    nextIdBindings: BindingProof[]
    reversedAddress: string | undefined
    domain: string | undefined
    tokenId: string | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    nextIdBindings: [],
    reversedAddress: undefined,
    tokenId: undefined,
    domain: '',
})
ENSContext.displayName = 'ENSContext'

export function ENSProvider({ children, result }: PropsWithChildren<SearchResultInspectorProps>) {
    const domain = result.domain
    const reversedAddress = result.address
    const nextIdBindings_ = result.bindingProofList

    const tokenId = domain ? resolveNonFungibleTokenIdFromEnsDomain(domain) : ''

    const { value: nextIdBindings = EMPTY_LIST } = useAsync(async () => {
        if (nextIdBindings_) return nextIdBindings_
        return reversedAddress ? NextIDProof.queryProfilesByRelationService(reversedAddress) : EMPTY_LIST
    }, [reversedAddress, JSON.stringify(nextIdBindings_)])

    return (
        <ENSContext.Provider
            value={{
                reversedAddress,
                tokenId,
                domain,
                nextIdBindings,
            }}>
            {children}
        </ENSContext.Provider>
    )
}

export interface SearchResultInspectorProps {
    result: EOAResult<ChainId>
    keyword: string
    keywordType?: SearchResultType
}
