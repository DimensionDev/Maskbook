import { createContext, PropsWithChildren } from 'react'
import { useAsync } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import type { SearchResultType, DomainResult, BindingProof } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { resolveNonFungibleTokenIdFromEnsDomain, ChainId } from '@masknet/web3-shared-evm'

interface ENSContextProps {
    nextIdBindings: BindingProof[]
    reversedAddress: string | undefined
    domain: string
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
    const tokenId = resolveNonFungibleTokenIdFromEnsDomain(domain)

    const { value: nextIdBindings = EMPTY_LIST } = useAsync(
        async () => (reversedAddress ? NextIDProof.queryProfilesByRelationService(domain) : EMPTY_LIST),
        [reversedAddress],
    )

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
    result: DomainResult<ChainId>
    keyword: string
    keywordType?: SearchResultType
}
